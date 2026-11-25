import React, { useEffect, useState } from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Header from "./components/Header";
import CalculatorPage from "./pages/CalculatorPage";
import AboutPage from "./pages/AboutPage";
import { loadTheme, saveTheme } from "./utils/storage";

export default function App() {
  const [theme, setTheme] = useState<"light" | "dark">(() => loadTheme());

  useEffect(() => {
    const root = document.documentElement;
    if (theme === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
    saveTheme(theme);
  }, [theme]);

  const handleToggleTheme = () => {
    setTheme((prev) => (prev === "dark" ? "light" : "dark"));
  };

  return (
    <Router basename={process.env.PUBLIC_URL}>
      <div className="flex min-h-screen flex-col bg-slate-50 text-slate-900 transition-colors duration-150 dark:bg-slate-950 dark:text-slate-100">
        <Header theme={theme} onToggleTheme={handleToggleTheme} />

        <div className="flex-1">
          <Routes>
            <Route path="/" element={<CalculatorPage />} />
            <Route path="/grade" element={<CalculatorPage />} />
            <Route path="/gpacpa" element={<CalculatorPage />} />
            <Route path="/gioi-thieu" element={<AboutPage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="*" element={<CalculatorPage />} />
          </Routes>
        </div>

        <footer className="mt-12 border-t border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950">
          <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-2 px-4 py-5 text-xs text-slate-500 sm:flex-row sm:px-6 lg:px-8 dark:text-slate-400">
            <span>Aplus grande | Người đồng hành</span>
            <span>Điểm số chỉ có thể tốt hơn</span>
          </div>
        </footer>
      </div>
    </Router>
  );
}
