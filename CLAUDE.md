# CLAUDE.md — hackathon-frontend

Emporio（エンボリオ）の Web フロントエンド。API 仕様は `../hackathon-backend/docs/requirements.md` が正典。

## 技術スタック
- React 19 + Create React App（react-scripts 5）
- UI：MUI v9（`@mui/material` / `@mui/icons-material`）、emotion
- ルーティング：react-router-dom v7
- HTTP：axios、認証：Firebase Auth（Googleログイン）

## ビルド・検証（最重要）
- **`CI=true npm run build` が通ること = ESLint 警告ゼロが必須。** Vercel は `CI=true` で動くため、未使用 import などの警告1つでビルドが落ちる。
- 変更後は必ず `cd /Users/matsuiriku/Desktop/UTTC/hackathon/hackathon-frontend && CI=true npm run build` で確認する。
- パス注意：親ディレクトリから複数 Bash を並列実行すると `cd` が漏れる。毎回フルパスで `cd` する。

## アーキテクチャ規約
- API 層は `src/api/*.js`（`client.js` が axios 本体。`baseURL = REACT_APP_API_URL || http://localhost:8000`）
- 認証状態は `src/context/UserContext.js`（`useUser()` で `{user, setUser, loading}`）。ログイン時に `POST /users/sync`。
- 通知は `src/context/ToastContext.jsx`（操作結果はトーストで明示）
- ページは `src/pages/`、共通UIは `src/components/`
- MUIテーマ：primary `#ff6b35`、secondary `#1976d2`（`App.js`）

## 既存コンポーネントを使い回す（新規で作らない）
- 一覧の読み込み中：`ProductGridSkeleton`（Grid xs=6 sm=4 md=3）
- 空状態：`EmptyState`（icon / message / 任意のaction）
- 商品画像：`ProductImage`（image_url 無しはカテゴリ別プレースホルダー）
- 商品カード：`ProductCard`
- モバイル下部ナビ：`BottomNav`（`isMobile && user` のときのみ表示）

## レスポンシブ方針
- モバイル/PC両対応。Header はモバイルでテキストリンクを折りたたみ、`BottomNav` で補完。
- `useMediaQuery(theme.breakpoints.down("sm"))` でモバイル判定。

## API 呼び出しの約束
- 所有者操作はメールをクエリで渡す（例 `createProduct(data, sellerEmail)` → `params:{seller_email}`）。
- AI：`generateDescription(title,category,price,condition,notes)`、`analyzeImage(imageBase64)`、`aiSetChat(messages)`。

## マスタ値（バックエンドと完全一致させる。ズレると AI 自動入力が弾かれる）
- カテゴリ(8)：服・ファッション / 本・漫画 / 家電・スマホ / スポーツ / おもちゃ / 家具・インテリア / コスメ・美容 / その他
- 状態(6)：新品・未使用 / 未使用に近い / 目立った傷や汚れなし / やや傷や汚れあり / 傷や汚れあり / 全体的に状態が悪い

## やらないこと
- ESLint 警告を増やす変更（ビルドが落ちる）
- 勝手な push / 破壊的 git 操作
- 無断での新規ドキュメント(.md)作成・emoji の混入
