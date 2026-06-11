import client from "./client";

// Firebase ログイン後にDBと同期
export const syncUser = (username, email) =>
  client.post("/users/sync", { username, email, password: "firebase_auth" });

// メールアドレスからユーザー取得
export const getMe = (email) =>
  client.get("/users/me", { params: { email } });

// 本人のユーザー名（取引時の表示名）を更新
export const updateUsername = (email, username) =>
  client.patch("/users/me", { username }, { params: { email } });
