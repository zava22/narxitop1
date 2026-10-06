import products from "../data/products.json";

import Navbar from "../components/layout/Navbar";
import Footer from "../components/layout/Footer";
import LockedContent from "../components/ui/LockedContent";

import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import { useLang } from "../context/LanguageContext";
import { formatPrice } from "../lib/constants";
import { toast } from "../lib/toast";
import useReveal from "../hooks/useReveal";

import "./ProductDetail.css";

function getProductFromUrl() {
  const path = window.location.pathname;
  const parts = path.split("/").filter(Boolean);

  if (parts[0] !== "product" || !parts[1]) {
    return null;
  }

  return products.find((product) => product.slug === parts[1]);
}

function getCheapestPrice(prices) {
  return Math.min(
    ...prices.map((item) => Number(item.price))
  );
}

export default function ProductDetail() {
  const { t, tCategory, tProduct, tUnit } = useLang();
  const { isAuthenticated, loading } = useAuth();
  const { addItem } = useCart();

  const product = getProductFromUrl();

  useReveal([product?.slug, isAuthenticated, loading]);

  // Guests must register before they can see product pages.
  if (!loading && !isAuthenticated) {
    return (
      <div className="product-detail-page-wrapper">
        <Navbar />

        <main className="product-detail-not-found">
          <LockedContent />
        </main>

        <Footer />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="product-detail-page-wrapper">
        <Navbar />

        <main className="product-detail-not-found">
          <div className="product-detail-not-found-box">

            <h1>{t("detail.notFound")}</h1>

            <p>{t("detail.notFoundText")}</p>

            <a
              href="/"
              className="product-detail-back-button"
            >
              {t("detail.back")}
            </a>

          </div>
        </main>

        <Footer />
      </div>
    );
  }

  const productName = tProduct(product, "name");
  const cheapestPrice = getCheapestPrice(product.prices);
  const mostExpensive = Math.max(
    ...product.prices.map((item) => Number(item.price))
  );

  const cheapestStore = product.prices.find(
    (item) => Number(item.price) === cheapestPrice
  );

  /*
   * Similar products:
   * - same category
   * - current product excluded
   * - first 8 products only
   */
  const similarProducts = products
    .filter(
      (item) =>
        item.id !== product.id &&
        item.category === product.category
    )
    .slice(0, 8);

  return (
    <div className="product-detail-page-wrapper">

      <Navbar />

      <main className="product-detail-page">

        <div className="product-detail-container">

          {/* =====================================
              BACK
              ===================================== */}

          <a
            href="/"
            className="product-detail-back"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="m15 18-6-6 6-6" />
            </svg>

            <span>{t("detail.back")}</span>
          </a>


          {/* =====================================
              MAIN PRODUCT
              ===================================== */}

          <section className="product-detail-card reveal">

            {/* Product image */}

            <div className="product-detail-image-section">

              <div className="product-detail-image-box">

                <img
                  src={product.image}
                  alt={productName}
                  className="product-detail-image"
                />

              </div>

            </div>


            {/* Product information */}

            <div className="product-detail-info">

              {/* Category */}

              <div className="product-detail-category">

                <span className="product-detail-category-dot" />

                <span>
                  {tCategory(product.category)}
                </span>

              </div>


              {/* Name */}

              <h1 className="product-detail-title">
                {productName}
              </h1>


              {/* Unit */}

              <div className="product-detail-unit">
                {tUnit(product.unit)}
              </div>


              {/* Description */}

              <p className="product-detail-description">
                {tProduct(product, "desc")}
              </p>


              {/* =================================
                  BEST PRICE
                  ================================= */}

              <div className="product-detail-best-price">

                <div className="best-price-label">
                  {t("detail.bestPrice")}
                </div>

                <div className="best-price-value">
                  {formatPrice(cheapestPrice)}
                </div>

                {mostExpensive > cheapestPrice && (
                  <div className="best-price-save">
                    {t("detail.save", {
                      amount: formatPrice(mostExpensive - cheapestPrice),
                    })}
                  </div>
                )}

                <div className="best-price-store">

                  <span>✓</span>

                  <span>
                    {cheapestStore?.store || t("detail.store")}
                  </span>

                </div>

              </div>


              {/* =================================
                  STORE PRICES
                  ================================= */}

              <div className="product-detail-prices">

                <h2>
                  {t("detail.storePrices")}
                </h2>

                <div className="detail-price-list">

                  {product.prices.map(
                    (item, index) => {

                      const isCheapest =
                        Number(item.price) === cheapestPrice;

                      return (
                        <div
                          key={`${item.store}-${index}`}
                          className={`detail-price-row ${
                            isCheapest
                              ? "detail-price-cheapest"
                              : ""
                          }`}
                        >

                          <div className="detail-store">

                            <span
                              className={`detail-store-logo detail-store-${item.store.toLowerCase()}`}
                            >
                              {item.store === "Korzinka" && "K"}
                              {item.store === "Havas" && "H"}
                              {item.store === "Makro" && "M"}
                            </span>

                            <span className="detail-store-name">
                              {item.store}
                            </span>

                            {isCheapest && (
                              <span className="best-badge">
                                {t("detail.cheapest")}
                              </span>
                            )}

                          </div>

                          <span className="detail-store-price">
                            {formatPrice(item.price)}
                          </span>

                        </div>
                      );
                    }
                  )}

                </div>

              </div>


              {/* =================================
                  ACTIONS
                  ================================= */}

              <div className="product-detail-actions">

                <button
                  type="button"
                  className="product-detail-cart"
                  onClick={() => {
                    addItem(product.slug);
                    toast(t("products.added"));
                  }}
                >
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <path d="M3.5 4h2l1.8 10.1a2 2 0 0 0 2 1.7h7.9a2 2 0 0 0 1.9-1.5L21 7H7" />
                    <circle cx="9.5" cy="19" r="1.2" />
                    <circle cx="17" cy="19" r="1.2" />
                  </svg>

                  <span>
                    {t("products.addToCart")}
                  </span>
                </button>

                <a
                  href="/"
                  className="product-detail-continue"
                >
                  {t("detail.continue")}
                </a>

              </div>

            </div>

          </section>


          {/* =====================================
              SIMILAR PRODUCTS
              ===================================== */}

          {similarProducts.length > 0 && (
            <section className="similar-products-section">

              <div className="similar-products-header">

                <div>
                  <span className="similar-products-eyebrow">
                    {t("detail.alsoLike")}
                  </span>

                  <h2 className="similar-products-title">
                    {t("detail.similar")}
                  </h2>
                </div>

                <a
                  href="/"
                  className="similar-products-all"
                >
                  {t("detail.seeAll")}
                </a>

              </div>


              {/* Horizontal scrolling container */}

              <div className="similar-products-scroll">

                {similarProducts.map((similarProduct) => {

                  const similarCheapestPrice =
                    getCheapestPrice(
                      similarProduct.prices
                    );

                  return (
                    <article
                      key={similarProduct.id}
                      className="similar-product-card reveal"
                    >

                      <a
                        href={`/product/${similarProduct.slug}`}
                        className="similar-product-image-link"
                      >
                        <div className="similar-product-image-box">

                          <img
                            src={similarProduct.image}
                            alt={tProduct(similarProduct, "name")}
                            className="similar-product-image"
                            loading="lazy"
                          />

                        </div>
                      </a>


                      <div className="similar-product-category">
                        {tCategory(similarProduct.category)}
                      </div>


                      <a
                        href={`/product/${similarProduct.slug}`}
                        className="similar-product-name"
                      >
                        {tProduct(similarProduct, "name")}
                      </a>


                      <div className="similar-product-bottom">

                        <div>
                          <span className="similar-price-label">
                            {t("detail.best")}
                          </span>

                          <span className="similar-product-price">
                            {formatPrice(
                              similarCheapestPrice
                            )}
                          </span>
                        </div>

                        <span className="similar-product-arrow">
                          →
                        </span>

                      </div>

                    </article>
                  );
                })}

              </div>

            </section>
          )}

        </div>

      </main>

      <Footer />

    </div>
  );
}