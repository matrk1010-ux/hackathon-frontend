import client from "./client";

// Firebase ログイン後にDBと同期
export const syncUser = (username, email) =>
  client.post("/users/sync", { username, email, password: "firebase_auth" });

// メールアドレスからユーザー取得
export const getMe = (email) =>
  client.get("/users/me", { params: { email } });
