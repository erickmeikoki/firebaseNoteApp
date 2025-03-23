import { useEffect } from "react";
import { useLocation } from "wouter";
import NotesLayout from "../components/Notes/NotesLayout";
import { useAuth } from "../hooks/useAuth";

export default function Home() {
  const { currentUser, loading } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (!loading && !currentUser) {
      setLocation("/auth");
    }
  }, [currentUser, loading, setLocation]);

  if (loading) {
    return <div className="auth-container">Loading...</div>;
  }

  if (!currentUser) {
    return null;
  }

  return <NotesLayout />;
}
