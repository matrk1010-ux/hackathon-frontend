import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useUser } from "../context/UserContext";
import { useToast } from "../context/ToastContext";
import { createProduct } from "../api/products";
import { generateDescription, analyzeImage } from "../api/ai";
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
  FormHelperText,
  Paper,
  Divider,
  Alert,
  CircularProgress,
} from "@mui/material";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import SellIcon from "@mui/icons-material/Sell";
import PhotoCameraIcon from "@mui/icons-material/PhotoCamera";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutlined";

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
  const [uploading, setUploading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [aiFilled, setAiFilled] = useState({}); // 画像AIが埋めた欄の目印
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
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
    // ユーザーが手で編集したらAI入力の目印を外す
    if (aiFilled[name]) setAiFilled((prev) => ({ ...prev, [name]: false }));
  };

  // 画像をGeminiで解析し、商品名・カテゴリ・状態を埋める（説明欄には触れない）
  const handleAnalyzeImage = async () => {
    if (!form.image_url) return setError("先に商品画像を選択してください");
    setError("");
    setAnalyzing(true);
    try {
      const res = await analyzeImage(form.image_url);
      const { title, category, condition } = res.data;
      const filled = {};
      setForm((f) => {
        const next = { ...f };
        if (title) { next.title = title; filled.title = true; }
        if (category) { next.category = category; filled.category = true; }
        if (condition) { next.condition = condition; filled.condition = true; }
        return next;
      });
      setAiFilled((prev) => ({ ...prev, ...filled }));
      if (Object.keys(filled).length > 0) {
        toast("AIが写真から入力しました。内容を確認してください", "success");
      } else {
        toast("写真から情報を読み取れませんでした", "warning");
      }
    } catch (e) {
      setError("画像の解析に失敗しました");
    } finally {
      setAnalyzing(false);
    }
  };

  // 画像をブラウザ上で縮小・JPEG圧縮して data URI に変換する
  const compressImage = (file, maxSize = 800, quality = 0.7) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (ev) => {
        const img = new Image();
        img.onload = () => {
          let { width, height } = img;
          if (width > height && width > maxSize) {
            height = Math.round((height * maxSize) / width);
            width = maxSize;
          } else if (height >= width && height > maxSize) {
            width = Math.round((width * maxSize) / height);
            height = maxSize;
          }
          const canvas = document.createElement("canvas");
          canvas.width = width;
          canvas.height = height;
          canvas.getContext("2d").drawImage(img, 0, 0, width, height);
          resolve(canvas.toDataURL("image/jpeg", quality));
        };
        img.onerror = reject;
        img.src = ev.target.result;
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });

  const handleImageSelect = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = ""; // 同じファイルを再選択できるようにリセット
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      return setError("画像ファイルを選択してください");
    }
    if (file.size > 10 * 1024 * 1024) {
      return setError("画像は10MB以下にしてください");
    }
    setError("");
    setUploading(true);
    try {
      const dataUrl = await compressImage(file);
      setForm((f) => ({ ...f, image_url: dataUrl }));
      toast("画像を設定しました", "success");
    } catch (err) {
      console.error(err);
      setError("画像の処理に失敗しました");
    } finally {
      setUploading(false);
    }
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
    if (!form.image_url) return setError("商品画像を選択してください");
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
              helperText={aiFilled.title ? "AIが写真から入力（編集できます）" : ""}
              FormHelperTextProps={{ sx: { color: "secondary.main" } }}
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
              {aiFilled.category && (
                <FormHelperText sx={{ color: "secondary.main" }}>
                  AIが写真から入力（変更できます）
                </FormHelperText>
              )}
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
              {aiFilled.condition && (
                <FormHelperText sx={{ color: "secondary.main" }}>
                  AIが写真から推定（変更できます）
                </FormHelperText>
              )}
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

            {/* 画像アップロード */}
            <Box>
              <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>
                商品画像{" "}
                <Box component="span" sx={{ color: "error.main" }}>*</Box>
              </Typography>
              <Button
                component="label"
                variant="outlined"
                startIcon={uploading ? <CircularProgress size={18} color="inherit" /> : <PhotoCameraIcon />}
                disabled={uploading}
                sx={{ fontWeight: 600 }}
              >
                {uploading ? "処理中..." : form.image_url ? "画像を変更" : "画像を選択"}
                <input type="file" accept="image/*" hidden onChange={handleImageSelect} />
              </Button>
              <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 0.5 }}>
                端末から画像を選べます（自動で縮小・圧縮されます）。出品には画像が1枚必要です。
              </Typography>
            </Box>

            {/* 画像プレビュー */}
            {form.image_url && (
              <Box>
                <Box sx={{ position: "relative", width: "100%" }}>
                  <Box
                    component="img"
                    src={form.image_url}
                    alt="プレビュー"
                    sx={{ width: "100%", maxHeight: 240, objectFit: "contain", borderRadius: 2, border: "1px solid #eee" }}
                  />
                  <Button
                    size="small"
                    color="error"
                    variant="contained"
                    startIcon={<DeleteOutlineIcon />}
                    onClick={() => setForm((f) => ({ ...f, image_url: "" }))}
                    sx={{ position: "absolute", top: 8, right: 8 }}
                  >
                    削除
                  </Button>
                </Box>

                {/* 画像からAIで入力 */}
                <Button
                  fullWidth
                  variant="contained"
                  color="secondary"
                  startIcon={analyzing ? <CircularProgress size={16} color="inherit" /> : <AutoAwesomeIcon />}
                  onClick={handleAnalyzeImage}
                  disabled={analyzing || uploading}
                  sx={{ mt: 1.5, fontWeight: 700 }}
                >
                  {analyzing ? "AIが読み取り中..." : "この写真からAIで入力"}
                </Button>
                <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 0.5 }}>
                  写真から商品名・カテゴリ・状態を自動入力します（説明文はそのまま、強調メモ欄として使えます）。
                </Typography>
              </Box>
            )}

            {/* 出品ボタン */}
            <Button
              type="submit"
              variant="contained"
              color="primary"
              size="large"
              disabled={submitting || uploading}
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
