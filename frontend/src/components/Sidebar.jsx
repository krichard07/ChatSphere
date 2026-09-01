import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { BsHash } from "react-icons/bs";
import { BsPlusLg } from "react-icons/bs";
import Logo from "../assets/Logo/Logo";
import "./Sidebar.css";

function Sidebar({
  channels,
  selectedChannel,
  setSelectedChannel,
  logout,
  setShowCreateChannelModal,
  currentUser,
}) {
  const [showMenu, setShowMenu] = useState(false);

  const navigate = useNavigate();

  const menuRef = useRef(null);

  const avatarUrl = currentUser?.avatar
    ? (
        currentUser.avatar.startsWith("http://") ||
        currentUser.avatar.startsWith("https://")
          ? currentUser.avatar
          : `http://127.0.0.1:8000${currentUser.avatar}`
      )
    : null;

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        menuRef.current &&
        !menuRef.current.contains(event.target)
      ) {
        setShowMenu(false);
      }
    };

    document.addEventListener(
      "mousedown",
      handleClickOutside
    );

    return () => {
      document.removeEventListener(
        "mousedown",
        handleClickOutside
      );
    };
  }, []);

  return (
    <aside className="sidebar">

      <div className="sidebar-header">

              <div className="sidebar-logo">

          <Logo size={72} />

          <h1 className="sidebar-title">
              ChatSphere
          </h1>

          <span className="sidebar-subtitle">
              Realtime Messaging
          </span>

      </div>

    </div>

      <div className="sidebar-channels">

          <div className="channels-label">
              Csatornák
          </div>

          {channels.map((channel) => (

              <div
                  key={channel.id}
                  className={
                      selectedChannel?.id === channel.id
                          ? "channel active"
                          : "channel"
                  }
                  onClick={() => setSelectedChannel(channel)}
              >

                  <BsHash className="channel-icon" />

                  <span className="channel-name">
                      {channel.name}
                  </span>

              </div>

          ))}

      </div>

      <div className="sidebar-footer">

        <button
            className="create-channel-btn"
            onClick={() =>
                setShowCreateChannelModal(true)
            }
        >

            <BsPlusLg className="create-channel-icon" />

            <span>Új csatorna</span>

        </button>

        <div
          className="user-card"
          ref={menuRef}
        >

          <div className="user-avatar">
            {avatarUrl ? (

              <img
                src={avatarUrl}
                alt="Profilkép"
                className="user-avatar-image"
              />

            ) : (

              currentUser?.username
                ?.charAt(0)
                ?.toUpperCase()

            )}
          </div>

          <div className="user-info">

            <div className="user-name">
              {currentUser?.username}
            </div>

            <div className="user-status">
              🟢 Online
            </div>

          </div>

          <button
            className="user-menu-button"
            onClick={() =>
              setShowMenu((prev) => !prev)
            }
          >
            ⋮
          </button>

          {showMenu && (

            <div className="user-menu">

              <button
                className="user-menu-item"
                onClick={() => {

                  setShowMenu(false);

                  navigate("/profile");

                }}
              >
                Profil
              </button>

              <button
                className="user-menu-item"
                onClick={() => {

                  setShowMenu(false);

                  navigate("/settings");

                }}
              >
                Beállítások
              </button>

              <div className="user-menu-divider" />

              <button
                className="user-menu-item logout"
                onClick={logout}
              >
                Kijelentkezés
              </button>

            </div>

          )}

        </div>

      </div>

    </aside>
  );
}

export default Sidebar;