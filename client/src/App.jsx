import { ThemeProvider } from "./context/ThemeContext";
import { WallpaperProvider } from "./context/WallpaperContext";
import { Routes, Route, Navigate, useNavigate } from "react-router";
import { useAuth, HandleSSOCallback } from "@clerk/react";
import { Toaster } from "react-hot-toast"

import ChatPage from "./pages/ChatPage";
import AuthPage from "./pages/AuthPage";
import PageLoader from "./components/Pageloader";
import { useAuthStore } from "./store/useAuthStore";
import { useEffect } from "react";

function AppContent() {
  const { isSignedIn, isLoaded } = useAuth();

  const clearAuth = useAuthStore((state) => state.clearAuth);
  const checkAuth = useAuthStore((state) => state.checkAuth);
  const isCheckingAuth = useAuthStore((state) => state.isCheckingAuth);

  function SSOCallback() {
    const navigate = useNavigate();

    return (
      <HandleSSOCallback
        navigateToApp={({ decorateUrl }) => {
          const url = decorateUrl("/");

          if (url.startsWith("http")) {
            window.location.href = url;
          } else {
            navigate(url, { replace: true });
          }
        }}
        navigateToSignIn={() => navigate("/auth", { replace: true })}
        navigateToSignUp={() => navigate("/auth", { replace: true })}
      />
    );
  }

  useEffect(() => {
    if (!isLoaded) return;

    if (isSignedIn) checkAuth();
    else clearAuth()
  }, [checkAuth, clearAuth, isLoaded, isSignedIn])

  if (!isLoaded || (isSignedIn && isCheckingAuth)) return <PageLoader />;

  return (
    <ThemeProvider>
      <WallpaperProvider>
        <Routes>
          <Route
            path="/"
            element={isSignedIn ? <ChatPage /> : <Navigate to="/auth" replace />}
          />
          <Route
            path="/auth"
            element={!isSignedIn ? <AuthPage /> : <Navigate to="/" replace />}
          />
          <Route path="/sso-callback" element={<SSOCallback />} />
        </Routes>
        <Toaster />
      </WallpaperProvider>
    </ThemeProvider>
  );
}

function App() {
  return (
    <ThemeProvider>
      <WallpaperProvider>
        <AppContent />
      </WallpaperProvider>
    </ThemeProvider>
  );
}

export default App;