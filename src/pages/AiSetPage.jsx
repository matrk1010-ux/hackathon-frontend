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
  CardActionArea,
  CircularProgress,
  InputAdornment,
  Alert,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemAvatar,
} from "@mui/material";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import SendIcon from "@mui/icons-material/Send";
import ShoppingCartCheckoutIcon from "@mui/icons-material/ShoppingCartCheckout";
import ProductImage from "../components/ProductImage";
import { useUser } from "../context/UserContext";
import { aiSetChat } from "../api/ai_set";
import { bulkBuyProducts } from "../api/purchases";

const AiSetPage = () => {
  const { user } = useUser();
  const navigate = useNavigate();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [minBudget, setMinBudget] = useState("");
  const [maxBudget, setMaxBudget] = useState("");
  const [loading, setLoading] = useState(false);
  const [plans, setPlans] = useState([]);
  const [buying, setBuying] = useState(false);
  const [buyResult, setBuyResult] = useState(null);
  const [planToBuy, setPlanToBuy] = useState(null);
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading, plans]);

  const budgetInvalid =
    minBudget !== "" && maxBudget !== "" && parseInt(maxBudget) < parseInt(minBudget);

  const sendMessage = async () => {
    if (!input.trim() || loading || budgetInvalid) return;

    const userMsg = { role: "user", content: input.trim() };
    const nextMessages = [...messages, userMsg];
    setMessages(nextMessages);
    setInput("");
    setLoading(true);
    setBuyResult(null);
    setPlans([]);

    try {
      const res = await aiSetChat(
        nextMessages,
        minBudget !== "" ? parseInt(minBudget) : null,
        maxBudget !== "" ? parseInt(maxBudget) : null
      );
      const { reply, plans: newPlans } = res.data;
      setMessages((prev) => [...prev, { role: "model", content: reply }]);
      setPlans(newPlans || []);
    } catch (e) {
      setMessages((prev) => [
        ...prev,
        { role: "model", content: "エラーが発生しました。もう一度お試しください。" },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleBuyPlan = async () => {
    if (!user || !planToBuy) return;
    const products = planToBuy.products;
    setBuying(true);
    setPlanToBuy(null);
    try {
      const res = await bulkBuyProducts(products.map((p) => p.id), user.email);
      const { purchased, failed, total_price } = res.data;
      setBuyResult({ purchased, failed, total_price });
      setPlans([]);
    } catch (e) {
      setBuyResult({ error: "購入に失敗しました" });
    } finally {
      setBuying(false);
    }
  };

  const dialogProducts = planToBuy?.products || [];
  const dialogTotal = planToBuy?.total_price || 0;

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
          欲しいものや状況を話しかけると、アプリ内の商品から買い方を提案します
        </Typography>
      </Box>

      {/* チャットエリア */}
      <Box sx={{ flex: 1, overflowY: "auto", p: 2, display: "flex", flexDirection: "column", gap: 2 }}>
        {messages.length === 0 && (
          <Box sx={{ textAlign: "center", mt: 6, color: "text.secondary" }}>
            <AutoAwesomeIcon sx={{ fontSize: 48, mb: 2, opacity: 0.3 }} />
            <Typography variant="body1">例：「鬼滅の刃1巻と3巻持ってます」</Typography>
            <Typography variant="body2" sx={{ mt: 0.5 }}>「来月から一人暮らし始めます」</Typography>
            <Typography variant="body2" sx={{ mt: 0.5 }}>「登山を始めたいです」</Typography>
          </Box>
        )}

        {messages.map((msg, i) => (
          <Box key={i} sx={{ display: "flex", justifyContent: msg.role === "user" ? "flex-end" : "flex-start" }}>
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

        {/* 提案プラン（買い方） */}
        {plans.length > 0 && (
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <Typography variant="caption" color="text.secondary" sx={{ ml: 0.5 }}>
              AIが提案する買い方（プランを選んでまとめて購入できます）
            </Typography>

            {plans.map((plan, pi) => (
              <Paper key={pi} variant="outlined" sx={{ p: 1.5, borderRadius: 2 }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <AutoAwesomeIcon color="secondary" fontSize="small" />
                  <Typography variant="subtitle2" fontWeight={700}>
                    {plan.title}
                  </Typography>
                  <Box sx={{ flex: 1 }} />
                  <Typography variant="body2" color="text.secondary">
                    {plan.products.length}点 / <strong>¥{plan.total_price.toLocaleString()}</strong>
                  </Typography>
                </Box>

                {plan.reason && (
                  <Box
                    sx={{
                      mt: 0.75,
                      mb: 1,
                      p: 0.75,
                      bgcolor: "rgba(25,118,210,0.06)",
                      borderRadius: 1,
                    }}
                  >
                    <Typography variant="caption" color="text.secondary" sx={{ lineHeight: 1.4 }}>
                      {plan.reason}
                    </Typography>
                  </Box>
                )}

                <Box
                  sx={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))",
                    gap: 1,
                    mt: plan.reason ? 0 : 1,
                  }}
                >
                  {plan.products.map((product) => (
                    <Card key={product.id} elevation={1} sx={{ borderRadius: 2 }}>
                      <CardActionArea onClick={() => navigate(`/products/${product.id}`)}>
                        <ProductImage product={product} height={90} emojiSize={32} />
                        <CardContent sx={{ p: 1, "&:last-child": { pb: 1 } }}>
                          <Typography variant="caption" noWrap display="block">{product.title}</Typography>
                          <Typography variant="body2" fontWeight={700} color="primary">
                            ¥{product.price.toLocaleString()}
                          </Typography>
                        </CardContent>
                      </CardActionArea>
                    </Card>
                  ))}
                </Box>

                {user ? (
                  <Box sx={{ mt: 1.5, display: "flex", justifyContent: "flex-end" }}>
                    <Button
                      variant="contained"
                      size="small"
                      startIcon={<ShoppingCartCheckoutIcon />}
                      onClick={() => setPlanToBuy(plan)}
                      disabled={buying}
                    >
                      このプランを購入（¥{plan.total_price.toLocaleString()}）
                    </Button>
                  </Box>
                ) : (
                  <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: "block" }}>
                    購入にはログインが必要です
                  </Typography>
                )}
              </Paper>
            ))}

            {plans.length > 1 && (
              <Typography variant="caption" color="text.secondary" sx={{ textAlign: "center" }}>
                ※ プラン同士は内容が重複する場合があります。いずれか1つをお選びください
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
                        {f.reason}
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
        <Box sx={{ display: "flex", gap: 1, alignItems: "center", flexWrap: "wrap" }}>
          <TextField
            size="small"
            label="下限（任意）"
            type="number"
            value={minBudget}
            onChange={(e) => {
              const v = e.target.value;
              if (v === "" || parseInt(v) >= 0) setMinBudget(v);
            }}
            sx={{ width: 130 }}
            inputProps={{ min: 0 }}
            InputProps={{ startAdornment: <InputAdornment position="start">¥</InputAdornment> }}
          />
          <Typography variant="body2" color="text.secondary">〜</Typography>
          <TextField
            size="small"
            label="上限（任意）"
            type="number"
            value={maxBudget}
            onChange={(e) => {
              const v = e.target.value;
              if (v === "" || parseInt(v) >= 0) setMaxBudget(v);
            }}
            sx={{ width: 130 }}
            inputProps={{ min: 0 }}
            InputProps={{ startAdornment: <InputAdornment position="start">¥</InputAdornment> }}
            error={budgetInvalid}
            helperText={budgetInvalid ? "上限は下限以上にしてください" : ""}
          />
          <Typography variant="caption" color="text.secondary">
            予算の範囲を設定するとその範囲内で提案します
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
            disabled={loading || !input.trim() || budgetInvalid}
            sx={{ minWidth: 56 }}
          >
            <SendIcon />
          </Button>
        </Box>
      </Box>

      {/* 購入確認ダイアログ */}
      <Dialog open={Boolean(planToBuy)} onClose={() => setPlanToBuy(null)} maxWidth="sm" fullWidth>
        <DialogTitle>「{planToBuy?.title}」を購入</DialogTitle>
        <DialogContent dividers>
          <List disablePadding>
            {dialogProducts.map((product, idx) => (
              <React.Fragment key={product.id}>
                <ListItem alignItems="flex-start" disablePadding sx={{ py: 1.5 }}>
                  <ListItemAvatar>
                    <Box sx={{ width: 64, height: 64, mr: 1, borderRadius: 1, overflow: "hidden" }}>
                      <ProductImage product={product} height={64} emojiSize={26} />
                    </Box>
                  </ListItemAvatar>
                  <Box sx={{ ml: 1, flex: 1, minWidth: 0 }}>
                    <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 1 }}>
                      <Typography variant="subtitle2" fontWeight={700}>
                        {product.title}
                      </Typography>
                      <Typography variant="body2" fontWeight={700} color="primary" sx={{ whiteSpace: "nowrap" }}>
                        ¥{product.price.toLocaleString()}
                      </Typography>
                    </Box>
                    {(product.category || product.condition) && (
                      <Typography variant="caption" color="text.secondary" display="block">
                        {product.category}
                        {product.category && product.condition && "　/　"}
                        {product.condition && `状態: ${product.condition}`}
                      </Typography>
                    )}
                    {product.description && (
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ mt: 0.5, whiteSpace: "pre-wrap" }}
                      >
                        {product.description}
                      </Typography>
                    )}
                  </Box>
                </ListItem>
                {idx < dialogProducts.length - 1 && <Divider component="li" />}
              </React.Fragment>
            ))}
          </List>
          <Divider sx={{ my: 1.5 }} />
          <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
            <Typography variant="subtitle1" fontWeight={700}>
              合計　¥{dialogTotal.toLocaleString()}
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button onClick={() => setPlanToBuy(null)} color="inherit">
            キャンセル
          </Button>
          <Button
            variant="contained"
            startIcon={<ShoppingCartCheckoutIcon />}
            onClick={handleBuyPlan}
          >
            購入する
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AiSetPage;
