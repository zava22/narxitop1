import { useEffect, useMemo, useRef, useState } from "react";

import products from "../data/products.json";

import Navbar from "../components/layout/Navbar";
import Footer from "../components/layout/Footer";
import LockedContent from "../components/ui/LockedContent";

import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import { useLang } from "../context/LanguageContext";
import { formatPrice } from "../lib/constants";
import useReveal from "../hooks/useReveal";
import useCountUp from "../hooks/useCountUp";
import useHoldToConfirm from "../hooks/useHoldToConfirm";

import "./Cart.css";

const Icon = ({ children, ...rest }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...rest}>
    {children}
  </svg>
);

const CART_ICON = (
  <Icon>
    <path d="M3.5 4h2l1.8 10.1a2 2 0 0 0 2 1.7h7.9a2 2 0 0 0 1.9-1.5L21 7H7" />
    <circle cx="9.5" cy="19" r="1.2" />
    <circle cx="17" cy="19" r="1.2" />
  </Icon>
);

function Money({ value, className = "" }) {
  const shown = useCountUp(value);
  return <span className={className}>{formatPrice(shown)}</span>;
}

/* Hold-to-confirm "clear cart" button (no confirm() popups). */
function HoldClear({ onConfirm, label, hint }) {
  const { progress, bind } = useHoldToConfirm(onConfirm, 1000);
  return (
    <button type="button" className="cart-clear hold" {...bind} style={{ "--p": progress }}>
      <span className="hold-fill" />
      <Icon><path d="M4 7h16M10 11v6M14 11v6M6 7l1 12a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2l1-12M9 7V4h6v3" /></Icon>
      <span className="hold-label">{progress > 0 ? hint : label}</span>
    </button>
  );
}

export default function Cart() {
  const { t, tProduct, tUnit } = useLang();
  const { isAuthenticated, loading } = useAuth();
  const { items, count, setQty, removeItem, addItem, clear } = useCart();

  const [leaving, setLeaving] = useState(null); // slug being animated out
  const [undo, setUndo] = useState(null); // { slug, qty }
  const [mode, setMode] = useState("single"); // single store vs smart split
  const undoTimer = useRef(0);

  useReveal([isAuthenticated, loading, items.length]);
  useEffect(() => () => clearTimeout(undoTimer.current), []);

  const lines = useMemo(
    () =>
      items
        .map((item) => ({
          ...item,
          product: products.find((p) => p.slug === item.slug),
        }))
        .filter((l) => l.product)
        .map((l) => {
          const sorted = [...l.product.prices].sort((a, b) => a.price - b.price);
          return {
            ...l,
            sorted,
            best: sorted[0],
            worst: sorted[sorted.length - 1],
          };
        }),
    [items]
  );

  const analysis = useMemo(() => {
    const stores = [...new Set(lines.flatMap((l) => l.product.prices.map((p) => p.store)))];

    const storeTotals = stores
      .map((store) => {
        let total = 0;
        let available = 0;
        lines.forEach((l) => {
          const e = l.product.prices.find((p) => p.store === store);
          if (e) {
            total += Number(e.price) * l.qty;
            available += 1;
          }
        });
        return { store, total, complete: available === lines.length, available };
      })
      .sort((a, b) => a.total - b.total);

    const comparable = storeTotals.filter((e) => e.complete);
    const cheapest = comparable[0];
    const priciest = comparable[comparable.length - 1];

    // Smart split: every product from its own cheapest store.
    const splitTotal = lines.reduce((sum, l) => sum + Number(l.best.price) * l.qty, 0);
    const splitStores = {};
    lines.forEach((l) => {
      splitStores[l.best.store] = (splitStores[l.best.store] || 0) + 1;
    });

    const maxTotal = Math.max(...storeTotals.map((s) => s.total), 1);
    const savings = cheapest && priciest ? priciest.total - cheapest.total : 0;
    const splitSavings = cheapest ? cheapest.total - splitTotal : 0;

    return { storeTotals, cheapest, priciest, savings, splitTotal, splitStores, splitSavings, maxTotal };
  }, [lines]);

  const handleRemove = (line) => {
    setLeaving(line.slug);
    setTimeout(() => {
      removeItem(line.slug);
      setLeaving(null);
      setUndo({ slug: line.slug, qty: line.qty });
      clearTimeout(undoTimer.current);
      undoTimer.current = setTimeout(() => setUndo(null), 6000);
    }, 380);
  };

  const handleUndo = () => {
    if (!undo) return;
    for (let i = 0; i < undo.qty; i += 1) addItem(undo.slug);
    clearTimeout(undoTimer.current);
    setUndo(null);
  };

  const handleClear = () => {
    clear();
    setUndo(null);
  };

  const headline = mode === "split" ? analysis.splitTotal : analysis.cheapest?.total ?? analysis.splitTotal;
  const savingsShown = mode === "split" ? analysis.savings + Math.max(0, analysis.splitSavings) : analysis.savings;
  const ringPct = analysis.priciest?.total
    ? Math.min(100, Math.round((savingsShown / analysis.priciest.total) * 100))
    : 0;
  const R = 34;
  const C = 2 * Math.PI * R;

  return (
    <div className="cart-page">
      <Navbar />

      <main className="cart-main">
        <div className="cart-container">
          <div className="cart-heading">
            <div className="cart-heading-icon">{CART_ICON}</div>
            <div>
              <h1>{t("cart.title")}</h1>
              <p>{t("cart.subtitle")}</p>
            </div>
            {lines.length > 0 && (
              <div className="cart-heading-count" key={count}>{t("cart.items", { n: count })}</div>
            )}
          </div>

          {!loading && !isAuthenticated ? (
            <LockedContent compact />
          ) : lines.length === 0 ? (
            <section className="cart-empty reveal">
              <div className="cart-empty-icon">{CART_ICON}</div>
              <h2>{t("cart.emptyTitle")}</h2>
              <p>{t("cart.emptyText")}</p>
              <a href="/" className="cart-empty-button">
                <Icon><path d="m15 18-6-6 6-6" /></Icon>
                <span>{t("cart.start")}</span>
              </a>

              {undo && (
                <button type="button" className="cart-undo-inline" onClick={handleUndo}>
                  ↶ {t("cart.undo")}
                </button>
              )}
            </section>
          ) : (
            <div className="cart-layout">
              <section className="cart-items">
                {lines.map((line, index) => {
                  const lineTotal = Number(line.best.price) * line.qty;
                  return (
                    <article
                      className={`cart-item reveal ${leaving === line.slug ? "leaving" : ""}`}
                      key={line.slug}
                      style={{ transitionDelay: `${index * 60}ms` }}
                    >
                      <a href={`/product/${line.slug}`} className="cart-item-thumb">
                        <img src={line.product.image} alt={tProduct(line.product, "name")} className="cart-item-image" />
                      </a>

                      <div className="cart-item-info">
                        <a href={`/product/${line.slug}`} className="cart-item-name">
                          {tProduct(line.product, "name")}
                        </a>
                        <span className="cart-item-unit">{tUnit(line.product.unit)}</span>

                        <div className="cart-chips">
                          {line.sorted.map((entry, i) => (
                            <span
                              key={entry.store}
                              className={`cart-chip ${i === 0 ? "cheapest" : ""}`}
                              style={{ animationDelay: `${i * 90}ms` }}
                            >
                              {i === 0 && <Icon><path d="m5 12 4.5 4.5L19 7" /></Icon>}
                              <b>{entry.store}</b>
                              <em>{formatPrice(entry.price)}</em>
                            </span>
                          ))}
                        </div>
                      </div>

                      <div className="cart-item-side">
                        <div className="cart-qty">
                          <button type="button" onClick={() => setQty(line.slug, line.qty - 1)} aria-label="-">−</button>
                          <span key={line.qty}>{line.qty}</span>
                          <button type="button" onClick={() => setQty(line.slug, line.qty + 1)} aria-label="+">+</button>
                        </div>

                        <div className="cart-line-total">
                          <small>{t("cart.bestAt", { store: line.best.store })}</small>
                          <Money value={lineTotal} className="cart-line-price" />
                        </div>

                        <button type="button" className="cart-remove" onClick={() => handleRemove(line)} aria-label={t("cart.remove")}>
                          <Icon><path d="M6 6l12 12M18 6 6 18" /></Icon>
                          <span>{t("cart.remove")}</span>
                        </button>
                      </div>
                    </article>
                  );
                })}

                <div className="cart-actions-row">
                  <HoldClear
                    onConfirm={handleClear}
                    label={`${t("cart.clear")} (${t("cart.items", { n: count })})`}
                    hint={t("cart.holdHint")}
                  />
                  <a href="/" className="cart-continue">{t("cart.start")} →</a>
                </div>
              </section>

              <aside className="cart-summary reveal">
                <h2>{t("cart.compare")}</h2>

                <div className="cart-mode" data-mode={mode}>
                  <span className="cart-mode-glider" />
                  <button type="button" className={mode === "single" ? "on" : ""} onClick={() => setMode("single")}>
                    {t("cart.modeSingle")}
                  </button>
                  <button type="button" className={mode === "split" ? "on" : ""} onClick={() => setMode("split")}>
                    {t("cart.modeSplit")}
                  </button>
                </div>

                <div key={mode} className="cart-mode-body">
                  {mode === "single" ? (
                    analysis.storeTotals.map((entry, i) => {
                      const best = analysis.cheapest?.store === entry.store;
                      return (
                        <div key={entry.store} className={`cart-store-row ${best ? "best" : ""} ${entry.complete ? "" : "partial"}`} style={{ animationDelay: `${i * 80}ms` }}>
                          <div className="cart-store-head">
                            <span>
                              {entry.store}
                              {best && <i className="cart-store-flag">{t("detail.cheapest")}</i>}
                              {!entry.complete && <i className="cart-store-flag warn">{entry.available}/{lines.length}</i>}
                            </span>
                            <Money value={entry.total} className="cart-store-total" />
                          </div>
                          <div className="cart-bar"><span style={{ width: `${(entry.total / analysis.maxTotal) * 100}%` }} /></div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="cart-split">
                      <p>{t("cart.splitInfo")}</p>
                      {Object.entries(analysis.splitStores).map(([store, n]) => (
                        <div key={store} className="cart-store-row best">
                          <div className="cart-store-head">
                            <span>{store}</span>
                            <span className="cart-split-n">{t("cart.items", { n })}</span>
                          </div>
                          <div className="cart-bar"><span style={{ width: `${(n / lines.length) * 100}%` }} /></div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="cart-best">
                  <div>
                    <span>{mode === "split" ? t("cart.splitTotal") : t("cart.cheapestStore")}</span>
                    <strong>{mode === "split" ? t("cart.modeSplit") : analysis.cheapest ? analysis.cheapest.store : "—"}</strong>
                  </div>
                  <Money value={headline} className="cart-best-total" />
                </div>

                {savingsShown > 0 && (
                  <div className="cart-savings">
                    <svg viewBox="0 0 80 80" className="cart-ring" aria-hidden="true">
                      <circle cx="40" cy="40" r={R} className="ring-bg" />
                      <circle cx="40" cy="40" r={R} className="ring-fg" strokeDasharray={C} strokeDashoffset={C - (C * ringPct) / 100} />
                      <text x="40" y="45" textAnchor="middle">{ringPct}%</text>
                    </svg>
                    <div>
                      <span>{t("cart.youSave")}</span>
                      <Money value={savingsShown} className="cart-savings-sum" />
                    </div>
                  </div>
                )}
              </aside>
            </div>
          )}
        </div>

        {undo && lines.length > 0 && (
          <div className="cart-undo" key={undo.slug + undo.qty}>
            <span>{t("cart.removedItem")}</span>
            <button type="button" onClick={handleUndo}>↶ {t("cart.undo")}</button>
            <i className="cart-undo-timer" />
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
