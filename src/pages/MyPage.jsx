import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useUser } from "../context/UserContext";
import { getSellerProducts, deleteProduct, getLikedProducts } from "../api/products";
import { getMyPurchases } from "../api/purchases";
import { getResaleStatus, submitAppeal } from "../api/resale";
import { updateUsername } from "../api/users";
import ProductCard from "../components/ProductCard";
import ProductGridSkeleton from "../components/ProductGridSkeleton";
import EmptyState from "../components/EmptyState";
import {
  Container,
  Box,
  Typography,
  Avatar,
  Tabs,
  Tab,
  Grid,
  Paper,
  CircularProgress,
  Button,
  Alert,
  List,
  ListItem,
  ListItemText,
  ListItemButton,
  Divider,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
} from "@mui/material";
import AddBoxIcon from "@mui/icons-material/AddBox";
import ShoppingBagIcon from "@mui/icons-material/ShoppingBag";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import ReceiptLongIcon from "@mui/icons-material/ReceiptLong";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutlined";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import EditIcon from "@mui/icons-material/Edit";
import TextField from "@mui/material/TextField";
import { useToast } from "../context/ToastContext";

const MyPage = () => {
  const { user, setUser } = useUser();
  const navigate = useNavigate();
  const toast = useToast();
  const [tab, setTab] = useState(0);
  const [sellingProducts, setSellingProducts] = useState([]);
  const [purchases, setPurchases] = useState([]);
  const [likedProducts, setLikedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [withdrawTarget, setWithdrawTarget] = useState(null);
  const [withdrawing, setWithdrawing] = useState(false);
  const [resaleStatus, setResaleStatus] = useState(null);
  const [appealOpen, setAppealOpen] = useState(false);
  const [appealMessage, setAppealMessage] = useState("");
  const [appealing, setAppealing] = useState(false);
  const [nameDialogOpen, setNameDialogOpen] = useState(false);
  const [nameInput, setNameInput] = useState("");
  const [savingName, setSavingName] = useState(false);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { if (user?.email) { fetchData(); fetchResaleStatus(); } }, [user]);

  const fetchResaleStatus = async () => {
    try {
      const res = await getResaleStatus(user.email);
      setResaleStatus(res.data);
    } catch (e) {
      setResaleStatus(null);
    }
  };

  const handleAppeal = async () => {
    if (!appealMessage.trim()) return;
    setAppealing(true);
    try {
      await submitAppeal(user.email, appealMessage.trim());
      toast("異議申し立てを受け付けました", "success");
      setAppealOpen(false);
      setAppealMessage("");
    } catch (e) {
      toast("送信に失敗しました", "error");
    } finally {
      setAppealing(false);
    }
  };

  const openNameDialog = () => {
    setNameInput(user.username || user.displayName || "");
    setNameDialogOpen(true);
  };

  const handleSaveName = async () => {
    const name = nameInput.trim();
    if (!name) return;
    setSavingName(true);
    try {
      const res = await updateUsername(user.email, name);
      // 表示名（取引で他ユーザーに見える名前）を即時反映
      setUser((prev) => ({ ...prev, ...res.data }));
      toast("ユーザー名を変更しました", "success");
      setNameDialogOpen(false);
    } catch (e) {
      toast(e.response?.data?.detail || "ユーザー名の変更に失敗しました", "error");
    } finally {
      setSavingName(false);
    }
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const [sellRes, buyRes, likedRes] = await Promise.all([
        getSellerProducts(user.email),
        getMyPurchases(user.email),
        getLikedProducts(user.email),
      ]);
      setSellingProducts(sellRes.data);
      setPurchases(buyRes.data);
      setLikedProducts(likedRes.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleWithdraw = async () => {
    if (!withdrawTarget) return;
    setWithdrawing(true);
    try {
      await deleteProduct(withdrawTarget.id, user.email);
      setWithdrawTarget(null);
      await fetchData();
    } catch (e) {
      console.error(e);
    } finally {
      setWithdrawing(false);
    }
  };

  if (!user) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", py: 10 }}>
        <Alert severity="warning" sx={{ borderRadius: 2 }}>
          マイページを見るにはログインが必要です
        </Alert>
      </Box>
    );
  }

  const available = sellingProducts.filter((p) => p.status === "available");
  const sold = sellingProducts.filter((p) => p.status === "sold");

  return (
    <Box sx={{ bgcolor: "grey.50", minHeight: "100vh", pb: 6 }}>
      {/* プロフィールヘッダー */}
      <Paper elevation={0} sx={{ bgcolor: "primary.main", color: "white", py: 4 }}>
        <Container maxWidth="lg">
          <Box sx={{ display: "flex", alignItems: "center", gap: 3 }}>
            <Avatar
              src={user.photoURL || ""}
              alt={user.username || user.displayName || "U"}
              sx={{ width: 72, height: 72, border: "3px solid rgba(255,255,255,0.5)", fontSize: "1.8rem" }}
            >
              {(user.username || user.displayName || "U")[0]}
            </Avatar>
            <Box>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <Typography variant="h5" sx={{ fontWeight: 700 }}>
                  {user.username || user.displayName}
                </Typography>
                <Button
                  size="small"
                  startIcon={<EditIcon sx={{ fontSize: 16 }} />}
                  onClick={openNameDialog}
                  sx={{
                    color: "white",
                    borderColor: "rgba(255,255,255,0.6)",
                    minWidth: 0,
                    px: 1,
                    "&:hover": { borderColor: "white", bgcolor: "rgba(255,255,255,0.12)" },
                  }}
                  variant="outlined"
                >
                  編集
                </Button>
              </Box>
              <Typography variant="body2" sx={{ opacity: 0.85 }}>
                {user.email}
              </Typography>
              <Typography variant="caption" sx={{ opacity: 0.75, display: "block", mt: 0.3 }}>
                このユーザー名が出品・取引時に他のユーザーへ表示されます
              </Typography>
            </Box>
          </Box>
        </Container>
      </Paper>

      <Container maxWidth="lg" sx={{ pt: 3 }}>
        {/* 転売判定の警告バナー */}
        {resaleStatus?.flagged && (
          <Alert
            severity={resaleStatus.restricted ? "error" : "warning"}
            icon={<WarningAmberIcon />}
            sx={{ borderRadius: 2, mb: 3 }}
            action={
              <Button color="inherit" size="small" onClick={() => setAppealOpen(true)}>
                異議申し立て
              </Button>
            }
          >
            {resaleStatus.restricted
              ? "転売の疑いにより、現在新規出品が制限され、あなたの出品商品は他のユーザーに表示されていません。誤検知の場合は異議申し立てができます。"
              : "あなたの出品に転売の可能性が検知されました。出品商品に警告バッジが表示される場合があります。誤検知の場合は異議申し立てができます。"}
          </Alert>
        )}

        {/* タブ */}
        <Paper elevation={1} sx={{ borderRadius: 2, mb: 3 }}>
          <Tabs
            value={tab}
            onChange={(_, v) => setTab(v)}
            indicatorColor="primary"
            textColor="primary"
            variant="fullWidth"
          >
            <Tab label={`出品中 (${available.length})`} />
            <Tab label={`売り切れ (${sold.length})`} />
            <Tab label={`いいね (${likedProducts.length})`} />
            <Tab label={`購入履歴 (${purchases.length})`} />
          </Tabs>
        </Paper>

        {/* コンテンツ */}
        {loading ? (
          <ProductGridSkeleton count={4} />
        ) : (
          <Box>
            {/* 出品中 */}
            {tab === 0 && (
              <>
                {available.length === 0 ? (
                  <EmptyState
                    icon={<ShoppingBagIcon sx={{ fontSize: 64 }} />}
                    message="出品中の商品はありません"
                    actionLabel="出品する"
                    actionIcon={<AddBoxIcon />}
                    onAction={() => navigate("/sell")}
                  />
                ) : (
                  <Grid container spacing={2}>
                    {available.map((p) => (
                      <Grid item xs={6} sm={4} md={3} key={p.id} sx={{ display: "flex" }}>
                        <Box sx={{ display: "flex", flexDirection: "column", width: "100%" }}>
                          <Box sx={{ flexGrow: 1, position: "relative" }}>
                            <ProductCard product={p} />
                            {p.hidden_by_penalty && (
                              <Chip
                                icon={<VisibilityOffIcon sx={{ fontSize: "0.9rem" }} />}
                                label="非表示中"
                                size="small"
                                color="error"
                                sx={{
                                  position: "absolute",
                                  top: 8,
                                  right: 8,
                                  fontWeight: 700,
                                  fontSize: "0.68rem",
                                  height: 22,
                                  "& .MuiChip-icon": { color: "white" },
                                  color: "white",
                                }}
                              />
                            )}
                          </Box>
                          <Button
                            fullWidth
                            size="small"
                            color="error"
                            variant="outlined"
                            startIcon={<DeleteOutlineIcon />}
                            onClick={() => setWithdrawTarget(p)}
                            sx={{ mt: 0.5 }}
                          >
                            取り下げる
                          </Button>
                        </Box>
                      </Grid>
                    ))}
                  </Grid>
                )}
              </>
            )}

            {/* 売り切れ */}
            {tab === 1 && (
              <>
                {sold.length === 0 ? (
                  <EmptyState
                    icon={<ShoppingBagIcon sx={{ fontSize: 64 }} />}
                    message="売り切れた商品はありません"
                  />
                ) : (
                  <Grid container spacing={2}>
                    {sold.map((p) => (
                      <Grid item xs={6} sm={4} md={3} key={p.id}>
                        <ProductCard product={p} />
                      </Grid>
                    ))}
                  </Grid>
                )}
              </>
            )}

            {/* いいね */}
            {tab === 2 && (
              <>
                {likedProducts.length === 0 ? (
                  <EmptyState
                    icon={<FavoriteBorderIcon sx={{ fontSize: 64 }} />}
                    message="いいねした商品はありません"
                  />
                ) : (
                  <Grid container spacing={2}>
                    {likedProducts.map((p) => (
                      <Grid item xs={6} sm={4} md={3} key={p.id}>
                        <ProductCard product={p} />
                      </Grid>
                    ))}
                  </Grid>
                )}
              </>
            )}

            {/* 購入履歴 */}
            {tab === 3 && (
              <>
                {purchases.length === 0 ? (
                  <EmptyState
                    icon={<ReceiptLongIcon sx={{ fontSize: 64 }} />}
                    message="購入履歴はありません"
                  />
                ) : (
                  <Paper elevation={1} sx={{ borderRadius: 2, overflow: "hidden" }}>
                    <List disablePadding>
                      {purchases.map((purchase, index) => (
                        <React.Fragment key={purchase.id}>
                          <ListItem disablePadding>
                            <ListItemButton onClick={() => navigate(`/products/${purchase.product_id}`)}>
                              <ListItemText
                                primary={purchase.product?.title || `商品ID: ${purchase.product_id}`}
                                secondary={new Date(purchase.purchased_at).toLocaleDateString("ja-JP")}
                                primaryTypographyProps={{ fontWeight: 600 }}
                              />
                              <Chip
                                label={`¥${purchase.price.toLocaleString()}`}
                                color="primary"
                                size="small"
                                sx={{ fontWeight: 700 }}
                              />
                            </ListItemButton>
                          </ListItem>
                          {index < purchases.length - 1 && <Divider />}
                        </React.Fragment>
                      ))}
                    </List>
                  </Paper>
                )}
              </>
            )}
          </Box>
        )}
      </Container>

      {/* 取り下げ確認ダイアログ */}
      <Dialog open={Boolean(withdrawTarget)} onClose={() => setWithdrawTarget(null)}>
        <DialogTitle>出品を取り下げますか？</DialogTitle>
        <DialogContent>
          <DialogContentText>
            「{withdrawTarget?.title}」を取り下げます。この操作は取り消せません。
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button onClick={() => setWithdrawTarget(null)} color="inherit" disabled={withdrawing}>
            キャンセル
          </Button>
          <Button
            onClick={handleWithdraw}
            color="error"
            variant="contained"
            disabled={withdrawing}
            startIcon={withdrawing ? <CircularProgress size={16} color="inherit" /> : <DeleteOutlineIcon />}
          >
            取り下げる
          </Button>
        </DialogActions>
      </Dialog>

      {/* 異議申し立てダイアログ */}
      <Dialog open={appealOpen} onClose={() => setAppealOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>異議申し立て</DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ mb: 2 }}>
            転売の判定に心当たりがない場合は、状況を記入して送信してください。運営が内容を確認します。
          </DialogContentText>
          <TextField
            autoFocus
            multiline
            minRows={4}
            fullWidth
            placeholder="例: これらは自分が使っていた私物で、転売目的ではありません。"
            value={appealMessage}
            onChange={(e) => setAppealMessage(e.target.value)}
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button onClick={() => setAppealOpen(false)} color="inherit" disabled={appealing}>
            キャンセル
          </Button>
          <Button
            onClick={handleAppeal}
            variant="contained"
            disabled={appealing || !appealMessage.trim()}
            startIcon={appealing ? <CircularProgress size={16} color="inherit" /> : null}
          >
            送信する
          </Button>
        </DialogActions>
      </Dialog>

      {/* ユーザー名変更ダイアログ */}
      <Dialog open={nameDialogOpen} onClose={() => setNameDialogOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>ユーザー名を変更</DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ mb: 2 }}>
            ここで設定した名前が、出品・取引時に他のユーザーへ表示されます。
          </DialogContentText>
          <TextField
            autoFocus
            fullWidth
            label="ユーザー名"
            placeholder="例: emporio_taro"
            value={nameInput}
            onChange={(e) => setNameInput(e.target.value)}
            inputProps={{ maxLength: 50 }}
            helperText={`${nameInput.length}/50`}
            onKeyDown={(e) => {
              if (e.key === "Enter" && nameInput.trim() && !savingName) handleSaveName();
            }}
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button onClick={() => setNameDialogOpen(false)} color="inherit" disabled={savingName}>
            キャンセル
          </Button>
          <Button
            onClick={handleSaveName}
            variant="contained"
            disabled={savingName || !nameInput.trim()}
            startIcon={savingName ? <CircularProgress size={16} color="inherit" /> : null}
          >
            保存する
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default MyPage;
