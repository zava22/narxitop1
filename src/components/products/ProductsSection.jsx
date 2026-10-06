import products from "../../data/products.json";

import LockedContent from "../ui/LockedContent";

import { useAuth } from "../../context/AuthContext";
import { useCart } from "../../context/CartContext";
import { useLang } from "../../context/LanguageContext";
import { ALL_CATEGORIES } from "../../lib/constants";
import { toast } from "../../lib/toast";
import useReveal from "../../hooks/useReveal";

import "./ProductsSection.css";

function formatPrice(price) {
  return `${Number(price).toLocaleString("uz-UZ")} UZS`;
}

const FALLBACK_IMAGE =
  "data:image/svg+xml;charset=UTF-8," +
  encodeURIComponent(`
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="600"
      height="600"
      viewBox="0 0 600 600"
    >
      <rect width="600" height="600" fill="#faf6f2"/>
      <rect
        x="165"
        y="130"
        width="270"
        height="300"
        rx="28"
        fill="#ffffff"
        stroke="#e6dcd5"
        stroke-width="4"
      />
      <circle cx="300" cy="255" r="55" fill="#eaf5f2"/>
      <path
        d="M275 255h50M300 230v50"
        stroke="#4b9589"
        stroke-width="7"
        stroke-linecap="round"
      />
      <text
        x="300"
        y="365"
        text-anchor="middle"
        font-family="Arial, sans-serif"
        font-size="24"
        font-weight="700"
        fill="#847972"
      >
        NarxTop
      </text>
    </svg>
  `);

function handleImageError(event) {
  event.currentTarget.onerror = null;
  event.currentTarget.src = FALLBACK_IMAGE;
}

function getCategoryIcon(category) {
  switch (category) {
    case "Ichimliklar":
      return (
        <svg viewBox="0 0 24 24">
          <path d="M9 4h6l-.7 14.2A2 2 0 0 1 12.3 20h-.6a2 2 0 0 1-2-1.8L9 4Z" />
          <path d="M9.4 8h5.2M10 12h4M10 3h4" />
        </svg>
      );

    case "Sneklar":
      return (
        <svg viewBox="0 0 24 24">
          <path d="M7 7.5c0-1.4 1.1-2.5 2.5-2.5h5C15.9 5 17 6.1 17 7.5v1c0 1-.4 1.9-1.1 2.6L14 13v3.5c0 1.4-1.1 2.5-2.5 2.5h-1C9.1 19 8 17.9 8 16.5V13l-1.9-1.9C5.4 10.4 5 9.5 5 8.5v-1Z" />
          <path d="M10 8h4M9 10.5h6" />
        </svg>
      );

    case "Mevalar":
      return (
        <svg viewBox="0 0 24 24">
          <path d="M12 8.5c-3.2-2.7-7.5-.4-7.5 4.2 0 4.6 2.7 7.3 5.7 7.3 1 0 1.5-.4 1.8-.4s.8.4 1.8.4c3 0 5.7-2.7 5.7-7.3 0-4.6-4.3-6.9-7.5-4.2Z" />
          <path d="M12 7c-.2-2 1-3.5 3-4M12 7c-1.8-1.4-3.9-1.4-5.2-.2" />
        </svg>
      );

    case "Sabzavotlar":
      return (
        <svg viewBox="0 0 24 24">
          <path d="M7 14c2.3-1.3 6.7-1.3 9 0 1.2.7 1.7 2.3 1 3.5-1 1.8-4.1 3-6.5 3S5 19.3 4 17.5c-.7-1.2-.2-2.8 1-3.5Z" />
          <path d="M8 13.5c0-2.4 1.7-4.2 4-5M11.5 8.5c.2-2 1.7-3.5 3.7-3.5M13.5 8c1.8-1.1 3.5-.7 4.5.3" />
        </svg>
      );

    case "Shirinliklar":
      return (
        <svg viewBox="0 0 24 24">
          <path d="m8 7 4 1 4-1 2 4-2 4-4 1-4-1-2-4 2-4Z" />
          <path d="m6 5-2-1M18 5l2-1M6 19l-2 1M18 19l2 1" />
          <path d="M9 11h6M10 14h4" />
        </svg>
      );

    case "Go'sht":
      return (
        <svg viewBox="0 0 24 24">
          <path d="M8.5 4.5c1.8-.8 3.3.4 4.5 1.6l5.2 5.2c1.8 1.8 1.8 4.6.1 6.3-1.7 1.7-4.5 1.7-6.3-.1l-5.2-5.2C5.6 11.1 4.4 9.6 5.2 7.8c.6-1.4 1.9-2.6 3.3-3.3Z" />
          <circle cx="15.8" cy="15.1" r="1.4" />
        </svg>
      );

    case "Sut mahsulotlari":
      return (
        <svg viewBox="0 0 24 24">
          <path d="M8 5h8v14H8z" />
          <path d="M9.5 3.5h5M9 7h6M10 11h4" />
        </svg>
      );

    case "Non mahsulotlari":
      return (
        <svg viewBox="0 0 24 24">
          <path d="M5 10.5h14v7.2a2.3 2.3 0 0 1-2.3 2.3H7.3A2.3 2.3 0 0 1 5 17.7v-7.2Z" />
          <path d="M5 10.5c.2-2.5 2.2-4.5 5-4.5 1.1 0 2 .4 2 1.4 0-1 .9-1.4 2-1.4 2.8 0 4.8 2 5 4.5" />
        </svg>
      );

    default:
      return (
        <svg viewBox="0 0 24 24">
          <rect x="5" y="5" width="14" height="14" rx="2" />
          <path d="M8 9h8M8 13h8M8 17h5" />
        </svg>
      );
  }
}

export function ProductCard({ product, index = 0 }) {
  const { t, tCategory, tProduct, tUnit } = useLang();
  const { addItem } = useCart();

  const productName = tProduct(product, "name");

  const cheapestPrice = Math.min(
    ...product.prices.map((item) => Number(item.price))
  );

  return (
    <article
      className="product-card reveal"
      style={{ transitionDelay: `${Math.min(index, 8) * 60}ms` }}
    >
      <a
        href={`/product/${product.slug}`}
        className="product-image-link"
      >
        <div className="product-image-box">
          <img
            src={product.image}
            alt={productName}
            className="product-image"
            loading="lazy"
            onError={handleImageError}
          />
        </div>
      </a>

      <a
        href={`/product/${product.slug}`}
        className="product-title"
      >
        {productName}
      </a>

      <div className="product-category">
        <span className="product-category-icon">
          {getCategoryIcon(product.category)}
        </span>

        <span>{tCategory(product.category)}</span>
      </div>

      <div className="product-price-list">
        {product.prices.map((item, index) => {
          const isCheapest =
            Number(item.price) === cheapestPrice;

          return (
            <div
              className="product-price-row"
              key={`${product.id}-${item.store}-${index}`}
            >
              <div className="product-store">
                <span
                  className={`store-logo store-${item.store.toLowerCase()}`}
                >
                  {item.store === "Korzinka" && "K"}
                  {item.store === "Havas" && "H"}
                  {item.store === "Makro" && "M"}
                </span>

                <span className="store-name">
                  {item.store}
                </span>
              </div>

              <span
                className={`store-price ${
                  isCheapest
                    ? "cheapest-price"
                    : ""
                }`}
              >
                {formatPrice(item.price)}
              </span>
            </div>
          );
        })}
      </div>

      <button
        type="button"
        className="product-cart-button"
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

        <span>{t("products.addToCart")}</span>
      </button>
    </article>
  );
}

export default function ProductsSection({
  selectedCategory = ALL_CATEGORIES,
}) {
  const { t, tCategory } = useLang();
  const { isAuthenticated, loading } = useAuth();

  const filteredProducts =
    selectedCategory === ALL_CATEGORIES
      ? products
      : products.filter(
          (product) =>
            product.category === selectedCategory
        );

  useReveal([selectedCategory, isAuthenticated, loading]);

  // Guests must register before they can see the product cards.
  if (!loading && !isAuthenticated) {
    return (
      <section className="products-section" id="products">
        <div className="products-container">
          <LockedContent />
        </div>
      </section>
    );
  }

  return (
    <section
      className="products-section"
      id="products"
    >
      <div className="products-container">

        <div className="products-header">
          <div>
            <h2 className="products-title">
              {selectedCategory === ALL_CATEGORIES
                ? t("products.allTitle")
                : tCategory(selectedCategory).toUpperCase()}
            </h2>

            <p className="products-count">
              {t("products.count", { n: filteredProducts.length })}
            </p>
          </div>

          <button
            type="button"
            className="discount-button"
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
              <path d="M12 3v18" />
              <path d="M17 7.5c0-1.7-2.2-3-5-3s-5 1.3-5 3 2.2 3 5 3 5 1.3 5 3-2.2 3-5 3-5-1.3-5-3" />
            </svg>

            <span>{t("products.discount")}</span>

            <svg
              className="discount-arrow"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="m6 9 6 6 6-6" />
            </svg>
          </button>
        </div>

        {filteredProducts.length > 0 ? (
          <div className="products-grid">
            {filteredProducts.map((product, index) => (
              <ProductCard
                key={product.id}
                product={product}
                index={index}
              />
            ))}
          </div>
        ) : (
          <div className="products-empty">
            <div className="products-empty-icon">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.7"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="11" cy="11" r="7" />
                <path d="m20 20-4-4" />
              </svg>
            </div>

            <h3>{t("products.emptyTitle")}</h3>

            <p>{t("products.emptyText")}</p>
          </div>
        )}

      </div>
    </section>
  );
}