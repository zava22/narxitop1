import { useLang } from "../../context/LanguageContext";
import "./LockedContent.css";

/* Shown instead of products/cart/search when the visitor is not signed in. */
export default function LockedContent({ compact = false }) {
  const { t } = useLang();

  return (
    <div className={`locked ${compact ? "locked-compact" : ""} reveal`}>
      <div className="locked-icon" aria-hidden="true">
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <rect x="4" y="10.5" width="16" height="10" rx="2.5" />
          <path d="M8 10.5V7.5a4 4 0 0 1 8 0v3" />
          <circle cx="12" cy="15.5" r="1.2" />
        </svg>
      </div>

      <h3 className="locked-title">{t("lock.title")}</h3>
      <p className="locked-text">{t("lock.text")}</p>

      <ul className="locked-perks">
        <li>✓ {t("lock.perk1")}</li>
        <li>✓ {t("lock.perk2")}</li>
        <li>✓ {t("lock.perk3")}</li>
      </ul>

      <div className="locked-actions">
        <a href="/auth?mode=signup" className="locked-primary">
          {t("lock.register")}
        </a>
        <a href="/auth" className="locked-secondary">
          {t("lock.login")}
        </a>
      </div>
    </div>
  );
}
