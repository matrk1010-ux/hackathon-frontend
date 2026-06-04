import client from "./client";

// Geminiで商品説明を自動生成
export const generateDescription = (title, category, price, condition = null, notes = null) =>
  client.post("/ai/generate-description", { title, category, price, condition, notes });

// 商品画像をGeminiで解析して商品名・カテゴリ・状態を推定
export const analyzeImage = (imageBase64) =>
  client.post("/ai/analyze-image", { image_base64: imageBase64 });
