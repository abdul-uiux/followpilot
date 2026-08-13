"use client";

import { onAuthStateChanged, type User } from "firebase/auth";
import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { firebaseAuth } from "../lib/firebase";

type AuthContextValue = { user: User | null; loading: boolean; displayName: string; initials: string; refreshProfile: () => void; profileVersion: number };
const AuthContext = createContext<AuthContextValue | null>(null);

function profile(user: User | null) {
  const displayName = user?.displayName?.trim() || user?.email?.split("@")[0] || "Account";
  const initials = displayName.split(/\s+/).filter(Boolean).map((part) => part[0]).join("").slice(0, 2).toUpperCase() || "A";
  return { displayName, initials };
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(() => firebaseAuth !== null);
  const [profileVersion, setProfileVersion] = useState(0);

  useEffect(() => {
    if (!firebaseAuth) return;
    return onAuthStateChanged(firebaseAuth, (nextUser) => {
      setUser(nextUser);
      setLoading(false);
    });
  }, []);

  const value = useMemo(() => ({ user, loading, ...profile(user), refreshProfile: () => setProfileVersion((version) => version + 1), profileVersion }), [user, loading, profileVersion]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const value = useContext(AuthContext);
  if (!value) throw new Error("useAuth must be used inside AuthProvider.");
  return value;
}
