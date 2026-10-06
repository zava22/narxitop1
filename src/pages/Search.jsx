import products from "../data/products.json";

import Navbar from "../components/layout/Navbar";
import Footer from "../components/layout/Footer";
import LockedContent from "../components/ui/LockedContent";
import { ProductCard } from "../components/products/ProductsSection";

import { useAuth } from "../context/AuthContext";
import { useLang } from "../context/LanguageContext";
import useReveal from "../hooks/useReveal";

import "../components/products/ProductsSection.css";
import "./Search.css";

const POPULAR = [
  ["Fanta", "fanta"],
  ["Pepsi", "pepsi"],
  ["Lay's", "lays"],
  ["Coca-Cola", "cola"],
  ["Banan", "banan"],
  ["Sut", "sut"],
];

export default function Search() {
  const { t, tProduct, tCategory } = useLang();
  const { isAuthenticated, loading } = useAuth();

  const query = (
    new URLSearchParams(window.location.search).get("q") || ""
  ).trim();

  const needle = query.toLowerCase();

  const results = needle
    ? products.filter((product) =>
        [
          product.name,
          product.slug,
          product.category,
          product.description,
          tProduct(product, "name"),
          tProduct(product, "desc"),
          tCategory(product.category),
        ]
          .join(" ")
          .toLowerCase()
          .includes(needle)
      )
    : [];

  useReveal([query, isAuthenticated, loading]);

  return (
    <div className="search-page">
      <Navbar />

      <main className="search-main">
        <div className="search-container">
          {/* Page heading */}
          <div className="search-heading">
            <span className="search-heading-icon">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <circle cx="11" cy="11" r="7" />
                <path d="m20 20-4-4" />
              </svg>
            </span>

            <div>
              <h1>{t("search.title")}</h1>
              <p>{t("search.subtitle")}</p>
            </div>
          </div>

          {!loading && !isAuthenticated ? (
            <LockedContent compact />
          ) : (
            <>
              {/* Search box */}
              <form className="search-box" action="/search">
                <div className="search-input-wrapper">
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <circle cx="11" cy="11" r="7" />
                    <path d="m20 20-4-4" />
                  </svg>

                  <input
                    type="text"
                    name="q"
                    defaultValue={query}
                    placeholder={t("search.placeholder")}
                    aria-label={t("search.aria")}
                  />
                </div>

                <button type="submit" className="search-submit">
                  {t("search.button")}
                </button>
              </form>

              {/* Popular searches */}
              <div className="popular-searches">
                <div className="popular-title">{t("search.popular")}</div>

                <div className="popular-list">
                  {POPULAR.map(([label, q]) => (
                    <a key={q} href={`/search?q=${q}`}>
                      {label}
                    </a>
                  ))}
                </div>
              </div>

              {/* Results / empty states */}
              {!query && (
                <div className="search-empty">
                  <div className="search-empty-icon">
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.6"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden="true"
                    >
                      <circle cx="11" cy="11" r="6.5" />
                      <path d="m16 16 5 5" />
                      <path d="M8.5 11h5" />
                    </svg>
                  </div>

                  <h2>{t("search.emptyTitle")}</h2>
                  <p>{t("search.emptyText")}</p>
                </div>
              )}

              {query && results.length === 0 && (
                <div className="search-empty">
                  <h2>{t("search.noResults", { q: query })}</h2>
                  <p>{t("search.tryOther")}</p>
                </div>
              )}

              {results.length > 0 && (
                <>
                  <p className="search-result-count">
                    {t("search.results", { q: query, n: results.length })}
                  </p>

                  <div className="products-grid">
                    {results.map((product, index) => (
                      <ProductCard
                        key={product.id}
                        product={product}
                        index={index}
                      />
                    ))}
                  </div>
                </>
              )}
            </>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
