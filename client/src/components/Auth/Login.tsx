import { useState } from "react";
import { useAuth } from "../../hooks/useAuth";
import { useLocation } from "wouter";

interface LoginProps {
  onSwitchToRegister: () => void;
}

export default function Login({ onSwitchToRegister }: LoginProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  
  const { login, signInWithGoogle } = useAuth();
  const [, setLocation] = useLocation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      setError("Please fill in all fields");
      return;
    }
    
    try {
      setIsLoading(true);
      setError("");
      await login(email, password);
      setLocation("/");
    } catch (err: any) {
      setError(err.message || "Failed to login");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      setIsLoading(true);
      setError("");
      await signInWithGoogle();
      setLocation("/");
    } catch (err: any) {
      setError(err.message || "Failed to sign in with Google");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-card">
      <div className="auth-header">
        <div className="auth-logo">
          <span className="material-icons">description</span>
          <span>NoteSpace</span>
        </div>
        <h1 className="auth-title">Welcome back</h1>
        <p className="auth-subtitle">Sign in to continue to NoteSpace</p>
      </div>

      {error && (
        <div className="alert alert-error">
          <span className="material-icons">error</span>
          <span>{error}</span>
        </div>
      )}

      <form className="auth-form" onSubmit={handleSubmit}>
        <div className="form-group">
          <label className="form-label" htmlFor="email">Email</label>
          <input 
            type="email" 
            id="email" 
            className="form-input" 
            placeholder="Enter your email" 
            required 
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={isLoading}
          />
        </div>
        <div className="form-group">
          <label className="form-label" htmlFor="password">Password</label>
          <input 
            type="password" 
            id="password" 
            className="form-input" 
            placeholder="Enter your password" 
            required 
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={isLoading}
          />
        </div>
        <div className="form-group">
          <button 
            type="submit" 
            className="btn" 
            style={{ width: "100%" }}
            disabled={isLoading}
          >
            {isLoading ? "Signing In..." : "Sign In"}
          </button>
        </div>
      </form>

      <div className="auth-divider">
        <span>OR</span>
      </div>

      <button 
        className="btn btn-outline" 
        style={{ width: "100%", marginBottom: "var(--space-md)" }}
        onClick={handleGoogleSignIn}
        disabled={isLoading}
      >
        <span className="material-icons">login</span>
        Sign in with Google
      </button>

      <div className="auth-footer">
        Don't have an account? 
        <a href="#" className="auth-link" onClick={(e) => {
          e.preventDefault();
          onSwitchToRegister();
        }}>Sign up</a>
      </div>
    </div>
  );
}
