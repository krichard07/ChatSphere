import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Zap,
  ShieldCheck,
  Globe2,
  ChevronRight,
  Moon,
  Sun,
} from "lucide-react";

import Logo from "../assets/Logo/Logo";
import api from "../api/api";

import "./Register.css";

function Register() {

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [password2, setPassword2] = useState("");

  const [error, setError] = useState("");

  const [theme, setTheme] = useState(() => {

    const savedTheme =
      localStorage.getItem(
        "chatsphere_theme"
      );

    return savedTheme || "dark";

  });

  const navigate = useNavigate();

  useEffect(() => {

    document.documentElement.setAttribute(
      "data-theme",
      theme
    );

  }, [theme]);
  
  const handleThemeChange = (
    newTheme
  ) => {

    setTheme(newTheme);

    localStorage.setItem(
      "chatsphere_theme",
      newTheme
    );

    document.documentElement.setAttribute(
      "data-theme",
      newTheme
    );

  };

  const register = async () => {

    setError("");

    if (
        !username.trim() ||
        !email.trim() ||
        !password ||
        !password2
    ) {

        setError(
            "Minden mezőt ki kell tölteni."
        );

        return;
    }


    if (password !== password2) {

        setError(
            "A két jelszó nem egyezik."
        );

        return;
    }


    try {

        await api.post(
            "/accounts/register/",
            {
                username:
                    username.trim(),

                email:
                    email.trim(),

                password:
                    password,

                password_confirm:
                    password2,
            }
        );


        navigate(
            "/login"
        );

    } catch (error) {

        console.error(
            "Regisztrációs hiba:",
            error
        );


        const data =
            error.response?.data;


        if (data?.username) {

            setError(
                data.username[0]
            );

            return;
        }


        if (data?.email) {

            setError(
                data.email[0]
            );

            return;
        }


        if (data?.password) {

            setError(
                data.password[0]
            );

            return;
        }


        if (
            data?.password_confirm
        ) {

            setError(
                data.password_confirm[0]
            );

            return;
        }


        setError(
            "A regisztráció sikertelen."
        );
    }
};

  return (

    <div className="register-page">

      <div className="register-theme-switcher">

        <button
          type="button"
          className={
            theme === "dark"
              ? "register-theme-btn active"
              : "register-theme-btn"
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
              ? "register-theme-btn active"
              : "register-theme-btn"
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

      <div className="register-left">

        <Logo size={120} />

        <h1 className="register-brand">
          ChatSphere
        </h1>

        <p className="register-description">
          Modern valós idejű üzenetküldő platform.
        </p>

        <div className="register-features">

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

      <div className="register-right">

        <div className="register-card">

          <h2>
            Fiók létrehozása
          </h2>

          <p className="register-subtitle">
            A regisztráció csak néhány másodpercet vesz igénybe.
          </p>

          <form
            className="register-form"
            onSubmit={(e) => {

              e.preventDefault();

              register();

            }}
          >
            {error && (
                <div className="register-error">
                    {error}
                </div>
            )}

            <input
              type="text"
              placeholder="Felhasználónév"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />

            <input
              type="email"
              placeholder="E-mail cím"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />

            <input
              type="password"
              placeholder="Jelszó"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />

            <input
              type="password"
              placeholder="Jelszó megerősítése"
              value={password2}
              onChange={(e) => setPassword2(e.target.value)}
            />

            <button type="submit">
              Fiók létrehozása
            </button>

          </form>

          <div className="register-footer">

            <span>
              Már van fiókod?
            </span>

            <Link
              to="/login"
              className="register-link"
            >

              <span>
                Bejelentkezés
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

export default Register;