import { useEffect, useMemo, useState } from "react";

import Navbar from "../components/layout/Navbar";
import Footer from "../components/layout/Footer";
import LockedContent from "../components/ui/LockedContent";

import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import { useLang } from "../context/LanguageContext";
import { useTheme } from "../context/ThemeContext";
import useReveal from "../hooks/useReveal";
import useHoldToConfirm from "../hooks/useHoldToConfirm";
import useCountUp from "../hooks/useCountUp";

import "./Account.css";

const COLORS = ["#34d399", "#6fd0c0", "#60a5fa", "#a78bfa", "#f472b6", "#ff8a70", "#fbbf24", "#f87171"];

const TABS = [
  { id: "profile", icon: "M20 21a8 8 0 0 0-16 0M12 13a5 5 0 1 0 0-10 5 5 0 0 0 0 10Z" },
  { id: "security", icon: "M12 3 4 6v6c0 5 3.4 8.2 8 9 4.6-.8 8-4 8-9V6l-8-3ZM9 12l2 2 4-4" },
  { id: "prefs", icon: "M4 6h10M18 6h2M4 12h4M12 12h8M4 18h12M20 18h0M14 4v4M8 10v4M16 16v4" },
  { id: "session", icon: "M15 4h3a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-3M10 17l-5-5 5-5M5 12h11" },
];

function Svg({ d, size = 20 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d={d} />
    </svg>
  );
}

function passwordScore(pw) {
  let s = 0;
  if (pw.length >= 8) s += 1;
  if (pw.length >= 12) s += 1;
  if (/[A-Z]/.test(pw) && /[a-z]/.test(pw)) s += 1;
  if (/\d/.test(pw)) s += 1;
  if (/[^A-Za-z0-9]/.test(pw)) s += 1;
  return Math.min(4, s);
}

function formatPhone(raw) {
  const d = raw.replace(/\D/g, "").replace(/^998/, "").slice(0, 9);
  const parts = [d.slice(0, 2), d.slice(2, 5), d.slice(5, 7), d.slice(7, 9)].filter(Boolean);
  return d ? `+998 ${parts.join(" ")}` : "";
}

function Field({ label, error, ok, children }) {
  return (
    <label className={`acc-field ${error ? "err" : ""} ${ok ? "ok" : ""}`}>
      <span className="acc-label">{label}</span>
      {children}
      <span className="acc-hint" aria-live="polite">{error || ""}</span>
    </label>
  );
}

function Banner({ state }) {
  if (!state) return null;
  return (
    <div className={`acc-banner ${state.type}`} key={state.id} role="status">
      <i />
      <span>{state.text}</span>
    </div>
  );
}

function Stat({ value, label }) {
  const n = useCountUp(value, 900);
  return (
    <div className="acc-stat">
      <strong>{n}</strong>
      <span>{label}</span>
    </div>
  );
}

export default function Account() {
  const { t, lang, setLang, languages } = useLang();
  const { isDark, toggleTheme } = useTheme();
  const { user, loading, isAuthenticated, displayName, updateProfile, updatePassword, signOut } = useAuth();
  const { count, items } = useCart();

  const meta = user?.user_metadata || {};
  const initial = useMemo(
    () => ({
      name: meta.name || displayName || "",
      second_name: meta.second_name || "",
      phone: meta.phone || "",
      avatar_color: meta.avatar_color || COLORS[0],
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [user?.id, user?.updated_at]
  );

  const [tab, setTab] = useState(() => window.location.hash.slice(1) || "profile");
  const [form, setForm] = useState(initial);
  const [touched, setTouched] = useState({});
  const [saving, setSaving] = useState(false);
  const [banner, setBanner] = useState(null);

  const [pw, setPw] = useState({ next: "", repeat: "" });
  const [showPw, setShowPw] = useState(false);
  const [pwBusy, setPwBusy] = useState(false);
  const [pwBanner, setPwBanner] = useState(null);
  const [leaving, setLeaving] = useState(false);

  useReveal([isAuthenticated, loading, tab]);
  useEffect(() => setForm(initial), [initial]);
  useEffect(() => {
    window.history.replaceState(null, "", `#${tab}`);
  }, [tab]);

  const say = (setter, type, text) => setter({ id: Date.now(), type, text });

  const errors = {
    name: form.name.trim().length < 2 ? t("acc.errName") : "",
    phone: form.phone && form.phone.replace(/\D/g, "").length !== 12 ? t("acc.errPhone") : "",
  };
  const dirty = Object.keys(initial).some((k) => (form[k] || "") !== (initial[k] || ""));
  const valid = !errors.name && !errors.phone;

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const save = async (e) => {
    e?.preventDefault();
    setTouched({ name: true, phone: true });
    if (!valid || !dirty) return;
    setSaving(true);
    try {
      await updateProfile({
        name: form.name.trim(),
        second_name: form.second_name.trim(),
        phone: form.phone,
        avatar_color: form.avatar_color,
      });
      say(setBanner, "success", t("acc.saved"));
    } catch (err) {
      say(setBanner, "error", err.message || t("acc.saveError"));
    } finally {
      setSaving(false);
    }
  };

  const score = passwordScore(pw.next);
  const pwMatch = pw.next && pw.next === pw.repeat;
  const pwReady = pw.next.length >= 8 && pwMatch;

  const changePassword = async (e) => {
    e.preventDefault();
    if (!pwReady) return;
    setPwBusy(true);
    try {
      await updatePassword(pw.next);
      setPw({ next: "", repeat: "" });
      say(setPwBanner, "success", t("acc.pwChanged"));
    } catch (err) {
      say(setPwBanner, "error", err.message || t("acc.saveError"));
    } finally {
      setPwBusy(false);
    }
  };

  const doLogout = async () => {
    setLeaving(true);
    try {
      await signOut();
    } finally {
      setTimeout(() => {
        window.location.href = "/";
      }, 650);
    }
  };
  const hold = useHoldToConfirm(doLogout, 1200);

  const since = user?.created_at ? new Date(user.created_at) : null;
  const days = since ? Math.max(1, Math.round((Date.now() - since.getTime()) / 86400000)) : 0;
  const tabIndex = TABS.findIndex((x) => x.id === tab);
  const fullName = `${form.name} ${form.second_name}`.trim();

  return (
    <div className={`account-page ${leaving ? "leaving" : ""}`}>
      <Navbar />

      <main className="acc-main">
        <div className="acc-container">
          {!loading && !isAuthenticated ? (
            <LockedContent compact />
          ) : (
            <>
              {/* Identity card */}
              <section className="acc-hero reveal">
                <div className="acc-hero-glow" style={{ background: form.avatar_color }} />
                <div className="acc-avatar" style={{ background: form.avatar_color }}>
                  {(form.name[0] || "N").toUpperCase()}
                  <i /><i />
                </div>
                <div className="acc-hero-text">
                  <h1 key={fullName}>{fullName || displayName}</h1>
                  <p>{user?.email}</p>
                  <span className="acc-badge">
                    <b />{user?.email_confirmed_at ? t("acc.verified") : t("acc.unverified")}
                  </span>
                </div>
                <div className="acc-stats">
                  <Stat value={count} label={t("acc.statItems")} />
                  <Stat value={items.length} label={t("acc.statProducts")} />
                  <Stat value={days} label={t("acc.statDays")} />
                </div>
              </section>

              <div className="acc-layout">
                {/* Tabs */}
                <nav className="acc-tabs" style={{ "--i": tabIndex }} role="tablist">
                  <span className="acc-tab-glider" />
                  {TABS.map((x) => (
                    <button key={x.id} type="button" role="tab" aria-selected={tab === x.id} className={tab === x.id ? "on" : ""} onClick={() => setTab(x.id)}>
                      <Svg d={x.icon} />
                      <span>{t(`acc.tab.${x.id}`)}</span>
                    </button>
                  ))}
                </nav>

                <section className="acc-panel" key={tab}>
                  {tab === "profile" && (
                    <form onSubmit={save} noValidate>
                      <h2>{t("acc.profileTitle")}</h2>
                      <p className="acc-sub">{t("acc.profileSub")}</p>

                      <div className="acc-grid">
                        <Field label={t("acc.name")} error={touched.name && errors.name} ok={touched.name && !errors.name}>
                          <input value={form.name} onChange={set("name")} onBlur={() => setTouched((x) => ({ ...x, name: true }))} maxLength={40} />
                        </Field>
                        <Field label={t("acc.secondName")}>
                          <input value={form.second_name} onChange={set("second_name")} maxLength={40} />
                        </Field>
                        <Field label={t("acc.phone")} error={touched.phone && errors.phone} ok={touched.phone && form.phone && !errors.phone}>
                          <input
                            value={form.phone}
                            inputMode="tel"
                            placeholder="+998 90 123 45 67"
                            onChange={(e) => setForm((f) => ({ ...f, phone: formatPhone(e.target.value) }))}
                            onBlur={() => setTouched((x) => ({ ...x, phone: true }))}
                          />
                        </Field>
                        <Field label="Email">
                          <input value={user?.email || ""} readOnly className="locked" />
                        </Field>
                      </div>

                      <span className="acc-label">{t("acc.color")}</span>
                      <div className="acc-colors" role="radiogroup">
                        {COLORS.map((c) => (
                          <button
                            key={c}
                            type="button"
                            role="radio"
                            aria-checked={form.avatar_color === c}
                            className={form.avatar_color === c ? "on" : ""}
                            style={{ "--c": c }}
                            onClick={() => setForm((f) => ({ ...f, avatar_color: c }))}
                          />
                        ))}
                      </div>

                      <Banner state={banner} />

                      <div className={`acc-savebar ${dirty ? "show" : ""}`}>
                        <span><i />{t("acc.unsaved")}</span>
                        <div>
                          <button type="button" className="ghost" onClick={() => { setForm(initial); setTouched({}); }}>{t("acc.reset")}</button>
                          <button type="submit" className="solid" disabled={saving || !dirty}>
                            {saving ? <b className="spin" /> : null}
                            {t("acc.save")}
                          </button>
                        </div>
                      </div>
                    </form>
                  )}

                  {tab === "security" && (
                    <form onSubmit={changePassword} noValidate>
                      <h2>{t("acc.secTitle")}</h2>
                      <p className="acc-sub">{t("acc.secSub")}</p>

                      <div className="acc-grid one">
                        <Field label={t("acc.newPw")}>
                          <div className="acc-pw">
                            <input type={showPw ? "text" : "password"} value={pw.next} onChange={(e) => setPw((p) => ({ ...p, next: e.target.value }))} autoComplete="new-password" />
                            <button type="button" onClick={() => setShowPw((v) => !v)}>{showPw ? t("acc.hide") : t("acc.show")}</button>
                          </div>
                        </Field>

                        <div className="acc-meter" data-score={pw.next ? score : -1}>
                          {[0, 1, 2, 3].map((i) => <span key={i} className={i < score ? "on" : ""} />)}
                          <em>{pw.next ? t(`acc.strength${score}`) : ""}</em>
                        </div>

                        <Field label={t("acc.repeatPw")} error={pw.repeat && !pwMatch ? t("acc.errMatch") : ""} ok={pw.repeat && pwMatch}>
                          <input type={showPw ? "text" : "password"} value={pw.repeat} onChange={(e) => setPw((p) => ({ ...p, repeat: e.target.value }))} autoComplete="new-password" />
                        </Field>
                      </div>

                      <ul className="acc-rules">
                        <li className={pw.next.length >= 8 ? "ok" : ""}>{t("acc.rule8")}</li>
                        <li className={/[A-Z]/.test(pw.next) && /[a-z]/.test(pw.next) ? "ok" : ""}>{t("acc.ruleCase")}</li>
                        <li className={/\d/.test(pw.next) ? "ok" : ""}>{t("acc.ruleNum")}</li>
                      </ul>

                      <Banner state={pwBanner} />

                      <button type="submit" className="solid wide" disabled={!pwReady || pwBusy}>
                        {pwBusy ? <b className="spin" /> : null}
                        {t("acc.changePw")}
                      </button>
                    </form>
                  )}

                  {tab === "prefs" && (
                    <div>
                      <h2>{t("acc.prefTitle")}</h2>
                      <p className="acc-sub">{t("acc.prefSub")}</p>

                      <span className="acc-label">{t("acc.language")}</span>
                      <div className="acc-choice" style={{ "--i": languages.indexOf(lang), "--n": languages.length }}>
                        <span className="acc-choice-glider" />
                        {languages.map((code) => (
                          <button key={code} type="button" className={lang === code ? "on" : ""} onClick={() => setLang(code)}>
                            <b>{code.toUpperCase()}</b>
                            <span>{code === "uz" ? "O‘zbekcha" : "Русский"}</span>
                          </button>
                        ))}
                      </div>

                      <span className="acc-label">{t("acc.theme")}</span>
                      <div className="acc-choice" style={{ "--i": isDark ? 1 : 0, "--n": 2 }}>
                        <span className="acc-choice-glider" />
                        <button type="button" className={!isDark ? "on" : ""} onClick={() => isDark && toggleTheme()}>
                          <b>☀</b><span>{t("acc.light")}</span>
                        </button>
                        <button type="button" className={isDark ? "on" : ""} onClick={() => !isDark && toggleTheme()}>
                          <b>☾</b><span>{t("acc.dark")}</span>
                        </button>
                      </div>
                    </div>
                  )}

                  {tab === "session" && (
                    <div>
                      <h2>{t("acc.sessionTitle")}</h2>
                      <p className="acc-sub">{t("acc.sessionSub")}</p>

                      <div className="acc-session">
                        <div className="acc-device"><Svg d="M4 5h16v11H4zM8 20h8M12 16v4" size={26} /></div>
                        <div>
                          <strong>{t("acc.thisDevice")}</strong>
                          <span>{user?.last_sign_in_at ? new Date(user.last_sign_in_at).toLocaleString(lang === "ru" ? "ru-RU" : "uz-UZ") : ""}</span>
                        </div>
                        <em><i />{t("acc.active")}</em>
                      </div>

                      <button type="button" className="acc-logout" {...hold.bind} style={{ "--p": hold.progress }}>
                        <span className="acc-logout-fill" />
                        <Svg d="M15 4h3a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-3M10 17l-5-5 5-5M5 12h11" />
                        <span>{hold.progress > 0 ? t("acc.logoutHold") : t("nav.logout")}</span>
                      </button>
                      <p className="acc-footnote">{t("acc.logoutHint")}</p>
                    </div>
                  )}
                </section>
              </div>
            </>
          )}
        </div>
      </main>

      <Footer />
      <div className="acc-curtain" />
    </div>
  );
}
