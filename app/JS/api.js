import { auth } from "./firebase.js";

function toQuery(params = {}) {
  const search = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      search.set(key, value);
    }
  });

  const query = search.toString();
  return query ? `?${query}` : "";
}

export async function apiFetch(path, options = {}) {
  const headers = new Headers(options.headers || {});
  const body = options.body;
  const isFormData = body instanceof FormData;
  const user = auth.currentUser;

  if (user?.uid) {
    headers.set("x-firebase-uid", user.uid);
  }

  let payload = body;

  if (body && !isFormData && typeof body === "object") {
    headers.set("Content-Type", "application/json");
    payload = JSON.stringify(body);
  }

  const response = await fetch(path, {
    ...options,
    headers,
    body: payload
  });

  const text = await response.text();
  let data = null;

  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      data = { error: text };
    }
  }

  if (!response.ok) {
    throw new Error(data?.error || "Request failed.");
  }

  return data;
}

export { toQuery };
