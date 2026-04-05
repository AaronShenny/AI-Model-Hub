import { Link, useLocation } from "wouter";
import { Bot, GitCompare, Menu, X } from "lucide-react";
import { useState } from "react";

interface Props {
  compareCount: number;
}

export function Navbar({ compareCount }: Props) {
  const [location] = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const links = [
    { href: "/", label: "Directory" },
    { href: "/compare", label: "Compare", badge: compareCount > 0 ? compareCount : undefined },
    { href: "/glossary", label: "Glossary" },
  ];

  return (
    <nav className="sticky top-0 z-40 border-b border-border/60 bg-background/90 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14">
          <Link href="/" className="flex items-center gap-2 font-bold text-foreground hover:text-primary transition-colors">
            <Bot className="w-5 h-5 text-primary" />
            <span>AI Model Directory</span>
          </Link>

          <div className="hidden sm:flex items-center gap-1">
            {links.map(({ href, label, badge }) => (
              <Link
                key={href}
                href={href}
                className={`relative px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  location === href
                    ? "text-primary bg-primary/10"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                }`}
              >
                {label}
                {badge !== undefined && (
                  <span className="absolute -top-1 -right-1 text-[10px] bg-primary text-primary-foreground rounded-full min-w-[16px] h-4 flex items-center justify-center px-1 font-bold">
                    {badge}
                  </span>
                )}
              </Link>
            ))}
          </div>

          <button
            type="button"
            className="sm:hidden p-2 rounded-lg hover:bg-muted text-foreground"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {mobileOpen && (
          <div className="sm:hidden pb-3 border-t border-border/40 mt-1 pt-3 space-y-1">
            {links.map(({ href, label, badge }) => (
              <Link
                key={href}
                href={href}
                onClick={() => setMobileOpen(false)}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  location === href
                    ? "text-primary bg-primary/10"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                }`}
              >
                {label}
                {badge !== undefined && (
                  <span className="text-[10px] bg-primary text-primary-foreground rounded-full px-1.5 py-0.5 font-bold">
                    {badge}
                  </span>
                )}
              </Link>
            ))}
          </div>
        )}
      </div>
    </nav>
  );
}
