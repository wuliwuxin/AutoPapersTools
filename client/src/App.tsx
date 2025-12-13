import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import { AuthProvider } from "./contexts/AuthContext";
import { ProtectedRoute } from "./components/ProtectedRoute";
import Home from "./pages/Home";
import PapersList from "./pages/PapersList";
import PaperDetail from "./pages/PaperDetail";
import FetchPapers from "./pages/FetchPapers";
import MyLibrary from "./pages/MyLibrary";
import { Login } from "./pages/Auth/Login";
import { Register } from "./pages/Auth/Register";
import UserProfile from "./pages/UserProfile";
import UploadPaper from "./pages/UploadPaper";

function Router() {
  return (
    <Switch>
      <Route path="/login" component={Login} />
      <Route path="/register" component={Register} />
      <Route path="/" component={Home} />
      <Route path="/papers" component={PapersList} />
      <Route path="/paper/:id" component={PaperDetail} />
      <Route path="/fetch-papers" component={FetchPapers} />
      <Route path="/upload">
        {() => (
          <ProtectedRoute>
            <UploadPaper />
          </ProtectedRoute>
        )}
      </Route>
      <Route path="/library">
        {() => (
          <ProtectedRoute>
            <MyLibrary />
          </ProtectedRoute>
        )}
      </Route>
      <Route path="/profile">
        {() => (
          <ProtectedRoute>
            <UserProfile />
          </ProtectedRoute>
        )}
      </Route>
      {/* 保留旧路由以兼容 */}
      <Route path="/settings/api-keys">
        {() => (
          <ProtectedRoute>
            <UserProfile />
          </ProtectedRoute>
        )}
      </Route>
      <Route path="/404" component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

// NOTE: About Theme
// - First choose a default theme according to your design style (dark or light bg), than change color palette in index.css
//   to keep consistent foreground/background color across components
// - If you want to make theme switchable, pass `switchable` ThemeProvider and use `useTheme` hook

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider
        defaultTheme="light"
        // switchable
      >
        <AuthProvider>
          <TooltipProvider>
            <Toaster />
            <Router />
          </TooltipProvider>
        </AuthProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
