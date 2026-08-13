"use client";

import { AccountMenu } from "./account-menu";

function SearchIcon() {
  return <svg className="h-3.5 w-3.5 shrink-0" viewBox="0 0 16 16" fill="none" aria-hidden="true"><circle cx="7" cy="7" r="4.35" stroke="currentColor" strokeWidth="1.4" /><path d="m10.2 10.2 3 3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" /></svg>;
}

export function AppHeader({ title, subtitle, searchValue, onSearchChange, searchPlaceholder = "Search workspace" }: { title: string; subtitle: string; searchValue?: string; onSearchChange?: (value: string) => void; searchPlaceholder?: string }) {
  return <header className="grid h-14 grid-cols-[1fr_auto_1fr] items-center border-b border-[#e8e7e4] bg-[#fbfbfa] px-5 sm:px-7"><div><p className="text-sm font-medium">{title}</p><p className="text-[11px] text-[#787774]">{subtitle}</p></div><label className="hidden w-[512px] items-center gap-2 rounded-md border border-[#deddda] bg-white px-3 text-[#787774] transition focus-within:border-[#191919] focus-within:ring-4 focus-within:ring-[#e9e9e7] md:flex"><SearchIcon /><input value={searchValue} onChange={(event) => onSearchChange?.(event.target.value)} aria-label={searchPlaceholder} placeholder={searchPlaceholder} className="h-8 w-full bg-transparent text-[12px] text-[#191919] outline-none placeholder:text-[#9b9995]" /></label><div className="justify-self-end"><AccountMenu /></div></header>;
}
