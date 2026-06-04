import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useUser } from "../context/UserContext";
import { getSellerProducts, deleteProduct, getLikedProducts } from "../api/products";
import { getMyPurchases } from "../api/purchases";
import ProductCard from "../components/ProductCard";
import ProductGridSkeleton from "../components/ProductGridSkeleton";
import EmptyState from "../components/EmptyState";
import {
  Container,
  Box,
  Typography,
  Avatar,
  Tabs,
  Tab,
  Grid,
  Paper,
  CircularProgress,
  Button,
  Alert,
  List,
  ListItem,
  ListItemText,
  ListItemButton,
  Divider,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
} from "@mui/material";
import AddBoxIcon from "@mui/icons-material/AddBox";
import ShoppingBagIcon from "@mui/icons-material/ShoppingBag";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import ReceiptLongIcon from "@mui/icons-material/ReceiptLong";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutlined";

const MyPage = () => {
  const { user } = useUser();
  const navigate = useNavigate();
  const [tab, setTab] = useState(0);
  const [sellingProducts, setSellingProducts] = useState([]);
  const [purchases, setPurchases] = useState([]);
  const [likedProducts, setLikedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [withdrawTarget, setWithdrawTarget] = useState(null);
  const [withdrawing, setWithdrawing] = useState(false);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { if (user?.email) fetchData(); }, [user]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [sellRes, buyRes, likedRes] = await Promise.all([
        getSellerProducts(user.email),
        getMyPurchases(user.email),
        getLikedProducts(user.email),
      ]);
      setSellingProducts(sellRes.data);
      setPurchases(buyRes.data);
      setLikedProducts(likedRes.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleWithdraw = async () => {
    if (!withdrawTarget) return;
    setWithdrawing(true);
    try {
      await deleteProduct(withdrawTarget.id, user.email);
      setWithdrawTarget(null);
      await fetchData();
    } catch (e) {
      console.error(e);
    } finally {
      setWithdrawing(false);
    }
  };

  if (!user) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", py: 10 }}>
        <Alert severity="warning" sx={{ borderRadius: 2 }}>
          マイページを見るにはログインが必要です
        </Alert>
      </Box>
    );
  }

  const available = sellingProducts.filter((p) => p.status === "available");
  const sold = sellingProducts.filter((p) => p.status === "sold");

  return (
    <Box sx={{ bgcolor: "grey.50", minHeight: "100vh", pb: 6 }}>
      {/* プロフィールヘッダー */}
      <Paper elevation={0} sx={{ bgcolor: "primary.main", color: "white", py: 4 }}>
        <Container maxWidth="lg">
          <Box sx={{ display: "flex", alignItems: "center", gap: 3 }}>
            <Avatar
              src={user.photoURL || ""}
              alt={user.displayName || "U"}
              sx={{ width: 72, height: 72, border: "3px solid rgba(255,255,255,0.5)", fontSize: "1.8rem" }}
            >
              {(user.displayName || "U")[0]}
            </Avatar>
            <Box>
              <Typography variant="h5" sx={{ fontWeight: 700 }}>
                {user.displayName || user.username}
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.85 }}>
                {user.email}
              </Typography>
            </Box>
          </Box>
        </Container>
      </Paper>

      <Container maxWidth="lg" sx={{ pt: 3 }}>
        {/* タブ */}
        <Paper elevation={1} sx={{ borderRadius: 2, mb: 3 }}>
          <Tabs
            value={tab}
            onChange={(_, v) => setTab(v)}
            indicatorColor="primary"
            textColor="primary"
            variant="fullWidth"
          >
            <Tab label={`出品中 (${available.length})`} />
            <Tab label={`売り切れ (${sold.length})`} />
            <Tab label={`いいね (${likedProducts.length})`} />
            <Tab label={`購入履歴 (${purchases.length})`} />
          </Tabs>
        </Paper>

        {/* コンテンツ */}
        {loading ? (
          <ProductGridSkeleton count={4} />
        ) : (
          <Box>
            {/* 出品中 */}
            {tab === 0 && (
              <>
                {available.length === 0 ? (
                  <EmptyState
                    icon={<ShoppingBagIcon sx={{ fontSize: 64 }} />}
                    message="出品中の商品はありません"
                    actionLabel="出品する"
                    actionIcon={<AddBoxIcon />}
                    onAction={() => navigate("/sell")}
                  />
                ) : (
                  <Grid container spacing={2}>
                    {available.map((p) => (
                      <Grid item xs={6} sm={4} md={3} key={p.id} sx={{ display: "flex" }}>
                        <Box sx={{ display: "flex", flexDirection: "column", width: "100%" }}>
                          <Box sx={{ flexGrow: 1 }}>
                            <ProductCard product={p} />
                          </Box>
                          <Button
                            fullWidth
                            size="small"
                            color="error"
                            variant="outlined"
                            startIcon={<DeleteOutlineIcon />}
                            onClick={() => setWithdrawTarget(p)}
                            sx={{ mt: 0.5 }}
                          >
                            取り下げる
                          </Button>
                        </Box>
                      </Grid>
                    ))}
                  </Grid>
                )}
              </>
            )}

            {/* 売り切れ */}
            {tab === 1 && (
              <>
                {sold.length === 0 ? (
                  <EmptyState
                    icon={<ShoppingBagIcon sx={{ fontSize: 64 }} />}
                    message="売り切れた商品はありません"
                  />
                ) : (
                  <Grid container spacing={2}>
                    {sold.map((p) => (
                      <Grid item xs={6} sm={4} md={3} key={p.id}>
                        <ProductCard product={p} />
                      </Grid>
                    ))}
                  </Grid>
                )}
              </>
            )}

            {/* いいね */}
            {tab === 2 && (
              <>
                {likedProducts.length === 0 ? (
                  <EmptyState
                    icon={<FavoriteBorderIcon sx={{ fontSize: 64 }} />}
                    message="いいねした商品はありません"
                  />
                ) : (
                  <Grid container spacing={2}>
                    {likedProducts.map((p) => (
                      <Grid item xs={6} sm={4} md={3} key={p.id}>
                        <ProductCard product={p} />
                      </Grid>
                    ))}
                  </Grid>
                )}
              </>
            )}

            {/* 購入履歴 */}
            {tab === 3 && (
              <>
                {purchases.length === 0 ? (
                  <EmptyState
                    icon={<ReceiptLongIcon sx={{ fontSize: 64 }} />}
                    message="購入履歴はありません"
                  />
                ) : (
                  <Paper elevation={1} sx={{ borderRadius: 2, overflow: "hidden" }}>
                    <List disablePadding>
                      {purchases.map((purchase, index) => (
                        <React.Fragment key={purchase.id}>
                          <ListItem disablePadding>
                            <ListItemButton onClick={() => navigate(`/products/${purchase.product_id}`)}>
                              <ListItemText
                                primary={purchase.product?.title || `商品ID: ${purchase.product_id}`}
                                secondary={new Date(purchase.purchased_at).toLocaleDateString("ja-JP")}
                                primaryTypographyProps={{ fontWeight: 600 }}
                              />
                              <Chip
                                label={`¥${purchase.price.toLocaleString()}`}
                                color="primary"
                                size="small"
                                sx={{ fontWeight: 700 }}
                              />
                            </ListItemButton>
                          </ListItem>
                          {index < purchases.length - 1 && <Divider />}
                        </React.Fragment>
                      ))}
                    </List>
                  </Paper>
                )}
              </>
            )}
          </Box>
        )}
      </Container>

      {/* 取り下げ確認ダイアログ */}
      <Dialog open={Boolean(withdrawTarget)} onClose={() => setWithdrawTarget(null)}>
        <DialogTitle>出品を取り下げますか？</DialogTitle>
        <DialogContent>
          <DialogContentText>
            「{withdrawTarget?.title}」を取り下げます。この操作は取り消せません。
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button onClick={() => setWithdrawTarget(null)} color="inherit" disabled={withdrawing}>
            キャンセル
          </Button>
          <Button
            onClick={handleWithdraw}
            color="error"
            variant="contained"
            disabled={withdrawing}
            startIcon={withdrawing ? <CircularProgress size={16} color="inherit" /> : <DeleteOutlineIcon />}
          >
            取り下げる
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default MyPage;
