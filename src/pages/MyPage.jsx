import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useUser } from "../context/UserContext";
import { getSellerProducts } from "../api/products";
import { getMyPurchases } from "../api/purchases";
import ProductCard from "../components/ProductCard";
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
  ListItemText,
  ListItemButton,
  Divider,
  Chip,
} from "@mui/material";
import AddBoxIcon from "@mui/icons-material/AddBox";
import ShoppingBagIcon from "@mui/icons-material/ShoppingBag";

const MyPage = () => {
  const { user } = useUser();
  const navigate = useNavigate();
  const [tab, setTab] = useState(0);
  const [sellingProducts, setSellingProducts] = useState([]);
  const [purchases, setPurchases] = useState([]);
  const [loading, setLoading] = useState(true);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { if (user?.email) fetchData(); }, [user]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [sellRes, buyRes] = await Promise.all([
        getSellerProducts(user.email),
        getMyPurchases(user.email),
      ]);
      setSellingProducts(sellRes.data);
      setPurchases(buyRes.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
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
            <Tab label={`購入履歴 (${purchases.length})`} />
          </Tabs>
        </Paper>

        {/* コンテンツ */}
        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
            <CircularProgress color="primary" />
          </Box>
        ) : (
          <Box>
            {/* 出品中 */}
            {tab === 0 && (
              <>
                {available.length === 0 ? (
                  <Box sx={{ textAlign: "center", py: 6 }}>
                    <ShoppingBagIcon sx={{ fontSize: 64, color: "grey.300", mb: 2 }} />
                    <Typography color="text.secondary" sx={{ mb: 3 }}>
                      出品中の商品はありません
                    </Typography>
                    <Button
                      variant="contained"
                      startIcon={<AddBoxIcon />}
                      onClick={() => navigate("/sell")}
                    >
                      出品する
                    </Button>
                  </Box>
                ) : (
                  <Grid container spacing={2}>
                    {available.map((p) => (
                      <Grid item xs={6} sm={4} md={3} key={p.id}>
                        <ProductCard product={p} />
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
                  <Alert severity="info" sx={{ borderRadius: 2 }}>売り切れた商品はありません</Alert>
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

            {/* 購入履歴 */}
            {tab === 2 && (
              <>
                {purchases.length === 0 ? (
                  <Alert severity="info" sx={{ borderRadius: 2 }}>購入履歴はありません</Alert>
                ) : (
                  <Paper elevation={1} sx={{ borderRadius: 2, overflow: "hidden" }}>
                    <List disablePadding>
                      {purchases.map((purchase, index) => (
                        <React.Fragment key={purchase.id}>
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
    </Box>
  );
};

export default MyPage;
