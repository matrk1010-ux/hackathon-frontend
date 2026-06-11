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
    <AppBar
      position="sticky"
      elevation={0}
      sx={{
        bgcolor: "background.paper",
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
            color: "primary.main",
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

            {/* アバター → マイページメニュー */}
            <IconButton onClick={(e) => setAnchorEl(e.currentTarget)} sx={{ p: 0.5 }}>
              <Avatar
                src={user.photoURL || ""}
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
