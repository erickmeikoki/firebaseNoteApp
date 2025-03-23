import { useState } from "react";
import { useAuth } from "../../hooks/useAuth";
import { useLocation } from "wouter";

interface RegisterProps {
  onSwitchToLogin: () => void;
}

export default function Register({ onSwitchToLogin }: RegisterProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  
  const { register, signInWithGoogle } = useAuth();
  const [, setLocation] = useLocation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name || !email || !password) {
      setError("Please fill in all fields");
      return;
    }
    
    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }
    
    try {
      setIsLoading(true);
      setError("");
      await register(email, password, name);
      setLocation("/");
    } catch (err: any) {
      setError(err.message || "Failed to register");
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
        <h1 className="auth-title">Create an account</h1>
        <p className="auth-subtitle">Sign up to start taking notes</p>
      </div>

      {error && (
        <div className="alert alert-error">
          <span className="material-icons">error</span>
          <span>{error}</span>
        </div>
      )}

      <form className="auth-form" onSubmit={handleSubmit}>
        <div className="form-group">
          <label className="form-label" htmlFor="reg-name">Full Name</label>
          <input 
            type="text" 
            id="reg-name" 
            className="form-input" 
            placeholder="Enter your name" 
            required 
            value={name}
            onChange={(e) => setName(e.target.value)}
            disabled={isLoading}
          />
        </div>
        <div className="form-group">
          <label className="form-label" htmlFor="reg-email">Email</label>
          <input 
            type="email" 
            id="reg-email" 
            className="form-input" 
            placeholder="Enter your email" 
            required 
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={isLoading}
          />
        </div>
        <div className="form-group">
          <label className="form-label" htmlFor="reg-password">Password</label>
          <input 
            type="password" 
            id="reg-password" 
            className="form-input" 
            placeholder="Create a password" 
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
            {isLoading ? "Creating Account..." : "Create Account"}
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
        <svg width="18" height="18" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48">
          <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z" />
          <path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z" />
          <path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z" />
          <path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z" />
        </svg>
        Sign up with Google
      </button>

      <div className="auth-footer">
        Already have an account? 
        <a href="#" className="auth-link" onClick={(e) => {
          e.preventDefault();
          onSwitchToLogin();
        }}>Sign in</a>
      </div>
    </div>
  );
}
