import { useEffect, useState } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
} from "react-router-dom";

import Chat from "./pages/Chat";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Profile from "./pages/Profile";
import Settings from "./pages/Settings";
import DocumentPreviewPage from "./pages/DocumentPreviewPage";
import ProtectedRoute from "./components/ProtectedRoute";
import api from "./api/api";
import { getAccessToken } from "./api/tokenService";

import "./App.css";

function App() {

  const [themeReady, setThemeReady] = useState(false);

  useEffect(() => {

    const loadUserTheme = async () => {

      const token = getAccessToken();

      if (!token) {
        setThemeReady(true);
        return;
      }

      try {

        const response =
          await api.get(
            "/accounts/me/"
          );

        const userTheme =
          response.data.theme || "dark";

        document.documentElement.setAttribute(
          "data-theme",
          userTheme
        );

        setThemeReady(true);

      } catch (error) {

        console.error(
          "Nem sikerült betölteni a felhasználó témáját:",
          error
        );

        setThemeReady(true);

      }

    };

    loadUserTheme();

  }, []);

  if (!themeReady) {
    return null;
  }

  return (
    <BrowserRouter>
      <Routes>

        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Chat />
            </ProtectedRoute>
          }
        />

        <Route
          path="/login"
          element={<Login />}
        />

        <Route
          path="/register"
          element={<Register />}
        />

        <Route
          path="/profile"
          element={<Profile />}
        />

        <Route
          path="/Settings"
          element={<Settings />}
        />

        <Route
          path="/document-preview"
          element={<DocumentPreviewPage />}
      />

      </Routes>
    </BrowserRouter>
  );
}

export default App;