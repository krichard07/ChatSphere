import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/api";

import Logo from "../assets/Logo/Logo";

import "./Settings.css";


function Settings() {

  const navigate = useNavigate();


const [theme, setTheme] =
  useState("dark");

    useEffect(() => {

    const loadTheme = async () => {

        try {

        const response =
            await api.get(
            "/accounts/me/"
            );

        const userTheme =
            response.data.theme || "dark";

        setTheme(userTheme);

        document.documentElement.setAttribute(
            "data-theme",
            userTheme
        );

        } catch (error) {

        console.error(
            "Nem sikerült betölteni a témát:",
            error
        );

        }

    };

    loadTheme();

    }, []);

    const handleThemeChange = async (
        newTheme
        ) => {

        try {

            await api.patch(
            "/accounts/me/",
            {
                theme: newTheme,
            }
            );

            setTheme(newTheme);

            localStorage.setItem(
            "chatsphere_theme",
            newTheme
            );

            document.documentElement.setAttribute(
            "data-theme",
            newTheme
            );

        } catch (error) {

            console.error(
            "Nem sikerült menteni a témát:",
            error
            );

        }

        };

  const [enterToSend, setEnterToSend] =
    useState(() => {

      const saved =
        localStorage.getItem(
          "chatsphere_enter_to_send"
        );

      if (saved === null) {
        return true;
      }

      return saved === "true";

    });


  const handleEnterToSendChange = () => {

    const newValue =
      !enterToSend;

    setEnterToSend(
      newValue
    );

    localStorage.setItem(
      "chatsphere_enter_to_send",
      String(newValue)
    );

  };


  return (

    <div className="settings-page">

      <div className="settings-card">

        <Logo size={64} />


        <div className="settings-header">

          <h1>
            Beállítások
          </h1>

          <p>
            A ChatSphere működésének személyre szabása
          </p>

        </div>


        <div className="settings-sections">

          {/* ========================= */}
          {/* MEGJELENÉS */}
          {/* ========================= */}

          <section className="settings-section">

            <div className="settings-section-header">

              <h2>
                Megjelenés
              </h2>

              <p>
                A ChatSphere megjelenésének beállításai.
              </p>

            </div>

            <div className="settings-row">

                <div className="settings-row-info">

                    <span className="settings-row-title">
                    Téma
                    </span>

                    <span className="settings-row-description">
                    A ChatSphere megjelenési módja.
                    </span>

                </div>


                <div className="settings-theme-options">

                    <button
                    type="button"
                    className={
                        theme === "dark"
                        ? "settings-theme-btn active"
                        : "settings-theme-btn"
                    }
                    onClick={() =>
                        handleThemeChange("dark")
                    }
                    >
                    Sötét
                    </button>

                    <button
                    type="button"
                    className={
                        theme === "light"
                        ? "settings-theme-btn active"
                        : "settings-theme-btn"
                    }
                    onClick={() =>
                        handleThemeChange("light")
                    }
                    >
                    Világos
                    </button>

                </div>

                </div>

          </section>


          {/* ========================= */}
          {/* ÜZENETEK */}
          {/* ========================= */}

          <section className="settings-section">

            <div className="settings-section-header">

              <h2>
                Üzenetek
              </h2>

              <p>
                Az üzenetküldés működésének beállításai.
              </p>

            </div>


            <div className="settings-row">

              <div className="settings-row-info">

                <span className="settings-row-title">
                  Enterrel küldés
                </span>

                <span className="settings-row-description">

                  {enterToSend
                    ? "Enter küld, Shift + Enter új sort kezd."
                    : "Enter új sort kezd, Ctrl/Cmd + Enter küld."}

                </span>

              </div>


              <button
                type="button"
                className={
                  enterToSend
                    ? "settings-toggle active"
                    : "settings-toggle"
                }
                onClick={
                  handleEnterToSendChange
                }
                role="switch"
                aria-checked={
                  enterToSend
                }
                aria-label="Enterrel küldés"
              >

                <span className="settings-toggle-knob" />

              </button>

            </div>

          </section>


          {/* ========================= */}
          {/* ÉRTESÍTÉSEK */}
          {/* ========================= */}

          <section className="settings-section">

            <div className="settings-section-header">

              <h2>
                Értesítések
              </h2>

              <p>
                Az alkalmazás értesítéseinek beállításai.
              </p>

            </div>

            <div className="settings-coming-soon">
              További beállítások hamarosan
            </div>

          </section>

        </div>


        <button
          type="button"
          className="settings-back-btn"
          onClick={() =>
            navigate("/")
          }
        >
          Vissza a chathez
        </button>

      </div>

    </div>

  );

}

export default Settings;