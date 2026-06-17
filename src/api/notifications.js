import client from "./client";

// 自分の出品への いいね/コメント/購入 を新着順で取得（未読数つき）
export const getNotifications = (email) =>
  client.get("/notifications/", { params: { user_email: email } });

// 通知を既読にする（最後に開いた時刻を更新）
export const markNotificationsRead = (email) =>
  client.post("/notifications/read", null, { params: { user_email: email } });
