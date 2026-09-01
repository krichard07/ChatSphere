import {
  useEffect,
  useRef,
  useState,
} from "react";

import { useNavigate } from "react-router-dom";

import {
  BsCamera,
  BsCheckLg,
  BsX,
} from "react-icons/bs";

import api from "../api/api";
import Logo from "../assets/Logo/Logo";
import "./Profile.css";


function Profile() {

  const [user, setUser] = useState(null);

  const [isEditing, setIsEditing] =
    useState(false);

  const [username, setUsername] =
    useState("");

  const [email, setEmail] =
    useState("");

  const [avatarFile, setAvatarFile] =
    useState(null);

  const [avatarPreview, setAvatarPreview] =
    useState(null);

  const [removeAvatar, setRemoveAvatar] =
    useState(false);

  const [isSaving, setIsSaving] =
    useState(false);

  const [error, setError] =
    useState("");

  const [success, setSuccess] =
    useState("");

  const [isChangingPassword, setIsChangingPassword] =
    useState(false);

  const [currentPassword, setCurrentPassword] =
    useState("");

  const [newPassword, setNewPassword] =
    useState("");

  const [newPasswordConfirm, setNewPasswordConfirm] =
    useState("");

  const fileInputRef = useRef(null);

  const navigate = useNavigate();


  useEffect(() => {

    api
      .get("/accounts/me/")
      .then((response) => {

        setUser(response.data);

        setUsername(
          response.data.username || ""
        );

        setEmail(
          response.data.email || ""
        );

      })
      .catch((error) => {

        console.error(error);

        setError(
          "Nem sikerült betölteni a profilt."
        );

      });

  }, []);


  useEffect(() => {

    return () => {

      if (
        avatarPreview &&
        avatarPreview.startsWith("blob:")
      ) {
        URL.revokeObjectURL(
          avatarPreview
        );
      }

    };

  }, [avatarPreview]);


  const getAvatarUrl = () => {

    if (removeAvatar) {
      return null;
    }

    if (avatarPreview) {
      return avatarPreview;
    }

    if (user?.avatar) {

      if (
        user.avatar.startsWith("http://") ||
        user.avatar.startsWith("https://")
      ) {
        return user.avatar;
      }

      return `http://127.0.0.1:8000${user.avatar}`;
    }

    return null;

  };


  const handleEdit = () => {

    setUsername(user?.username || "");
    setEmail(user?.email || "");

    setAvatarFile(null);
    setAvatarPreview(null);
    setRemoveAvatar(false);

    setError("");
    setSuccess("");

    setIsEditing(true);

  };


  const handleCancel = () => {

    setUsername(user?.username || "");
    setEmail(user?.email || "");

    setAvatarFile(null);
    setAvatarPreview(null);
    setRemoveAvatar(false);

    setError("");
    setSuccess("");

    setIsEditing(false);

  };

  const handlePasswordChangeOpen = () => {

  setCurrentPassword("");
  setNewPassword("");
  setNewPasswordConfirm("");

  setError("");
  setSuccess("");

  setIsChangingPassword(true);

};


const handlePasswordChangeCancel = () => {

  setCurrentPassword("");
  setNewPassword("");
  setNewPasswordConfirm("");

  setError("");
  setSuccess("");

  setIsChangingPassword(false);

};


const handlePasswordChangeSave = async () => {

    if (!currentPassword) {
      setError("Add meg a jelenlegi jelszavad.");
      return;
    }

    if (!newPassword) {
      setError("Add meg az új jelszót.");
      return;
    }

    if (!newPasswordConfirm) {
      setError("Erősítsd meg az új jelszót.");
      return;
    }

    if (newPassword !== newPasswordConfirm) {
      setError("Az új jelszavak nem egyeznek.");
      return;
    }

    try {

      setIsSaving(true);
      setError("");
      setSuccess("");

      await api.post(
        "/accounts/change-password/",
        {
          current_password: currentPassword,
          new_password: newPassword,
          new_password_confirm: newPasswordConfirm,
        }
      );

      setCurrentPassword("");
      setNewPassword("");
      setNewPasswordConfirm("");

      setIsChangingPassword(false);

      setSuccess(
        "A jelszó sikeresen módosítva."
      );

    } catch (error) {

      console.error(
        "Jelszó módosítási hiba:",
        error
      );

      const data =
        error.response?.data;

      if (data?.current_password?.length) {
        setError(data.current_password[0]);
      } else if (data?.new_password?.length) {
        setError(data.new_password[0]);
      } else if (data?.new_password_confirm?.length) {
        setError(data.new_password_confirm[0]);
      } else {
        setError(
          "Nem sikerült módosítani a jelszót."
        );
      }

    } finally {

      setIsSaving(false);

    }

  };


  const handleAvatarChange = (event) => {

    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    if (!file.type.startsWith("image/")) {

      setError(
        "Profilképként csak képfájl tölthető fel."
      );

      return;
    }

    const previewUrl =
      URL.createObjectURL(file);

    setAvatarFile(file);
    setAvatarPreview(previewUrl);
    setRemoveAvatar(false);

    setError("");

  };

  const handleAvatarRemove = () => {

  setAvatarFile(null);
  setAvatarPreview(null);

  setRemoveAvatar(true);

  setError("");

};


  const handleSave = async () => {

    if (!username.trim()) {

      setError(
        "A felhasználónév nem lehet üres."
      );

      return;
    }

    if (!email.trim()) {

      setError(
        "Az e-mail cím nem lehet üres."
      );

      return;
    }

    const formData = new FormData();

    formData.append(
      "username",
      username.trim()
    );

    formData.append(
      "email",
      email.trim()
    );

    if (avatarFile) {
      formData.append(
        "avatar",
        avatarFile
      );
    }

    if (removeAvatar) {
      formData.append(
        "remove_avatar",
        "true"
      );
    }

    try {

      setIsSaving(true);
      setError("");
      setSuccess("");

      const response = await api.patch(
        "/accounts/me/",
        formData
      );

      setUser(response.data);

      setUsername(
        response.data.username || ""
      );

      setEmail(
        response.data.email || ""
      );

      setAvatarFile(null);
      setAvatarPreview(null);
      setRemoveAvatar(false);

      setIsEditing(false);

      setSuccess(
        "A profil sikeresen frissítve."
      );

    } catch (error) {

      console.error(
        "Profil mentési hiba:",
        error
      );

      const data =
        error.response?.data;

      if (data?.username?.length) {

        setError(data.username[0]);

      } else if (data?.email?.length) {

        setError(data.email[0]);

      } else if (data?.avatar?.length) {

        setError(data.avatar[0]);

      } else {

        setError(
          "Nem sikerült menteni a profilt."
        );

      }

    } finally {

      setIsSaving(false);

    }

  };


  const avatarUrl = getAvatarUrl();


  return (

    <div className="profile-page">

      <div className="profile-card">

        <Logo size={72} />


        <div className="profile-avatar-wrapper">

          <div className="profile-avatar">

            {avatarUrl ? (

              <img
                src={avatarUrl}
                alt="Profilkép"
                className="profile-avatar-image"
              />

            ) : (

              user?.username
                ?.charAt(0)
                ?.toUpperCase()

            )}

          </div>


          {isEditing && (

            <button
              type="button"
              className="profile-avatar-edit"
              onClick={() =>
                fileInputRef.current?.click()
              }
              aria-label="Profilkép cseréje"
              title="Profilkép cseréje"
            >
              <BsCamera />
            </button>

          )}

          {isEditing && avatarUrl && (

            <button
              type="button"
              className="profile-avatar-remove"
              onClick={handleAvatarRemove}
              aria-label="Profilkép eltávolítása"
              title="Profilkép eltávolítása"
            >
              <BsX />
            </button>

          )}

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            hidden
            onChange={handleAvatarChange}
          />

        </div>


        {!isEditing && !isChangingPassword ? (

          <>

            <h1 className="profile-name">
              {user?.username}
            </h1>

            <p className="profile-email">
              {user?.email}
            </p>

          </>

        ) : isEditing ? (

          <div className="profile-edit-fields">

            <div className="profile-field">

              <label htmlFor="profile-username">
                Felhasználónév
              </label>

              <input
                id="profile-username"
                type="text"
                value={username}
                onChange={(event) =>
                  setUsername(event.target.value)
                }
                autoComplete="username"
              />

            </div>

            <div className="profile-field">

              <label htmlFor="profile-email">
                E-mail cím
              </label>

              <input
                id="profile-email"
                type="email"
                value={email}
                onChange={(event) =>
                  setEmail(event.target.value)
                }
                autoComplete="email"
              />

            </div>

          </div>

        ) : (

          <div className="profile-edit-fields">

            <div className="profile-field">

              <label htmlFor="current-password">
                Jelenlegi jelszó
              </label>

              <input
                id="current-password"
                type="password"
                value={currentPassword}
                onChange={(event) =>
                  setCurrentPassword(
                    event.target.value
                  )
                }
                autoComplete="current-password"
              />

            </div>

            <div className="profile-field">

              <label htmlFor="new-password">
                Új jelszó
              </label>

              <input
                id="new-password"
                type="password"
                value={newPassword}
                onChange={(event) =>
                  setNewPassword(
                    event.target.value
                  )
                }
                autoComplete="new-password"
              />

            </div>

            <div className="profile-field">

              <label htmlFor="new-password-confirm">
                Új jelszó megerősítése
              </label>

              <input
                id="new-password-confirm"
                type="password"
                value={newPasswordConfirm}
                onChange={(event) =>
                  setNewPasswordConfirm(
                    event.target.value
                  )
                }
                autoComplete="new-password"
              />

            </div>

          </div>

        )}


        <div className="profile-status">
          Online
        </div>


        {error && (

          <div className="profile-message error">
            {error}
          </div>

        )}


        {success && (

          <div className="profile-message success">
            {success}
          </div>

        )}


        <div className="profile-buttons">

        {!isEditing && !isChangingPassword ? (

          <>

            <button
              type="button"
              className="profile-btn"
              onClick={handleEdit}
            >
              Profil szerkesztése
            </button>

            <button
              type="button"
              className="profile-btn"
              onClick={handlePasswordChangeOpen}
            >
              Jelszó módosítása
            </button>

            <button
              type="button"
              className="profile-btn back-btn"
              onClick={() =>
                navigate("/")
              }
            >
              Vissza a chathez
            </button>

          </>

        ) : isEditing ? (

          <div className="profile-edit-actions">

            <button
              type="button"
              className="profile-btn profile-cancel-btn"
              onClick={handleCancel}
              disabled={isSaving}
            >
              <BsX />
              Mégse
            </button>

            <button
              type="button"
              className="profile-btn profile-save-btn"
              onClick={handleSave}
              disabled={isSaving}
            >
              <BsCheckLg />

              {isSaving
                ? "Mentés..."
                : "Mentés"}
            </button>

          </div>

        ) : (

          <div className="profile-edit-actions">

            <button
              type="button"
              className="profile-btn profile-cancel-btn"
              onClick={handlePasswordChangeCancel}
              disabled={isSaving}
            >
              <BsX />
              Mégse
            </button>

            <button
              type="button"
              className="profile-btn profile-save-btn"
              onClick={handlePasswordChangeSave}
              disabled={isSaving}
            >
              <BsCheckLg />

              {isSaving
                ? "Mentés..."
                : "Jelszó mentése"}
            </button>

          </div>

        )}

      </div>

      </div>

    </div>

  );

}

export default Profile;