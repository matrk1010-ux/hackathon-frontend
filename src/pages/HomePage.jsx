import React, { useState, useEffect } from "react";
import { signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import { fireAuth } from "../firebase";
import { useUser } from "../context/UserContext";
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
  CircularProgress,
  InputAdornment,
  IconButton,
  Alert,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import ClearIcon from "@mui/icons-material/Clear";
import GoogleIcon from "@mui/icons-material/Google";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";

const HomePage = () => {
  const { user } = useUser();
  const [products, setProducts] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [keyword, setKeyword] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [loading, setLoading] = useState(true);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { fetchProducts(); }, [keyword]);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { if (user?.email) fetchRecommendations(); }, [user]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const params = { limit: 20 };
      if (keyword) params.keyword = keyword;
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
    } catch (e) {
      alert("ログインに失敗しました");
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
            {keyword ? `「${keyword}」の検索結果` : "新着商品"}
          </Typography>

          {loading ? (
            <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
              <CircularProgress color="primary" />
            </Box>
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
