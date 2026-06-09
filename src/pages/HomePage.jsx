import React, { useState, useEffect } from "react";
import { signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import { fireAuth } from "../firebase";
import { useUser } from "../context/UserContext";
import { useToast } from "../context/ToastContext";
import { getProducts } from "../api/products";
import { getRecommendations } from "../api/recommendations";
import ProductCard from "../components/ProductCard";
import ProductGridSkeleton from "../components/ProductGridSkeleton";
import EmptyState from "../components/EmptyState";
import {
  Container,
  Box,
  Typography,
  TextField,
  Button,
  Grid,
  Paper,
  InputAdornment,
  IconButton,
  Chip,
  Stack,
} from "@mui/material";
import SearchOffIcon from "@mui/icons-material/SearchOff";
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
  useEffect(() => { if (user?.email) fetchRecommendations(); }, [user, category]);

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
      const res = await getRecommendations(user.email, 10, category || null);
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
            color: "primary.dark",
            py: { xs: 4, md: 5 },
            borderRadius: 0,
            background:
              "linear-gradient(135deg, #E6DED4 0%, #C8D9E6 40%, #AFC3D4 100%)",
            borderBottom: "1px solid",
            borderColor: "divider",
          }}
        >
          <Container maxWidth="md">
            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 2 }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                <AutoAwesomeIcon sx={{ color: "primary.main" }} />
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 800, lineHeight: 1.3 }}>
                    Shop the coast, curated by AI
                  </Typography>
                  <Typography variant="body2" sx={{ color: "primary.main", opacity: 0.85 }}>
                    ログインするとAIレコメンド機能が使えます
                  </Typography>
                </Box>
              </Box>
              <Button
                variant="contained"
                startIcon={<GoogleIcon />}
                onClick={handleGoogleLogin}
                sx={{
                  bgcolor: "primary.main",
                  color: "#fff",
                  fontWeight: 700,
                  px: 2.5,
                  boxShadow: "0 14px 36px rgba(27,39,53,0.22)",
                  "&:hover": { bgcolor: "primary.dark" },
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
            sx={{
              "& .MuiOutlinedInput-root": {
                bgcolor: "#FFFFFF",
                transition: "background-color .15s ease, box-shadow .15s ease",
                boxShadow: "0 8px 22px rgba(27,39,53,0.08)",
                "& fieldset": { borderColor: "rgba(109,137,166,0.35)" },
                "&:hover": { bgcolor: "#FFFFFF" },
                "&:hover fieldset": { borderColor: "rgba(109,137,166,0.55)" },
                "&.Mui-focused": {
                  bgcolor: "#FFFFFF",
                  boxShadow: "0 0 0 3px rgba(38,60,89,.15)",
                },
                "&.Mui-focused fieldset": { borderColor: "primary.main" },
              },
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{ color: "text.secondary" }} />
                </InputAdornment>
              ),
              endAdornment: searchInput && (
                <InputAdornment position="end">
                  <IconButton size="small" onClick={handleClear}>
                    <ClearIcon fontSize="small" />
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
          {["", ...CATEGORIES].map((cat) => {
            const selected = category === cat;
            return (
              <Chip
                key={cat || "all"}
                label={cat || "すべて"}
                onClick={() => setCategory(cat)}
                sx={{
                  fontWeight: 600,
                  flexShrink: 0,
                  border: "1px solid",
                  bgcolor: selected ? "primary.tint" : "transparent",
                  borderColor: selected ? "primary.main" : "divider",
                  color: selected ? "primary.main" : "text.secondary",
                  "&:hover": {
                    bgcolor: selected ? "primary.tint" : "action.hover",
                  },
                }}
              />
            );
          })}
        </Stack>

        {/* レコメンド */}
        {user && recommendations.length > 0 && !keyword && (
          <Box sx={{ mb: 5 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
              <AutoAwesomeIcon color="primary" />
              <Typography variant="h6" sx={{ fontWeight: 700 }}>
                {category ? `あなたへのおすすめ・${category}` : "あなたへのおすすめ"}
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
            <ProductGridSkeleton count={8} />
          ) : products.length === 0 ? (
            <EmptyState
              icon={<SearchOffIcon sx={{ fontSize: 64 }} />}
              message="商品が見つかりませんでした"
            />
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
