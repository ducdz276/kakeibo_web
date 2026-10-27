import React, { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Cell,
  PieChart,
  Pie,
  Legend,
} from "recharts";

const API_URL = "http://localhost:5000/api";

const EXPENSE_CATEGORIES = [
  "Ăn uống",
  "Mua sắm",
  "Sinh hoạt",
  "Di chuyển",
  "Y tế",
  "Giải trí",
  "Khác",
];

const INCOME_CATEGORIES = ["Lương", "Thưởng", "Đầu tư", "Khác"];

const CATEGORY_KEYS = {
  "Ăn uống": "food",
  "Mua sắm": "shopping",
  "Sinh hoạt": "living",
  "Di chuyển": "transport",
  "Y tế": "health",
  "Giải trí": "entertainment",
  Khác: "other",
  Lương: "salary",
  Thưởng: "bonus",
  "Đầu tư": "investment",

  // Tên danh mục tiếng Nhật
  飲食: "food",
  食費: "food",
  買い物: "shopping",
  生活費: "living",
  交通費: "transport",
  医療費: "health",
  娯楽: "entertainment",
  その他: "other",
  給料: "salary",
  ボーナス: "bonus",
  投資: "investment",
};

const CATEGORY_EMOJIS = {
  food: "🍔",
  shopping: "🛍️",
  living: "🏠",
  transport: "🚌",
  health: "🏥",
  entertainment: "🎮",
  other: "📦",
  salary: "💰",
  bonus: "🎁",
  investment: "📈",
};

const CATEGORY_COLORS = [
  "#2563eb",
  "#d946ef",
  "#8b5cf6",
  "#0284c7",
  "#059669",
  "#e11d48",
  "#d97706",
];

const getToday = () => {
  const date = new Date();

  return [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, "0"),
    String(date.getDate()).padStart(2, "0"),
  ].join("-");
};

const normalizeDate = (value) => {
  if (!value) return "";

  if (typeof value === "string") {
    const match = value.match(/^\d{4}-\d{2}-\d{2}/);
    if (match) return match[0];
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "";

  return [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, "0"),
    String(date.getDate()).padStart(2, "0"),
  ].join("-");
};

const normalizeTransaction = (item) => ({
  ...item,
  id: item.id,
  title: String(item.title ?? ""),
  amount: Number(item.amount ?? 0),
  type: item.type,
  category: String(item.category ?? "").trim(),
  date: normalizeDate(item.date),
});

// Xóa emoji đầu tên danh mục nếu dữ liệu đã có emoji.
const removeLeadingEmoji = (value) =>
  String(value ?? "")
    .trim()
    .replace(
      /^(?:\p{Emoji_Presentation}|\p{Extended_Pictographic})(?:\uFE0F|\u200D|\p{Emoji_Modifier}|\p{Emoji_Presentation}|\p{Extended_Pictographic})*\s*/u,
      ""
    )
    .trim();

export default function Dashboard() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();

  const [theme, setTheme] = useState(
    () => localStorage.getItem("theme") || "dark"
  );

  const [user, setUser] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  const [showModal, setShowModal] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [selectedId, setSelectedId] = useState(null);

  const [filterType, setFilterType] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedMonth, setSelectedMonth] = useState(getToday().slice(0, 7));

  const [formData, setFormData] = useState({
    title: "",
    amount: "",
    type: "expense",
    category: EXPENSE_CATEGORIES[0],
    date: getToday(),
  });

  const [profileData, setProfileData] = useState({
    username: "",
    avatar: "",
  });

  const isJapanese = i18n.language?.startsWith("ja");

  const text = (key, vi, ja) => t(key, { defaultValue: isJapanese ? ja : vi });

  const money = (amount) =>
    `¥ ${Number(amount || 0).toLocaleString(isJapanese ? "ja-JP" : "vi-VN")}`;

  // Dịch tên danh mục và chỉ hiển thị một emoji.
  const getTranslatedCategory = (category) => {
    const cleanCategory = removeLeadingEmoji(category);

    if (!cleanCategory) return "";

    const key = CATEGORY_KEYS[cleanCategory];

    if (!key) return cleanCategory;

    const translated = removeLeadingEmoji(
      t(`categories.${key}`, { defaultValue: cleanCategory })
    );

    return `${CATEGORY_EMOJIS[key] || "📌"} ${translated}`;
  };

  const fetchTransactions = async (token) => {
    const response = await axios.get(`${API_URL}/transactions`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    const data = Array.isArray(response.data)
      ? response.data
      : response.data?.transactions;

    if (!Array.isArray(data)) {
      throw new Error("Dữ liệu giao dịch không hợp lệ.");
    }

    const normalized = data.map(normalizeTransaction);
    setTransactions(normalized);

    return normalized;
  };

  // Theme
  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
    localStorage.setItem("theme", theme);
  }, [theme]);

  // Đọc thông tin tài khoản và giao dịch
  useEffect(() => {
    const token = localStorage.getItem("token");
    const savedUser = localStorage.getItem("user");
    let active = true;

    const loadDashboard = async () => {
      if (!token || !savedUser) {
        navigate("/login", { replace: true });
        setLoading(false);
        return;
      }

      try {
        const parsedUser = JSON.parse(savedUser);

        if (active) {
          setUser(parsedUser);
          setProfileData({
            username: parsedUser.username || "",
            avatar: parsedUser.avatar || "",
          });
        }

        await fetchTransactions(token);
      } catch (error) {
        console.error(
          "Không thể tải dữ liệu:",
          error.response?.data || error.message
        );

        const status = error.response?.status;

        if (active && (status === 401 || status === 403)) {
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          navigate("/login", { replace: true });
        }
      } finally {
        if (active) setLoading(false);
      }
    };

    loadDashboard();

    return () => {
      active = false;
    };
  }, [navigate]);

  const changeLanguage = async (language) => {
    await i18n.changeLanguage(language);
    localStorage.setItem("appLanguage", language);
  };

  const handleMonthChange = (offset) => {
    const [year, month] = selectedMonth.split("-").map(Number);
    const date = new Date(year, month - 1 + offset, 1);

    setSelectedMonth(
      `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`
    );
  };

  const resetForm = () => ({
    title: "",
    amount: "",
    type: "expense",
    category: EXPENSE_CATEGORIES[0],
    date: getToday(),
  });

  const handleOpenAddModal = () => {
    setEditingId(null);
    setFormData(resetForm());
    setShowModal(true);
  };

  const handleOpenEditModal = (item) => {
    setEditingId(item.id);
    setFormData({
      title: item.title,
      amount: String(item.amount),
      type: item.type,
      category: item.category,
      date: item.date || getToday(),
    });
    setShowModal(true);
  };

  const handleTypeChange = (type) => {
    setFormData((previous) => ({
      ...previous,
      type,
      category:
        type === "expense" ? EXPENSE_CATEGORIES[0] : INCOME_CATEGORIES[0],
    }));
  };

  const handleSubmitForm = async (event) => {
    event.preventDefault();

    const token = localStorage.getItem("token");

    if (!token) {
      navigate("/login");
      return;
    }

    const payload = {
      title: formData.title.trim(),
      amount: Number(formData.amount),
      type: formData.type,
      category: formData.category,
      date: formData.date,
    };

    if (!payload.title || !payload.category || !payload.date) {
      alert(
        text(
          "dashboard.required",
          "Vui lòng điền đầy đủ thông tin.",
          "すべての項目を入力してください。"
        )
      );
      return;
    }

    if (!Number.isFinite(payload.amount) || payload.amount <= 0) {
      alert(
        text(
          "dashboard.invalid_amount",
          "Số tiền phải lớn hơn 0.",
          "金額は0より大きく入力してください。"
        )
      );
      return;
    }

    try {
      if (editingId !== null) {
        await axios.put(`${API_URL}/transactions/${editingId}`, payload, {
          headers: { Authorization: `Bearer ${token}` },
        });
      } else {
        await axios.post(`${API_URL}/transactions`, payload, {
          headers: { Authorization: `Bearer ${token}` },
        });
      }

      await fetchTransactions(token);

      setShowModal(false);
      setEditingId(null);
      setFormData(resetForm());

      alert(
        editingId !== null
          ? text(
              "dashboard.update_success",
              "Cập nhật giao dịch thành công!",
              "取引を更新しました！"
            )
          : text(
              "dashboard.add_success",
              "Thêm giao dịch thành công!",
              "取引を追加しました！"
            )
      );
    } catch (error) {
      console.error(
        "Lỗi lưu giao dịch:",
        error.response?.data || error.message
      );
      alert(
        error.response?.data?.message ||
          text(
            "dashboard.save_error",
            "Không thể lưu giao dịch.",
            "取引を保存できませんでした。"
          )
      );
    }
  };

  const handleDelete = async (id) => {
    const confirmed = window.confirm(
      text(
        "dashboard.confirm_delete",
        "Bạn có chắc muốn xóa giao dịch này?",
        "この取引を削除しますか？"
      )
    );

    if (!confirmed) return;

    const token = localStorage.getItem("token");

    if (!token) {
      navigate("/login");
      return;
    }

    try {
      await axios.delete(`${API_URL}/transactions/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      await fetchTransactions(token);

      if (selectedId === id) setSelectedId(null);

      alert(
        text(
          "dashboard.delete_success",
          "Xóa giao dịch thành công!",
          "取引を削除しました！"
        )
      );
    } catch (error) {
      console.error(
        "Lỗi xóa giao dịch:",
        error.response?.data || error.message
      );
      alert(
        error.response?.data?.message ||
          text(
            "dashboard.delete_error",
            "Không thể xóa giao dịch.",
            "取引を削除できませんでした。"
          )
      );
    }
  };

  const handleImageUpload = (event) => {
    const file = event.target.files?.[0];

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert(
        text(
          "dashboard.invalid_image",
          "Vui lòng chọn file ảnh.",
          "画像ファイルを選択してください。"
        )
      );
      return;
    }

    const reader = new FileReader();

    reader.onloadend = () => {
      setProfileData((previous) => ({
        ...previous,
        avatar: reader.result,
      }));
    };

    reader.readAsDataURL(file);
  };

  const handleUpdateProfile = async (event) => {
    event.preventDefault();

    const token = localStorage.getItem("token");

    if (!token) {
      navigate("/login");
      return;
    }

    try {
      const response = await axios.put(
        `${API_URL}/users/profile`,
        profileData,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const updatedUser = response.data?.user || {
        ...user,
        ...profileData,
      };

      setUser(updatedUser);
      localStorage.setItem("user", JSON.stringify(updatedUser));
      setShowProfileModal(false);

      alert(
        text(
          "dashboard.profile_success",
          "Cập nhật hồ sơ thành công!",
          "プロフィールを更新しました！"
        )
      );
    } catch (error) {
      console.error(
        "Lỗi cập nhật hồ sơ:",
        error.response?.data || error.message
      );
      alert(
        error.response?.data?.message ||
          text(
            "dashboard.profile_error",
            "Không thể cập nhật hồ sơ.",
            "プロフィールを更新できませんでした。"
          )
      );
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login", { replace: true });
  };

  // Dữ liệu theo tháng
  const monthlyTransactions = useMemo(
    () =>
      transactions.filter((item) => item.date?.slice(0, 7) === selectedMonth),
    [transactions, selectedMonth]
  );

  const totalIncome = monthlyTransactions
    .filter((item) => item.type === "income")
    .reduce((sum, item) => sum + item.amount, 0);

  const totalExpense = monthlyTransactions
    .filter((item) => item.type === "expense")
    .reduce((sum, item) => sum + item.amount, 0);

  const totalBalance = totalIncome - totalExpense;

  const filteredTransactions = monthlyTransactions.filter((item) => {
    const matchesType = filterType === "all" || item.type === filterType;

    const keyword = searchTerm.trim().toLowerCase();

    const searchableText = [
      item.title,
      item.category,
      getTranslatedCategory(item.category),
    ]
      .join(" ")
      .toLowerCase();

    return matchesType && searchableText.includes(keyword);
  });

  const trendData = [...monthlyTransactions]
    .sort((a, b) => a.date.localeCompare(b.date))
    .map((item) => ({
      name: item.date.slice(8, 10),
      amount: item.type === "expense" ? -item.amount : item.amount,
    }));

  const categoryDataMap = monthlyTransactions
    .filter((item) => item.type === "expense")
    .reduce((result, item) => {
      const category = removeLeadingEmoji(item.category);
      result[category] = (result[category] || 0) + item.amount;
      return result;
    }, {});

  const pieChartData = Object.entries(categoryDataMap).map(
    ([category, amount], index) => ({
      name: getTranslatedCategory(category),
      value: amount,
      color: CATEGORY_COLORS[index % CATEGORY_COLORS.length],
    })
  );

  const [yearStr, monthStr] = selectedMonth.split("-");

  const displayMonthText = isJapanese
    ? `${yearStr}年 ${Number(monthStr)}月`
    : `Tháng ${Number(monthStr)} / ${yearStr}`;

  const panelClass =
    "bg-white/80 dark:bg-white/5 backdrop-blur-2xl border border-slate-200/80 dark:border-white/10 shadow-xl";

  const inputClass =
    "w-full bg-slate-100 dark:bg-[#252044] border border-slate-300 dark:border-white/10 px-4 py-3 rounded-xl text-slate-800 dark:text-white focus:ring-2 focus:ring-violet-500 focus:outline-none";

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f1f3f9] dark:bg-[#0f0c29] text-slate-800 dark:text-white">
        {text(
          "dashboard.loading",
          "Đang tải dữ liệu...",
          "データを読み込み中..."
        )}
      </div>
    );
  }

  return (
    <div
      className={`min-h-screen p-4 md:p-8 font-sans transition-colors ${
        theme === "dark"
          ? "bg-gradient-to-br from-[#0f0c29] via-[#302b63] to-[#24243e] text-slate-100"
          : "bg-[#f1f3f9] text-slate-900"
      }`}
    >
      <div className="max-w-6xl mx-auto space-y-8">
        <header
          className={`p-5 rounded-3xl flex flex-col md:flex-row md:items-center justify-between gap-4 ${panelClass}`}
        >
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => setShowProfileModal(true)}
              className="w-14 h-14 rounded-full overflow-hidden shrink-0 bg-gradient-to-tr from-violet-600 to-fuchsia-600 flex items-center justify-center text-white text-xl font-bold"
              title={text(
                "dashboard.profile_title",
                "Hồ sơ cá nhân",
                "プロフィール"
              )}
            >
              {profileData.avatar ? (
                <img
                  src={profileData.avatar}
                  alt="Avatar"
                  className="w-full h-full object-cover"
                />
              ) : (
                user?.username?.charAt(0)?.toUpperCase() || "U"
              )}
            </button>

            <div>
              <h1 className="text-2xl font-black bg-gradient-to-r from-violet-500 to-fuchsia-500 bg-clip-text text-transparent">
                {t("dashboard.title", { defaultValue: "Quản lý tài chính" })}
              </h1>
              <p className="text-sm text-slate-500 dark:text-slate-300">
                {t("dashboard.welcome", { defaultValue: "Xin chào," })}{" "}
                <strong>{user?.username}</strong>
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => handleMonthChange(-1)}
              className="px-3 py-2 rounded-xl bg-slate-200 dark:bg-white/10"
              aria-label="Previous month"
            >
              ◀
            </button>
            <span className="min-w-28 text-center font-bold">
              {displayMonthText}
            </span>
            <button
              type="button"
              onClick={() => handleMonthChange(1)}
              className="px-3 py-2 rounded-xl bg-slate-200 dark:bg-white/10"
              aria-label="Next month"
            >
              ▶
            </button>

            <button
              type="button"
              onClick={() =>
                setTheme((previous) => (previous === "dark" ? "light" : "dark"))
              }
              className="px-3 py-2 rounded-xl bg-slate-200 dark:bg-white/10"
              title={theme === "dark" ? "Light mode" : "Dark mode"}
            >
              {theme === "dark" ? "☀️" : "🌙"}
            </button>

            <button
              type="button"
              onClick={handleLogout}
              className="px-4 py-2 rounded-xl bg-slate-200 dark:bg-white/10 font-bold"
            >
              {t("dashboard.logout", { defaultValue: "Đăng xuất" })}
            </button>

            <div className="flex gap-1 p-1 rounded-xl bg-slate-200 dark:bg-white/10">
              {["vi", "ja"].map((language) => (
                <button
                  key={language}
                  type="button"
                  onClick={() => changeLanguage(language)}
                  className={`px-3 py-2 rounded-lg text-sm font-bold ${
                    i18n.language?.startsWith(language)
                      ? "bg-violet-600 text-white"
                      : "text-slate-600 dark:text-slate-300"
                  }`}
                >
                  {language.toUpperCase()}
                </button>
              ))}
            </div>
          </div>
        </header>

        <section className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="p-6 rounded-3xl bg-gradient-to-br from-violet-600 via-fuchsia-600 to-pink-600 text-white shadow-xl">
            <p className="font-bold">
              {t("dashboard.balance", { defaultValue: "Số dư" })}
            </p>
            <p className="text-3xl font-black mt-3">{money(totalBalance)}</p>
          </div>

          <div className={`p-6 rounded-3xl ${panelClass}`}>
            <p className="text-sm text-slate-500 dark:text-slate-300">
              {t("dashboard.income", { defaultValue: "Tổng thu nhập" })}
            </p>
            <p className="text-3xl font-black mt-3 text-emerald-500">
              {money(totalIncome)}
            </p>
          </div>

          <div className={`p-6 rounded-3xl ${panelClass}`}>
            <p className="text-sm text-slate-500 dark:text-slate-300">
              {t("dashboard.expense", { defaultValue: "Tổng chi tiêu" })}
            </p>
            <p className="text-3xl font-black mt-3 text-rose-500">
              {money(totalExpense)}
            </p>
          </div>
        </section>

        <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className={`p-5 md:p-7 rounded-3xl ${panelClass}`}>
            <h2 className="text-lg font-bold mb-5">
              {t("dashboard.chart_trend", {
                defaultValue: "Xu hướng dòng tiền",
              })}
            </h2>

            <div className="h-64">
              {trendData.length === 0 ? (
                <div className="h-full flex items-center justify-center text-slate-500">
                  {t("dashboard.no_data", { defaultValue: "Chưa có dữ liệu" })}
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={trendData}>
                    <defs>
                      <linearGradient
                        id="colorAmount"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop
                          offset="5%"
                          stopColor="#d946ef"
                          stopOpacity={0.6}
                        />
                        <stop
                          offset="95%"
                          stopColor="#8b5cf6"
                          stopOpacity={0}
                        />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip formatter={(value) => money(value)} />
                    <Area
                      type="monotone"
                      dataKey="amount"
                      stroke="#d946ef"
                      strokeWidth={3}
                      fill="url(#colorAmount)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          <div className={`p-5 md:p-7 rounded-3xl ${panelClass}`}>
            <h2 className="text-lg font-bold mb-5">
              {t("dashboard.chart_pie", {
                defaultValue: "Chi tiêu theo danh mục",
              })}
            </h2>

            <div className="h-64">
              {pieChartData.length === 0 ? (
                <div className="h-full flex items-center justify-center text-slate-500">
                  {t("dashboard.no_data", { defaultValue: "Chưa có dữ liệu" })}
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieChartData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="45%"
                      innerRadius={55}
                      outerRadius={80}
                      paddingAngle={3}
                    >
                      {pieChartData.map((entry, index) => (
                        <Cell
                          key={`${entry.name}-${index}`}
                          fill={entry.color}
                        />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => money(value)} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>
        </section>

        <section className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <h2 className="text-xl font-black">
            {t("dashboard.transactions", { defaultValue: "Lịch sử giao dịch" })}
          </h2>

          <div className="flex flex-col sm:flex-row flex-wrap gap-3">
            <input
              type="search"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder={t("dashboard.search_placeholder", {
                defaultValue: "Tìm giao dịch...",
              })}
              className="px-4 py-3 rounded-xl bg-white dark:bg-white/5 border border-slate-300 dark:border-white/10 outline-none"
            />

            <select
              value={filterType}
              onChange={(event) => setFilterType(event.target.value)}
              className={inputClass}
            >
              <option value="all">
                {t("dashboard.filter_all", { defaultValue: "Tất cả" })}
              </option>
              <option value="income">
                {t("dashboard.filter_income", { defaultValue: "Thu nhập" })}
              </option>
              <option value="expense">
                {t("dashboard.filter_expense", { defaultValue: "Chi tiêu" })}
              </option>
            </select>

            <button
              type="button"
              onClick={handleOpenAddModal}
              className="px-5 py-3 rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white font-bold"
            >
              + {t("dashboard.add_btn", { defaultValue: "Thêm giao dịch" })}
            </button>
          </div>
        </section>

        <section className={`p-5 md:p-7 rounded-3xl ${panelClass}`}>
          {filteredTransactions.length === 0 ? (
            <div className="py-10 text-center text-slate-500">
              {t("dashboard.no_data", { defaultValue: "Không có giao dịch" })}
            </div>
          ) : (
            <div className="space-y-3">
              {filteredTransactions.map((item) => (
                <article
                  key={item.id}
                  onClick={() => setSelectedId(item.id)}
                  className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl border cursor-pointer ${
                    selectedId === item.id
                      ? "border-violet-500 bg-violet-500/10"
                      : "border-slate-200 dark:border-white/10 bg-white/40 dark:bg-white/5"
                  }`}
                >
                  <div className="min-w-0">
                    <p className="font-bold break-words">{item.title}</p>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                      {getTranslatedCategory(item.category)} · {item.date}
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    <strong
                      className={
                        item.type === "income"
                          ? "text-emerald-500"
                          : "text-rose-500"
                      }
                    >
                      {item.type === "income" ? "+" : "-"}
                      {money(item.amount)}
                    </strong>

                    <button
                      type="button"
                      onClick={(event) => {
                        event.stopPropagation();
                        handleOpenEditModal(item);
                      }}
                      className="px-3 py-2 rounded-xl hover:bg-violet-500/10"
                      title="Edit"
                    >
                      ✏️
                    </button>

                    <button
                      type="button"
                      onClick={(event) => {
                        event.stopPropagation();
                        handleDelete(item.id);
                      }}
                      className="px-3 py-2 rounded-xl hover:bg-rose-500/10"
                      title="Delete"
                    >
                      🗑️
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>

        {showModal && (
          <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
            <div className="w-full max-w-xl my-6 p-6 rounded-3xl bg-white dark:bg-[#1c1836] text-slate-800 dark:text-white border border-slate-200 dark:border-white/10 shadow-2xl">
              <h2 className="text-2xl font-black mb-6">
                {editingId !== null
                  ? t("dashboard.modal_edit_title", {
                      defaultValue: "Sửa giao dịch",
                    })
                  : t("dashboard.modal_add_title", {
                      defaultValue: "Thêm giao dịch",
                    })}
              </h2>

              <form onSubmit={handleSubmitForm} className="space-y-4">
                <label className="block text-sm font-bold">
                  {t("dashboard.field_title", {
                    defaultValue: "Tên giao dịch",
                  })}
                  <input
                    required
                    value={formData.title}
                    onChange={(event) =>
                      setFormData((p) => ({ ...p, title: event.target.value }))
                    }
                    className={`${inputClass} mt-2`}
                  />
                </label>

                <label className="block text-sm font-bold">
                  {t("dashboard.field_amount", { defaultValue: "Số tiền (¥)" })}
                  <input
                    required
                    type="number"
                    min="1"
                    step="1"
                    value={formData.amount}
                    onChange={(event) =>
                      setFormData((p) => ({ ...p, amount: event.target.value }))
                    }
                    className={`${inputClass} mt-2`}
                  />
                </label>

                <label className="block text-sm font-bold">
                  {t("dashboard.field_type", {
                    defaultValue: "Loại giao dịch",
                  })}
                  <select
                    value={formData.type}
                    onChange={(event) => handleTypeChange(event.target.value)}
                    className={`${inputClass} mt-2`}
                  >
                    <option value="expense">
                      {t("dashboard.filter_expense", {
                        defaultValue: "Chi tiêu",
                      })}
                    </option>
                    <option value="income">
                      {t("dashboard.filter_income", {
                        defaultValue: "Thu nhập",
                      })}
                    </option>
                  </select>
                </label>

                <label className="block text-sm font-bold">
                  {t("dashboard.field_category", { defaultValue: "Danh mục" })}
                  <select
                    value={formData.category}
                    onChange={(event) =>
                      setFormData((p) => ({
                        ...p,
                        category: event.target.value,
                      }))
                    }
                    className={`${inputClass} mt-2`}
                  >
                    {(formData.type === "expense"
                      ? EXPENSE_CATEGORIES
                      : INCOME_CATEGORIES
                    ).map((category) => (
                      <option key={category} value={category}>
                        {getTranslatedCategory(category)}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="block text-sm font-bold">
                  {t("dashboard.field_date", { defaultValue: "Ngày" })}
                  <input
                    required
                    type="date"
                    value={formData.date}
                    onChange={(event) =>
                      setFormData((p) => ({ ...p, date: event.target.value }))
                    }
                    className={`${inputClass} mt-2`}
                  />
                </label>

                <div className="flex gap-3 pt-3">
                  <button
                    type="button"
                    onClick={() => {
                      setShowModal(false);
                      setEditingId(null);
                    }}
                    className="flex-1 px-5 py-3 rounded-xl bg-slate-200 dark:bg-white/10 font-bold"
                  >
                    {t("dashboard.btn_cancel", { defaultValue: "Hủy" })}
                  </button>

                  <button
                    type="submit"
                    className="flex-1 px-5 py-3 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-bold"
                  >
                    {editingId !== null
                      ? t("dashboard.btn_update", { defaultValue: "Cập nhật" })
                      : t("dashboard.btn_save", { defaultValue: "Lưu" })}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {showProfileModal && (
          <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
            <div className="w-full max-w-md p-6 rounded-3xl bg-white dark:bg-[#1c1836] text-slate-800 dark:text-white border border-slate-200 dark:border-white/10 shadow-2xl">
              <h2 className="text-2xl font-black mb-6">
                {t("dashboard.profile_title", {
                  defaultValue: "Hồ sơ cá nhân",
                })}
              </h2>

              <form onSubmit={handleUpdateProfile} className="space-y-5">
                <label className="flex flex-col items-center gap-3">
                  <span className="w-24 h-24 rounded-full overflow-hidden bg-violet-600 text-white flex items-center justify-center text-3xl font-bold">
                    {profileData.avatar ? (
                      <img
                        src={profileData.avatar}
                        alt="Avatar"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      profileData.username?.charAt(0)?.toUpperCase() || "U"
                    )}
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="max-w-full text-sm"
                  />
                </label>

                <label className="block text-sm font-bold">
                  {t("dashboard.display_name", {
                    defaultValue: "Tên hiển thị",
                  })}
                  <input
                    required
                    value={profileData.username}
                    onChange={(event) =>
                      setProfileData((p) => ({
                        ...p,
                        username: event.target.value,
                      }))
                    }
                    className={`${inputClass} mt-2`}
                  />
                </label>

                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setShowProfileModal(false)}
                    className="flex-1 px-5 py-3 rounded-xl bg-slate-200 dark:bg-white/10 font-bold"
                  >
                    {t("dashboard.btn_cancel", { defaultValue: "Hủy" })}
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-5 py-3 rounded-xl bg-violet-600 text-white font-bold"
                  >
                    {t("dashboard.btn_save_profile", {
                      defaultValue: "Lưu hồ sơ",
                    })}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
