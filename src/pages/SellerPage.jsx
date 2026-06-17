import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getSellerProducts } from "../api/products";
import { getSellerProfile } from "../api/users";
import ProductCard from "../components/ProductCard";
import ProductGridSkeleton from "../components/ProductGridSkeleton";
import EmptyState from "../components/EmptyState";
import { parseUtc } from "../utils/datetime";
import {
  Container,
  Box,
  Typography,
  Avatar,
  Paper,
  Grid,
  Button,
  Alert,
  Chip,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import PersonIcon from "@mui/icons-material/Person";
import ShoppingBagIcon from "@mui/icons-material/ShoppingBag";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";

const SellerPage = () => {
  const { email } = useParams();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    setLoading(true);
    Promise.all([
      getSellerProfile(email).then((res) => res.data).catch(() => null),
      getSellerProducts(email, 100, true).then((res) => res.data).catch(() => []),
    ]).then(([prof, prods]) => {
      if (!active) return;
      setProfile(prof);
      setProducts(prods);
      setLoading(false);
    });
    return () => {
      active = false;
    };
  }, [email]);

  const available = products.filter((p) => p.status === "available");
  const sold = products.filter((p) => p.status === "sold");

  return (
    <Box sx={{ bgcolor: "grey.50", minHeight: "100vh", pb: 6 }}>
      {/* プロフィールヘッダー */}
      <Paper elevation={0} sx={{ bgcolor: "primary.main", color: "white", py: 4 }}>
        <Container maxWidth="lg">
          <Button
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate(-1)}
            sx={{ color: "white", mb: 2, opacity: 0.9 }}
          >
            戻る
          </Button>
          <Box sx={{ display: "flex", alignItems: "center", gap: 3 }}>
            <Avatar
              src={profile?.avatar_url || ""}
              sx={{
                width: 72,
                height: 72,
                border: "3px solid rgba(255,255,255,0.5)",
                bgcolor: "primary.light",
                fontSize: "1.8rem",
              }}
            >
              <PersonIcon sx={{ fontSize: "2.2rem" }} />
            </Avatar>
            <Box>
              <Typography variant="h5" sx={{ fontWeight: 700 }}>
                {profile?.username || "出品者"}
              </Typography>
              <Box sx={{ display: "flex", gap: 2, mt: 0.5, flexWrap: "wrap" }}>
                <Typography variant="body2" sx={{ opacity: 0.9 }}>
                  出品中 {profile?.active_count ?? available.length}
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.9 }}>
                  売却済み {profile?.sold_count ?? sold.length}
                </Typography>
              </Box>
              {profile?.bio && (
                <Typography variant="body2" sx={{ opacity: 0.95, mt: 0.75, whiteSpace: "pre-wrap" }}>
                  {profile.bio}
                </Typography>
              )}
              {profile?.created_at && (
                <Typography variant="caption" sx={{ opacity: 0.75, display: "block", mt: 0.5 }}>
                  {parseUtc(profile.created_at).toLocaleDateString("ja-JP")} に登録
                </Typography>
              )}
            </Box>
          </Box>
        </Container>
      </Paper>

      <Container maxWidth="lg" sx={{ pt: 3 }}>
        {/* 転売注意（段階1以上の出品者） */}
        {profile?.resale_stage >= 1 && (
          <Alert severity="warning" icon={<WarningAmberIcon />} sx={{ borderRadius: 2, mb: 3 }}>
            この出品者は転売の可能性が検知されています。購入は慎重にご検討ください。
          </Alert>
        )}

        {loading ? (
          <ProductGridSkeleton count={8} />
        ) : products.length === 0 ? (
          <EmptyState
            icon={<ShoppingBagIcon sx={{ fontSize: 64 }} />}
            message="出品中の商品はありません"
          />
        ) : (
          <>
            {/* 出品中 */}
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
              出品中の商品
            </Typography>
            {available.length === 0 ? (
              <EmptyState
                icon={<ShoppingBagIcon sx={{ fontSize: 64 }} />}
                message="出品中の商品はありません"
              />
            ) : (
              <Grid container spacing={2}>
                {available.map((p) => (
                  <Grid item xs={6} sm={4} md={3} key={p.id}>
                    <ProductCard product={p} />
                  </Grid>
                ))}
              </Grid>
            )}

            {/* 売却済み */}
            {sold.length > 0 && (
              <Box sx={{ mt: 5 }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
                  <Typography variant="h6" sx={{ fontWeight: 700 }}>
                    売却済み
                  </Typography>
                  <Chip label={sold.length} size="small" />
                </Box>
                <Grid container spacing={2}>
                  {sold.map((p) => (
                    <Grid item xs={6} sm={4} md={3} key={p.id}>
                      <ProductCard product={p} />
                    </Grid>
                  ))}
                </Grid>
              </Box>
            )}
          </>
        )}
      </Container>
    </Box>
  );
};

export default SellerPage;
