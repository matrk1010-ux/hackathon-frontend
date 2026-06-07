import client from "./client";

// 本人向けの転売ペナルティ段階を取得（検知ロジックは非開示）
export const getResaleStatus = (userEmail) =>
  client.get(`/resale/status/${encodeURIComponent(userEmail)}`);

// 異議申し立て（スタブ：受付応答のみ）
export const submitAppeal = (userEmail, message) =>
  client.post("/resale/appeal", { user_email: userEmail, message });
