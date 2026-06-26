// Profile.jsx
// Perfil del usuario con cuenta, contraseña, eliminación y favoritos.

import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  FaArrowRight,
  FaEdit,
  FaEye,
  FaEyeSlash,
  FaHeart,
  FaKey,
  FaSave,
  FaSignOutAlt,
  FaTrashAlt,
  FaUserAlt,
} from "react-icons/fa";

import { useAuth } from "../../context/AuthContext";
import { useLanguage } from "../../context/LanguageContext";
import { translations } from "../../i18n";
import { api } from "../../services/api";

import "./Profile.css";

const DDRAGON_VERSION = "15.24.1";
const PLACEHOLDER_IMG = "https://static.thenounproject.com/png/104062-200.png";

function normalizeList(response) {
  if (Array.isArray(response)) return response;
  if (Array.isArray(response?.data)) return response.data;
  if (Array.isArray(response?.favoritesFull)) return response.favoritesFull;
  if (Array.isArray(response?.champions)) return response.champions;

  return [];
}

function normalizeChampionId(name) {
  const raw = String(name || "").trim();

  const specialCases = {
    "Nunu & Willump": "Nunu",
    "Master Yi": "MasterYi",
    "Maestro Yi": "MasterYi",
    Wukong: "MonkeyKing",
    LeBlanc: "Leblanc",
    "Kai'Sa": "Kaisa",
    "Cho'Gath": "Chogath",
    "Kha'Zix": "Khazix",
    "Rek'Sai": "RekSai",
    "Vel'Koz": "Velkoz",
    "Kog'Maw": "KogMaw",
    "Bel'Veth": "Belveth",
    "Dr. Mundo": "DrMundo",
    "Renata Glasc": "Renata",
    "Miss Fortune": "MissFortune",
    "Tahm Kench": "TahmKench",
    "Twisted Fate": "TwistedFate",
    "Jarvan IV": "JarvanIV",
    "Xin Zhao": "XinZhao",
  };

  if (specialCases[raw]) return specialCases[raw];

  return raw.replace(/['’.\s]/g, "").replace(/&/g, "").replace(/-/g, "");
}

function getChampionId(champion) {
  return (
    champion?.championId ||
    champion?.id ||
    champion?.key ||
    champion?.slug ||
    normalizeChampionId(champion?.name)
  );
}

function getChampionName(champion) {
  return champion?.name || champion?.id || "Champion";
}

function getChampionIcon(champion) {
  if (champion?.iconUrl) return champion.iconUrl;
  if (champion?.imageUrl) return champion.imageUrl;
  if (champion?.squareUrl) return champion.squareUrl;

  return `https://ddragon.leagueoflegends.com/cdn/${DDRAGON_VERSION}/img/champion/${getChampionId(
    champion
  )}.png`;
}

function isStrongPassword(password) {
  return (
    password.length >= 8 &&
    password.length <= 64 &&
    /[A-Z]/.test(password) &&
    /[a-z]/.test(password) &&
    /[0-9]/.test(password) &&
    /[^A-Za-z0-9]/.test(password)
  );
}

function scrollToProfileTop() {
  window.scrollTo({
    top: 0,
    left: 0,
    behavior: "smooth",
  });
}

function PasswordInput({
  value,
  onChange,
  placeholder,
  visible,
  onToggle,
  showLabel,
  hideLabel,
  className = "",
}) {
  return (
    <div className={`profile__passwordField ${className}`}>
      <input
        className="profile__input profile__input--password"
        type={visible ? "text" : "password"}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required
      />

      <button
        className="profile__passwordToggle"
        type="button"
        onClick={onToggle}
        aria-label={visible ? hideLabel : showLabel}
      >
        {visible ? <FaEyeSlash /> : <FaEye />}
      </button>
    </div>
  );
}

export default function Profile() {
  const { user, logout } = useAuth();
  const { language } = useLanguage();
  const navigate = useNavigate();

  const text = translations[language].profile;

  const [profileUser, setProfileUser] = useState(user || null);
  const [favoriteChampions, setFavoriteChampions] = useState([]);

  const [username, setUsername] = useState(user?.username || "");
  const [email, setEmail] = useState(user?.email || "");

  const [currentPasswordProfile, setCurrentPasswordProfile] = useState("");
  const [currentPasswordChange, setCurrentPasswordChange] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [deletePassword, setDeletePassword] = useState("");

  const [showCurrentProfile, setShowCurrentProfile] = useState(false);
  const [showCurrentChange, setShowCurrentChange] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showDeletePassword, setShowDeletePassword] = useState(false);

  const [loadingFavorites, setLoadingFavorites] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const displayName = profileUser?.username || user?.username || text.guest;
  const displayEmail = profileUser?.email || user?.email || text.noEmail;

  const passwordLabels = {
    showLabel: text.showPassword,
    hideLabel: text.hidePassword,
  };

  useEffect(() => {
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        window.scrollTo({ top: 0, left: 0, behavior: "auto" });
      });
    });
  }, [language]);

  useEffect(() => {
    if (!message && !error) return;

    scrollToProfileTop();

    const timer = setTimeout(() => {
      setMessage("");
      setError("");
    }, 3000);

    return () => clearTimeout(timer);
  }, [message, error]);

  useEffect(() => {
    async function loadProfile() {
      try {
        const response = await api.get("/auth/me");
        const data = response.data?.user || response.data;

        setProfileUser(data);
        setUsername(data?.username || "");
        setEmail(data?.email || "");
      } catch {
        setProfileUser(user || null);
      }
    }

    loadProfile();
  }, [user]);

  useEffect(() => {
    let alive = true;

    async function loadFavoritesFull() {
      try {
        setLoadingFavorites(true);

        const response = await api.get("/auth/favorites/full");
        const list = normalizeList(response.data);

        if (!alive) return;

        setFavoriteChampions(list);
      } catch {
        if (!alive) return;

        setFavoriteChampions([]);
      } finally {
        if (alive) setLoadingFavorites(false);
      }
    }

    loadFavoritesFull();

    return () => {
      alive = false;
    };
  }, []);

  const clearFeedback = () => {
    setMessage("");
    setError("");
  };

  async function handleUpdateProfile(event) {
    event.preventDefault();
    clearFeedback();
    scrollToProfileTop();

    try {
      const response = await api.put("/auth/profile", {
        username,
        email,
        password: currentPasswordProfile,
      });

      const updatedUser = response.data?.user;

      if (updatedUser) {
        setProfileUser(updatedUser);
        setUsername(updatedUser.username || "");
        setEmail(updatedUser.email || "");
      }

      setMessage(text.profileUpdated);
      setCurrentPasswordProfile("");
      setShowCurrentProfile(false);
    } catch (error) {
      setError(error.response?.data?.message || text.updateFailed);
    }
  }

  async function handleChangePassword(event) {
    event.preventDefault();
    clearFeedback();
    scrollToProfileTop();

    if (!isStrongPassword(newPassword)) {
      setError(text.strongPassword);
      return;
    }

    if (newPassword !== confirmPassword) {
      setError(text.passwordsMismatch);
      return;
    }

    try {
      await api.put("/auth/password", {
        oldPassword: currentPasswordChange,
        newPassword,
        confirmPassword,
      });

      setMessage(text.passwordChanged);
      setCurrentPasswordChange("");
      setNewPassword("");
      setConfirmPassword("");
      setShowCurrentChange(false);
      setShowNewPassword(false);
      setShowConfirmPassword(false);
    } catch (error) {
      setError(error.response?.data?.message || text.passwordChangeFailed);
    }
  }

  function openDeleteModal() {
    clearFeedback();

    if (!deletePassword.trim()) {
      setError(text.deletePasswordRequired);
      return;
    }

    setDeleteModalOpen(true);
  }

  function closeDeleteModal() {
    setDeleteModalOpen(false);
  }

  async function confirmDeleteAccount() {
    clearFeedback();
    setDeleteModalOpen(false);
    scrollToProfileTop();

    try {
      await api.delete("/auth", {
        data: { password: deletePassword },
      });

      logout();

      localStorage.removeItem("token");
      localStorage.removeItem("user");

      navigate("/login", {
        replace: true,
      });
    } catch (error) {
      setError(error.response?.data?.message || text.deleteFailed);
    }
  }

  function handleLogout() {
    logout();
    navigate("/login");
  }

  return (
    <main className="profile">
      <section className="profile__panel" aria-label={text.profileAria}>
        <header className="profile__hero">
          <div className="profile__titleRow">
            <span className="profile__stick" aria-hidden="true" />
            <h1 className="profile__title">{text.title}</h1>
            <span className="profile__stick" aria-hidden="true" />
          </div>

          <p className="profile__subtitle">{text.subtitle}</p>
        </header>

        <section className="profile__accountCard">
          <div className="profile__avatarBox" aria-hidden="true">
            <FaUserAlt className="profile__avatarIcon" />
          </div>

          <div className="profile__accountInfo">
            <span className="profile__kicker">{text.account}</span>
            <h2 className="profile__username">{displayName}</h2>
            <p className="profile__email">{displayEmail}</p>
          </div>

          <button className="profile__logoutBtn" type="button" onClick={handleLogout}>
            <FaSignOutAlt aria-hidden="true" />
            <span>{text.logout}</span>
          </button>
        </section>

        {(message || error) && (
          <div className={`profile__feedback ${error ? "profile__feedback--error" : ""}`}>
            {error || message}
          </div>
        )}

        <div className="profile__layout">
          <section className="profile__mainBlock">
            <div className="profile__blockHead">
              <div>
                <h2 className="profile__sectionTitle">
                  <FaHeart aria-hidden="true" />
                  {text.favorites}
                </h2>

                <p className="profile__sectionText">{text.favoritesText}</p>
              </div>
            </div>

            {loadingFavorites && <p className="profile__status">{text.loading}</p>}

            {!loadingFavorites && (
              <>
                {favoriteChampions.length > 0 ? (
                  <div className="profile__favoritesList">
                    {favoriteChampions.map((champion) => {
                      const id = getChampionId(champion);
                      const name = getChampionName(champion);

                      return (
                        <Link
                          className="profile__championMini"
                          key={id}
                          to={`/champions/${id}`}
                          title={`${text.viewChampion}: ${name}`}
                        >
                          <span className="profile__championIconBox">
                            <img
                              className="profile__championIcon"
                              src={getChampionIcon(champion)}
                              alt={name}
                              loading="lazy"
                              decoding="async"
                              onError={(event) => {
                                event.currentTarget.src = PLACEHOLDER_IMG;
                              }}
                            />
                          </span>

                          <span className="profile__championName">{name}</span>
                        </Link>
                      );
                    })}
                  </div>
                ) : (
                  <div className="profile__empty">
                    <FaHeart className="profile__emptyIcon" aria-hidden="true" />
                    <h3 className="profile__emptyTitle">{text.emptyTitle}</h3>
                    <p className="profile__emptyText">{text.emptyText}</p>
                  </div>
                )}
              </>
            )}

            <section className="profile__buildsCard profile__buildsCard--wide">
              <span className="profile__buildsBadge">{text.buildsBadge}</span>
              <h2 className="profile__buildsTitle">{text.buildsTitle}</h2>
              <p className="profile__buildsText">{text.buildsText}</p>

              <span className="profile__buildsArrow" aria-hidden="true">
                <FaArrowRight />
              </span>
            </section>
          </section>

          <aside className="profile__side">
            <section className="profile__settingsCard">
              <h2 className="profile__sideTitle">
                <FaUserAlt aria-hidden="true" />
                {text.settings}
              </h2>

              <form className="profile__form" onSubmit={handleUpdateProfile}>
                <h3 className="profile__formTitle">
                  <FaEdit aria-hidden="true" />
                  {text.updateProfile}
                </h3>

                <input
                  className="profile__input"
                  type="text"
                  value={username}
                  onChange={(event) => setUsername(event.target.value)}
                  placeholder={text.username}
                  required
                />

                <input
                  className="profile__input"
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder={text.email}
                  required
                />

                <PasswordInput
                  value={currentPasswordProfile}
                  onChange={(event) => setCurrentPasswordProfile(event.target.value)}
                  placeholder={text.currentPassword}
                  visible={showCurrentProfile}
                  onToggle={() => setShowCurrentProfile((prev) => !prev)}
                  {...passwordLabels}
                />

                <button className="profile__submitBtn" type="submit">
                  <FaSave aria-hidden="true" />
                  <span>{text.saveChanges}</span>
                </button>
              </form>

              <form className="profile__form" onSubmit={handleChangePassword}>
                <h3 className="profile__formTitle">
                  <FaKey aria-hidden="true" />
                  {text.changePassword}
                </h3>

                <PasswordInput
                  value={currentPasswordChange}
                  onChange={(event) => setCurrentPasswordChange(event.target.value)}
                  placeholder={text.currentPassword}
                  visible={showCurrentChange}
                  onToggle={() => setShowCurrentChange((prev) => !prev)}
                  {...passwordLabels}
                />

                <PasswordInput
                  value={newPassword}
                  onChange={(event) => setNewPassword(event.target.value)}
                  placeholder={text.newPassword}
                  visible={showNewPassword}
                  onToggle={() => setShowNewPassword((prev) => !prev)}
                  {...passwordLabels}
                />

                <PasswordInput
                  value={confirmPassword}
                  onChange={(event) => setConfirmPassword(event.target.value)}
                  placeholder={text.confirmPassword}
                  visible={showConfirmPassword}
                  onToggle={() => setShowConfirmPassword((prev) => !prev)}
                  {...passwordLabels}
                />

                <button className="profile__submitBtn" type="submit">
                  <FaKey aria-hidden="true" />
                  <span>{text.changePasswordBtn}</span>
                </button>

                <Link className="profile__forgotLink" to="/forgot-password">
                  {text.forgotPassword}
                </Link>
              </form>

              <div className="profile__form profile__form--danger">
                <h3 className="profile__formTitle profile__formTitle--danger">
                  <FaTrashAlt aria-hidden="true" />
                  {text.deleteAccount}
                </h3>

                <PasswordInput
                  value={deletePassword}
                  onChange={(event) => setDeletePassword(event.target.value)}
                  placeholder={text.currentPassword}
                  visible={showDeletePassword}
                  onToggle={() => setShowDeletePassword((prev) => !prev)}
                  {...passwordLabels}
                />

                <button
                  className="profile__submitBtn profile__submitBtn--danger"
                  type="button"
                  onClick={openDeleteModal}
                >
                  <FaTrashAlt aria-hidden="true" />
                  <span>{text.deleteMyAccount}</span>
                </button>
              </div>
            </section>
          </aside>
        </div>
      </section>

      {deleteModalOpen && (
        <div className="profile__modalOverlay" role="presentation">
          <section
            className="profile__modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="delete-account-title"
          >
            <span className="profile__modalIcon" aria-hidden="true">
              <FaTrashAlt />
            </span>

            <h2 className="profile__modalTitle" id="delete-account-title">
              {text.deleteModalTitle}
            </h2>

            <p className="profile__modalText">{text.deleteModalText}</p>

            <div className="profile__modalActions">
              <button
                className="profile__modalBtn profile__modalBtn--ghost"
                type="button"
                onClick={closeDeleteModal}
              >
                {text.cancel}
              </button>

              <button
                className="profile__modalBtn profile__modalBtn--danger"
                type="button"
                onClick={confirmDeleteAccount}
              >
                <FaTrashAlt aria-hidden="true" />
                <span>{text.confirmDelete}</span>
              </button>
            </div>
          </section>
        </div>
      )}
    </main>
  );
}