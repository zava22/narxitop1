import { useState } from "react";

import { useAuth } from "../../context/AuthContext";
import { useCart } from "../../context/CartContext";
import { useLang } from "../../context/LanguageContext";
import { useTheme } from "../../context/ThemeContext";

import useTypewriter from "../../hooks/useTypewriter";

import "./Navbar.css";

export default function Navbar() {
  const { t, lang, setLang, languages } = useLang();
  const { isDark, toggleTheme } = useTheme();
  const { isAuthenticated, displayName, user } = useAuth();
  const [focused, setFocused] = useState(false);
  const typed = useTypewriter(
    [t("nav.searchPlaceholder"), "Fanta, Sprite, Lay's…", "Sut, non, tuxum…"],
    { type: 70, hold: 1400 }
  );
  const avatarColor = user?.user_metadata?.avatar_color || "#34d399";
  const langIndex = Math.max(0, languages.indexOf(lang));
  const { count } = useCart();
  const [menuOpen, setMenuOpen] = useState(false);

  const pathname = window.location.pathname;
  const isActive = (path) =>
    path === "/" ? pathname === "/" : pathname.startsWith(path);

  return (
    <header className="navbar nav-pro">
      <div className="navbar-inner">
        {/* Logo */}
        <a href="/" className="navbar-logo">
          <span className="logo-narx">Narx</span>
          <span className="logo-top">Top</span>
        </a>

        {/* Search */}
        <form className="navbar-search" action="/search">
          <input
            type="text"
            name="q"
            placeholder={focused ? t("nav.searchPlaceholder") : typed + "▍"}
            onFocus={() => setFocused(true)}
            onBlur={(e) => setFocused(Boolean(e.target.value))}
            autoComplete="off"
          />

          <button type="submit" aria-label={t("nav.search")}>
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="11" cy="11" r="7" />
              <path d="m20 20-4-4" />
            </svg>
          </button>
        </form>

        {/* Navigation */}
        <nav className={`navbar-menu ${menuOpen ? "open" : ""}`}>
          <a
            href="/"
            className={`navbar-link ${isActive("/") ? "active" : ""}`}
          >
            {t("nav.home")}
          </a>

          <a
            href="/search"
            className={`navbar-link ${isActive("/search") ? "active" : ""}`}
          >
            {t("nav.search")}
          </a>

          <a
            href="/cart"
            className={`navbar-link navbar-cart ${
              isActive("/cart") ? "active" : ""
            }`}
          >
            {t("nav.cart")}
            {count > 0 && (
              <span className="cart-badge" key={count}>
                {count}
              </span>
            )}
          </a>
        </nav>

        {/* Theme */}
        <button
          type="button"
          className="theme-button"
          aria-label={t("nav.theme")}
          title={t("nav.theme")}
          onClick={toggleTheme}
        >
          {isDark ? (
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="4" />
              <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
            </svg>
          ) : (
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M21 12.8A8.5 8.5 0 1 1 11.2 3 6.5 6.5 0 0 0 21 12.8Z" />
            </svg>
          )}
        </button>

        {/* Language */}
        <div
          className="language-switcher lang-pro"
          style={{ "--i": langIndex, "--n": languages.length }}
          role="radiogroup"
        >
          <span className="lang-glider" aria-hidden="true" />
          {languages.map((code) => (
            <button
              key={code}
              type="button"
              role="radio"
              aria-checked={lang === code}
              className={`language ${lang === code ? "active" : ""}`}
              onClick={() => setLang(code)}
            >
              {code.toUpperCase()}
            </button>
          ))}
        </div>

        {/* Auth */}
        {isAuthenticated ? (
          <a
            href="/account"
            className={`navbar-user nav-account ${isActive("/account") ? "active" : ""}`}
            title={t("acc.title")}
          >
            <span
              className="navbar-avatar"
              style={{ background: avatarColor }}
              aria-hidden="true"
            >
              {(displayName[0] || "N").toUpperCase()}
              <i className="avatar-ring" />
            </span>
            <span className="navbar-username">
              {t("nav.hello", { name: displayName })}
            </span>
            <svg className="nav-gear" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <circle cx="12" cy="12" r="3" />
              <path d="M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.9.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.9 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.9l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.9.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.9-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.9V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1Z" />
            </svg>
          </a>
        ) : (
          <a href="/auth" className="navbar-auth-button">
            {t("nav.login")}
          </a>
        )}

        {/* Mobile burger */}
        <button
          type="button"
          className="navbar-burger"
          aria-label="Menu"
          onClick={() => setMenuOpen((open) => !open)}
        >
          <span />
          <span />
          <span />
        </button>
      </div>
    </header>
  );
}
