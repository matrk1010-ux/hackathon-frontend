import client from "./client";

// Geminiで商品説明を自動生成
export const generateDescription = (title, category, price) =>
  client.post("/ai/generate-description", { title, category, price });
