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
  
  const { register } = useAuth();
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
