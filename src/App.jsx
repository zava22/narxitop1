import { useEffect } from "react";

import AppRouter from "./router/AppRouter";
import Toaster from "./components/ui/Toaster";

import { useAuth } from "./context/AuthContext";
import { useLang } from "./context/LanguageContext";
import { toast } from "./lib/toast";

import "./App.css";

/* Greets the user (once per browser tab) right after they sign in. */
function WelcomeWatcher() {
  const { user, displayName } = useAuth();
  const { t } = useLang();

  useEffect(() => {
    if (!user) return;

    const key = `narxtop_welcomed_${user.id}`;

    try {
      if (sessionStorage.getItem(key)) return;
      sessionStorage.setItem(key, "1");
    } catch {
      /* ignore */
    }

    toast(t("auth.welcome", { name: displayName }), { confetti: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  return null;
}

function App() {
  return (
    <>
      <AppRouter />
      <WelcomeWatcher />
      <Toaster />
    </>
  );
}

export default App;
