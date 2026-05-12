import client from "./client";

// レコメンド商品取得
export const getRecommendations = (userEmail, limit = 10) =>
  client.get("/recommendations/", { params: { user_email: userEmail, limit } });
