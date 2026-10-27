import React, { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import { useTranslation } from "react-i18next"; // <-- Import i18n

const Register = () => {
  const { t, i18n } = useTranslation();
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
  });
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
    localStorage.setItem("appLanguage", lng);
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(
        "http://localhost:5000/api/auth/register",
        formData
      );
      setMessage("✅ " + t("auth.register_success"));
      setTimeout(() => navigate("/login"), 2000);
    } catch (error) {
      setMessage(
        "❌ " + (error.response?.data?.message || t("auth.server_error"))
      );
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-4 relative">
      {/* Nút đổi ngôn ngữ */}
      <div className="absolute top-4 right-4 space-x-2">
        <button
          onClick={() => changeLanguage("vi")}
          className="px-3 py-1 text-sm font-medium border border-gray-300 rounded-md hover:bg-gray-100 bg-white"
        >
          VI
        </button>
        <button
          onClick={() => changeLanguage("ja")}
          className="px-3 py-1 text-sm font-medium border border-gray-300 rounded-md hover:bg-gray-100 bg-white"
        >
          JA
        </button>
      </div>

      <div className="w-full max-w-md p-8 bg-white rounded-xl shadow-lg border border-gray-100">
        <h1 className="text-3xl font-bold text-center text-blue-600 mb-6">
          {t("auth.register_title")}
        </h1>

        {message && (
          <div
            className={`p-3 mb-4 rounded text-center font-medium ${
              message.includes("✅")
                ? "bg-green-100 text-green-700"
                : "bg-red-100 text-red-700"
            }`}
          >
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t("auth.username")}
            </label>
            <input
              type="text"
              name="username"
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t("auth.email")}
            </label>
            <input
              type="email"
              name="email"
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t("auth.password")}
            </label>
            <input
              type="password"
              name="password"
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <button
            type="submit"
            className="w-full py-2 px-4 text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors font-medium mt-4"
          >
            {t("auth.register_btn")}
          </button>
        </form>

        <p className="mt-6 text-sm text-center text-gray-600">
          {t("auth.has_account")}{" "}
          <Link
            to="/login"
            className="text-blue-600 hover:underline font-medium"
          >
            {t("auth.login_now")}
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
