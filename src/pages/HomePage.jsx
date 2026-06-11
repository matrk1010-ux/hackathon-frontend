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
} from "@mui/material";
import SearchOffIcon from "@mui/icons-material/SearchOff";
import SearchIcon from "@mui/icons-material/Search";
import ClearIcon from "@mui/icons-material/Clear";
import GoogleIcon from "@mui/icons-material/Google";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";

const HomePage = () => {
  const { user } = useUser();
  const toast = useToast();
  const [products, setProducts] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [keyword, setKeyword] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [recLoading, setRecLoading] = useState(false);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { if (keyword) fetchProducts(); }, [keyword]);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { if (user?.email) fetchRecommendations(); }, [user]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const params = { limit: 20, keyword };
      const res = await getProducts(params);
      setProducts(res.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const fetchRecommendations = async () => {
    setRecLoading(true);
    try {
      const res = await getRecommendations(user.email, 30);
      setRecommendations(res.data);
    } catch (e) {
      console.error(e);
    } finally {
      setRecLoading(false);
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
                    ログインをしてください
                  </Typography>
                  <Typography variant="body2" sx={{ color: "primary.main", opacity: 0.85 }}>
                    出品・いいね・購入機能にはログインが必要です
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

        {keyword ? (
          /* 検索結果 */
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
              {`「${keyword}」の検索結果`}
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
        ) : user ? (
          /* あなたへのおすすめ */
          <Box>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
              <AutoAwesomeIcon color="primary" />
              <Typography variant="h6" sx={{ fontWeight: 700 }}>
                あなたへのおすすめ
              </Typography>
            </Box>
            {recLoading ? (
              <ProductGridSkeleton count={8} />
            ) : recommendations.length === 0 ? (
              <EmptyState
                icon={<AutoAwesomeIcon sx={{ fontSize: 64 }} />}
                message="おすすめを準備中です"
              />
            ) : (
              <Grid container spacing={2}>
                {recommendations.map((p) => (
                  <Grid item xs={6} sm={4} md={3} key={p.id}>
                    <ProductCard product={p} />
                  </Grid>
                ))}
              </Grid>
            )}
          </Box>
        ) : null}
      </Container>
    </Box>
  );
};

export default HomePage;
