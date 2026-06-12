import client from "./client";

export const aiSetChat = (messages) =>
  client.post("/ai-set/chat", { messages });
