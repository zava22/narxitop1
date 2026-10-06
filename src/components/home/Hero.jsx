import { useLang } from "../../context/LanguageContext";

import useTypewriter from "../../hooks/useTypewriter";

import "./Hero.css";

export default function Hero() {
  const { t } = useLang();
  const typed = useTypewriter(
    [t("hero.title2"), t("hero.type2"), t("hero.type3")],
    { hold: 2200 }
  );

  return (
    <section className="hero-section hero-pro">
      <div className="hero-aurora" aria-hidden="true">
        <i /><i /><i />
      </div>
      <div className="hero-grid-bg" aria-hidden="true" />
      <div className="hero-container">
        <div className="hero-content">

          <h1 className="hero-title">
            {t("hero.title1")}
            <br />
            <span className="hero-typed">
              {typed}
              <span className="hero-caret" aria-hidden="true" />
            </span>

            <span className="hero-rocket" aria-hidden="true">
              <svg viewBox="0 0 24 24">
                <path d="M14.5 3.5c2.4-.9 4.7-.9 6 0 .9 1.3.9 3.6 0 6-1.1 3-3.8 5.9-7.1 7.2l-3.1-3.1c1.3-3.3 4.2-6 7.2-7.1Z" />
                <path d="m10.3 13.7-4 4" />
                <path d="M6.2 17.8 4 20l.3-3.1" />
                <path d="m10.2 7.2-3.4-.4-1.9 1.9 4.1 1.1" />
                <path d="m16.8 13.8.4 3.4-1.9 1.9-1.1-4.1" />
                <circle cx="16.8" cy="7.2" r="1.7" />
              </svg>
            </span>
          </h1>

          <p className="hero-description">{t("hero.desc")}</p>

          <div className="hero-actions">

            {/* Compare supermarkets */}
            <a href="#products" className="hero-button">
              <span className="hero-button-icon" aria-hidden="true">
                <svg viewBox="0 0 24 24">
                  <path d="M4 19h16" />
                  <path d="M6 17V7" />
                  <path d="M10 17V10" />
                  <path d="M14 17V5" />
                  <path d="M18 17v-8" />
                  <path d="M4 7h4M12 5h4M16 9h4" />
                </svg>
              </span>

              <span>{t("hero.btn1")}</span>
            </a>

            {/* Cart */}
            <a href="/cart" className="hero-button">
              <span className="hero-button-icon" aria-hidden="true">
                <svg viewBox="0 0 24 24">
                  <path d="M3.5 4h2l1.8 10.1a2 2 0 0 0 2 1.7h7.9a2 2 0 0 0 1.9-1.5L21 7H7" />
                  <circle cx="9.5" cy="19" r="1.2" />
                  <circle cx="17" cy="19" r="1.2" />
                </svg>
              </span>

              <span>{t("hero.btn2")}</span>
            </a>

            {/* Discounts */}
            <a href="#products" className="hero-button">
              <span className="hero-button-icon" aria-hidden="true">
                <svg viewBox="0 0 24 24">
                  <path d="m7.5 4.5 3-1.5 3 1.5 3.3-.2 1.4 2.9 2.8 1.7-.8 3.2.8 3.2-2.8 1.7-1.4 2.9-3.3-.2-3 1.5-3-1.5-3.3.2-1.4-2.9-2.8-1.7.8-3.2-.8-3.2 2.8-1.7 1.4-2.9 3.3.2Z" />
                  <path d="m9 15 6-6" />
                  <circle cx="9.5" cy="9.5" r="1" />
                  <circle cx="14.5" cy="14.5" r="1" />
                </svg>
              </span>

              <span>{t("hero.btn3")}</span>
            </a>

          </div>

        </div>
      </div>
    </section>
  );
}