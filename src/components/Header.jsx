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
import StorefrontIcon from "@mui/icons-material/Storefront";
import AddBoxIcon from "@mui/icons-material/AddBox";

const Header = () => {
  const { user, setUser } = useUser();
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState(null);

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
        <StorefrontIcon sx={{ mr: 1 }} />
        <Typography
          variant="h6"
          component={Link}
          to="/"
          sx={{ flexGrow: 1, color: "inherit", textDecoration: "none", fontWeight: 700 }}
        >
          フリマアプリ
        </Typography>

        {user ? (
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            {/* 出品ボタン */}
            <Button
              color="inherit"
              startIcon={<AddBoxIcon />}
              component={Link}
              to="/sell"
              sx={{ fontWeight: 600 }}
            >
              出品する
            </Button>

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
