import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { ExternalLink, Menu, Moon, Sun, X } from "lucide-react";

interface HeaderProps {
  theme: "light" | "dark";
  onToggleTheme: () => void;
}

export default function Header({ theme, onToggleTheme }: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  const isCalculatorActive =
    location.pathname === "/" ||
    location.pathname === "/grade" ||
    location.pathname === "/gpacpa";
  const isAboutActive =
    location.pathname === "/gioi-thieu" || location.pathname === "/about";

  const iconSrc = `${process.env.PUBLIC_URL}/icon-ndh-aplus.webp`;

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200/90 bg-white/95 backdrop-blur-sm dark:border-slate-800 dark:bg-slate-950/95">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-8 px-4 sm:px-6 lg:px-8">
        {/* Zone 1: Brand Wordmark */}
        <Link
          to="/"
          onClick={() => setMobileMenuOpen(false)}
          className="flex shrink-0 items-center gap-2.5 whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4169E1] focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-950 rounded-lg"
        >
          <img
            src={iconSrc}
            alt="Aplus"
            referrerPolicy="no-referrer"
            className="h-8 w-8 shrink-0 rounded-lg object-cover ring-1 ring-slate-200 dark:ring-slate-700"
          />
          <span className="text-base font-bold tracking-tight text-slate-900 dark:text-white">
            Aplus
          </span>
        </Link>

        {/* Zone 2: Primary Navigation Links */}
        <nav
          aria-label="Điều hướng chính"
          className="hidden md:flex items-center gap-7 text-sm font-medium"
        >
          <Link
            to="/"
            className={`whitespace-nowrap shrink-0 py-1 transition-colors ${
              isCalculatorActive
                ? "text-[#4169E1] dark:text-[#6F8FF2] font-semibold"
                : "text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white"
            }`}
          >
            Tính CPA &amp; GPA
          </Link>
          <a
            href="https://cms.ndh.io.vn/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 whitespace-nowrap shrink-0 py-1 text-slate-600 transition-colors hover:text-slate-900 dark:text-slate-300 dark:hover:text-white"
          >
            <span>Tạo bài viết</span>
            <ExternalLink className="h-3.5 w-3.5 opacity-60" aria-hidden="true" />
          </a>
          <a
            href="https://docs.ndh.io.vn/chia-se"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 whitespace-nowrap shrink-0 py-1 text-slate-600 transition-colors hover:text-slate-900 dark:text-slate-300 dark:hover:text-white"
          >
            <span>Chia sẻ tài liệu</span>
            <ExternalLink className="h-3.5 w-3.5 opacity-60" aria-hidden="true" />
          </a>
          <Link
            to="/gioi-thieu"
            className={`whitespace-nowrap shrink-0 py-1 transition-colors ${
              isAboutActive
                ? "text-[#4169E1] dark:text-[#6F8FF2] font-semibold"
                : "text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white"
            }`}
          >
            Giới thiệu
          </Link>
        </nav>

        {/* Zone 3: Theme Switcher & Mobile Drawer Trigger */}
        <div className="flex shrink-0 items-center gap-2">
          <button
            type="button"
            onClick={onToggleTheme}
            aria-label={
              theme === "dark"
                ? "Chuyển sang giao diện sáng"
                : "Chuyển sang giao diện tối"
            }
            title={
              theme === "dark"
                ? "Chuyển sang chế độ sáng"
                : "Chuyển sang chế độ tối"
            }
            className="inline-flex h-10 items-center gap-2 whitespace-nowrap shrink-0 rounded-lg border border-slate-200 bg-white px-3 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4169E1] dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800 dark:hover:text-white"
          >
            {theme === "dark" ? (
              <>
                <Sun className="h-4 w-4 text-amber-400" aria-hidden="true" />
                <span className="hidden sm:inline">Sáng</span>
              </>
            ) : (
              <>
                <Moon className="h-4 w-4 text-[#4169E1]" aria-hidden="true" />
                <span className="hidden sm:inline">Tối</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            aria-label={mobileMenuOpen ? "Đóng menu" : "Mở menu điều hướng"}
            aria-expanded={mobileMenuOpen}
            className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-700 transition-colors hover:bg-slate-50 md:hidden dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
          >
            {mobileMenuOpen ? (
              <X className="h-5 w-5" aria-hidden="true" />
            ) : (
              <Menu className="h-5 w-5" aria-hidden="true" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Navigation Drawer */}
      {mobileMenuOpen && (
        <div className="border-t border-slate-200 bg-white px-4 py-3 md:hidden dark:border-slate-800 dark:bg-slate-950">
          <nav className="flex flex-col gap-1" aria-label="Điều hướng di động">
            <Link
              to="/"
              onClick={() => setMobileMenuOpen(false)}
              className={`flex min-h-[44px] items-center rounded-lg px-3 text-sm font-medium transition-colors ${
                isCalculatorActive
                  ? "bg-[#4169E1]/10 text-[#4169E1] dark:bg-[#4169E1]/20 dark:text-[#9EB4FA]"
                  : "text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-900"
              }`}
            >
              Tính CPA &amp; GPA
            </Link>
            <a
              href="https://cms.ndh.io.vn/"
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => setMobileMenuOpen(false)}
              className="flex min-h-[44px] items-center justify-between rounded-lg px-3 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-900"
            >
              <span>Tạo bài viết</span>
              <ExternalLink className="h-4 w-4 opacity-60" aria-hidden="true" />
            </a>
            <a
              href="https://docs.ndh.io.vn/chia-se"
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => setMobileMenuOpen(false)}
              className="flex min-h-[44px] items-center justify-between rounded-lg px-3 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-900"
            >
              <span>Chia sẻ tài liệu</span>
              <ExternalLink className="h-4 w-4 opacity-60" aria-hidden="true" />
            </a>
            <Link
              to="/gioi-thieu"
              onClick={() => setMobileMenuOpen(false)}
              className={`flex min-h-[44px] items-center rounded-lg px-3 text-sm font-medium transition-colors ${
                isAboutActive
                  ? "bg-[#4169E1]/10 text-[#4169E1] dark:bg-[#4169E1]/20 dark:text-[#9EB4FA]"
                  : "text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-900"
              }`}
            >
              Giới thiệu
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}
