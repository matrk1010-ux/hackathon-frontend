import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { UserProvider } from "./context/UserContext";
import { ToastProvider } from "./context/ToastContext";
import { createTheme, ThemeProvider, CssBaseline, Box } from "@mui/material";
import Header from "./components/Header";
import BottomNav from "./components/BottomNav";
import HomePage from "./pages/HomePage";
import ProductDetailPage from "./pages/ProductDetailPage";
import SellPage from "./pages/SellPage";
import MyPage from "./pages/MyPage";
import AiSetPage from "./pages/AiSetPage";

const theme = createTheme({
  palette: {
    primary: {
      main: "#ff6b35",
      contrastText: "#fff",
    },
    secondary: {
      main: "#1976d2",
    },
  },
  typography: {
    fontFamily: [
      "-apple-system",
      "BlinkMacSystemFont",
      '"Segoe UI"',
      "Roboto",
      '"Helvetica Neue"',
      "Arial",
      "sans-serif",
    ].join(","),
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <UserProvider>
        <ToastProvider>
          <BrowserRouter>
            <Header />
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/products/:id" element={<ProductDetailPage />} />
              <Route path="/sell" element={<SellPage />} />
              <Route path="/mypage" element={<MyPage />} />
              <Route path="/ai-set" element={<AiSetPage />} />
            </Routes>
            {/* モバイルのボトムナビ分の余白 */}
            <Box sx={{ height: { xs: 56, sm: 0 } }} />
            <BottomNav />
          </BrowserRouter>
        </ToastProvider>
      </UserProvider>
    </ThemeProvider>
  );
}

export default App;
