"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_ITEMS = [
  { href: "/", label: "Dashboard", icon: "📊" },
  { href: "/runway", label: "Runway", icon: "🛫" },
  { href: "/expenses", label: "Expenses", icon: "💸" },
  { href: "/forecast", label: "Forecast", icon: "📈" },
  { href: "/optimize", label: "Optimize", icon: "🚀" },
];

export default function NavBar() {
  const pathname = usePathname();

  return (
    <nav className="flex items-center gap-1 p-1 rounded-xl bg-white/[0.03] border border-white/5 backdrop-blur-md">
      {NAV_ITEMS.map((item) => {
        const active = pathname === item.href;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`
              flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200
              ${
                active
                  ? "bg-gradient-to-r from-violet-600/30 to-cyan-600/20 text-cyan-300 border border-cyan-500/20 shadow-lg shadow-cyan-500/5"
                  : "text-slate-400 hover:text-slate-200 hover:bg-white/5"
              }
            `}
          >
            <span className="text-base">{item.icon}</span>
            <span className="hidden sm:inline">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
