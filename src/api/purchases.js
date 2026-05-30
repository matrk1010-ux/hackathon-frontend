import client from "./client";

// 商品を購入
export const buyProduct = (productId, buyerEmail) =>
  client.post("/purchases/", null, {
    params: { product_id: productId, buyer_email: buyerEmail },
  });

// 購入履歴取得
export const getMyPurchases = (buyerEmail) =>
  client.get("/purchases/me", { params: { buyer_email: buyerEmail } });

// まとめて購入
export const bulkBuyProducts = (productIds, buyerEmail) =>
  client.post("/purchases/bulk", { product_ids: productIds, buyer_email: buyerEmail });
