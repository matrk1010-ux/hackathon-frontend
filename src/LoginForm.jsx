import React, { useState } from "react";
import { signInWithPopup, GoogleAuthProvider, signOut } from "firebase/auth";
import { fireAuth } from "./firebase";

export const LoginForm = ({ user, setUser }) => {
  const [loading, setLoading] = useState(false);

  const handleGoogleLogin = async () => {
    setLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(fireAuth, provider);
      const currentUser = result.user;
      
      localStorage.setItem("user", JSON.stringify({
        uid: currentUser.uid,
        email: currentUser.email,
        displayName: currentUser.displayName,
        photoURL: currentUser.photoURL
      }));
      
      setUser(currentUser);
      alert(`ログイン成功: ${currentUser.displayName}`);
    } catch (err) {
      alert(`ログイン失敗: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(fireAuth);
      localStorage.removeItem("user");
      setUser(null);
      alert("ログアウトしました");
    } catch (err) {
      alert(`ログアウト失敗: ${err.message}`);
    }
  };

  return (
    <div style={styles.container}>
      {user ? (
        <div style={styles.userInfo}>
          {user.photoURL && (
            <img src={user.photoURL} alt="profile" style={styles.avatar} />
          )}
          <p>ログイン中: <strong>{user.displayName}</strong></p>
          <p>Email: {user.email}</p>
          <button onClick={handleLogout} style={styles.logoutBtn}>
            ログアウト
          </button>
        </div>
      ) : (
        <button 
          onClick={handleGoogleLogin} 
          disabled={loading}
          style={styles.loginBtn}
        >
          {loading ? "ログイン中..." : "Googleでログイン"}
        </button>
      )}
    </div>
  );
};

const styles = {
  container: {
    padding: "20px",
    border: "1px solid #ddd",
    borderRadius: "8px",
    maxWidth: "400px",
    margin: "20px auto"
  },
  userInfo: {
    textAlign: "center"
  },
  avatar: {
    width: "50px",
    height: "50px",
    borderRadius: "50%",
    marginBottom: "10px"
  },
  loginBtn: {
    width: "100%",
    padding: "10px",
    fontSize: "16px",
    backgroundColor: "#4285F4",
    color: "white",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer"
  },
  logoutBtn: {
    padding: "10px 20px",
    backgroundColor: "#f44336",
    color: "white",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
    marginTop: "10px"
  }
};
