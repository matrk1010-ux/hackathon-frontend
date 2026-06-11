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

const MAX_IMAGES = 5; // 1商品あたりの画像上限（バックエンドと一致させる）

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
  });
  const [images, setImages] = useState([]); // data URI の配列（先頭がサムネ）
  const [submitting, setSubmitting] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [uploading, setUploading] = useState(false);
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
    const files = Array.from(e.target.files || []);
    e.target.value = ""; // 同じファイルを再選択できるようにリセット
    if (files.length === 0) return;

    const remaining = MAX_IMAGES - images.length;
    if (remaining <= 0) {
      return setError(`画像は最大${MAX_IMAGES}枚までです`);
    }
    setError("");
    setUploading(true);
    try {
      const added = [];
      for (const file of files.slice(0, remaining)) {
        if (!file.type.startsWith("image/")) continue;
        if (file.size > 10 * 1024 * 1024) {
          setError("10MBを超える画像はスキップしました");
          continue;
        }
        added.push(await compressImage(file));
      }
      if (added.length > 0) {
        setImages((prev) => [...prev, ...added].slice(0, MAX_IMAGES));
        if (files.length > remaining) {
          toast(`画像は最大${MAX_IMAGES}枚までのため一部のみ追加しました`, "warning");
        }
      }
    } catch (err) {
      console.error(err);
      setError("画像の処理に失敗しました");
    } finally {
      setUploading(false);
    }
  };

  const removeImage = (idx) =>
    setImages((prev) => prev.filter((_, i) => i !== idx));

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
    if (images.length === 0) return setError("商品画像を1枚以上選択してください");
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
          image_url: images[0] || null,  // サムネ（後方互換）
          image_urls: images,            // 全画像
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

            {/* 画像アップロード */}
            <Box>
              <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>
                商品画像{" "}
                <Box component="span" sx={{ color: "error.main" }}>*</Box>{" "}
                <Box component="span" sx={{ color: "text.secondary", fontWeight: 400, fontSize: 13 }}>
                  （{images.length}/{MAX_IMAGES}）
                </Box>
              </Typography>
              <Button
                component="label"
                variant="outlined"
                startIcon={uploading ? <CircularProgress size={18} color="inherit" /> : <PhotoCameraIcon />}
                disabled={uploading || images.length >= MAX_IMAGES}
                sx={{ fontWeight: 600 }}
              >
                {uploading ? "処理中..." : images.length > 0 ? "画像を追加" : "画像を選択"}
                <input type="file" accept="image/*" multiple hidden onChange={handleImageSelect} />
              </Button>
              <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 0.5 }}>
                端末から最大{MAX_IMAGES}枚まで選べます（自動で縮小・圧縮されます）。先頭の画像がサムネイルになります。
              </Typography>
            </Box>

            {/* 画像プレビュー */}
            {images.length > 0 && (
              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1.5 }}>
                {images.map((src, idx) => (
                  <Box
                    key={idx}
                    sx={{
                      position: "relative",
                      width: 100,
                      height: 100,
                      borderRadius: 2,
                      overflow: "hidden",
                      border: idx === 0 ? "2px solid" : "1px solid #eee",
                      borderColor: idx === 0 ? "primary.main" : "#eee",
                    }}
                  >
                    <Box
                      component="img"
                      src={src}
                      alt={`プレビュー${idx + 1}`}
                      sx={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
                    />
                    {idx === 0 && (
                      <Box
                        sx={{
                          position: "absolute",
                          bottom: 0,
                          left: 0,
                          right: 0,
                          bgcolor: "primary.main",
                          color: "#fff",
                          fontSize: 11,
                          fontWeight: 700,
                          textAlign: "center",
                          py: 0.25,
                        }}
                      >
                        サムネ
                      </Box>
                    )}
                    <Box
                      onClick={() => removeImage(idx)}
                      sx={{
                        position: "absolute",
                        top: 2,
                        right: 2,
                        width: 22,
                        height: 22,
                        borderRadius: "50%",
                        bgcolor: "rgba(0,0,0,0.6)",
                        color: "#fff",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        cursor: "pointer",
                        "&:hover": { bgcolor: "error.main" },
                      }}
                    >
                      <DeleteOutlineIcon sx={{ fontSize: 16 }} />
                    </Box>
                  </Box>
                ))}
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
