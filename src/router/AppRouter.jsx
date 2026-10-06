import Home from "../pages/Home";
import Search from "../pages/Search";
import Cart from "../pages/Cart";
import ProductDetail from "../pages/ProductDetail";
import Auth from "../pages/Auth";
import Account from "../pages/Account";
import AuthConfirm from "../pages/AuthConfirm";

export default function AppRouter() {
  // Remove a trailing slash ("/auth/" → "/auth") but keep "/"
  const pathname =
    window.location.pathname.replace(/\/+$/, "") || "/";

  if (pathname === "/") return <Home />;

  // Email confirmation page (the link in the e-mail points here)
  if (pathname === "/auth/confirm") return <AuthConfirm />;

  // Login / sign up
  if (pathname === "/auth") return <Auth />;

  if (pathname === "/account") return <Account />;

  if (pathname === "/search") return <Search />;
  if (pathname === "/cart") return <Cart />;
  if (pathname.startsWith("/product/")) return <ProductDetail />;

  // Unknown URL → Home
  return <Home />;
}
