import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import { supabase } from "../lib/supabase";

const AuthContext = createContext(null);

/*
 * IMPORTANT — these URLs must be allowed in
 * Supabase → Authentication → URL Configuration → Redirect URLs
 * (see SETUP.md). Otherwise the link in the confirmation email
 * opens an error page.
 */
const confirmUrl = () => `${window.location.origin}/auth/confirm`;

export function getDisplayName(user) {
  if (!user) return "";

  const meta = user.user_metadata || {};

  return (
    meta.name ||
    meta.given_name ||
    meta.full_name?.split(" ")[0] ||
    user.email?.split("@")[0] ||
    ""
  );
}

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    supabase.auth.getSession().then(({ data, error }) => {
      if (error) {
        console.error("Failed to get session:", error);
      }

      if (mounted) {
        setSession(data?.session ?? null);
        setUser(data?.session?.user ?? null);
        setLoading(false);
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession ?? null);
      setUser(newSession?.user ?? null);
      setLoading(false);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  /* ----------------------------- SIGN UP ----------------------------- */
  const signUp = useCallback(
    async ({ name, secondName, phone, email, password }) => {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: confirmUrl(),
          data: {
            name,
            second_name: secondName,
            phone,
          },
        },
      });

      if (error) throw error;

      // Supabase returns a user with no identities (and no error) when
      // the e-mail is already registered — treat it as an error.
      if (data?.user && data.user.identities?.length === 0) {
        throw new Error("User already registered");
      }

      return data;
    },
    []
  );

  /* ----------------------- RESEND CONFIRMATION ----------------------- */
  const resendConfirmation = useCallback(async (email) => {
    const { data, error } = await supabase.auth.resend({
      type: "signup",
      email,
      options: { emailRedirectTo: confirmUrl() },
    });

    if (error) throw error;
    return data;
  }, []);

  /* ----------------------------- SIGN IN ----------------------------- */
  const signIn = useCallback(async ({ email, password }) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;
    return data;
  }, []);

  /* ------------------------------ GOOGLE ------------------------------ */
  const signInWithGoogle = useCallback(async () => {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/`,
        queryParams: { prompt: "select_account" },
      },
    });

    if (error) throw error;
    return data;
  }, []);

  /* ----------------------------- SIGN OUT ----------------------------- */
  const signOut = useCallback(async () => {
    const { error } = await supabase.auth.signOut();

    if (error) throw error;

    setSession(null);
    setUser(null);
  }, []);

  /* -------------------------- PASSWORD RESET -------------------------- */
  const sendPasswordRecovery = useCallback(async (email) => {
    const { data, error } = await supabase.auth.resetPasswordForEmail(
      email,
      { redirectTo: `${window.location.origin}/reset-password` }
    );

    if (error) throw error;
    return data;
  }, []);

  const updatePassword = useCallback(async (newPassword) => {
    const { data, error } = await supabase.auth.updateUser({
      password: newPassword,
    });

    if (error) throw error;
    return data;
  }, []);

  /* --------------------------- UPDATE PROFILE --------------------------- */
  const updateProfile = useCallback(async (fields) => {
    const { data, error } = await supabase.auth.updateUser({ data: fields });

    if (error) throw error;
    if (data?.user) setUser(data.user);
    return data;
  }, []);

  const value = useMemo(
    () => ({
      session,
      user,
      loading,
      isAuthenticated: Boolean(user),
      displayName: getDisplayName(user),

      signUp,
      signIn,
      signInWithGoogle,
      signOut,
      resendConfirmation,
      sendPasswordRecovery,
      updatePassword,
      updateProfile,
    }),
    [
      session,
      user,
      loading,
      signUp,
      signIn,
      signInWithGoogle,
      signOut,
      resendConfirmation,
      sendPasswordRecovery,
      updatePassword,
      updateProfile,
    ]
  );

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }

  return context;
}
