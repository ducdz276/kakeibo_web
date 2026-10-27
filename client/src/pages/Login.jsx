import React, { useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

export default function Login() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Chuyển đổi ngôn ngữ và lưu lựa chọn
  const changeLanguage = async (lng) => {
    try {
      await i18n.changeLanguage(lng);
      localStorage.setItem("appLanguage", lng);
      setError("");
    } catch (err) {
      console.error("Lỗi chuyển ngôn ngữ:", err);
    }
  };

  // Xử lý đăng nhập
  const handleLogin = async (e) => {
    e.preventDefault();

    setError("");
    setLoading(true);

    try {
      const response = await axios.post(
        "http://localhost:5000/api/auth/login",
        {
          email: email.trim(),
          password,
        }
      );

      const data = response.data;

      if (!data.token) {
        setError(t("auth.server_error"));
        return;
      }

      localStorage.setItem("token", data.token);

      if (data.user) {
        localStorage.setItem("user", JSON.stringify(data.user));
      }

      navigate("/dashboard", { replace: true });
    } catch (err) {
      console.error("Lỗi đăng nhập:", err);

      setError(err.response?.data?.message || t("auth.server_error"));
    } finally {
      setLoading(false);
    }
  };

  const isVietnamese = (
    i18n.resolvedLanguage ||
    i18n.language ||
    "vi"
  ).startsWith("vi");

  const isJapanese = (
    i18n.resolvedLanguage ||
    i18n.language ||
    "vi"
  ).startsWith("ja");

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100 dark:bg-slate-950 px-4 py-8">
      <div className="w-full max-w-md rounded-2xl bg-white dark:bg-slate-900 shadow-xl p-8">
        {/* Chuyển đổi ngôn ngữ */}
        <div className="flex justify-end gap-2 mb-6">
          <button
            type="button"
            onClick={() => changeLanguage("vi")}
            aria-label="Tiếng Việt"
            aria-pressed={isVietnamese}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition ${
              isVietnamese
                ? "bg-violet-600 text-white"
                : "bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-200"
            }`}
          >
            🇻🇳
          </button>

          <button
            type="button"
            onClick={() => changeLanguage("ja")}
            aria-label="日本語"
            aria-pressed={isJapanese}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition ${
              isJapanese
                ? "bg-violet-600 text-white"
                : "bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-200"
            }`}
          >
            🇯🇵
          </button>
        </div>

        {/* Tiêu đề */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-violet-100 dark:bg-violet-500/20 text-violet-600 dark:text-violet-300 text-2xl font-bold mb-4">
            VNI
          </div>

          {/* <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white">
            span className="text-violet-600">.</span>
          </h1> */}

          <h2 className="text-xl font-semibold text-slate-800 dark:text-slate-100 mt-3">
            {t("auth.login_title")}
          </h2>
        </div>

        {/* Form đăng nhập */}
        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2"
            >
              {t("auth.email")}
            </label>

            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="example@email.com"
              required
              autoComplete="email"
              disabled={loading}
              className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 px-4 py-3 outline-none focus:ring-2 focus:ring-violet-500 focus:border-violet-500 disabled:opacity-60"
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2"
            >
              {t("auth.password")}
            </label>

            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              autoComplete="current-password"
              disabled={loading}
              className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 px-4 py-3 outline-none focus:ring-2 focus:ring-violet-500 focus:border-violet-500 disabled:opacity-60"
            />
          </div>

          {error && (
            <p
              role="alert"
              className="rounded-lg bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 px-3 py-2 text-sm text-red-600 dark:text-red-400"
            >
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-violet-600 hover:bg-violet-700 active:bg-violet-800 disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold py-3 transition shadow-lg shadow-violet-600/20"
          >
            {loading ? "..." : t("auth.login_btn")}
          </button>
        </form>

        {/* Đăng ký */}
        <p className="text-center text-sm text-slate-600 dark:text-slate-400 mt-6">
          {t("auth.no_account")}{" "}
          <Link
            to="/register"
            className="font-semibold text-violet-600 hover:text-violet-700 dark:text-violet-400"
          >
            {t("auth.register_now")}
          </Link>
        </p>

        <p className="text-center text-xs text-slate-400 mt-8">
          © {new Date().getFullYear()} Finora
        </p>
      </div>
    </div>
  );
}
