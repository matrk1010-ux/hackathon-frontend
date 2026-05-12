import React, { createContext, useContext, useState, useEffect } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { fireAuth } from "../firebase";
import { syncUser } from "../api/users";

const UserContext = createContext(null);

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(fireAuth, async (firebaseUser) => {
      if (firebaseUser) {
        // Firebase ログイン済みならDBと同期
        try {
          const res = await syncUser(
            firebaseUser.displayName || firebaseUser.email,
            firebaseUser.email
          );
          setUser({
            ...res.data,
            displayName: firebaseUser.displayName,
            photoURL: firebaseUser.photoURL,
          });
        } catch (e) {
          // 同期失敗してもFirebaseの情報だけ使う
          setUser({
            email: firebaseUser.email,
            displayName: firebaseUser.displayName,
            photoURL: firebaseUser.photoURL,
          });
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return (
    <UserContext.Provider value={{ user, setUser, loading }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => useContext(UserContext);
