import { auth, db } from "./firebase.js";
import { doc, getDoc } from "https://www.gstatic.com/firebasejs/12.10.0/firebase-firestore.js";
import { apiFetch } from "./api.js";

function inferName(email = "") {
  return email.split("@")[0] || "Postd user";
}

export async function syncCurrentUser(overrides = {}) {
  const user = auth.currentUser;

  if (!user) {
    throw new Error("No authenticated user.");
  }

  const snap = await getDoc(doc(db, "users", user.uid));
  const profile = snap.exists() ? snap.data() : {};

  const payload = {
    firebaseUid: user.uid,
    email: overrides.email || profile.email || user.email || "",
    name: overrides.name || profile.name || user.displayName || inferName(user.email),
    pronouns: overrides.pronouns ?? profile.pronouns ?? "",
    bio: overrides.bio ?? profile.bio ?? "",
    profileImage: overrides.profileImage ?? profile.profileImage ?? "",
    colorGroup: overrides.colorGroup ?? profile.color ?? "",
    surveyAnswers: overrides.surveyAnswers ?? profile.answers ?? []
  };

  await apiFetch("/api/users/sync", {
    method: "POST",
    body: payload
  });

  return payload;
}
