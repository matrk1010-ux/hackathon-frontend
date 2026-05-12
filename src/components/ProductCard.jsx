import React from "react";
import { useNavigate } from "react-router-dom";
import {
  Card,
  CardActionArea,
  CardMedia,
  CardContent,
  Typography,
  Chip,
  Box,
} from "@mui/material";
import ImageNotSupportedIcon from "@mui/icons-material/ImageNotSupported";

const ProductCard = ({ product }) => {
  const navigate = useNavigate();

  return (
    <Card
      sx={{ height: "100%", display: "flex", flexDirection: "column", borderRadius: 2 }}
      elevation={2}
    >
      <CardActionArea
        onClick={() => navigate(`/products/${product.id}`)}
        sx={{ flexGrow: 1, display: "flex", flexDirection: "column", alignItems: "stretch" }}
      >
        {/* 画像 */}
        {product.image_url ? (
          <CardMedia
            component="img"
            image={product.image_url}
            alt={product.title}
            sx={{ height: 180, objectFit: "cover" }}
          />
        ) : (
          <Box
            sx={{
              height: 180,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              bgcolor: "grey.100",
              color: "grey.400",
            }}
          >
            <ImageNotSupportedIcon sx={{ fontSize: 48 }} />
          </Box>
        )}

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
          {product.category && (
            <Chip
              label={product.category}
              size="small"
              color="primary"
              variant="outlined"
              sx={{ mb: 1, fontSize: "0.7rem" }}
            />
          )}
          <Typography variant="subtitle1" color="primary" sx={{ fontWeight: 700 }}>
            ¥{product.price.toLocaleString()}
          </Typography>
        </CardContent>
      </CardActionArea>
    </Card>
  );
};

export default ProductCard;
