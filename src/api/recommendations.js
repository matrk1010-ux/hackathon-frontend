import client from "./client";

// レコメンド商品取得（category指定でカテゴリ絞り込み）
export const getRecommendations = (userEmail, limit = 10, category = null) =>
  client.get("/recommendations/", {
    params: { user_email: userEmail, limit, ...(category ? { category } : {}) },
  });
