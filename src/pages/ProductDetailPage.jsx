import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useUser } from "../context/UserContext";
import { useToast } from "../context/ToastContext";
import { getProduct, getLikeStatus, likeProduct, unlikeProduct, recordView, getProducts } from "../api/products";
import { buyProduct } from "../api/purchases";
import {
  Container,
  Box,
  Typography,
  Button,
  Chip,
  Skeleton,
  Paper,
  Divider,
  Grid,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Avatar,
  Alert,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import FavoriteIcon from "@mui/icons-material/Favorite";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import PersonIcon from "@mui/icons-material/Person";
import ProductImage from "../components/ProductImage";
import ProductCard from "../components/ProductCard";

const ProductDetailPage = () => {
  const { id } = useParams();
  const { user } = useUser();
  const toast = useToast();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [liked, setLiked] = useState(false);
  const [loading, setLoading] = useState(true);
  const [buying, setBuying] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [related, setRelated] = useState([]);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { setLoading(true); fetchProduct(); }, [id, user?.email]);

  useEffect(() => {
    if (user?.email && product) {
      fetchLikeStatus();
      recordView(product.id, user.email).catch(() => {});
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, product]);

  // 同じカテゴリの関連商品を取得
  useEffect(() => {
    if (!product?.category) return setRelated([]);
    getProducts({ category: product.category, limit: 12 })
      .then((res) => {
        const items = res.data
          .filter((p) => p.id !== product.id && p.status === "available")
          .slice(0, 4);
        setRelated(items);
      })
      .catch(() => setRelated([]));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [product?.id]);

  const fetchProduct = async () => {
    try {
      const res = await getProduct(id, user?.email);
      setProduct(res.data);
    } catch (e) {
      toast("商品が見つかりません", "error");
      navigate("/");
    } finally {
      setLoading(false);
    }
  };

  const fetchLikeStatus = async () => {
    try {
      const res = await getLikeStatus(product.id, user.email);
      setLiked(res.data.liked);
    } catch (e) {}
  };

  const handleLike = async () => {
    if (!user) return toast("ログインが必要です", "warning");
    try {
      if (liked) {
        await unlikeProduct(product.id, user.email);
        setLiked(false);
      } else {
        await likeProduct(product.id, user.email);
        setLiked(true);
      }
    } catch (e) {
      toast("操作に失敗しました", "error");
    }
  };

  const handleBuy = async () => {
    setConfirmOpen(false);
    setBuying(true);
    try {
      await buyProduct(product.id, user.email);
      toast("購入が完了しました！", "success");
      navigate("/mypage");
    } catch (e) {
      toast(e.response?.data?.detail || "購入に失敗しました", "error");
    } finally {
      setBuying(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ bgcolor: "grey.50", minHeight: "100vh", py: 3 }}>
        <Container maxWidth="md">
          <Skeleton width={80} height={40} sx={{ mb: 2 }} />
          <Paper elevation={2} sx={{ borderRadius: 3, overflow: "hidden" }}>
            <Box sx={{ display: "flex", flexDirection: { xs: "column", md: "row" } }}>
              <Skeleton
                variant="rectangular"
                sx={{ width: { xs: "100%", md: "45%" }, minHeight: { xs: 280, md: 360 } }}
              />
              <Box sx={{ p: 3, flexGrow: 1 }}>
                <Skeleton width={120} height={32} sx={{ mb: 1 }} />
                <Skeleton width="80%" height={40} />
                <Skeleton width="40%" height={48} sx={{ mb: 2 }} />
                <Skeleton variant="rectangular" height={44} sx={{ borderRadius: 1, mb: 3 }} />
                <Skeleton width="100%" />
                <Skeleton width="95%" />
                <Skeleton width="70%" />
              </Box>
            </Box>
          </Paper>
        </Container>
      </Box>
    );
  }
  if (!product) return null;

  const isMine = user?.id === product.seller_id;
  const isSold = product.status === "sold";

  return (
    <Box sx={{ bgcolor: "grey.50", minHeight: "100vh", py: 3 }}>
      <Container maxWidth="md">
        {/* 戻るボタン */}
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate(-1)}
          sx={{ mb: 2, color: "text.secondary" }}
        >
          戻る
        </Button>

        <Paper elevation={2} sx={{ borderRadius: 3, overflow: "hidden" }}>
          <Box sx={{ display: "flex", flexDirection: { xs: "column", md: "row" } }}>
            {/* 画像 */}
            <Box
              sx={{
                width: { xs: "100%", md: "45%" },
                minHeight: { xs: 280, md: 360 },
                display: "flex",
                flexShrink: 0,
              }}
            >
              <ProductImage product={product} height="100%" emojiSize={96} />
            </Box>

            {/* 情報 */}
            <Box sx={{ p: 3, flexGrow: 1 }}>
              <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", mb: 1 }}>
                {product.category && (
                  <Chip
                    label={product.category}
                    color="primary"
                    variant="outlined"
                    size="small"
                  />
                )}
                {product.condition && (
                  <Chip
                    label={`状態: ${product.condition}`}
                    color="default"
                    variant="outlined"
                    size="small"
                  />
                )}
              </Box>

              <Typography variant="h5" sx={{ fontWeight: 700, mb: 1 }}>
                {product.title}
              </Typography>

              <Typography variant="h4" color="primary" sx={{ fontWeight: 700, mb: 2 }}>
                ¥{product.price.toLocaleString()}
              </Typography>

              {isSold && (
                <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>
                  この商品は売り切れです
                </Alert>
              )}

              {product.resale_flagged && !isMine && (
                <Alert severity="warning" sx={{ mb: 2, borderRadius: 2 }}>
                  この商品は転売の可能性があると判定されています。購入は慎重にご検討ください。
                </Alert>
              )}

              {isMine && product.hidden_by_penalty && (
                <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>
                  転売の疑いにより、この商品は現在他のユーザーに表示されていません。
                </Alert>
              )}

              {/* アクションボタン */}
              <Box sx={{ display: "flex", gap: 2, mb: 3, flexWrap: "wrap" }}>
                <Button
                  variant={liked ? "contained" : "outlined"}
                  color={liked ? "error" : "inherit"}
                  startIcon={liked ? <FavoriteIcon /> : <FavoriteBorderIcon />}
                  onClick={handleLike}
                  sx={{ fontWeight: 600 }}
                >
                  {liked ? "いいね済み" : "いいね"}
                </Button>

                {!isMine && !isSold && (
                  <Button
                    variant="contained"
                    color="primary"
                    startIcon={<ShoppingCartIcon />}
                    onClick={() => {
                      if (!user) return toast("ログインが必要です", "warning");
                      setConfirmOpen(true);
                    }}
                    disabled={buying}
                    sx={{ fontWeight: 700 }}
                  >
                    {buying ? "処理中..." : "購入する"}
                  </Button>
                )}

                {isMine && (
                  <Chip label="自分の出品" color="default" variant="outlined" />
                )}
              </Box>

              <Divider sx={{ mb: 2 }} />

              {/* 商品説明 */}
              {product.description && (
                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 0.5 }}>
                    商品説明
                  </Typography>
                  <Typography variant="body2" sx={{ whiteSpace: "pre-wrap", lineHeight: 1.8 }}>
                    {product.description}
                  </Typography>
                </Box>
              )}

              <Divider sx={{ mb: 2 }} />

              {/* 出品者 */}
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <Avatar sx={{ width: 32, height: 32, bgcolor: "primary.light" }}>
                  <PersonIcon fontSize="small" />
                </Avatar>
                <Box>
                  <Typography variant="caption" color="text.secondary">出品者</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    {product.seller?.username || "不明"}
                  </Typography>
                </Box>
              </Box>
            </Box>
          </Box>
        </Paper>

        {/* 関連商品 */}
        {related.length > 0 && (
          <Box sx={{ mt: 5 }}>
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
              関連商品
            </Typography>
            <Grid container spacing={2}>
              {related.map((p) => (
                <Grid item xs={6} sm={4} md={3} key={p.id}>
                  <ProductCard product={p} />
                </Grid>
              ))}
            </Grid>
          </Box>
        )}
      </Container>

      {/* 購入確認ダイアログ */}
      <Dialog open={confirmOpen} onClose={() => setConfirmOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>購入の確認</DialogTitle>
        <DialogContent>
          <DialogContentText>
            「{product.title}」を
            <Typography component="span" color="primary" sx={{ fontWeight: 700, mx: 0.5 }}>
              ¥{product.price.toLocaleString()}
            </Typography>
            で購入しますか？
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setConfirmOpen(false)}>キャンセル</Button>
          <Button variant="contained" onClick={handleBuy} autoFocus>
            購入する
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ProductDetailPage;
