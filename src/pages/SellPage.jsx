import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useUser } from "../context/UserContext";
import { useToast } from "../context/ToastContext";
import { createProduct } from "../api/products";
import { generateDescription } from "../api/ai";
import {
  Container,
  Box,
  Typography,
  TextField,
  Button,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Paper,
  Divider,
  Alert,
  CircularProgress,
} from "@mui/material";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import SellIcon from "@mui/icons-material/Sell";

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

const SellPage = () => {
  const { user } = useUser();
  const toast = useToast();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    title: "",
    description: "",
    price: "",
    category: "",
    condition: "",
    image_url: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState("");

  if (!user) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", py: 10 }}>
        <Alert severity="warning" sx={{ borderRadius: 2 }}>
          出品するにはログインが必要です
        </Alert>
      </Box>
    );
  }

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleGenerateDescription = async () => {
    if (!form.title) return setError("まず商品名を入力してください");
    setError("");
    setGenerating(true);
    try {
      const res = await generateDescription(
        form.title,
        form.category || null,
        form.price ? parseInt(form.price) : null,
        form.condition || null,
        form.description || null
      );
      setForm({ ...form, description: res.data.description });
    } catch (e) {
      setError("説明文の生成に失敗しました");
    } finally {
      setGenerating(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title || !form.price) return setError("商品名と価格は必須です");
    if (!form.condition) return setError("商品の状態を選択してください");
    setError("");
    setSubmitting(true);
    try {
      await createProduct(
        {
          title: form.title,
          description: form.description || null,
          price: parseInt(form.price),
          category: form.category || null,
          condition: form.condition || null,
          image_url: form.image_url || null,
        },
        user.email
      );
      toast("出品しました！", "success");
      navigate("/");
    } catch (e) {
      setError(e.response?.data?.detail || "出品に失敗しました");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Box sx={{ bgcolor: "grey.50", minHeight: "100vh", py: 4 }}>
      <Container maxWidth="sm">
        <Typography variant="h5" sx={{ fontWeight: 700, mb: 3, display: "flex", alignItems: "center", gap: 1 }}>
          <SellIcon color="primary" /> 商品を出品する
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }} onClose={() => setError("")}>
            {error}
          </Alert>
        )}

        <Paper elevation={2} sx={{ p: 3, borderRadius: 3 }}>
          <Box component="form" onSubmit={handleSubmit} sx={{ display: "flex", flexDirection: "column", gap: 3 }}>

            {/* 商品名 */}
            <TextField
              label="商品名"
              name="title"
              value={form.title}
              onChange={handleChange}
              placeholder="例：ナイキのスニーカー 27cm"
              required
              fullWidth
            />

            {/* カテゴリ */}
            <FormControl fullWidth>
              <InputLabel>カテゴリ</InputLabel>
              <Select
                name="category"
                value={form.category}
                label="カテゴリ"
                onChange={handleChange}
              >
                <MenuItem value=""><em>選択してください</em></MenuItem>
                {CATEGORIES.map((c) => (
                  <MenuItem key={c} value={c}>{c}</MenuItem>
                ))}
              </Select>
            </FormControl>

            {/* 商品の状態 */}
            <FormControl fullWidth required>
              <InputLabel>商品の状態</InputLabel>
              <Select
                name="condition"
                value={form.condition}
                label="商品の状態"
                onChange={handleChange}
              >
                {CONDITIONS.map((c) => (
                  <MenuItem key={c} value={c}>{c}</MenuItem>
                ))}
              </Select>
            </FormControl>

            {/* 価格 */}
            <TextField
              label="価格（円）"
              name="price"
              type="number"
              value={form.price}
              onChange={handleChange}
              placeholder="例：3000"
              inputProps={{ min: 1 }}
              required
              fullWidth
            />

            {/* 商品説明 */}
            <Box>
              <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 1 }}>
                <Typography variant="body2" color="text.secondary">商品説明</Typography>
                <Button
                  size="small"
                  variant="outlined"
                  color="secondary"
                  startIcon={generating ? <CircularProgress size={14} /> : <AutoAwesomeIcon />}
                  onClick={handleGenerateDescription}
                  disabled={generating}
                >
                  {generating ? "生成中..." : "AIで自動生成"}
                </Button>
              </Box>
              <TextField
                name="description"
                value={form.description}
                onChange={handleChange}
                placeholder="強調したいポイントを箇条書きでもOK（例：購入1年・週1使用、付属品全部あり、目立つ傷なし）。「AIで自動生成」を押すと、この内容を踏まえた紹介文を作成します。"
                multiline
                rows={5}
                fullWidth
              />
              <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: "block" }}>
                ※ 伝えたいことを書いてから「AIで自動生成」を押すと、その意図を汲んだ説明文に置き換わります。
              </Typography>
            </Box>

            <Divider />

            {/* 画像URL */}
            <TextField
              label="画像URL"
              name="image_url"
              type="url"
              value={form.image_url}
              onChange={handleChange}
              placeholder="https://..."
              fullWidth
            />

            {/* 画像プレビュー */}
            {form.image_url && (
              <Box
                component="img"
                src={form.image_url}
                alt="プレビュー"
                sx={{ width: "100%", maxHeight: 200, objectFit: "contain", borderRadius: 2, border: "1px solid #eee" }}
              />
            )}

            {/* 出品ボタン */}
            <Button
              type="submit"
              variant="contained"
              color="primary"
              size="large"
              disabled={submitting}
              sx={{ fontWeight: 700, py: 1.5 }}
            >
              {submitting ? <CircularProgress size={22} color="inherit" /> : "出品する"}
            </Button>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
};

export default SellPage;
