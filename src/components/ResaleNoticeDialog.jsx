import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Dialog,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Zoom,
} from "@mui/material";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import { useUser } from "../context/UserContext";
import { getResaleStatus } from "../api/resale";

// ポップアウト用のトランジション（中央からズームイン）
const Transition = React.forwardRef(function Transition(props, ref) {
  return <Zoom ref={ref} {...props} />;
});

// 転売スコアが段階2（出品制限）に達したログインユーザーへ、通告をモーダルで表示する。
// アプリ全体に常駐し、ログイン中ユーザーの状態をページ遷移ごとに確認する。
const ResaleNoticeDialog = () => {
  const { user } = useUser();
  const location = useLocation();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if (!user?.email || dismissed) return;
    getResaleStatus(user.email)
      .then((res) => {
        if (res.data?.restricted) setOpen(true);
      })
      .catch(() => {});
  }, [user, location.pathname, dismissed]);

  const close = () => {
    setOpen(false);
    setDismissed(true);
  };

  return (
    <Dialog
      open={open}
      onClose={close}
      TransitionComponent={Transition}
      maxWidth="xs"
      fullWidth
      PaperProps={{ sx: { borderRadius: 3, overflow: "hidden" } }}
    >
      <Box sx={{ bgcolor: "error.main", color: "#fff", py: 2.5, textAlign: "center" }}>
        <WarningAmberIcon sx={{ fontSize: 48 }} />
        <Typography variant="h6" sx={{ fontWeight: 800, mt: 0.5 }}>
          出品制限のお知らせ
        </Typography>
      </Box>
      <DialogContent sx={{ py: 3 }}>
        <Typography variant="body2" sx={{ lineHeight: 1.9 }}>
          転売の疑いが基準値を超えたため、あなたのアカウントは
          <Box component="span" sx={{ fontWeight: 700, color: "error.main" }}>
            新規出品を制限
          </Box>
          しました。現在出品中の商品も、他のユーザーには表示されていません。
        </Typography>
        <Typography variant="body2" sx={{ lineHeight: 1.9, mt: 1.5, color: "text.secondary" }}>
          心当たりがない場合は、異議申し立てから状況をお知らせください。
        </Typography>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2.5, gap: 1 }}>
        <Button onClick={close} color="inherit">
          閉じる
        </Button>
        <Button
          variant="contained"
          color="error"
          onClick={() => {
            close();
            navigate("/mypage");
          }}
        >
          異議申し立て
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ResaleNoticeDialog;
