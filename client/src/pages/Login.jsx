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
  const [showPassword, setShowPassword] = useState(false);

  const currentLanguage = i18n.resolvedLanguage || i18n.language || "vi";

  const isJapanese = currentLanguage.startsWith("ja");

  const changeLanguage = async (lng) => {
    try {
      await i18n.changeLanguage(lng);
      localStorage.setItem("appLanguage", lng);
      setError("");
    } catch (err) {
      console.error("Lỗi chuyển ngôn ngữ:", err);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();

    if (loading) return;

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

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#faf8f5] px-4 py-12 text-[#393448] selection:bg-[#e8defb] sm:px-6">
      {/* Background decorations */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -left-24 -top-24 h-72 w-72 rounded-full bg-[#eee5fb] opacity-70 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-24 -right-20 h-80 w-80 rounded-full bg-[#f9e4e5] opacity-60 blur-3xl"
      />

      {/* Language selector */}
      <div className="absolute right-4 top-5 z-10 sm:right-8 sm:top-7">
        <div className="flex items-center gap-1 rounded-full border border-[#e9e2e9] bg-white/80 p-1 shadow-sm backdrop-blur">
          <button
            type="button"
            onClick={() => changeLanguage("vi")}
            aria-label="Tiếng Việt"
            aria-pressed={!isJapanese}
            className={`rounded-full px-3 py-1.5 text-xs font-semibold transition-all ${
              !isJapanese
                ? "bg-[#eee7fb] text-[#7257a5]"
                : "text-[#817b89] hover:bg-[#f7f3fa]"
            }`}
          >
            VI
          </button>

          <button
            type="button"
            onClick={() => changeLanguage("ja")}
            aria-label="日本語"
            aria-pressed={isJapanese}
            className={`rounded-full px-3 py-1.5 text-xs font-semibold transition-all ${
              isJapanese
                ? "bg-[#f8e5e5] text-[#b85f68]"
                : "text-[#817b89] hover:bg-[#f7f3fa]"
            }`}
          >
            JA
          </button>
        </div>
      </div>

      <div className="relative z-0 w-full max-w-[440px]">
        {/* Finora brand */}
        <div className="mb-7 text-center">
          <Link
            to="/"
            className="inline-flex items-center gap-3 rounded-xl outline-none focus-visible:ring-2 focus-visible:ring-[#b8a2e8]"
            aria-label="Finora home"
          >
            <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#eee7fb] text-[#8066b5]">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                className="h-6 w-6"
                aria-hidden="true"
              >
                <path
                  d="M4 17.5 9 12l3.5 3.5L20 7"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M15.5 7H20v4.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </span>

            <span className="text-2xl font-bold tracking-tight text-[#393448]">
              Finora<span className="text-[#bc7d91]">.</span>
            </span>
          </Link>

          <div className="mt-5 flex items-center justify-center gap-2 text-[10px] font-medium tracking-[0.24em] text-[#a39aa8]">
            <span className="h-px w-7 bg-[#e7cbd0]" />
            YOUR FINANCIAL JOURNEY
            <span className="h-px w-7 bg-[#e7cbd0]" />
          </div>
        </div>

        <section className="rounded-[28px] border border-white bg-white/90 p-6 shadow-[0_20px_70px_rgba(82,62,104,0.08)] backdrop-blur-xl sm:p-9">
          <div className="mb-7">
            <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[#faf0f0] px-3 py-1.5 text-xs font-medium text-[#b66d79]">
              {/* <span className="h-1.5 w-1.5 rounded-full bg-[#d99ba3]" />
              {isJapanese ? "おかえりなさい" : "Chào mừng bạn trở lại"} */}
            </div>

            <h1 className="text-center text-2xl font-bold tracking-tight text-[#393448] sm:text-[28px]">
              {t("auth.login_title")}
            </h1>
          </div>

          {/* Error message */}
          {error && (
            <div
              role="alert"
              aria-live="polite"
              className="mb-5 flex items-start gap-2.5 rounded-xl border border-[#f0d5d7] bg-[#fff4f4] p-3.5 text-sm leading-5 text-[#ad555f]"
            >
              <span aria-hidden="true">!</span>
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-5">
            {/* Email */}
            <div>
              <label
                htmlFor="login-email"
                className="mb-2 block text-sm font-semibold text-[#514a5e]"
              >
                {t("auth.email")}
              </label>

              <div className="relative">
                <span className="pointer-events-none absolute inset-y-0 left-3.5 flex items-center text-[#aaa1b4]">
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.7"
                    className="h-5 w-5"
                    aria-hidden="true"
                  >
                    <rect x="3" y="5" width="18" height="14" rx="3" />
                    <path
                      d="m4 7 8 6 8-6"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </span>

                <input
                  id="login-email"
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setError("");
                  }}
                  placeholder={
                    isJapanese ? "メールアドレスを入力" : "Nhập email của bạn"
                  }
                  autoComplete="email"
                  maxLength={254}
                  required
                  disabled={loading}
                  className="w-full rounded-xl border border-[#e9e4ec] bg-[#fdfcfd] py-3.5 pl-11 pr-4 text-sm text-[#393448] outline-none transition placeholder:text-[#b8b1bf] hover:border-[#d8cce8] focus:border-[#b5a0dc] focus:bg-white focus:ring-4 focus:ring-[#eee7fb]/70 disabled:opacity-60"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label
                htmlFor="login-password"
                className="mb-2 block text-sm font-semibold text-[#514a5e]"
              >
                {t("auth.password")}
              </label>

              <div className="relative">
                <span className="pointer-events-none absolute inset-y-0 left-3.5 flex items-center text-[#aaa1b4]">
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.7"
                    className="h-5 w-5"
                    aria-hidden="true"
                  >
                    <rect x="4" y="10" width="16" height="11" rx="3" />
                    <path d="M8 10V7a4 4 0 0 1 8 0v3" strokeLinecap="round" />
                    <path d="M12 14v3" strokeLinecap="round" />
                  </svg>
                </span>

                <input
                  id="login-password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setError("");
                  }}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  required
                  disabled={loading}
                  className="w-full rounded-xl border border-[#e9e4ec] bg-[#fdfcfd] py-3.5 pl-11 pr-16 text-sm text-[#393448] outline-none transition placeholder:text-[#b8b1bf] hover:border-[#d8cce8] focus:border-[#b5a0dc] focus:bg-white focus:ring-4 focus:ring-[#eee7fb]/70 disabled:opacity-60"
                />

                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  aria-label={
                    showPassword
                      ? isJapanese
                        ? "パスワードを隠す"
                        : "Ẩn mật khẩu"
                      : isJapanese
                      ? "パスワードを表示"
                      : "Hiện mật khẩu"
                  }
                  className="absolute inset-y-0 right-3 flex items-center px-1 text-xs font-medium text-[#8e7aa8] transition hover:text-[#665080] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#b5a0dc]"
                >
                  {showPassword
                    ? isJapanese
                      ? "非表示"
                      : "Ẩn"
                    : isJapanese
                    ? "表示"
                    : "Hiện"}
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="group mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-[#8270b5] px-5 py-3.5 text-sm font-semibold text-white shadow-[0_7px_18px_rgba(130,112,181,0.20)] transition duration-200 hover:-translate-y-0.5 hover:bg-[#715da7] hover:shadow-[0_10px_24px_rgba(130,112,181,0.28)] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#e8defb] active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? (
                <>
                  <svg
                    className="h-4 w-4 animate-spin"
                    viewBox="0 0 24 24"
                    fill="none"
                    aria-hidden="true"
                  >
                    <circle
                      cx="12"
                      cy="12"
                      r="9"
                      stroke="currentColor"
                      strokeWidth="3"
                      opacity=".3"
                    />
                    <path
                      d="M21 12a9 9 0 0 0-9-9"
                      stroke="currentColor"
                      strokeWidth="3"
                      strokeLinecap="round"
                    />
                  </svg>
                  {isJapanese ? "ログイン中..." : "Đang đăng nhập..."}
                </>
              ) : (
                <>
                  {t("auth.login_btn")}
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    className="h-4 w-4 transition-transform group-hover:translate-x-1"
                    aria-hidden="true"
                  >
                    <path
                      d="M5 12h14m-6-6 6 6-6 6"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </>
              )}
            </button>
          </form>

          <div className="my-6 flex items-center gap-3">
            <span className="h-px flex-1 bg-[#eee9f0]" />
            <span className="text-[10px] tracking-[0.12em] text-[#b2aab7]">
              FINORA
            </span>
            <span className="h-px flex-1 bg-[#eee9f0]" />
          </div>

          <p className="text-center text-sm text-[#8b8493]">
            {t("auth.no_account")}{" "}
            <Link
              to="/register"
              className="font-semibold text-[#9b6eae] underline decoration-[#e6d7ec] underline-offset-4 transition hover:text-[#72518a] hover:decoration-[#b9a0c8]"
            >
              {t("auth.register_now")}
            </Link>
          </p>
        </section>

        {/* Footer */}
        <footer className="mt-6 text-center">
          <div className="flex items-center justify-center gap-2 text-xs text-[#a49ba8]">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.6"
              className="h-4 w-4"
              aria-hidden="true"
            >
              <path
                d="M12 22s8-4 8-11V5l-8-3-8 3v6c0 7 8 11 8 11Z"
                strokeLinejoin="round"
              />
              <path
                d="m9 12 2 2 4-4"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            {isJapanese
              ? "あなたの毎日に、安心できるお金の管理を。"
              : "Quản lý tài chính an tâm hơn mỗi ngày."}
          </div>

          <p className="mt-2 text-[10px] tracking-wide text-[#b7afb9]">
            © {new Date().getFullYear()} Finora
          </p>
        </footer>
      </div>
    </main>
  );
}
