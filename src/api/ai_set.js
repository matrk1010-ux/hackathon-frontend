import client from "./client";

export const aiSetChat = (messages, budget = null) =>
  client.post("/ai-set/chat", { messages, budget });
