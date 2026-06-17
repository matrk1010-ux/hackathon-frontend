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

// 本人のプロフィール（表示名・アバター・自己紹介）を更新
export const updateProfile = (email, { username, avatar_url, bio }) =>
  client.patch("/users/me", { username, avatar_url, bio }, { params: { email } });

// 出品者プロフィール（出品者ページのヘッダー用）
export const getSellerProfile = (email) =>
  client.get(`/users/seller-profile/${encodeURIComponent(email)}`);
