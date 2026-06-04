import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useUser } from "../context/UserContext";
import {
  Paper,
  BottomNavigation,
  BottomNavigationAction,
  useMediaQuery,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import HomeIcon from "@mui/icons-material/Home";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import AddBoxIcon from "@mui/icons-material/AddBox";
import PersonIcon from "@mui/icons-material/Person";

// モバイル専用のメルカリ風ボトムナビ
const BottomNav = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useUser();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  // 未ログイン時やデスクトップでは表示しない
  if (!isMobile || !user) return null;

  const routes = ["/", "/ai-set", "/sell", "/mypage"];
  const current = routes.indexOf(location.pathname);

  return (
    <Paper
      elevation={8}
      sx={{
        position: "fixed",
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: (t) => t.zIndex.appBar,
        borderTop: "1px solid",
        borderColor: "divider",
      }}
    >
      <BottomNavigation
        showLabels
        value={current === -1 ? false : current}
        onChange={(e, newValue) => navigate(routes[newValue])}
      >
        <BottomNavigationAction label="ホーム" icon={<HomeIcon />} />
        <BottomNavigationAction label="AIセット" icon={<AutoAwesomeIcon />} />
        <BottomNavigationAction label="出品" icon={<AddBoxIcon />} />
        <BottomNavigationAction label="マイページ" icon={<PersonIcon />} />
      </BottomNavigation>
    </Paper>
  );
};

export default BottomNav;
