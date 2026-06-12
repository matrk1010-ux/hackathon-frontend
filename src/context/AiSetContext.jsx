import React, { createContext, useContext, useState } from "react";

// AIセットの会話・プランをページ遷移後も保持するためのコンテキスト。
// （AiSetPage はルート切替でアンマウントされ useState が消えるため、
//   残したい状態だけをここへ持ち上げる）
const AiSetContext = createContext(null);

export const AiSetProvider = ({ children }) => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [plans, setPlans] = useState([]);
  const [buyResult, setBuyResult] = useState(null);

  return (
    <AiSetContext.Provider
      value={{
        messages,
        setMessages,
        input,
        setInput,
        plans,
        setPlans,
        buyResult,
        setBuyResult,
      }}
    >
      {children}
    </AiSetContext.Provider>
  );
};

export const useAiSet = () => {
  const ctx = useContext(AiSetContext);
  if (!ctx) throw new Error("useAiSet must be used within AiSetProvider");
  return ctx;
};
