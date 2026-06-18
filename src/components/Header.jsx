import React, { useState, useEffect, useCallback } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { signOut } from "firebase/auth";
import { fireAuth } from "../firebase";
import { useUser } from "../context/UserContext";
import { getNotifications, markNotificationsRead } from "../api/notifications";
import { parseUtc } from "../utils/datetime";
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  Avatar,
  Menu,
  MenuItem,
  IconButton,
  Divider,
  Badge,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import useMediaQuery from "@mui/material/useMediaQuery";
import AddBoxIcon from "@mui/icons-material/AddBox";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import NotificationsNoneIcon from "@mui/icons-material/NotificationsNone";
import FavoriteIcon from "@mui/icons-material/Favorite";
import ChatBubbleOutlineIcon from "@mui/icons-material/ChatBubbleOutlineOutlined";
import ShoppingBagIcon from "@mui/icons-material/ShoppingBag";

const NOTIF_LABEL = {
  like: "をいいねしました",
  comment: "にコメントしました",
  sold: "が購入されました",
};

// 種別ごとのアイコン・色（いいね=赤 / コメント=青系 / 購入=緑）
const NOTIF_META = {
  like: { Icon: FavoriteIcon, color: "error.main", bg: "rgba(192,73,47,0.12)" },
  comment: { Icon: ChatBubbleOutlineIcon, color: "#1976d2", bg: "rgba(25,118,210,0.12)" },
  sold: { Icon: ShoppingBagIcon, color: "success.main", bg: "rgba(46,125,91,0.14)" },
};

const Header = () => {
  const { user, setUser } = useUser();
  const navigate = useNavigate();
  const location = useLocation();
  const [anchorEl, setAnchorEl] = useState(null);
  const [notifAnchor, setNotifAnchor] = useState(null);
  const [notifs, setNotifs] = useState([]);
  const [unread, setUnread] = useState(0);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const loadNotifs = useCallback(() => {
    if (!user?.email) return;
    getNotifications(user.email)
      .then((res) => {
        setNotifs(res.data.items || []);
        setUnread(res.data.unread_count || 0);
      })
      .catch(() => {});
  }, [user]);

  // ログイン中はページ遷移ごとに通知を取得（未読バッジ更新）
  useEffect(() => { loadNotifs(); }, [loadNotifs, location.pathname]);

  const openNotif = (e) => {
    setNotifAnchor(e.currentTarget);
    if (user?.email && unread > 0) {
      markNotificationsRead(user.email).then(() => setUnread(0)).catch(() => {});
    }
  };

  const handleLogout = async () => {
    setAnchorEl(null);
    await signOut(fireAuth);
    setUser(null);
    navigate("/");
  };

  return (
    <AppBar
      position="sticky"
      elevation={0}
      sx={{
        background: "linear-gradient(135deg, #E6DED4 0%, #C8D9E6 40%, #AFC3D4 100%)",
        color: "text.primary",
        borderBottom: "1px solid",
        borderColor: "divider",
        boxShadow: "0 1px 2px rgba(20,40,60,.06)",
      }}
    >
      <Toolbar sx={{ gap: 1 }}>
        {/* ロゴ */}
        <Box
          component={Link}
          to="/"
          sx={{
            flexGrow: 1,
            display: "flex",
            alignItems: "center",
            color: "#2F4A72", // ロゴだけ少し濃いめの青
            textDecoration: "none",
          }}
        >
          <Box sx={{ display: "flex", flexDirection: "column", lineHeight: 1 }}>
            <Typography
              variant="h6"
              sx={{
                fontWeight: 800,
                letterSpacing: ".02em",
                lineHeight: 1.1,
                fontSize: { xs: "1.3rem", sm: "1.5rem" },
              }}
            >
              Emporio
            </Typography>
            {!isMobile && (
              <Typography
                variant="caption"
                sx={{ color: "text.secondary", lineHeight: 1, fontSize: ".62rem", letterSpacing: ".34em" }}
              >
                エンボリオ
              </Typography>
            )}
          </Box>
        </Box>

        {user ? (
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            {/* AIセット・出品ボタン（モバイルでは下部ナビに集約） */}
            {!isMobile && (
              <>
                <Button
                  color="secondary"
                  startIcon={<AutoAwesomeIcon />}
                  component={Link}
                  to="/ai-set"
                  sx={{ fontWeight: 600 }}
                >
                  AIセット
                </Button>
                <Button
                  variant="contained"
                  color="primary"
                  startIcon={<AddBoxIcon />}
                  component={Link}
                  to="/sell"
                  sx={{ fontWeight: 600 }}
                >
                  出品する
                </Button>
              </>
            )}

            {/* 通知ベル */}
            <IconButton onClick={openNotif} sx={{ color: "text.secondary" }} aria-label="通知">
              <Badge badgeContent={unread} color="error" max={99}>
                <NotificationsNoneIcon />
              </Badge>
            </IconButton>
            <Menu
              anchorEl={notifAnchor}
              open={Boolean(notifAnchor)}
              onClose={() => setNotifAnchor(null)}
              transformOrigin={{ horizontal: "right", vertical: "top" }}
              anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
              slotProps={{ paper: { sx: { width: 320, maxHeight: 420 } } }}
            >
              <Box sx={{ px: 2, py: 1 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>通知</Typography>
              </Box>
              <Divider />
              {notifs.length === 0 ? (
                <Box sx={{ px: 2, py: 3, textAlign: "center" }}>
                  <Typography variant="body2" color="text.secondary">通知はありません</Typography>
                </Box>
              ) : (
                notifs.map((n, i) => {
                  const meta = NOTIF_META[n.type] || NOTIF_META.like;
                  const Icon = meta.Icon;
                  return (
                    <MenuItem
                      key={i}
                      onClick={() => { setNotifAnchor(null); navigate(`/products/${n.product_id}`); }}
                      sx={{ whiteSpace: "normal", alignItems: "center", gap: 1.25, py: 1 }}
                    >
                      <Box
                        sx={{
                          width: 34,
                          height: 34,
                          borderRadius: "50%",
                          flexShrink: 0,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          bgcolor: meta.bg,
                          color: meta.color,
                        }}
                      >
                        <Icon sx={{ fontSize: 18 }} />
                      </Box>
                      <Box sx={{ minWidth: 0 }}>
                        <Typography sx={{ fontSize: 13, lineHeight: 1.45 }}>
                          {n.type === "sold"
                            ? `「${n.product_title}」が購入されました`
                            : `${n.actor}さんが「${n.product_title}」${NOTIF_LABEL[n.type] || ""}`}
                        </Typography>
                        <Typography sx={{ fontSize: 11, color: "text.secondary", mt: 0.3 }}>
                          {n.created_at
                            ? parseUtc(n.created_at).toLocaleString("ja-JP", { month: "numeric", day: "numeric", hour: "2-digit", minute: "2-digit" })
                            : ""}
                        </Typography>
                      </Box>
                    </MenuItem>
                  );
                })
              )}
            </Menu>

            {/* アバター → マイページメニュー */}
            <IconButton onClick={(e) => setAnchorEl(e.currentTarget)} sx={{ p: 0.5 }}>
              <Avatar
                src={user.avatar_url || user.photoURL || ""}
                alt={user.username || user.displayName || "U"}
                sx={{ width: 36, height: 36, border: "2px solid", borderColor: "divider", bgcolor: "primary.main" }}
              >
                {(user.username || user.displayName || "U")[0]}
              </Avatar>
            </IconButton>
            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={() => setAnchorEl(null)}
              transformOrigin={{ horizontal: "right", vertical: "top" }}
              anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
            >
              <MenuItem disabled>
                <Typography variant="body2" color="text.secondary">
                  {user.username || user.displayName}
                </Typography>
              </MenuItem>
              <Divider />
              <MenuItem
                onClick={() => { setAnchorEl(null); navigate("/mypage"); }}
              >
                マイページ
              </MenuItem>
              <MenuItem onClick={handleLogout} sx={{ color: "error.main" }}>
                ログアウト
              </MenuItem>
            </Menu>
          </Box>
        ) : (
          <Typography variant="body2" sx={{ opacity: 0.8 }}>
            ログインしてください
          </Typography>
        )}
      </Toolbar>
    </AppBar>
  );
};

export default Header;
