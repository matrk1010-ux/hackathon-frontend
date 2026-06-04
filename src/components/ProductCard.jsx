import React from "react";
import { useNavigate } from "react-router-dom";
import {
  Card,
  CardActionArea,
  CardContent,
  Typography,
  Chip,
  Box,
  Stack,
} from "@mui/material";
import ProductImage from "./ProductImage";

const ProductCard = ({ product }) => {
  const navigate = useNavigate();
  const isSold = product.status === "sold";

  return (
    <Card
      sx={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        borderRadius: 2,
        transition: "transform 0.15s ease, box-shadow 0.15s ease",
        "&:hover": { transform: "translateY(-4px)", boxShadow: 6 },
      }}
      elevation={2}
    >
      <CardActionArea
        onClick={() => navigate(`/products/${product.id}`)}
        sx={{ flexGrow: 1, display: "flex", flexDirection: "column", alignItems: "stretch" }}
      >
        {/* 画像（無い場合はカテゴリ別プレースホルダー） */}
        <Box sx={{ position: "relative" }}>
          <ProductImage product={product} height={180} />
          {isSold && (
            <Box
              sx={{
                position: "absolute",
                inset: 0,
                bgcolor: "rgba(0,0,0,0.5)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Chip label="SOLD" color="default" sx={{ bgcolor: "white", fontWeight: 700 }} />
            </Box>
          )}
        </Box>

        {/* 情報 */}
        <CardContent sx={{ flexGrow: 1, pb: "12px !important" }}>
          <Typography
            variant="body2"
            sx={{
              fontWeight: 600,
              mb: 0.5,
              overflow: "hidden",
              textOverflow: "ellipsis",
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
            }}
          >
            {product.title}
          </Typography>
          <Stack direction="row" spacing={0.5} sx={{ mb: 1, flexWrap: "wrap", gap: 0.5 }}>
            {product.category && (
              <Chip
                label={product.category}
                size="small"
                color="primary"
                variant="outlined"
                sx={{ fontSize: "0.7rem" }}
              />
            )}
            {product.condition && (
              <Chip
                label={product.condition}
                size="small"
                variant="outlined"
                sx={{ fontSize: "0.7rem", color: "text.secondary", borderColor: "grey.300" }}
              />
            )}
          </Stack>
          <Typography variant="subtitle1" color="primary" sx={{ fontWeight: 700 }}>
            ¥{product.price.toLocaleString()}
          </Typography>
        </CardContent>
      </CardActionArea>
    </Card>
  );
};

export default ProductCard;
