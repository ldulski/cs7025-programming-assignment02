require("dotenv").config();

const express = require("express");
const http = require("http");
const morgan = require("morgan");
const path = require("path");
const { WebSocketServer, WebSocket } = require("ws");
const { withDb } = require("./db");

const app = express();
const server = http.createServer(app);
const wss = new WebSocketServer({ noServer: true });
const hostname = "0.0.0.0";
const port = Number(process.env.PORT || 3000);
const projectRoot = path.resolve(__dirname, "..");
const socketsByUser = new Map();

app.use(morgan("dev"));
app.use(express.json({ limit: "2mb" }));
app.use(express.urlencoded({ extended: true }));

app.use("/app", express.static(path.join(projectRoot, "app")));
app.use("/pages", express.static(path.join(projectRoot, "pages")));
app.use("/my-app", express.static(path.join(projectRoot, "my-app")));

function toJson(value, fallback) {
  if (!value) {
    return fallback;
  }

  if (typeof value === "string") {
    try {
      return JSON.parse(value);
    } catch {
      return fallback;
    }
  }

  return value;
}

function cleanText(value, max = 5000) {
  return String(value || "").trim().slice(0, max);
}

function getUid(req, bodyKey = "firebaseUid") {
  return cleanText(
    req.get("x-firebase-uid") ||
      req.body?.[bodyKey] ||
      req.query?.uid,
    128
  );
}

function normalizeMessage(row) {
  return {
    ...row,
    likedByMe: row.likedByMe !== undefined ? Boolean(row.likedByMe) : false,
    likeCount: Number(row.likeCount || 0),
    payload: toJson(row.payload, {})
  };
}

function addSocket(uid, socket) {
  if (!socketsByUser.has(uid)) {
    socketsByUser.set(uid, new Set());
  }

  socketsByUser.get(uid).add(socket);
}

function removeSocket(uid, socket) {
  const set = socketsByUser.get(uid);

  if (!set) {
    return;
  }

  set.delete(socket);

  if (!set.size) {
    socketsByUser.delete(uid);
  }
}

function sendSocket(socket, payload) {
  if (socket.readyState === WebSocket.OPEN) {
    socket.send(JSON.stringify(payload));
  }
}

function broadcastToUsers(uids, payload) {
  [...new Set(uids)].forEach((uid) => {
    socketsByUser.get(uid)?.forEach((socket) => {
      sendSocket(socket, payload);
    });
  });
}

async function initDb() {
  await withDb(async (conn) => {
    await conn.query(`
      CREATE TABLE IF NOT EXISTS users (
        firebase_uid VARCHAR(128) PRIMARY KEY,
        email VARCHAR(255) UNIQUE,
        name VARCHAR(120) NOT NULL,
        pronouns VARCHAR(60) DEFAULT '',
        bio TEXT,
        profile_image TEXT,
        color_group VARCHAR(32),
        survey_answers LONGTEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

    await conn.query(`
      CREATE TABLE IF NOT EXISTS saved_matches (
        user_uid VARCHAR(128) NOT NULL,
        saved_user_uid VARCHAR(128) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (user_uid, saved_user_uid),
        CONSTRAINT fk_saved_matches_user FOREIGN KEY (user_uid) REFERENCES users(firebase_uid) ON DELETE CASCADE,
        CONSTRAINT fk_saved_matches_saved FOREIGN KEY (saved_user_uid) REFERENCES users(firebase_uid) ON DELETE CASCADE
      )
    `);

    await conn.query(`
      CREATE TABLE IF NOT EXISTS messages (
        id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
        sender_uid VARCHAR(128) NOT NULL,
        recipient_uid VARCHAR(128) NOT NULL,
        message_type VARCHAR(20) NOT NULL DEFAULT 'postcard',
        subject VARCHAR(160) DEFAULT '',
        body TEXT NOT NULL,
        payload LONGTEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT fk_messages_sender FOREIGN KEY (sender_uid) REFERENCES users(firebase_uid) ON DELETE CASCADE,
        CONSTRAINT fk_messages_recipient FOREIGN KEY (recipient_uid) REFERENCES users(firebase_uid) ON DELETE CASCADE
      )
    `);

    await conn.query(`
      CREATE TABLE IF NOT EXISTS message_likes (
        message_id BIGINT UNSIGNED NOT NULL,
        user_uid VARCHAR(128) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (message_id, user_uid),
        CONSTRAINT fk_message_likes_message FOREIGN KEY (message_id) REFERENCES messages(id) ON DELETE CASCADE,
        CONSTRAINT fk_message_likes_user FOREIGN KEY (user_uid) REFERENCES users(firebase_uid) ON DELETE CASCADE
      )
    `);
  });
}

async function upsertBasicUser(conn, { firebaseUid, email, name }) {
  if (!firebaseUid || !email || !name) {
    return;
  }

  await conn.query(
    `
      INSERT INTO users (firebase_uid, email, name)
      VALUES (?, ?, ?)
      ON DUPLICATE KEY UPDATE
        email = VALUES(email),
        name = VALUES(name)
    `,
    [firebaseUid, email, name]
  );
}

async function findRecipient(conn, { recipientUid, recipientEmail, recipientName }) {
  if (recipientUid) {
    const rows = await conn.query(
      `SELECT firebase_uid, email, name, color_group, pronouns, bio, profile_image
       FROM users
       WHERE firebase_uid = ?
       LIMIT 1`,
      [recipientUid]
    );
    return rows[0] || null;
  }

  if (recipientEmail) {
    const rows = await conn.query(
      `SELECT firebase_uid, email, name, color_group, pronouns, bio, profile_image
       FROM users
       WHERE email = ?
       LIMIT 1`,
      [recipientEmail]
    );
    return rows[0] || null;
  }

  if (recipientName) {
    const rows = await conn.query(
      `SELECT firebase_uid, email, name, color_group, pronouns, bio, profile_image
       FROM users
       WHERE name = ?
       LIMIT 1`,
      [recipientName]
    );
    return rows[0] || null;
  }

  return null;
}

async function insertMessage(conn, input) {
  const senderUid = cleanText(input.senderUid, 128);
  const senderEmail = cleanText(input.senderEmail, 255);
  const senderName = cleanText(input.senderName, 120);
  const subject = cleanText(input.subject, 160);
  const body = cleanText(input.body, 8000);
  const payload = JSON.stringify(toJson(input.payload, {}));
  const messageType = cleanText(input.messageType || "postcard", 20);

  if (!senderUid || !senderEmail || !senderName || !body) {
    const error = new Error("senderUid, senderEmail, senderName, and body are required.");
    error.statusCode = 400;
    throw error;
  }

  await upsertBasicUser(conn, {
    firebaseUid: senderUid,
    email: senderEmail,
    name: senderName
  });

  const recipient = await findRecipient(conn, {
    recipientUid: cleanText(input.recipientUid, 128),
    recipientEmail: cleanText(input.recipientEmail, 255),
    recipientName: cleanText(input.recipientName, 120)
  });

  if (!recipient) {
    const error = new Error("Recipient not found. Ask them to sign in once, then use a saved match or their exact TCD email.");
    error.statusCode = 404;
    throw error;
  }

  const insert = await conn.query(
    `
      INSERT INTO messages (
        sender_uid,
        recipient_uid,
        message_type,
        subject,
        body,
        payload
      )
      VALUES (?, ?, ?, ?, ?, ?)
    `,
    [senderUid, recipient.firebase_uid, messageType, subject, body, payload]
  );

  const rows = await conn.query(
    `
      SELECT
        m.id,
        m.sender_uid AS senderUid,
        m.recipient_uid AS recipientUid,
        m.message_type AS messageType,
        m.subject,
        m.body,
        m.payload,
        m.created_at AS createdAt,
        sender.name AS senderName,
        sender.email AS senderEmail,
        sender.profile_image AS senderImage,
        recipient.name AS recipientName,
        recipient.email AS recipientEmail,
        recipient.profile_image AS recipientImage,
        0 AS likedByMe,
        0 AS likeCount
      FROM messages m
      JOIN users sender ON sender.firebase_uid = m.sender_uid
      JOIN users recipient ON recipient.firebase_uid = m.recipient_uid
      WHERE m.id = ?
      LIMIT 1
    `,
    [Number(insert.insertId)]
  );

  return normalizeMessage(rows[0]);
}

async function fetchPostcards(conn, uid, direction) {
  const isInbox = direction === "inbox";
  const ownerColumn = isInbox ? "m.recipient_uid" : "m.sender_uid";
  const personColumn = isInbox ? "m.sender_uid" : "m.recipient_uid";
  const personAlias = isInbox ? "sender" : "recipient";

  const rows = await conn.query(
    `
      SELECT
        m.id,
        m.sender_uid AS senderUid,
        m.recipient_uid AS recipientUid,
        m.message_type AS messageType,
        m.subject,
        m.body,
        m.payload,
        m.created_at AS createdAt,
        u.firebase_uid AS ${personAlias}Uid,
        u.name AS ${personAlias}Name,
        u.email AS ${personAlias}Email,
        u.profile_image AS ${personAlias}Image,
        EXISTS(
          SELECT 1
          FROM message_likes ml
          WHERE ml.message_id = m.id AND ml.user_uid = ?
        ) AS likedByMe,
        (
          SELECT COUNT(*)
          FROM message_likes ml
          WHERE ml.message_id = m.id
        ) AS likeCount
      FROM messages m
      JOIN users u ON u.firebase_uid = ${personColumn}
      WHERE ${ownerColumn} = ? AND m.message_type = 'postcard'
      ORDER BY m.created_at DESC
    `,
    [uid, uid]
  );

  return rows.map(normalizeMessage);
}

async function fetchChatThread(conn, firebaseUid, targetUid) {
  const rows = await conn.query(
    `
      SELECT
        m.id,
        m.sender_uid AS senderUid,
        m.recipient_uid AS recipientUid,
        m.message_type AS messageType,
        m.subject,
        m.body,
        m.payload,
        m.created_at AS createdAt,
        sender.name AS senderName,
        sender.email AS senderEmail,
        sender.profile_image AS senderImage,
        recipient.name AS recipientName,
        recipient.email AS recipientEmail,
        recipient.profile_image AS recipientImage
      FROM messages m
      JOIN users sender ON sender.firebase_uid = m.sender_uid
      JOIN users recipient ON recipient.firebase_uid = m.recipient_uid
      WHERE m.message_type = 'chat'
        AND (
          (m.sender_uid = ? AND m.recipient_uid = ?)
          OR
          (m.sender_uid = ? AND m.recipient_uid = ?)
        )
      ORDER BY m.created_at ASC, m.id ASC
    `,
    [firebaseUid, targetUid, targetUid, firebaseUid]
  );

  return rows.map(normalizeMessage);
}

async function fetchChatContacts(conn, firebaseUid) {
  const savedMatches = await conn.query(
    `
      SELECT
        u.firebase_uid AS firebaseUid,
        u.name,
        u.email,
        u.pronouns,
        u.bio,
        u.profile_image AS profileImage,
        u.color_group AS colorGroup,
        1 AS bookmarked
      FROM saved_matches sm
      JOIN users u ON u.firebase_uid = sm.saved_user_uid
      WHERE sm.user_uid = ?
      ORDER BY u.name ASC
    `,
    [firebaseUid]
  );

  const chattedUsers = await conn.query(
    `
      SELECT DISTINCT
        u.firebase_uid AS firebaseUid,
        u.name,
        u.email,
        u.pronouns,
        u.bio,
        u.profile_image AS profileImage,
        u.color_group AS colorGroup,
        0 AS bookmarked
      FROM messages m
      JOIN users u
        ON u.firebase_uid = CASE
          WHEN m.sender_uid = ? THEN m.recipient_uid
          ELSE m.sender_uid
        END
      WHERE m.message_type = 'chat'
        AND (m.sender_uid = ? OR m.recipient_uid = ?)
      ORDER BY u.name ASC
    `,
    [firebaseUid, firebaseUid, firebaseUid]
  );

  const merged = new Map();

  [...savedMatches, ...chattedUsers].forEach((user) => {
    const existing = merged.get(user.firebaseUid);
    merged.set(user.firebaseUid, {
      ...existing,
      ...user,
      bookmarked: Boolean(existing?.bookmarked || user.bookmarked)
    });
  });

  return [...merged.values()].sort((a, b) => a.name.localeCompare(b.name));
}

app.get("/", (req, res) => {
  res.redirect("/pages/index.html");
});

app.get("/api/health", async (req, res) => {
  try {
    await withDb((conn) => conn.query("SELECT 1"));
    res.json({ ok: true });
  } catch (error) {
    res.status(500).json({ ok: false, error: error.message });
  }
});

app.post("/api/users/sync", async (req, res) => {
  const firebaseUid = getUid(req);
  const email = cleanText(req.body?.email, 255);
  const name = cleanText(req.body?.name, 120);

  if (!firebaseUid || !email || !name) {
    return res.status(400).json({ error: "firebaseUid, email, and name are required." });
  }

  const pronouns = cleanText(req.body?.pronouns, 60);
  const bio = cleanText(req.body?.bio, 2000);
  const profileImage = cleanText(req.body?.profileImage, 5000);
  const colorGroup = cleanText(req.body?.colorGroup, 32);
  const surveyAnswers = JSON.stringify(toJson(req.body?.surveyAnswers, []));

  try {
    await withDb(async (conn) => {
      await conn.query(
        `
          INSERT INTO users (
            firebase_uid,
            email,
            name,
            pronouns,
            bio,
            profile_image,
            color_group,
            survey_answers
          )
          VALUES (?, ?, ?, ?, ?, ?, ?, ?)
          ON DUPLICATE KEY UPDATE
            email = VALUES(email),
            name = VALUES(name),
            pronouns = VALUES(pronouns),
            bio = VALUES(bio),
            profile_image = VALUES(profile_image),
            color_group = VALUES(color_group),
            survey_answers = VALUES(survey_answers)
        `,
        [
          firebaseUid,
          email,
          name,
          pronouns,
          bio,
          profileImage,
          colorGroup || null,
          surveyAnswers
        ]
      );
    });

    res.json({ ok: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get("/api/users/me", async (req, res) => {
  const firebaseUid = getUid(req);

  if (!firebaseUid) {
    return res.status(400).json({ error: "uid is required." });
  }

  try {
    const data = await withDb(async (conn) => {
      const users = await conn.query(
        `
          SELECT firebase_uid AS firebaseUid, email, name, pronouns, bio, profile_image AS profileImage, color_group AS colorGroup
          FROM users
          WHERE firebase_uid = ?
          LIMIT 1
        `,
        [firebaseUid]
      );

      if (!users[0]) {
        return null;
      }

      const savedMatches = await conn.query(
        `
          SELECT
            u.firebase_uid AS firebaseUid,
            u.name,
            u.email,
            u.pronouns,
            u.bio,
            u.profile_image AS profileImage,
            u.color_group AS colorGroup
          FROM saved_matches sm
          JOIN users u ON u.firebase_uid = sm.saved_user_uid
          WHERE sm.user_uid = ?
          ORDER BY sm.created_at DESC
        `,
        [firebaseUid]
      );

      return { user: users[0], savedMatches };
    });

    if (!data) {
      return res.status(404).json({ error: "User not found." });
    }

    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get("/api/matches", async (req, res) => {
  const firebaseUid = getUid(req);

  if (!firebaseUid) {
    return res.status(400).json({ error: "uid is required." });
  }

  try {
    const matches = await withDb(async (conn) => {
      const users = await conn.query(
        `SELECT color_group AS colorGroup FROM users WHERE firebase_uid = ? LIMIT 1`,
        [firebaseUid]
      );

      const colorGroup = users[0]?.colorGroup;

      if (!colorGroup) {
        return [];
      }

      return conn.query(
        `
          SELECT
            u.firebase_uid AS firebaseUid,
            u.name,
            u.email,
            u.pronouns,
            u.bio,
            u.profile_image AS profileImage,
            u.color_group AS colorGroup,
            EXISTS(
              SELECT 1
              FROM saved_matches sm
              WHERE sm.user_uid = ? AND sm.saved_user_uid = u.firebase_uid
            ) AS bookmarked
          FROM users u
          WHERE u.color_group = ? AND u.firebase_uid <> ?
          ORDER BY u.name ASC
        `,
        [firebaseUid, colorGroup, firebaseUid]
      );
    });

    res.json(matches.map((match) => ({ ...match, bookmarked: Boolean(match.bookmarked) })));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/matches/toggle", async (req, res) => {
  const firebaseUid = getUid(req);
  const targetUid = cleanText(req.body?.targetUid, 128);

  if (!firebaseUid || !targetUid) {
    return res.status(400).json({ error: "firebaseUid and targetUid are required." });
  }

  if (firebaseUid === targetUid) {
    return res.status(400).json({ error: "You cannot save yourself." });
  }

  try {
    const bookmarked = await withDb(async (conn) => {
      const rows = await conn.query(
        `SELECT 1 FROM saved_matches WHERE user_uid = ? AND saved_user_uid = ? LIMIT 1`,
        [firebaseUid, targetUid]
      );

      if (rows[0]) {
        await conn.query(
          `DELETE FROM saved_matches WHERE user_uid = ? AND saved_user_uid = ?`,
          [firebaseUid, targetUid]
        );
        return false;
      }

      await conn.query(
        `INSERT INTO saved_matches (user_uid, saved_user_uid) VALUES (?, ?)`,
        [firebaseUid, targetUid]
      );
      return true;
    });

    res.json({ bookmarked });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get("/api/messages/inbox", async (req, res) => {
  const firebaseUid = getUid(req);

  if (!firebaseUid) {
    return res.status(400).json({ error: "uid is required." });
  }

  try {
    const rows = await withDb((conn) => fetchPostcards(conn, firebaseUid, "inbox"));
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get("/api/messages/outbox", async (req, res) => {
  const firebaseUid = getUid(req);

  if (!firebaseUid) {
    return res.status(400).json({ error: "uid is required." });
  }

  try {
    const rows = await withDb((conn) => fetchPostcards(conn, firebaseUid, "outbox"));
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/messages", async (req, res) => {
  try {
    const result = await withDb((conn) => insertMessage(conn, req.body));
    res.status(201).json({
      id: result.id,
      recipient: {
        firebaseUid: result.recipientUid,
        email: result.recipientEmail,
        name: result.recipientName
      }
    });
  } catch (error) {
    res.status(error.statusCode || 500).json({ error: error.message });
  }
});

app.get("/api/chat/contacts", async (req, res) => {
  const firebaseUid = getUid(req);

  if (!firebaseUid) {
    return res.status(400).json({ error: "uid is required." });
  }

  try {
    const contacts = await withDb((conn) => fetchChatContacts(conn, firebaseUid));
    res.json(contacts);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get("/api/chat/thread", async (req, res) => {
  const firebaseUid = getUid(req);
  const targetUid = cleanText(req.query?.targetUid, 128);

  if (!firebaseUid || !targetUid) {
    return res.status(400).json({ error: "uid and targetUid are required." });
  }

  try {
    const thread = await withDb((conn) => fetchChatThread(conn, firebaseUid, targetUid));
    res.json(thread);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/chat/messages", async (req, res) => {
  try {
    const result = await withDb((conn) => insertMessage(conn, {
      ...req.body,
      messageType: "chat",
      subject: ""
    }));

    broadcastToUsers([result.senderUid, result.recipientUid], {
      type: "chat.message",
      message: result
    });

    res.status(201).json(result);
  } catch (error) {
    res.status(error.statusCode || 500).json({ error: error.message });
  }
});

app.post("/api/messages/:id/like", async (req, res) => {
  const firebaseUid = getUid(req);
  const messageId = Number(req.params.id);

  if (!firebaseUid || !messageId) {
    return res.status(400).json({ error: "firebaseUid and message id are required." });
  }

  try {
    const data = await withDb(async (conn) => {
      const existing = await conn.query(
        `SELECT 1 FROM message_likes WHERE message_id = ? AND user_uid = ? LIMIT 1`,
        [messageId, firebaseUid]
      );

      if (existing[0]) {
        await conn.query(
          `DELETE FROM message_likes WHERE message_id = ? AND user_uid = ?`,
          [messageId, firebaseUid]
        );
      } else {
        await conn.query(
          `INSERT INTO message_likes (message_id, user_uid) VALUES (?, ?)`,
          [messageId, firebaseUid]
        );
      }

      const counts = await conn.query(
        `
          SELECT
            COUNT(*) AS likeCount,
            EXISTS(
              SELECT 1
              FROM message_likes
              WHERE message_id = ? AND user_uid = ?
            ) AS likedByMe
          FROM message_likes
          WHERE message_id = ?
        `,
        [messageId, firebaseUid, messageId]
      );

      return {
        likeCount: Number(counts[0]?.likeCount || 0),
        likedByMe: Boolean(counts[0]?.likedByMe)
      };
    });

    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

wss.on("connection", (socket, request, clientInfo) => {
  socket.clientInfo = clientInfo;
  addSocket(clientInfo.uid, socket);

  withDb((conn) => upsertBasicUser(conn, {
    firebaseUid: clientInfo.uid,
    email: clientInfo.email,
    name: clientInfo.name
  })).catch(() => {});

  sendSocket(socket, { type: "socket.ready", uid: clientInfo.uid });

  socket.on("message", async (raw) => {
    let payload;

    try {
      payload = JSON.parse(raw.toString());
    } catch {
      sendSocket(socket, { type: "socket.error", error: "Invalid socket payload." });
      return;
    }

    if (payload.type !== "chat.send") {
      return;
    }

    try {
      const message = await withDb((conn) => insertMessage(conn, {
        senderUid: clientInfo.uid,
        senderEmail: clientInfo.email,
        senderName: clientInfo.name,
        recipientUid: payload.recipientUid,
        recipientEmail: payload.recipientEmail,
        recipientName: payload.recipientName,
        body: payload.body,
        messageType: "chat",
        subject: "",
        payload: {}
      }));

      broadcastToUsers([message.senderUid, message.recipientUid], {
        type: "chat.message",
        message
      });
    } catch (error) {
      sendSocket(socket, {
        type: "socket.error",
        error: error.message
      });
    }
  });

  socket.on("close", () => {
    removeSocket(clientInfo.uid, socket);
  });
});

server.on("upgrade", (request, socket, head) => {
  const url = new URL(request.url, `http://${request.headers.host}`);

  if (url.pathname !== "/ws") {
    socket.destroy();
    return;
  }

  const uid = cleanText(url.searchParams.get("uid"), 128);
  const email = cleanText(url.searchParams.get("email"), 255);
  const name = cleanText(url.searchParams.get("name"), 120);

  if (!uid || !email || !name) {
    socket.destroy();
    return;
  }

  wss.handleUpgrade(request, socket, head, (client) => {
    wss.emit("connection", client, request, { uid, email, name });
  });
});

app.use((req, res) => {
  res.status(404).json({ error: "Not found." });
});

initDb()
  .then(() => {
    server.listen(port, hostname, () => {
      console.log(`Postd server running on http://${hostname}:${port}`);
    });
  })
  .catch((error) => {
    console.error("Failed to start server:", error);
    process.exit(1);
  });
