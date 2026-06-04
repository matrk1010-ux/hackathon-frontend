import React from "react";
import { Grid, Card, Box, Skeleton } from "@mui/material";

// 商品グリッドの読み込み中プレースホルダー（全画面共通）
const ProductGridSkeleton = ({ count = 8 }) => (
  <Grid container spacing={2}>
    {Array.from({ length: count }).map((_, i) => (
      <Grid item xs={6} sm={4} md={3} key={i}>
        <Card sx={{ borderRadius: 2 }} elevation={2}>
          <Skeleton variant="rectangular" height={180} />
          <Box sx={{ p: 1.5 }}>
            <Skeleton width="90%" />
            <Skeleton width="50%" />
            <Skeleton width="40%" height={28} sx={{ mt: 1 }} />
          </Box>
        </Card>
      </Grid>
    ))}
  </Grid>
);

export default ProductGridSkeleton;
