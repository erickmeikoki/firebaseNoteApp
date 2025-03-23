import { Switch, Route } from "wouter";
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from "./context/AuthContext";
import { NotesProvider } from "./context/NotesContext";
import Home from "./pages/home";
import Auth from "./pages/auth";
import SharedNote from "./pages/shared-note";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/auth" component={Auth} />
      <Route path="/shared/:shareId" component={SharedNote} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <AuthProvider>
      <NotesProvider>
        <Router />
      </NotesProvider>
      <Toaster />
    </AuthProvider>
  );
}

export default App;
