import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { UserProvider } from "./context/UserContext";
import { ToastProvider } from "./context/ToastContext";
import { AiSetProvider } from "./context/AiSetContext";
import { createTheme, ThemeProvider, CssBaseline, Box } from "@mui/material";
import Header from "./components/Header";
import BottomNav from "./components/BottomNav";
import HomePage from "./pages/HomePage";
import ProductDetailPage from "./pages/ProductDetailPage";
import SellPage from "./pages/SellPage";
import MyPage from "./pages/MyPage";
import AiSetPage from "./pages/AiSetPage";
import SellerPage from "./pages/SellerPage";
import ResaleNoticeDialog from "./components/ResaleNoticeDialog";

const FONT_FAMILY = [
  "-apple-system",
  "BlinkMacSystemFont",
  '"Segoe UI"',
  "Roboto",
  '"Helvetica Neue"',
  "Arial",
  "sans-serif",
].join(",");

// Coastal Commerce パレット
const COASTAL = {
  deepCurrent: "#263C59", // primary
  darkDetail: "#1B2735", // 最濃ディテール
  coastalSlate: "#6D89A6", // 区切り線・サブ
  oceanPearl: "#AFC3D4", // 価格・セルのハイライト
  seafoamCloud: "#C8D9E6", // 選択面・淡いハイライト
  driftwoodPale: "#E6DED4", // ライト面の背景
};

const theme = createTheme({
  palette: {
    primary: {
      main: COASTAL.deepCurrent, // Deep Current
      dark: COASTAL.darkDetail,
      light: COASTAL.coastalSlate, // 白文字が乗る中間トーン（アバター等）
      tint: COASTAL.seafoamCloud, // 選択中Chip・淡いハイライト面
      contrastText: "#fff",
    },
    secondary: {
      main: COASTAL.coastalSlate, // Coastal Slate アクセント
      dark: "#506A85",
      light: COASTAL.oceanPearl,
      contrastText: "#fff",
    },
    text: {
      primary: COASTAL.darkDetail, // ink（見出し・本文）
      secondary: "#5A6B7D", // muted（補助テキスト）
    },
    background: {
      default: "#EFEAE1", // ドリフトウッド寄りのライト背景
      paper: "#FFFFFF",
    },
    divider: "rgba(109,137,166,0.35)", // Coastal Slate の細い線
    success: { main: "#2E7D5B" },
    warning: { main: "#C77D2E" },
    error: { main: "#C0492F" },
  },
  shape: {
    borderRadius: 12, // --radius-card
  },
  typography: {
    fontFamily: FONT_FAMILY,
    h5: { fontWeight: 800, letterSpacing: "-0.01em" },
    h6: { fontWeight: 700, letterSpacing: "-0.005em" },
    subtitle1: { fontWeight: 600 },
    subtitle2: { fontWeight: 600 },
    body1: { lineHeight: 1.7 },
    body2: { lineHeight: 1.7 },
    button: { fontWeight: 600, textTransform: "none", letterSpacing: "0.01em" },
    caption: { letterSpacing: "0.01em" },
  },
  components: {
    MuiButton: {
      defaultProps: { disableElevation: true },
      styleOverrides: {
        root: { borderRadius: 8 },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: { borderRadius: 8, fontWeight: 600 },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: { borderRadius: 8 },
      },
    },
    MuiPaper: {
      styleOverrides: {
        rounded: { borderRadius: 12 },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          border: "1px solid rgba(109,137,166,0.25)",
          boxShadow: "0 10px 26px rgba(27,39,53,0.10)",
        },
      },
    },
  },
});

export { COASTAL };

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <UserProvider>
        <ToastProvider>
          <AiSetProvider>
          <BrowserRouter>
            <Header />
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/products/:id" element={<ProductDetailPage />} />
              <Route path="/sellers/:email" element={<SellerPage />} />
              <Route path="/sell" element={<SellPage />} />
              <Route path="/mypage" element={<MyPage />} />
              <Route path="/ai-set" element={<AiSetPage />} />
            </Routes>
            {/* モバイルのボトムナビ分の余白 */}
            <Box sx={{ height: { xs: 56, sm: 0 } }} />
            <BottomNav />
            <ResaleNoticeDialog />
          </BrowserRouter>
          </AiSetProvider>
        </ToastProvider>
      </UserProvider>
    </ThemeProvider>
  );
}

export default App;
