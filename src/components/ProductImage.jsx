import React from "react";
import { Box, Typography } from "@mui/material";

// カテゴリごとの配色・アイコン（画像が無い商品のプレースホルダー用）
const CATEGORY_STYLE = {
  "服・ファッション": { emoji: "👕", colors: ["#ff8fab", "#ff6b9d"] },
  "本・漫画": { emoji: "📚", colors: ["#7b8cff", "#5b6fd6"] },
  "家電・スマホ": { emoji: "📱", colors: ["#48cae4", "#00b4d8"] },
  "スポーツ": { emoji: "⚽", colors: ["#90be6d", "#43aa8b"] },
  "おもちゃ": { emoji: "🧸", colors: ["#fcbf49", "#f9844a"] },
  "家具・インテリア": { emoji: "🛋️", colors: ["#c8956d", "#9c6644"] },
  "コスメ・美容": { emoji: "💄", colors: ["#f72585", "#b5179e"] },
  "その他": { emoji: "📦", colors: ["#adb5bd", "#6c757d"] },
};

const DEFAULT_STYLE = CATEGORY_STYLE["その他"];

/**
 * 商品画像。image_url があればそれを、無ければカテゴリ別の
 * グラデーション＋アイコン＋商品名のプレースホルダーを表示する。
 */
const ProductImage = ({ product, height = 180, emojiSize = 56 }) => {
  if (product?.image_url) {
    return (
      <Box
        component="img"
        src={product.image_url}
        alt={product.title}
        sx={{ width: "100%", height, objectFit: "cover", display: "block" }}
      />
    );
  }

  const style = CATEGORY_STYLE[product?.category] || DEFAULT_STYLE;
  const [c1, c2] = style.colors;

  return (
    <Box
      sx={{
        height,
        width: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 1,
        px: 2,
        textAlign: "center",
        color: "white",
        background: `linear-gradient(135deg, ${c1} 0%, ${c2} 100%)`,
      }}
    >
      <Box sx={{ fontSize: emojiSize, lineHeight: 1 }}>{style.emoji}</Box>
      <Typography
        variant="caption"
        sx={{
          fontWeight: 700,
          textShadow: "0 1px 3px rgba(0,0,0,0.25)",
          overflow: "hidden",
          textOverflow: "ellipsis",
          display: "-webkit-box",
          WebkitLineClamp: 2,
          WebkitBoxOrient: "vertical",
          lineHeight: 1.3,
        }}
      >
        {product?.title}
      </Typography>
    </Box>
  );
};

export default ProductImage;
