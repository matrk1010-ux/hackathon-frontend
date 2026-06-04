import React from "react";
import { Box, Typography, Button } from "@mui/material";
import InboxIcon from "@mui/icons-material/Inbox";

// 空状態の共通表示（全画面で見た目を統一）
const EmptyState = ({ icon, message, actionLabel, onAction, actionIcon }) => {
  const IconEl = icon || <InboxIcon sx={{ fontSize: 64 }} />;
  return (
    <Box sx={{ textAlign: "center", py: 7, color: "grey.400" }}>
      <Box sx={{ color: "grey.300", mb: 1.5 }}>{IconEl}</Box>
      <Typography color="text.secondary" sx={{ mb: actionLabel ? 3 : 0 }}>
        {message}
      </Typography>
      {actionLabel && onAction && (
        <Button variant="contained" startIcon={actionIcon} onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </Box>
  );
};

export default EmptyState;
