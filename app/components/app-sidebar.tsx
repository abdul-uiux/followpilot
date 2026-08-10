"use client";

import Link from "next/link";

type AppSidebarProps = {
  activePage: "home" | "meetings" | "integrations" | "settings";
  onNewMeeting?: () => void;
};

const navItems = [
  { key: "home", label: "Home", href: "/", icon: "/figma-icons/home.svg" },
  { key: "meetings", label: "Meetings", href: "/meetings", icon: "/figma-icons/folder-clock.svg" },
  { key: "integrations", label: "Integrations", href: "/integrations", icon: "/figma-icons/puzzle.svg" },
  { key: "settings", label: "Settings", href: "/settings", icon: "/figma-icons/settings.svg" },
] as const;

export function AppSidebar({ activePage }: AppSidebarProps) {

  return (
    <aside className="fixed inset-y-0 left-0 z-20 hidden w-60 border-r border-[#e8e7e4] bg-[#fbfbfa] px-3 py-4 lg:flex lg:flex-col">
      <Link href="/" className="flex items-center gap-2.5 px-2">
        <div className="grid h-7 w-7 place-items-center rounded-md bg-[#191919] text-xs font-bold text-white">F</div>
        <span className="text-sm font-semibold tracking-[-0.02em]">FollowPilot</span>
      </Link>

      <nav aria-label="Primary navigation" className="mt-6 space-y-1 text-[13px] leading-5">
        {navItems.map((item) => {
          const isActive = item.key === activePage;
          const className = `flex items-center gap-3 rounded-md px-3 py-2 transition ${isActive ? "bg-[#e9e9e7] font-medium text-[#191919] hover:text-[#191919]" : "text-[#625f5c] hover:bg-[#efefed] hover:text-[#191919]"}`;
          const contents = <><span aria-hidden="true" className="h-6 w-6 shrink-0 bg-current [mask-position:center] [mask-repeat:no-repeat] [mask-size:contain] [-webkit-mask-position:center] [-webkit-mask-repeat:no-repeat] [-webkit-mask-size:contain]" style={{ maskImage: `url(${item.icon})`, WebkitMaskImage: `url(${item.icon})` }} />{item.label}</>;

          return item.href.startsWith("#") ? (
            <a key={item.key} href={item.href} className={className}>{contents}</a>
          ) : (
            <Link key={item.key} href={item.href} aria-current={isActive ? "page" : undefined} className={className}>{contents}</Link>
          );
        })}
      </nav>

    </aside>
  );
}
