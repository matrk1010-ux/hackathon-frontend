import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
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
  MenuItem,
  Stack,
  Slide,
} from "@mui/material";
import SearchOffIcon from "@mui/icons-material/SearchOff";
import SearchIcon from "@mui/icons-material/Search";
import ClearIcon from "@mui/icons-material/Clear";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import GoogleIcon from "@mui/icons-material/Google";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";

// マスタ値（バックエンドと完全一致させる）
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
const CONDITIONS = [
  "新品・未使用",
  "未使用に近い",
  "目立った傷や汚れなし",
  "やや傷や汚れあり",
  "傷や汚れあり",
  "全体的に状態が悪い",
];

const HomePage = () => {
  const { user } = useUser();
  const toast = useToast();
  // 検索条件はURLクエリに持たせる。これで商品詳細から戻った時に検索結果が復元される。
  const [searchParams, setSearchParams] = useSearchParams();
  const keyword = searchParams.get("q") || "";
  const category = searchParams.get("category") || "";
  const condition = searchParams.get("condition") || "";
  const sort = searchParams.get("sort") || "newest";

  const [products, setProducts] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [searchInput, setSearchInput] = useState(keyword);
  const [loading, setLoading] = useState(false);
  const [recLoading, setRecLoading] = useState(false);
  // 検索欄タップで開く全画面の検索モード。URLに検索条件が乗っていれば（詳細から戻った時など）
  // 自動で開いた状態にして結果を復元する。
  const [manualOpen, setManualOpen] = useState(false);

  const hasFilter =
    Boolean(keyword) || Boolean(category) || Boolean(condition) || sort !== "newest";
  const searchOpen = manualOpen || hasFilter;

  // 戻る/進むでURLのキーワードが変わったら入力欄も追従させる
  useEffect(() => { setSearchInput(keyword); }, [keyword]);

  // 検索条件が指定された時だけ結果を取得（開いた直後の無条件状態では何も出さない）
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { if (searchOpen && hasFilter) fetchProducts(); }, [keyword, category, condition, sort, searchOpen, hasFilter]);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { if (user?.email) fetchRecommendations(); }, [user]);

  // 1つの検索条件をURLクエリに反映（履歴を汚さないよう replace）
  const setParam = (key, value, defaultValue = "") => {
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        if (value && value !== defaultValue) next.set(key, value);
        else next.delete(key);
        return next;
      },
      { replace: true }
    );
  };

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const params = { limit: 30, sort };
      if (keyword) params.keyword = keyword;
      if (category) params.category = category;
      if (condition) params.condition = condition;
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
    setParam("q", searchInput.trim());
  };

  const handleClear = () => {
    setSearchInput("");
    setParam("q", "");
  };

  // 検索モードを閉じる：条件をすべて消してホーム（おすすめ）へ戻る
  const closeSearch = () => {
    setManualOpen(false);
    setSearchInput("");
    setSearchParams({}, { replace: true });
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

  const filterSelects = (
    <Stack direction="row" spacing={1.5} sx={{ flexWrap: "wrap", gap: 1.5 }}>
      <TextField
        select
        size="small"
        label="カテゴリ"
        value={category}
        onChange={(e) => setParam("category", e.target.value)}
        sx={{ minWidth: 150, bgcolor: "#fff", borderRadius: 1 }}
      >
        <MenuItem value="">すべて</MenuItem>
        {CATEGORIES.map((c) => (
          <MenuItem key={c} value={c}>{c}</MenuItem>
        ))}
      </TextField>
      <TextField
        select
        size="small"
        label="状態"
        value={condition}
        onChange={(e) => setParam("condition", e.target.value)}
        sx={{ minWidth: 150, bgcolor: "#fff", borderRadius: 1 }}
      >
        <MenuItem value="">すべて</MenuItem>
        {CONDITIONS.map((c) => (
          <MenuItem key={c} value={c}>{c}</MenuItem>
        ))}
      </TextField>
      <TextField
        select
        size="small"
        label="並び替え"
        value={sort}
        onChange={(e) => setParam("sort", e.target.value, "newest")}
        sx={{ minWidth: 150, bgcolor: "#fff", borderRadius: 1 }}
      >
        <MenuItem value="newest">新着順</MenuItem>
        <MenuItem value="price_asc">価格が安い順</MenuItem>
        <MenuItem value="price_desc">価格が高い順</MenuItem>
        <MenuItem value="likes">いいねが多い順</MenuItem>
      </TextField>
    </Stack>
  );

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
        {/* 検索バー（タップで全画面の検索モードを開く） */}
        <Box
          onClick={() => setManualOpen(true)}
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1,
            px: 2,
            py: 1.5,
            mb: 4,
            bgcolor: "#FFFFFF",
            borderRadius: 2,
            border: "1px solid rgba(109,137,166,0.35)",
            boxShadow: "0 8px 22px rgba(27,39,53,0.08)",
            cursor: "pointer",
            transition: "box-shadow .15s ease",
            "&:hover": { boxShadow: "0 8px 22px rgba(27,39,53,0.16)" },
          }}
        >
          <SearchIcon sx={{ color: "text.secondary" }} />
          <Typography color="text.secondary">
            キーワード・カテゴリ・状態で検索
          </Typography>
        </Box>

        {/* おすすめ（ログイン中のみ／おすすめ順） */}
        {user && (
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
        )}
      </Container>

      {/* 全画面の検索モード（ぬるっとスライドイン） */}
      <Slide direction="up" in={searchOpen} mountOnEnter unmountOnExit>
        <Box
          sx={{
            position: "fixed",
            inset: 0,
            zIndex: 1300,
            bgcolor: "#EAF1F7", // 寒色寄りのライトブルー（検索モードの背景）
            display: "flex",
            flexDirection: "column",
          }}
        >
          {/* 上部バー：戻る＋キーワード入力 */}
          <Paper elevation={2} sx={{ borderRadius: 0, p: 1.5 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <IconButton onClick={closeSearch} aria-label="検索を閉じる">
                <ArrowBackIcon />
              </IconButton>
              <Box component="form" onSubmit={handleSearch} sx={{ flexGrow: 1 }}>
                <TextField
                  fullWidth
                  size="small"
                  autoFocus
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  placeholder="キーワードで検索..."
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
              </Box>
            </Box>
            <Box sx={{ mt: 1.5 }}>{filterSelects}</Box>
          </Paper>

          {/* 結果一覧（スクロール）。条件未指定（開いた直後）は何も表示しない */}
          <Box sx={{ flexGrow: 1, overflowY: "auto", p: 2 }}>
            {hasFilter && (
              <Container maxWidth="lg" disableGutters>
                <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
                  {keyword ? `「${keyword}」の検索結果` : "絞り込み結果"}
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
              </Container>
            )}
          </Box>
        </Box>
      </Slide>
    </Box>
  );
};

export default HomePage;
