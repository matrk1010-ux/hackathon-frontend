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
  Alert,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemAvatar,
  Chip,
  Checkbox,
} from "@mui/material";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import SendIcon from "@mui/icons-material/Send";
import ShoppingCartCheckoutIcon from "@mui/icons-material/ShoppingCartCheckout";
import ProductImage from "../components/ProductImage";
import { useUser } from "../context/UserContext";
import { useAiSet } from "../context/AiSetContext";
import { aiSetChat } from "../api/ai_set";
import { bulkBuyProducts } from "../api/purchases";

const AiSetPage = () => {
  const { user } = useUser();
  const navigate = useNavigate();
  // ページ遷移後も会話・プランを保持するため Context から取得
  const {
    messages,
    setMessages,
    input,
    setInput,
    plans,
    setPlans,
    buyResult,
    setBuyResult,
  } = useAiSet();
  const [loading, setLoading] = useState(false);
  const [buying, setBuying] = useState(false);
  const [planToBuy, setPlanToBuy] = useState(null);
  const [selectedIds, setSelectedIds] = useState([]);
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading, plans]);

  // 購入確認ダイアログを開くたび、対象プランの全商品を「選択済み」で初期化
  useEffect(() => {
    setSelectedIds((planToBuy?.products || []).map((p) => p.id));
  }, [planToBuy]);

  const sendMessage = async () => {
    if (!input.trim() || loading) return;

    const userMsg = { role: "user", content: input.trim() };
    const nextMessages = [...messages, userMsg];
    setMessages(nextMessages);
    setInput("");
    setLoading(true);
    setBuyResult(null);
    setPlans([]);

    try {
      const res = await aiSetChat(nextMessages);
      const { reply, plans: newPlans } = res.data;
      setMessages((prev) => [...prev, { role: "model", content: reply }]);
      setPlans(newPlans || []);
    } catch (e) {
      setMessages((prev) => [
        ...prev,
        {
          role: "model",
          content: "エラーが発生しました。もう一度お試しください。",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleBuyPlan = async () => {
    if (!user || !planToBuy || selectedIds.length === 0) return;
    const products = (planToBuy.products || []).filter((p) =>
      selectedIds.includes(p.id),
    );
    if (products.length === 0) return;
    setBuying(true);
    setPlanToBuy(null);
    try {
      const res = await bulkBuyProducts(
        products.map((p) => p.id),
        user.email,
      );
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
  const dialogTotal = dialogProducts
    .filter((p) => selectedIds.includes(p.id))
    .reduce((sum, p) => sum + p.price, 0);
  const toggleBuyProduct = (id) =>
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );

  return (
    <Box
      sx={{
        maxWidth: 800,
        mx: "auto",
        height: "calc(100vh - 64px)",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* ヘッダー */}
      <Box
        sx={{
          p: 2,
          borderBottom: "1px solid #eee",
          bgcolor: "background.paper",
        }}
      >
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
      <Box
        sx={{
          flex: 1,
          overflowY: "auto",
          p: 2,
          display: "flex",
          flexDirection: "column",
          gap: 2,
        }}
      >
        {messages.length === 0 && (
          <Box sx={{ textAlign: "center", mt: 6, color: "text.secondary" }}>
            <AutoAwesomeIcon sx={{ fontSize: 48, mb: 2, opacity: 0.3 }} />
            <Typography variant="body1">
              例：「[小説名]の3巻まで持ってます」
            </Typography>
            <Typography variant="body1" sx={{ mt: 0.5 }}>
              「来月から一人暮らし始めるので調理器具を揃えたいです」
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
                borderRadius:
                  msg.role === "user"
                    ? "18px 18px 4px 18px"
                    : "18px 18px 18px 4px",
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
            <Paper
              elevation={0}
              sx={{
                px: 2,
                py: 1.5,
                bgcolor: "grey.100",
                borderRadius: "18px 18px 18px 4px",
              }}
            >
              <CircularProgress size={16} />
            </Paper>
          </Box>
        )}

        {/* 提案プラン（買い方） */}
        {plans.length > 0 && (
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ ml: 0.5 }}
            >
              AIが提案する買い方（プランを選んでまとめて購入できます）
            </Typography>

            {plans.map((plan, pi) => (
              <Paper
                key={pi}
                variant="outlined"
                sx={{
                  p: 1.5,
                  borderRadius: 2,
                  ...(plan.recommended && {
                    borderColor: "primary.main",
                    borderWidth: 2,
                    boxShadow: "0 2px 10px rgba(255,107,53,0.15)",
                  }),
                }}
              >
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 0.75,
                    flexWrap: "wrap",
                  }}
                >
                  <AutoAwesomeIcon color="secondary" fontSize="small" />
                  <Typography variant="subtitle2" fontWeight={700}>
                    {plan.title}
                  </Typography>
                  {plan.recommended && (
                    <Chip
                      label="おすすめ"
                      color="primary"
                      size="small"
                      sx={{ height: 20, fontWeight: 700 }}
                    />
                  )}
                  {plan.label && (
                    <Chip
                      label={plan.label}
                      color="secondary"
                      variant="outlined"
                      size="small"
                      sx={{ height: 20 }}
                    />
                  )}
                  <Box sx={{ flex: 1 }} />
                  <Typography variant="body2" color="text.secondary">
                    {plan.products.length}点 /{" "}
                    <strong>¥{plan.total_price.toLocaleString()}</strong>
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
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      sx={{ lineHeight: 1.4 }}
                    >
                      {plan.reason}
                    </Typography>
                  </Box>
                )}

                <Box
                  sx={{
                    display: "grid",
                    gridTemplateColumns:
                      "repeat(auto-fill, minmax(140px, 1fr))",
                    gap: 1,
                    mt: plan.reason ? 0 : 1,
                  }}
                >
                  {plan.products.map((product) => (
                    <Card
                      key={product.id}
                      elevation={1}
                      sx={{ borderRadius: 2 }}
                    >
                      <CardActionArea
                        onClick={() => navigate(`/products/${product.id}`)}
                      >
                        <ProductImage
                          product={product}
                          height={90}
                          emojiSize={32}
                        />
                        <CardContent sx={{ p: 1, "&:last-child": { pb: 1 } }}>
                          <Typography variant="caption" noWrap display="block">
                            {product.title}
                          </Typography>
                          {product.seller?.username && (
                            <Typography
                              variant="caption"
                              noWrap
                              display="block"
                              color="text.secondary"
                            >
                              出品者: {product.seller.username}
                            </Typography>
                          )}
                          <Typography
                            variant="body2"
                            fontWeight={700}
                            color="primary"
                          >
                            ¥{product.price.toLocaleString()}
                          </Typography>
                        </CardContent>
                      </CardActionArea>
                    </Card>
                  ))}
                </Box>

                {user ? (
                  <Box
                    sx={{
                      mt: 1.5,
                      display: "flex",
                      justifyContent: "flex-end",
                    }}
                  >
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
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ mt: 1, display: "block" }}
                  >
                    購入にはログインが必要です
                  </Typography>
                )}
              </Paper>
            ))}

            {plans.length > 1 && (
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ textAlign: "center" }}
              >
                ※
                プラン同士は内容が重複する場合があります。いずれか1つをお選びください
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
                {buyResult.purchased.length}点を購入しました（合計 ¥
                {buyResult.total_price.toLocaleString()}）
                {buyResult.failed.length > 0 && (
                  <Box sx={{ mt: 0.5 }}>
                    {buyResult.failed.map((f) => (
                      <Typography
                        key={f.product_id}
                        variant="caption"
                        display="block"
                      >
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
      <Box sx={{ p: 2, bgcolor: "background.paper" }}>
        <Box sx={{ display: "flex", gap: 1 }}>
          <TextField
            fullWidth
            size="small"
            placeholder="欲しいものや状況を入力してください..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (
                e.key === "Enter" &&
                !e.shiftKey &&
                !e.nativeEvent.isComposing
              ) {
                e.preventDefault(); // 送信後に改行が入力欄へ残るのを防ぐ
                sendMessage();
              }
            }}
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

      {/* 購入確認ダイアログ */}
      <Dialog
        open={Boolean(planToBuy)}
        onClose={() => setPlanToBuy(null)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>「{planToBuy?.title}」を購入</DialogTitle>
        <DialogContent dividers>
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ display: "block", mb: 1 }}
          >
            チェックを外すとその商品を購入対象から除けます（再度チェックで戻せます。合計に反映されます）
          </Typography>
          <List disablePadding>
            {dialogProducts.map((product, idx) => {
              const checked = selectedIds.includes(product.id);
              return (
                <React.Fragment key={product.id}>
                  <ListItem
                    alignItems="flex-start"
                    disablePadding
                    sx={{ py: 1.5, opacity: checked ? 1 : 0.45 }}
                  >
                    <Checkbox
                      edge="start"
                      checked={checked}
                      onChange={() => toggleBuyProduct(product.id)}
                      aria-label="このプランに含める"
                      sx={{ mt: 1 }}
                    />
                    <ListItemAvatar>
                      <Box
                        sx={{
                          width: 64,
                          height: 64,
                          mr: 1,
                          borderRadius: 1,
                          overflow: "hidden",
                        }}
                      >
                        <ProductImage
                          product={product}
                          height={64}
                          emojiSize={26}
                        />
                      </Box>
                    </ListItemAvatar>
                    <Box sx={{ ml: 1, flex: 1, minWidth: 0 }}>
                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "baseline",
                          gap: 1,
                        }}
                      >
                        <Typography variant="subtitle2" fontWeight={700}>
                          {product.title}
                        </Typography>
                        <Typography
                          variant="body2"
                          fontWeight={700}
                          color="primary"
                          sx={{ whiteSpace: "nowrap" }}
                        >
                          ¥{product.price.toLocaleString()}
                        </Typography>
                      </Box>
                      {(product.category ||
                        product.condition ||
                        product.seller?.username) && (
                        <Typography
                          variant="caption"
                          color="text.secondary"
                          display="block"
                        >
                          {[
                            product.category,
                            product.condition && `状態: ${product.condition}`,
                            product.seller?.username &&
                              `出品者: ${product.seller.username}`,
                          ]
                            .filter(Boolean)
                            .join("　/　")}
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
                  {idx < dialogProducts.length - 1 && (
                    <Divider component="li" />
                  )}
                </React.Fragment>
              );
            })}
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
            disabled={selectedIds.length === 0}
          >
            購入する（¥{dialogTotal.toLocaleString()}）
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AiSetPage;
