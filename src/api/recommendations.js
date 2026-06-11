import client from "./client";

// レコメンド商品取得（category指定でカテゴリ絞り込み）
export const getRecommendations = (userEmail, limit = 10, category = null) =>
  client.get("/recommendations/", {
    params: { user_email: userEmail, limit, ...(category ? { category } : {}) },
  });

// この商品に似た商品（embeddingのコサイン類似度順）
export const getSimilarProducts = (productId, limit = 4) =>
  client.get(`/recommendations/similar/${productId}`, { params: { limit } });
