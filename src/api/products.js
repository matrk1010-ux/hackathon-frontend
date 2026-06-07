import client from "./client";

// 商品一覧取得（検索・フィルタ対応）
export const getProducts = (params) =>
  client.get("/products/", { params });

// 商品詳細取得（本人は転売非表示中の自分の商品も閲覧できるよう user_email を渡す）
export const getProduct = (id, userEmail) =>
  client.get(`/products/${id}`, {
    params: userEmail ? { user_email: userEmail } : {},
  });

// 商品出品
export const createProduct = (data, sellerEmail) =>
  client.post("/products/", data, { params: { seller_email: sellerEmail } });

// 出品取り下げ（削除）
export const deleteProduct = (productId, sellerEmail) =>
  client.delete(`/products/${productId}`, { params: { seller_email: sellerEmail } });

// 自分の出品一覧
export const getSellerProducts = (email, limit = 100) =>
  client.get(`/products/seller/${email}`, { params: { limit } });

// いいねした商品一覧
export const getLikedProducts = (userEmail, limit = 100) =>
  client.get(`/products/liked/${userEmail}`, { params: { limit } });

// いいね済み確認
export const getLikeStatus = (productId, userEmail) =>
  client.get(`/products/${productId}/like`, { params: { user_email: userEmail } });

// いいね
export const likeProduct = (productId, userEmail) =>
  client.post(`/products/${productId}/like`, null, { params: { user_email: userEmail } });

// いいね取り消し
export const unlikeProduct = (productId, userEmail) =>
  client.delete(`/products/${productId}/like`, { params: { user_email: userEmail } });

// 閲覧記録
export const recordView = (productId, userEmail) =>
  client.post(`/products/${productId}/view`, null, { params: { user_email: userEmail } });
