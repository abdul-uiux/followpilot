import Image from "next/image";
import Link from "next/link";

type AppSidebarProps = {
  activePage: "home" | "meetings" | "settings";
  onNewMeeting?: () => void;
};

const navItems = [
  { key: "home", label: "Home", href: "/", icon: "/figma-icons/home.svg" },
  { key: "meetings", label: "Meetings", href: "/meetings", icon: "/figma-icons/folder-clock.svg" },
  { key: "integrations", label: "Integrations", href: "#integrations", icon: "/figma-icons/puzzle.svg" },
  { key: "settings", label: "Settings", href: "/settings", icon: "/figma-icons/settings.svg" },
] as const;

export function AppSidebar({ activePage, onNewMeeting }: AppSidebarProps) {
  const newMeetingClassName = "mt-6 flex items-center justify-center gap-2 rounded-lg bg-[#191919] px-4 py-2.5 text-[13px] font-medium text-white transition hover:bg-[#353535] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#d9d9d7]";

  return (
    <aside className="fixed inset-y-0 left-0 z-20 hidden w-60 border-r border-[#e8e7e4] bg-[#fbfbfa] px-3 py-4 lg:flex lg:flex-col">
      <Link href="/" className="flex items-center gap-2.5 px-2">
        <div className="grid h-7 w-7 place-items-center rounded-md bg-[#191919] text-xs font-bold text-white">F</div>
        <span className="text-sm font-semibold tracking-[-0.02em]">FollowPilot</span>
      </Link>

      {onNewMeeting ? (
        <button type="button" onClick={onNewMeeting} className={newMeetingClassName}>
          <span className="text-base leading-none">+</span> New meeting
        </button>
      ) : (
        <Link href="/" className={newMeetingClassName}>
          <span className="text-base leading-none">+</span> New meeting
        </Link>
      )}

      <nav aria-label="Primary navigation" className="mt-6 space-y-1 text-[13px] leading-5">
        {navItems.map((item) => {
          const isActive = item.key === activePage;
          const className = `flex items-center gap-3 rounded-md px-3 py-2 transition ${isActive ? "bg-[#e9e9e7] font-medium text-[#191919]" : "text-[#625f5c] hover:bg-[#efefed]"}`;
          const contents = <><Image src={item.icon} alt="" width={24} height={24} className="h-6 w-6 shrink-0" />{item.label}</>;

          return item.href.startsWith("#") ? (
            <a key={item.key} href={item.href} className={className}>{contents}</a>
          ) : (
            <Link key={item.key} href={item.href} aria-current={isActive ? "page" : undefined} className={className}>{contents}</Link>
          );
        })}
      </nav>

      <div className="mt-auto rounded-lg border border-[#e8e7e4] bg-white p-3">
        <div className="flex items-center gap-2.5">
          <div className="grid h-7 w-7 place-items-center rounded-full bg-[#e8e7e4] text-[10px] font-semibold">AR</div>
          <div className="min-w-0"><p className="truncate text-xs font-medium">Alex Rivera</p><p className="truncate text-[11px] text-[#787774]">Personal workspace</p></div>
        </div>
      </div>
    </aside>
  );
}
