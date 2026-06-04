import React, { useState, useEffect } from "react";
import { signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import { fireAuth } from "../firebase";
import { useUser } from "../context/UserContext";
import { useToast } from "../context/ToastContext";
import { getProducts } from "../api/products";
import { getRecommendations } from "../api/recommendations";
import ProductCard from "../components/ProductCard";
import {
  Container,
  Box,
  Typography,
  TextField,
  Button,
  Grid,
  Paper,
  Skeleton,
  Card,
  InputAdornment,
  IconButton,
  Alert,
  Chip,
  Stack,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import ClearIcon from "@mui/icons-material/Clear";
import GoogleIcon from "@mui/icons-material/Google";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";

const CATEGORIES = [
  "服・ファッション",
  "本・漫画",
  "家電・スマホ",
  "スポーツ",
  "おもちゃ",
  "家具・インテリア",
  "コスメ・美容",
  "その他",
];

const HomePage = () => {
  const { user } = useUser();
  const toast = useToast();
  const [products, setProducts] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [keyword, setKeyword] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [category, setCategory] = useState("");
  const [loading, setLoading] = useState(true);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { fetchProducts(); }, [keyword, category]);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { if (user?.email) fetchRecommendations(); }, [user]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const params = { limit: 20 };
      if (keyword) params.keyword = keyword;
      if (category) params.category = category;
      const res = await getProducts(params);
      setProducts(res.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const fetchRecommendations = async () => {
    try {
      const res = await getRecommendations(user.email);
      setRecommendations(res.data);
    } catch (e) {
      console.error(e);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setKeyword(searchInput);
  };

  const handleClear = () => {
    setKeyword("");
    setSearchInput("");
  };

  const handleGoogleLogin = async () => {
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(fireAuth, provider);
      toast("ログインしました", "success");
    } catch (e) {
      toast("ログインに失敗しました", "error");
    }
  };

  return (
    <Box sx={{ bgcolor: "grey.50", minHeight: "100vh" }}>
      {/* ログインバナー */}
      {!user && (
        <Paper
          elevation={0}
          sx={{
            bgcolor: "primary.main",
            color: "white",
            py: 3,
            borderRadius: 0,
          }}
        >
          <Container maxWidth="md">
            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 2 }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <AutoAwesomeIcon />
                <Typography variant="body1" sx={{ fontWeight: 500 }}>
                  ログインするとAIレコメンド機能が使えます
                </Typography>
              </Box>
              <Button
                variant="contained"
                startIcon={<GoogleIcon />}
                onClick={handleGoogleLogin}
                sx={{
                  bgcolor: "white",
                  color: "primary.main",
                  fontWeight: 700,
                  "&:hover": { bgcolor: "grey.100" },
                }}
              >
                Googleでログイン
              </Button>
            </Box>
          </Container>
        </Paper>
      )}

      <Container maxWidth="lg" sx={{ py: 4 }}>
        {/* 検索バー */}
        <Box component="form" onSubmit={handleSearch} sx={{ mb: 4 }}>
          <TextField
            fullWidth
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="キーワードで検索..."
            variant="outlined"
            sx={{ bgcolor: "white" }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon color="action" />
                </InputAdornment>
              ),
              endAdornment: searchInput && (
                <InputAdornment position="end">
                  <IconButton size="small" onClick={handleClear}>
                    <ClearIcon />
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
          <Button
            type="submit"
            variant="contained"
            sx={{ mt: 1, display: "none" }}
          >
            検索
          </Button>
        </Box>

        {/* カテゴリ絞り込み */}
        <Stack
          direction="row"
          spacing={1}
          sx={{
            mb: 4,
            overflowX: "auto",
            pb: 1,
            "&::-webkit-scrollbar": { height: 6 },
            "&::-webkit-scrollbar-thumb": { bgcolor: "grey.300", borderRadius: 3 },
          }}
        >
          <Chip
            label="すべて"
            color={category === "" ? "primary" : "default"}
            variant={category === "" ? "filled" : "outlined"}
            onClick={() => setCategory("")}
            sx={{ fontWeight: 600, flexShrink: 0 }}
          />
          {CATEGORIES.map((cat) => (
            <Chip
              key={cat}
              label={cat}
              color={category === cat ? "primary" : "default"}
              variant={category === cat ? "filled" : "outlined"}
              onClick={() => setCategory(cat)}
              sx={{ fontWeight: 600, flexShrink: 0 }}
            />
          ))}
        </Stack>

        {/* レコメンド */}
        {user && recommendations.length > 0 && !keyword && (
          <Box sx={{ mb: 5 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
              <AutoAwesomeIcon color="primary" />
              <Typography variant="h6" sx={{ fontWeight: 700 }}>
                あなたへのおすすめ
              </Typography>
            </Box>
            <Grid container spacing={2}>
              {recommendations.map((p) => (
                <Grid item xs={6} sm={4} md={3} key={p.id}>
                  <ProductCard product={p} />
                </Grid>
              ))}
            </Grid>
          </Box>
        )}

        {/* 商品一覧 */}
        <Box>
          <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
            {keyword ? `「${keyword}」の検索結果` : category ? category : "新着商品"}
          </Typography>

          {loading ? (
            <Grid container spacing={2}>
              {Array.from({ length: 8 }).map((_, i) => (
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
          ) : products.length === 0 ? (
            <Alert severity="info" sx={{ borderRadius: 2 }}>
              商品が見つかりませんでした
            </Alert>
          ) : (
            <Grid container spacing={2}>
              {products.map((p) => (
                <Grid item xs={6} sm={4} md={3} key={p.id}>
                  <ProductCard product={p} />
                </Grid>
              ))}
            </Grid>
          )}
        </Box>
      </Container>
    </Box>
  );
};

export default HomePage;
