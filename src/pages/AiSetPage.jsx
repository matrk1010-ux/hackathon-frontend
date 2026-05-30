import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  Card,
  CardContent,
  CardMedia,
  CardActionArea,
  CircularProgress,
  InputAdornment,
  Alert,
  Divider,
} from "@mui/material";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import SendIcon from "@mui/icons-material/Send";
import ShoppingCartCheckoutIcon from "@mui/icons-material/ShoppingCartCheckout";
import ImageNotSupportedIcon from "@mui/icons-material/ImageNotSupported";
import { useUser } from "../context/UserContext";
import { aiSetChat } from "../api/ai_set";
import { bulkBuyProducts } from "../api/purchases";

const AiSetPage = () => {
  const { user } = useUser();
  const navigate = useNavigate();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [budget, setBudget] = useState("");
  const [loading, setLoading] = useState(false);
  const [suggestedProducts, setSuggestedProducts] = useState([]);
  const [buying, setBuying] = useState(false);
  const [buyResult, setBuyResult] = useState(null);
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const sendMessage = async () => {
    if (!input.trim() || loading) return;

    const userMsg = { role: "user", content: input.trim() };
    const nextMessages = [...messages, userMsg];
    setMessages(nextMessages);
    setInput("");
    setLoading(true);
    setBuyResult(null);

    try {
      const res = await aiSetChat(
        nextMessages,
        budget ? parseInt(budget) : null
      );
      const { reply, suggested_products } = res.data;

      setMessages((prev) => [...prev, { role: "model", content: reply }]);
      setSuggestedProducts(suggested_products || []);
    } catch (e) {
      setMessages((prev) => [
        ...prev,
        { role: "model", content: "エラーが発生しました。もう一度お試しください。" },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleBulkBuy = async () => {
    if (!user || suggestedProducts.length === 0) return;
    setBuying(true);
    try {
      const res = await bulkBuyProducts(
        suggestedProducts.map((p) => p.id),
        user.email
      );
      const { purchased, failed, total_price } = res.data;
      setBuyResult({ purchased, failed, total_price });
      setSuggestedProducts([]);
    } catch (e) {
      setBuyResult({ error: "購入に失敗しました" });
    } finally {
      setBuying(false);
    }
  };

  const totalPrice = suggestedProducts.reduce((sum, p) => sum + p.price, 0);

  return (
    <Box sx={{ maxWidth: 800, mx: "auto", height: "calc(100vh - 64px)", display: "flex", flexDirection: "column" }}>
      {/* ヘッダー */}
      <Box sx={{ p: 2, borderBottom: "1px solid #eee", bgcolor: "background.paper" }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <AutoAwesomeIcon color="primary" />
          <Typography variant="h6" fontWeight={700}>
            AIセットモード
          </Typography>
        </Box>
        <Typography variant="body2" color="text.secondary">
          欲しいものや状況を話しかけると、アプリ内の商品からセットを提案します
        </Typography>
      </Box>

      {/* チャットエリア */}
      <Box sx={{ flex: 1, overflowY: "auto", p: 2, display: "flex", flexDirection: "column", gap: 2 }}>
        {messages.length === 0 && (
          <Box sx={{ textAlign: "center", mt: 6, color: "text.secondary" }}>
            <AutoAwesomeIcon sx={{ fontSize: 48, mb: 2, opacity: 0.3 }} />
            <Typography variant="body1">
              例：「鬼滅の刃1巻と3巻持ってます」
            </Typography>
            <Typography variant="body2" sx={{ mt: 0.5 }}>
              「来月から一人暮らし始めます」
            </Typography>
            <Typography variant="body2" sx={{ mt: 0.5 }}>
              「登山を始めたいです」
            </Typography>
          </Box>
        )}

        {messages.map((msg, i) => (
          <Box
            key={i}
            sx={{
              display: "flex",
              justifyContent: msg.role === "user" ? "flex-end" : "flex-start",
            }}
          >
            <Paper
              elevation={0}
              sx={{
                px: 2,
                py: 1.5,
                maxWidth: "80%",
                borderRadius: msg.role === "user" ? "18px 18px 4px 18px" : "18px 18px 18px 4px",
                bgcolor: msg.role === "user" ? "primary.main" : "grey.100",
                color: msg.role === "user" ? "white" : "text.primary",
                whiteSpace: "pre-wrap",
              }}
            >
              <Typography variant="body2">{msg.content}</Typography>
            </Paper>
          </Box>
        ))}

        {loading && (
          <Box sx={{ display: "flex", justifyContent: "flex-start" }}>
            <Paper elevation={0} sx={{ px: 2, py: 1.5, bgcolor: "grey.100", borderRadius: "18px 18px 18px 4px" }}>
              <CircularProgress size={16} />
            </Paper>
          </Box>
        )}

        {/* 提案商品カード */}
        {suggestedProducts.length > 0 && (
          <Box>
            <Typography variant="caption" color="text.secondary" sx={{ ml: 0.5 }}>
              アプリ内の関連商品
            </Typography>
            <Box sx={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))", gap: 1.5, mt: 1 }}>
              {suggestedProducts.map((product) => (
                <Card key={product.id} elevation={1} sx={{ borderRadius: 2 }}>
                  <CardActionArea onClick={() => navigate(`/products/${product.id}`)}>
                    {product.image_url ? (
                      <CardMedia
                        component="img"
                        height="100"
                        image={product.image_url}
                        alt={product.title}
                        sx={{ objectFit: "cover" }}
                      />
                    ) : (
                      <Box sx={{ height: 100, display: "flex", alignItems: "center", justifyContent: "center", bgcolor: "grey.100" }}>
                        <ImageNotSupportedIcon sx={{ color: "grey.400" }} />
                      </Box>
                    )}
                    <CardContent sx={{ p: 1, "&:last-child": { pb: 1 } }}>
                      <Typography variant="caption" noWrap display="block">
                        {product.title}
                      </Typography>
                      <Typography variant="body2" fontWeight={700} color="primary">
                        ¥{product.price.toLocaleString()}
                      </Typography>
                    </CardContent>
                  </CardActionArea>
                </Card>
              ))}
            </Box>

            {user && (
              <Box sx={{ mt: 1.5, display: "flex", alignItems: "center", gap: 2 }}>
                <Typography variant="body2" color="text.secondary">
                  合計 <strong>¥{totalPrice.toLocaleString()}</strong>
                </Typography>
                <Button
                  variant="contained"
                  size="small"
                  startIcon={buying ? <CircularProgress size={14} color="inherit" /> : <ShoppingCartCheckoutIcon />}
                  onClick={handleBulkBuy}
                  disabled={buying}
                >
                  セットをまとめて購入
                </Button>
              </Box>
            )}
            {!user && (
              <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: "block" }}>
                購入にはログインが必要です
              </Typography>
            )}
          </Box>
        )}

        {/* 購入結果 */}
        {buyResult && (
          <Box>
            {buyResult.error ? (
              <Alert severity="error">{buyResult.error}</Alert>
            ) : (
              <Alert severity="success">
                {buyResult.purchased.length}点を購入しました（合計 ¥{buyResult.total_price.toLocaleString()}）
                {buyResult.failed.length > 0 && (
                  <Box sx={{ mt: 0.5 }}>
                    {buyResult.failed.map((f) => (
                      <Typography key={f.product_id} variant="caption" display="block">
                        ID:{f.product_id} — {f.reason}
                      </Typography>
                    ))}
                  </Box>
                )}
              </Alert>
            )}
          </Box>
        )}

        <div ref={bottomRef} />
      </Box>

      {/* 入力エリア */}
      <Divider />
      <Box sx={{ p: 2, bgcolor: "background.paper", display: "flex", flexDirection: "column", gap: 1 }}>
        <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
          <TextField
            size="small"
            label="予算（任意）"
            type="number"
            value={budget}
            onChange={(e) => setBudget(e.target.value)}
            sx={{ width: 140 }}
            InputProps={{
              startAdornment: <InputAdornment position="start">¥</InputAdornment>,
            }}
          />
          <Typography variant="caption" color="text.secondary">
            予算を設定するとその範囲内で提案します
          </Typography>
        </Box>
        <Box sx={{ display: "flex", gap: 1 }}>
          <TextField
            fullWidth
            size="small"
            placeholder="欲しいものや状況を入力してください..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing && sendMessage()}
            multiline
            maxRows={3}
          />
          <Button
            variant="contained"
            onClick={sendMessage}
            disabled={loading || !input.trim()}
            sx={{ minWidth: 56 }}
          >
            <SendIcon />
          </Button>
        </Box>
      </Box>
    </Box>
  );
};

export default AiSetPage;
