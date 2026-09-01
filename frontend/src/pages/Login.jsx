import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Zap,
  ShieldCheck,
  Globe2,
  ChevronRight,
  Moon,
  Sun,
} from "lucide-react";
import api from "../api/api";

import {
  getAccessToken,
  setAccessToken,
  setRefreshToken,
} from "../api/tokenService";

import Logo from "../assets/Logo/Logo";

import "./Login.css";

function Login() {

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const [theme, setTheme] = useState(() => {
    const savedTheme =
      localStorage.getItem(
        "chatsphere_theme"
      );

    return savedTheme || "dark";
  });

  const [themeChangedOnLogin, setThemeChangedOnLogin] =
  useState(false);

  const navigate = useNavigate();

  useEffect(() => {

    document.documentElement.setAttribute(
      "data-theme",
      theme
    );

  }, [theme]);

  useEffect(() => {

    const token = getAccessToken();

    if (token) {
      navigate("/");
    }

  }, [navigate]);

  const handleThemeChange = (
    newTheme
  ) => {

    setTheme(newTheme);

    setThemeChangedOnLogin(true);

    localStorage.setItem(
      "chatsphere_theme",
      newTheme
    );

    document.documentElement.setAttribute(
      "data-theme",
      newTheme
    );

  };

  const login = async () => {

    if (!username.trim() || !password.trim()) {
      return;
    }

    try {

      const loginResponse =
        await api.post(
          "/accounts/login/",
          {
            username,
            password,
          }
        );

      setAccessToken(
        loginResponse.data.access
      );

      setRefreshToken(
        loginResponse.data.refresh
      );

      const userResponse =
        await api.get(
          "/accounts/me/"
        );

      let finalTheme;

        if (themeChangedOnLogin) {

          finalTheme = theme;

          await api.patch(
            "/accounts/me/",
            {
              theme: finalTheme,
            }
          );

        } else {

          finalTheme =
            userResponse.data.theme || "dark";

        }

        localStorage.setItem(
          "chatsphere_theme",
          finalTheme
        );

        document.documentElement.setAttribute(
          "data-theme",
          finalTheme
        );

        navigate("/");

    } catch (error) {

      console.error(error);

    }

  };

  return (

    <div className="login-page">

      <div className="login-theme-switcher">

        <button
          type="button"
          className={
            theme === "dark"
              ? "login-theme-btn active"
              : "login-theme-btn"
          }
          onClick={() =>
            handleThemeChange("dark")
          }
          aria-label="Sötét téma"
          title="Sötét téma"
        >
          <Moon />
        </button>

        <button
          type="button"
          className={
            theme === "light"
              ? "login-theme-btn active"
              : "login-theme-btn"
          }
          onClick={() =>
            handleThemeChange("light")
          }
          aria-label="Világos téma"
          title="Világos téma"
        >
          <Sun />
        </button>

      </div>

      <div className="login-left">

        <Logo size={120} />

        <h1 className="login-brand">
          ChatSphere
        </h1>

        <p className="login-description">
          Modern valós idejű üzenetküldő platform.
        </p>

        <div className="login-features">

          <div className="feature-item">

            <Zap className="feature-icon" />

            <span>
              Gyors valós idejű üzenetküldés
            </span>

          </div>

          <div className="feature-item">

            <ShieldCheck className="feature-icon" />

            <span>
              Biztonságos hitelesítés
            </span>

          </div>

          <div className="feature-item">

            <Globe2 className="feature-icon" />

            <span>
              Többcsatornás beszélgetések
            </span>

          </div>

        </div>

      </div>

      <div className="login-right">

        <div className="login-card">

          <h2>
            Üdv újra!
          </h2>

          <p className="login-subtitle">
            Jelentkezz be a ChatSphere használatához.
          </p>

          <form
            className="login-form"
            onSubmit={(e) => {

              e.preventDefault();

              login();

            }}
          >

            <input
              type="text"
              placeholder="Felhasználónév"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />

            <input
              type="password"
              placeholder="Jelszó"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />

            <button type="submit">
              Bejelentkezés
            </button>

          </form>

          <div className="login-footer">

            <span>
              Első alkalommal jársz itt?
            </span>

            <Link
              to="/register"
              className="register-link"
          >

              <span>
                  Fiók létrehozása
              </span>

              <ChevronRight
                  className="register-arrow"
              />

          </Link>

          </div>

        </div>

      </div>

    </div>

  );

}

export default Login;