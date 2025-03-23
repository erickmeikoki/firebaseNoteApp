import { useState } from "react";
import { useLocation } from "wouter";
import Login from "../components/Auth/Login";
import Register from "../components/Auth/Register";
import { useAuth } from "../hooks/useAuth";

export default function Auth() {
  const [isLoginView, setIsLoginView] = useState(true);
  const { currentUser, loading } = useAuth();
  const [, setLocation] = useLocation();

  // Redirect to home if user is already logged in
  if (loading) {
    return <div className="auth-container">Loading...</div>;
  }

  if (currentUser) {
    setLocation("/");
    return null;
  }

  return (
    <div className="auth-container">
      {isLoginView ? (
        <Login onSwitchToRegister={() => setIsLoginView(false)} />
      ) : (
        <Register onSwitchToLogin={() => setIsLoginView(true)} />
      )}
    </div>
  );
}
