import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { signOut } from "firebase/auth";
import { fireAuth } from "../firebase";
import { useUser } from "../context/UserContext";
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
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import useMediaQuery from "@mui/material/useMediaQuery";
import StorefrontIcon from "@mui/icons-material/Storefront";
import AddBoxIcon from "@mui/icons-material/AddBox";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";

const Header = () => {
  const { user, setUser } = useUser();
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState(null);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const handleLogout = async () => {
    setAnchorEl(null);
    await signOut(fireAuth);
    setUser(null);
    navigate("/");
  };

  return (
    <AppBar position="sticky" color="primary" elevation={2}>
      <Toolbar sx={{ gap: 1 }}>
        {/* ロゴ */}
        <Box
          component={Link}
          to="/"
          sx={{
            flexGrow: 1,
            display: "flex",
            alignItems: "center",
            gap: 1,
            color: "inherit",
            textDecoration: "none",
          }}
        >
          <StorefrontIcon />
          <Box sx={{ display: "flex", flexDirection: "column", lineHeight: 1 }}>
            <Typography
              variant="h6"
              sx={{ fontWeight: 800, letterSpacing: ".04em", lineHeight: 1.1 }}
            >
              Emporio
            </Typography>
            {!isMobile && (
              <Typography
                variant="caption"
                sx={{ opacity: 0.85, lineHeight: 1, fontSize: ".62rem", letterSpacing: ".18em" }}
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
                  color="inherit"
                  startIcon={<AutoAwesomeIcon />}
                  component={Link}
                  to="/ai-set"
                  sx={{ fontWeight: 600 }}
                >
                  AIセット
                </Button>
                <Button
                  color="inherit"
                  startIcon={<AddBoxIcon />}
                  component={Link}
                  to="/sell"
                  sx={{ fontWeight: 600 }}
                >
                  出品する
                </Button>
              </>
            )}

            {/* アバター → マイページメニュー */}
            <IconButton onClick={(e) => setAnchorEl(e.currentTarget)} sx={{ p: 0.5 }}>
              <Avatar
                src={user.photoURL || ""}
                alt={user.displayName || "U"}
                sx={{ width: 36, height: 36, border: "2px solid #fff" }}
              >
                {(user.displayName || "U")[0]}
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
                  {user.displayName || user.username}
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
