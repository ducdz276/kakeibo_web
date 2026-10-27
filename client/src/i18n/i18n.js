import i18n from "i18next";
import { initReactI18next } from "react-i18next";

import vi from "./locales/vi.json";
import ja from "./locales/ja.json";

// Lấy ngôn ngữ đã lưu; mặc định là tiếng Việt
const savedLanguage =
  typeof localStorage !== "undefined"
    ? localStorage.getItem("appLanguage")
    : null;

const initialLanguage = ["vi", "ja"].includes(savedLanguage)
  ? savedLanguage
  : "vi";

i18n.use(initReactI18next).init({
  resources: {
    vi: { translation: vi },
    ja: { translation: ja },
  },

  lng: initialLanguage,
  fallbackLng: "vi",
  supportedLngs: ["vi", "ja"],

  interpolation: {
    escapeValue: false,
  },

  react: {
    useSuspense: false,
  },
});

export default i18n;
