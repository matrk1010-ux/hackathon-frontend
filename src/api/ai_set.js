import client from "./client";

export const aiSetChat = (messages, minBudget = null, maxBudget = null) =>
  client.post("/ai-set/chat", { messages, min_budget: minBudget, max_budget: maxBudget });
