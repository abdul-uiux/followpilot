"use client";

import Link from "next/link";
import { signOut } from "firebase/auth";
import { useEffect, useRef, useState } from "react";
import { firebaseAuth } from "../lib/firebase";
import { useAuth } from "./auth-provider";

export function AccountMenu() {
  const { user, displayName, initials } = useAuth();
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const closeMenu = (event: MouseEvent) => {
      if (!menuRef.current?.contains(event.target as Node)) setOpen(false);
    };
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", closeMenu);
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.removeEventListener("mousedown", closeMenu);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, []);

  const logout = async () => {
    setOpen(false);
    if (firebaseAuth) await signOut(firebaseAuth);
    window.location.assign("/");
  };

  return (
    <div ref={menuRef} className="relative hidden sm:block">
      <button
        type="button"
        aria-label="Open account menu"
        aria-expanded={open}
        aria-controls="account-menu"
        onClick={() => setOpen((current) => !current)}
        className="flex items-center gap-2.5 rounded-md px-1.5 py-1 text-left transition hover:bg-[#efefed] focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-[#e9e9e7]"
      >
        <div className="grid h-7 w-7 shrink-0 place-items-center overflow-hidden rounded-full bg-[#e8e7e4] bg-cover bg-center text-[10px] font-semibold text-[#191919]" style={user?.photoURL ? { backgroundImage: `url(${user.photoURL})` } : undefined}>{user?.photoURL ? <span className="sr-only">{displayName}</span> : initials}</div>
        <div className="max-w-40 min-w-0">
          <p className="truncate text-[12px] font-medium leading-4 text-[#191919]">{displayName}</p>
          <p className="truncate text-[10px] leading-3 text-[#787774]">{user?.email ?? ""}</p>
        </div>
        <svg aria-hidden="true" className={`h-3.5 w-3.5 shrink-0 text-[#787774] transition-transform duration-150 ${open ? "rotate-180" : ""}`} viewBox="0 0 16 16" fill="none">
          <path d="m4 6 4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {open && (
        <div id="account-menu" role="menu" className="absolute right-0 top-[calc(100%+8px)] z-40 w-44 rounded-lg border border-[#e1e0dd] bg-white p-1 shadow-[0_1px_2px_rgba(0,0,0,0.03)]">
          <Link href="/settings" role="menuitem" onClick={() => setOpen(false)} className="flex items-center gap-2.5 rounded-md px-2.5 py-2 text-[13px] text-[#4f4d4a] transition hover:bg-[#f1f1ef] hover:text-[#191919]">
            <span aria-hidden="true" className="grid h-5 w-5 shrink-0 place-items-center"><span className="h-4 w-4 bg-current [mask-image:url('/figma-icons/settings.svg')] [mask-position:center] [mask-repeat:no-repeat] [mask-size:contain] [-webkit-mask-image:url('/figma-icons/settings.svg')] [-webkit-mask-position:center] [-webkit-mask-repeat:no-repeat] [-webkit-mask-size:contain]" /></span>
            Settings
          </Link>
          <button type="button" role="menuitem" onClick={() => void logout()} className="flex w-full cursor-pointer items-center gap-2.5 rounded-md px-2.5 py-2 text-left text-[13px] text-[#4f4d4a] transition hover:bg-[#f1f1ef] hover:text-[#191919]">
            <span aria-hidden="true" className="grid h-5 w-5 shrink-0 place-items-center"><svg className="h-4 w-4" viewBox="0 0 16 16" fill="none"><path d="M6.4 3H3.8A1.8 1.8 0 0 0 2 4.8v6.4A1.8 1.8 0 0 0 3.8 13h2.6M9.5 5.2 12.3 8 9.5 10.8M5.5 8h6.6" stroke="currentColor" strokeWidth="1.35" strokeLinecap="round" strokeLinejoin="round" /></svg></span>
            Log out
          </button>
        </div>
      )}
    </div>
  );
}
