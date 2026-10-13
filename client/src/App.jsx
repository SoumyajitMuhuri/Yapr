import { ThemeProvider } from "./context/ThemeContext";
import { WallpaperProvider } from "./context/WallpaperContext";
import { Routes, Route, Navigate } from "react-router";
import { useAuth } from "@clerk/react";

import ChatPage from "./pages/ChatPage";
import AuthPage from "./pages/AuthPage";
import PageLoader from "./components/Pageloader";

function AppContent() {
  const { isSignedIn, isLoaded } = useAuth();

  if (!isLoaded) return <PageLoader />;

  return (
    <Routes>
      <Route
        path="/"
        element={isSignedIn ? <ChatPage /> : <Navigate to="/auth" replace />}
      />
      <Route
        path="/auth"
        element={!isSignedIn ? <AuthPage /> : <Navigate to="/" replace />}
      />
    </Routes>
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