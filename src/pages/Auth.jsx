import { useEffect, useState } from "react";

import Navbar from "../components/layout/Navbar";
import Footer from "../components/layout/Footer";

import { useAuth } from "../context/AuthContext";
import { useLang } from "../context/LanguageContext";

import "./Auth.css";

/* Turn Supabase's English error messages into translated, friendly ones. */
function friendlyError(error, t) {
  const message = (error?.message || "").toLowerCase();

  if (message.includes("invalid login")) return t("auth.err.invalid");
  if (message.includes("not confirmed")) return t("auth.err.notConfirmed");
  if (message.includes("already registered")) return t("auth.err.exists");
  if (message.includes("at least 6") || message.includes("weak"))
    return t("auth.err.weak");
  if (message.includes("rate limit") || message.includes("too many"))
    return t("auth.err.rate");

  return error?.message || t("auth.err.generic");
}

export default function Auth() {
  const { t } = useLang();

  const {
    signUp,
    signIn,
    signInWithGoogle,
    sendPasswordRecovery,
    resendConfirmation,
    loading: authLoading,
    isAuthenticated,
  } = useAuth();

  const initialMode =
    new URLSearchParams(window.location.search).get("mode") === "signup"
      ? "signup"
      : "login";

  const [mode, setMode] = useState(initialMode);

  const [formData, setFormData] = useState({
    name: "",
    secondName: "",
    phone: "",
    email: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [needsConfirmation, setNeedsConfirmation] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const isLogin = mode === "login";
  const isLoading = loading || authLoading;

  // Signed in (also after Google): go to the home page.
  useEffect(() => {
    if (!isAuthenticated) return undefined;

    const timer = setTimeout(() => {
      window.location.href = "/";
    }, 1400);

    return () => clearTimeout(timer);
  }, [isAuthenticated]);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({ ...previous, [name]: value }));
    setError("");
    setSuccess("");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");
    setSuccess("");
    setNeedsConfirmation(false);
    setLoading(true);

    try {
      if (isLogin) {
        await signIn({
          email: formData.email.trim(),
          password: formData.password,
        });

        setSuccess(t("auth.signedInOk"));
      } else {
        const data = await signUp({
          name: formData.name.trim(),
          secondName: formData.secondName.trim(),
          phone: formData.phone.trim(),
          email: formData.email.trim(),
          password: formData.password,
        });

        if (data?.session) {
          setSuccess(t("auth.signupOkSession"));
        } else {
          setSuccess(t("auth.checkEmail"));
          setNeedsConfirmation(true);
        }
      }
    } catch (caught) {
      if ((caught?.message || "").toLowerCase().includes("not confirmed")) {
        setNeedsConfirmation(true);
      }
      setError(friendlyError(caught, t));
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      await signInWithGoogle(); // redirects to Google
    } catch (caught) {
      setError(friendlyError(caught, t) || t("auth.err.google"));
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    setError("");
    setSuccess("");

    if (!formData.email.trim()) {
      setError(t("auth.enterEmailFirst"));
      return;
    }

    setLoading(true);

    try {
      await sendPasswordRecovery(formData.email.trim());
      setSuccess(t("auth.resetSent"));
    } catch (caught) {
      setError(friendlyError(caught, t));
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (!formData.email.trim()) {
      setError(t("auth.enterEmailFirst"));
      return;
    }

    setLoading(true);
    setError("");

    try {
      await resendConfirmation(formData.email.trim());
      setSuccess(t("confirm.resent"));
    } catch (caught) {
      setError(friendlyError(caught, t));
    } finally {
      setLoading(false);
    }
  };

  const switchMode = () => {
    setMode(isLogin ? "signup" : "login");
    setError("");
    setSuccess("");
    setNeedsConfirmation(false);
    setFormData((previous) => ({ ...previous, password: "" }));
  };

  const googleButton = (
    <button
      type="button"
      className="auth-google"
      onClick={handleGoogleLogin}
      disabled={isLoading}
    >
      <svg className="google-icon" viewBox="0 0 24 24" aria-hidden="true">
        <path
          fill="#4285F4"
          d="M21.35 12.27c0-.71-.06-1.39-.18-2.04H12v3.86h5.23a4.47 4.47 0 0 1-1.94 2.93v2.44h3.14c1.84-1.69 2.92-4.18 2.92-7.19Z"
        />
        <path
          fill="#34A853"
          d="M12 21.73c2.63 0 4.84-.87 6.45-2.37l-3.14-2.44c-.87.58-1.98.92-3.31.92-2.54 0-4.69-1.72-5.46-4.03H3.3v2.52A9.73 9.73 0 0 0 12 21.73Z"
        />
        <path
          fill="#FBBC05"
          d="M6.54 13.81A5.85 5.85 0 0 1 6.23 12c0-.63.11-1.25.31-1.81V7.67H3.3A9.73 9.73 0 0 0 2.27 12c0 1.57.38 3.06 1.03 4.33l3.24-2.52Z"
        />
        <path
          fill="#EA4335"
          d="M12 6.16c1.43 0 2.71.49 3.72 1.45l2.79-2.79C16.83 3.26 14.63 2.27 12 2.27A9.73 9.73 0 0 0 3.3 7.67l3.24 2.52C6.85 7.88 9.01 6.16 12 6.16Z"
        />
      </svg>
      {t("auth.google")}
    </button>
  );

  return (
    <div className="auth-page-wrapper">
      <Navbar />

      <main className="auth-page">
        {/* Floating decorative blobs */}
        <span className="auth-blob auth-blob-1" aria-hidden="true" />
        <span className="auth-blob auth-blob-2" aria-hidden="true" />
        <span className="auth-blob auth-blob-3" aria-hidden="true" />

        <div className="auth-layout">
          {/* Side panel */}
          <aside className="auth-side" aria-hidden="true">
            <div className="auth-side-logo">
              <span>Narx</span>Top
            </div>
            <h2>{t("auth.sideTitle")}</h2>
            <p>{t("auth.sideText")}</p>

            <div className="auth-side-stores">
              <span className="auth-chip chip-k">Korzinka</span>
              <span className="auth-chip chip-h">Havas</span>
              <span className="auth-chip chip-m">Makro</span>
            </div>
          </aside>

          <div className="auth-container">
            <section className="auth-card" key={mode}>
              {isAuthenticated ? (
                <div className="auth-header">
                  <div className="auth-logo">N</div>
                  <h1 className="auth-title">{t("auth.alreadySignedIn")}</h1>
                  <p className="auth-subtitle">{t("auth.alreadySub")}</p>
                  <a href="/" className="auth-submit auth-home-link">
                    {t("auth.goHome")}
                  </a>
                </div>
              ) : (
                <>
                  <div className="auth-header">
                    <div className="auth-logo">N</div>

                    <h1 className="auth-title">
                      {isLogin
                        ? t("auth.loginTitle")
                        : t("auth.signupTitle")}
                    </h1>

                    <p className="auth-subtitle">
                      {isLogin
                        ? t("auth.loginSub")
                        : t("auth.signupSub")}
                    </p>
                  </div>

                  {error && <div className="auth-error">{error}</div>}
                  {success && <div className="auth-success">{success}</div>}

                  {needsConfirmation && (
                    <button
                      type="button"
                      className="auth-link auth-resend"
                      onClick={handleResend}
                      disabled={isLoading}
                    >
                      {t("confirm.resend")}
                    </button>
                  )}

                  <form className="auth-form" onSubmit={handleSubmit}>
                    {!isLogin && (
                      <div className="auth-row">
                        <div className="auth-field">
                          <label className="auth-label" htmlFor="name">
                            {t("auth.firstName")}
                          </label>
                          <input
                            id="name"
                            name="name"
                            type="text"
                            className="auth-input"
                            placeholder={t("auth.firstNamePh")}
                            value={formData.name}
                            onChange={handleChange}
                            autoComplete="given-name"
                            required
                          />
                        </div>

                        <div className="auth-field">
                          <label className="auth-label" htmlFor="secondName">
                            {t("auth.lastName")}
                          </label>
                          <input
                            id="secondName"
                            name="secondName"
                            type="text"
                            className="auth-input"
                            placeholder={t("auth.lastNamePh")}
                            value={formData.secondName}
                            onChange={handleChange}
                            autoComplete="family-name"
                            required
                          />
                        </div>
                      </div>
                    )}

                    {!isLogin && (
                      <div className="auth-field">
                        <label className="auth-label" htmlFor="phone">
                          {t("auth.phone")}
                        </label>
                        <input
                          id="phone"
                          name="phone"
                          type="tel"
                          className="auth-input"
                          placeholder="+998 90 123 45 67"
                          value={formData.phone}
                          onChange={handleChange}
                          autoComplete="tel"
                          required
                        />
                      </div>
                    )}

                    <div className="auth-field">
                      <label className="auth-label" htmlFor="email">
                        {t("auth.email")}
                      </label>
                      <input
                        id="email"
                        name="email"
                        type="email"
                        className="auth-input"
                        placeholder="you@example.com"
                        value={formData.email}
                        onChange={handleChange}
                        autoComplete="email"
                        required
                      />
                    </div>

                    <div className="auth-field">
                      <div className="auth-password-row">
                        <label className="auth-label" htmlFor="password">
                          {t("auth.password")}
                        </label>

                        {isLogin && (
                          <button
                            type="button"
                            className="auth-link"
                            onClick={handleForgotPassword}
                            disabled={isLoading}
                          >
                            {t("auth.forgot")}
                          </button>
                        )}
                      </div>

                      <div className="auth-password-wrap">
                        <input
                          id="password"
                          name="password"
                          type={showPassword ? "text" : "password"}
                          className="auth-input"
                          placeholder={t("auth.passwordPh")}
                          value={formData.password}
                          onChange={handleChange}
                          autoComplete={
                            isLogin ? "current-password" : "new-password"
                          }
                          minLength={6}
                          required
                        />
                        <button
                          type="button"
                          className="auth-eye"
                          onClick={() => setShowPassword((value) => !value)}
                          aria-label="Show / hide password"
                        >
                          {showPassword ? "🙈" : "👁️"}
                        </button>
                      </div>
                    </div>

                    <button
                      type="submit"
                      className="auth-submit"
                      disabled={isLoading}
                    >
                      {isLoading
                        ? t("auth.wait")
                        : isLogin
                          ? t("auth.signIn")
                          : t("auth.createAccount")}
                    </button>
                  </form>

                  <div className="auth-divider">
                    <span>{t("auth.or")}</span>
                  </div>

                  {googleButton}

                  <div className="auth-switch">
                    {isLogin ? t("auth.noAccount") : t("auth.haveAccount")}

                    <button
                      type="button"
                      onClick={switchMode}
                      disabled={isLoading}
                    >
                      {isLogin
                        ? t("auth.createAccount")
                        : t("auth.signIn")}
                    </button>
                  </div>
                </>
              )}
            </section>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
