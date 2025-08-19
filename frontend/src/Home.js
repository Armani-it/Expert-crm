
import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
  X,
  Calendar,
  Users,
  TrendingUp,
  BookOpen,
  Clock,
  CheckCircle,
  ArrowLeft,
  Plus,
  Target,
  Filter,
  DollarSign,
  PieChart as PieChartIcon,
  Check,
  XCircle,
  History,
  BookCopy,
  Lock,
  Unlock,
  Info,
  Edit,
  Trash2,
} from "lucide-react";

import {
  ComposedChart,
  BarChart,
  RadialBarChart,
  Line,
  Bar,
  RadialBar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LabelList,
} from "recharts";


import DetailsModal from "./pieces/DetailsModal"
import LoginModal from "./pieces/LoginModal"
import PlanModal from "./pieces/PlanModal"
import Modal from "./pieces/Modal"
import FormPage from "./pieces/FormPage";
import TeacherNotificationSender  from "./pieces/TeacherNotificationSender"
import DistributionView from "./pieces/DistributionView";

// =================================================================
//                          CONFIGURATION
// =================================================================
const API_URL = "https://backend-expert-crm.onrender.com";
const GOOGLE_SCRIPT_URL =
  "https://script.google.com/macros/s/AKfycbxXA8JQ0sQ1gxFQYGhgo995CFq3CrbgSPMnkHez0Up7PzWhsoFAbQMj3CoI15dJmEU_Uw/exec";
const WEBHOOK_URL = "https://us-central1-akcent-academy.cloudfunctions.net/sendMessageWhatsApp";
const RESCHEDULE_WEBHOOK_URL = "https://us-central1-akcent-academy.cloudfunctions.net/sendMessageWhatsApp";

// =================================================================
//                          DEMO DATA & CONSTANTS
// =================================================================
// =================================================================
const initialUsers = [
  // Администраторы и РОПы
  {
    id: "1",
    username: "admin",
    password: "password123",
    role: "admin",
    name: "Admin",
  },
  {
    id: "2",
    username: "danial",
    password: "password123",
    role: "rop",
    name: "Даниял",
  },
  {
    id: "34",
    username: "akcent",
    password: "password123",
    role: "rop",
    name: "Акцент",
  },
  {
    id: "3",
    username: "damir",
    password: "password123",
    role: "rop",
    name: "Дамир",
  },
  {
    id: "4",
    username: "nazerke",
    password: "password123",
    role: "rop",
    name: "Назерке",
  },
  {
    id: "5",
    username: "abylai",
    password: "password123",
    role: "rop",
    name: "Абылай",
  },
  {
    id: "7",
    username: "sayakhat",
    password: "password123",
    role: "rop",
    name: "Саяхат",
  },
  {
    id: "8",
    username: "madina",
    password: "password123",
    role: "rop",
    name: "Мадина",
  },
  {
    id: "9",
    username: "aisha",
    password: "password123",
    role: "rop",
    name: "Айша",
  },
  {
    id: "28",
    username: "togzhan",
    password: "password123",
    role: "rop",
    name: "Тоғжан",
  },
  {
    id: "30",
    username: "dinara",
    password: "password123",
    role: "rop",
    name: "Динара",
  },
  {
    id: "31",
    username: "Ak",
    password: "password123",
    role: "rop",
    name: "Динара",
  },

  // Обновленный список учителей

  {
    id: "33",
    username: "sabina",
    password: "password123",
    role: "teacher",
    name: "Сәбина",
    number: "87072531783",
  },
  {
    id: "16",
    username: "gaziza",
    password: "password123",
    role: "teacher",
    name: "Ғазиза",
  },
  {
    id: "18",
    username: "dana",
    password: "password123",
    role: "teacher",
    name: "Дана",
  },
  {
    id: "10",
    username: "qymbat",
    password: "password123",
    role: "teacher",
    name: "Қымбат",
  },
  {
    id: "15",
    username: "nursulu",
    password: "password123",
    role: "teacher",
    name: "Нұрсулу",
  },
  {
    id: "34",
    username: "nazerke",
    password: "password123",
    role: "teacher",
    name: "Назерке",
  },
  {
    id: "13",
    username: "nurqabyl",
    password: "password123",
    role: "teacher",
    name: "Нұрқабыл",
  },
  {
    id: "22",
    username: "dinaraTeach",
    password: "password123",
    role: "teacher",
    name: "Динара",
  },
  {
    id: "11",
    username: "dilnaz",
    password: "password123",
    role: "teacher",
    name: "Дильназ",
  },
  {
    id: "35",
    username: "aizhan",
    password: "password123",
    role: "teacher",
    name: "Айжан",
  },
  {
    id: "21",
    username: "zhanargul",
    password: "password123",
    role: "teacher",
    name: "Жанаргуль",
  },
  {
    id: "32",
    username: "primoy",
    password: "password123",
    role: "teacher",
    name: "Прямой",
  },
];

const ALL_SOURCES = [
  "Facebook Tilda-Сайт",
  "Прямой",
  "Акцент",
  "Фейсбук Ватсап",
  "Facebook Ген-лид",
  "TikTok Target",
  "Инстаграм сторис",
  "Инстаграм био",
  "Телеграм",
  "Блогер",
  "База-лид",
  "Деңгей анықтау",
];


function getTeacherNumberByName(name, { normalize = false } = {}) {
  if (!name) return null;
  const needle = String(name).trim().toLowerCase();

  const teacher = initialUsers.find(
    (u) => u.role === "teacher" && String(u.name || "").trim().toLowerCase() === needle
  );
  if (!teacher) return null;

  const raw = teacher.number ? String(teacher.number).trim() : "";
  if (!raw) return null;

  return normalize ? normalizeKzNumber(raw) : raw;
}

function normalizeKzNumber(number) {
  let n = String(number).replace(/[^\d+]/g, "");
  if (n.startsWith("+")) n = n.slice(1);
  if (n.length === 11 && n.startsWith("8")) n = "7" + n.slice(1);
  if (!n.startsWith("7")) n = "7" + n.replace(/^7+/, "");
  return `+${n}`;
}

const generateTimeSlots = () => {
  const slots = [];
  let hour = 9;
  let minute = 0;

  while (hour < 23 || (hour === 23 && minute <= 40)) {
    const formattedHour = hour.toString().padStart(2, "0");
    const formattedMinute = minute.toString().padStart(2, "0");
    slots.push(`${formattedHour}:${formattedMinute}`);

    minute += 40;
    if (minute >= 60) {
      hour++;
      minute -= 60;
    }
  }
  return slots;
};

// =================================================================
//                          HELPER FUNCTIONS
// =================================================================

const formatPhoneNumber = (phoneStr) => {
  if (!phoneStr) return "";
  let cleaned = ("" + phoneStr).replace(/\D/g, "");
  if (cleaned.length === 11 && cleaned.startsWith("8"))
    cleaned = "7" + cleaned.slice(1);
  if (cleaned.length === 10 && !cleaned.startsWith("7"))
    cleaned = "7" + cleaned;
  const match = cleaned.match(/^7(\d{3})(\d{3})(\d{2})(\d{2})$/);
  return match
    ? `+7 (${match[1]}) ${match[2]}-${match[3]}-${match[4]}`
    : phoneStr;
};

const cleanPhoneNumberForApi = (phoneStr) => {
  if (!phoneStr) return "";
  let cleaned = ("" + phoneStr).replace(/\D/g, "");
  if (cleaned.length === 11 && cleaned.startsWith("8")) {
    return "7" + cleaned.slice(1);
  }
  if (cleaned.startsWith("7") && cleaned.length === 11) {
    return cleaned;
  }
  if (cleaned.length === 10) {
    return "7" + cleaned;
  }
  return phoneStr;
};

const getRankColor = (index) =>
  [
    "from-yellow-400 to-yellow-600",
    "from-gray-400 to-gray-600",
    "from-orange-400 to-orange-600",
  ][index] || "from-blue-400 to-blue-600";
const getRankIcon = (index) => ["👑", "🥈", "🥉"][index] || index + 1;

const getAppointmentColorForStatus = (status) => {
  switch (status) {
    case "Оплата":
      return "bg-gradient-to-r from-green-500 to-green-600 text-white";
    case "Клиент отказ":
    case "Каспий отказ":
      return "bg-gradient-to-r from-red-500 to-red-600 text-white";
    default:
      return "bg-gradient-to-r from-blue-500 to-blue-600 text-white";
  }
};

// =================================================================
//                          COMMON COMPONENTS
// =================================================================

const Spinner = () => (
  <div className="flex flex-col items-center justify-center gap-3 text-gray-500">
    <div className="w-8 h-8 border-2 border-gray-200 border-t-blue-500 rounded-full animate-spin"></div>
    <span className="text-sm">Загрузка...</span>
  </div>
);

const Toast = ({ message, type, isVisible }) => {
  let bgColor = "bg-gradient-to-r from-red-500 to-red-600";
  if (type === "success")
    bgColor = "bg-gradient-to-r from-green-500 to-green-600";
  else if (type === "info")
    bgColor = "bg-gradient-to-r from-blue-500 to-blue-600";

  return (
    <div
      className={`fixed top-6 right-6 px-4 py-3 md:px-6 md:py-4 rounded-xl text-white font-medium shadow-2xl transition-all duration-300 transform z-50 ${
        isVisible
          ? "opacity-100 translate-y-0 scale-100"
          : "opacity-0 -translate-y-4 scale-95 pointer-events-none"
      } ${bgColor}`}
    >
      <div className="flex items-center gap-3">
        {type === "success" ? (
          <CheckCircle size={20} />
        ) : type === "info" ? (
          <Info size={20} />
        ) : (
          <XCircle size={20} />
        )}
        <span className="font-medium text-sm md:text-base">{message}</span>
      </div>
    </div>
  );
};



const TrialsListView = ({
  entries,
  ropList,
  onOpenDetails,
  readOnly = false,
  onFilterBySource,
}) => {
  const [filters, setFilters] = useState({
    startDate: "",
    endDate: "",
    rop: "",
    source: "",
    status: "",
    paymentType: "",
  });

  const sourceCounts = useMemo(() => {
    const counts = {};
    ALL_SOURCES.forEach((source) => {
      counts[source] = 0;
    });
    entries.forEach((entry) => {
      if (counts[entry.source] !== undefined) {
        counts[entry.source]++;
      }
    });
    return counts;
  }, [entries]);

  const filteredEntries = useMemo(() => {
    return entries
      .filter((entry) => {
        const startDate = filters.startDate
          ? new Date(filters.startDate)
          : null;
        if (startDate) startDate.setUTCHours(0, 0, 0, 0);

        const endDate = filters.endDate ? new Date(filters.endDate) : null;
        if (endDate) endDate.setUTCHours(23, 59, 59, 999);

        const entryTrialDate = entry.trialDate
          ? new Date(entry.trialDate)
          : null;

        let dateMatch = true;
        if (startDate && endDate) {
          dateMatch =
            entryTrialDate &&
            entryTrialDate >= startDate &&
            entryTrialDate <= endDate;
        } else if (startDate) {
          dateMatch = entryTrialDate && entryTrialDate >= startDate;
        } else if (endDate) {
          dateMatch = entryTrialDate && entryTrialDate <= endDate;
        }

        return (
          dateMatch &&
          (!filters.rop || entry.rop === filters.rop) &&
          (!filters.source || entry.source === filters.source) &&
          (!filters.status || (entry.status || "Ожидает") === filters.status) &&
          (!filters.paymentType || entry.paymentType === filters.paymentType)
        );
      })
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }, [entries, filters]);

  const handleFilterChange = (e) => {
    setFilters((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSourceButtonClick = (source) => {
    setFilters((prev) => ({ ...prev, source: source }));
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      Ожидает: {
        bg: "bg-gradient-to-r from-yellow-400 to-orange-500",
        text: "text-white",
      },
      Назначен: {
        bg: "bg-gradient-to-r from-blue-400 to-blue-600",
        text: "text-white",
      },
      Проведен: {
        bg: "bg-gradient-to-r from-green-400 to-green-600",
        text: "text-white",
      },
      Оплата: {
        bg: "bg-gradient-to-r from-emerald-400 to-emerald-600",
        text: "text-white",
      },
      Перенос: {
        bg: "bg-gradient-to-r from-orange-400 to-orange-600",
        text: "text-white",
      },
      "Клиент отказ": {
        bg: "bg-gradient-to-r from-red-400 to-red-600",
        text: "text-white",
      },
      "Каспий отказ": {
        bg: "bg-gradient-to-r from-red-400 to-red-600",
        text: "text-white",
      },
    };
    const config = statusConfig[status] || statusConfig["Ожидает"];
    return `${config.bg} ${config.text}`;
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
      <div className="p-8 border-b border-gray-100 bg-gradient-to-r from-blue-50 to-indigo-50">
        <h3 className="font-bold text-xl text-gray-900 flex items-center gap-3">
          <BookOpen className="w-6 h-6 text-blue-600" />
          Список пробных уроков
          <span className="ml-auto bg-gradient-to-r from-blue-500 to-indigo-500 text-white text-sm font-bold px-4 py-2 rounded-full">
            {filteredEntries.length} из {entries.length}
          </span>
        </h3>
      </div>
      <div className="p-8 bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
        <div className="flex flex-wrap gap-2 mb-4">
          <button
            onClick={() => handleSourceButtonClick("")}
            className={`px-4 py-2 text-sm font-semibold rounded-full transition-colors ${
              !filters.source
                ? "bg-blue-600 text-white shadow-md"
                : "bg-white text-gray-700 hover:bg-gray-200"
            }`}
          >
            Все ({entries.length})
          </button>
          {ALL_SOURCES.map((source) => (
            <button
              key={source}
              onClick={() => handleSourceButtonClick(source)}
              className={`px-4 py-2 text-sm font-semibold rounded-full transition-colors ${
                filters.source === source
                  ? "bg-blue-600 text-white shadow-md"
                  : "bg-white text-gray-700 hover:bg-gray-200"
              }`}
            >
              {source} ({sourceCounts[source]})
            </button>
          ))}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-2">
              Начало периода
            </label>
            <input
              type="date"
              name="startDate"
              value={filters.startDate}
              onChange={handleFilterChange}
              className="w-full p-3 border-2 border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 font-medium"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-2">
              Конец периода
            </label>
            <input
              type="date"
              name="endDate"
              value={filters.endDate}
              onChange={handleFilterChange}
              className="w-full p-3 border-2 border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 font-medium"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-2">
              РОП
            </label>
            <select
              name="rop"
              value={filters.rop}
              onChange={handleFilterChange}
              className="w-full p-3 border-2 border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 font-medium"
            >
              <option value="">Все РОП</option>
              {ropList.map((r) => (
                <option key={r.id} value={r.name}>
                  {r.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-2">
              Статус
            </label>
            <select
              name="status"
              value={filters.status}
              onChange={handleFilterChange}
              className="w-full p-3 border-2 border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 font-medium"
            >
              <option value="">Все статусы</option>
              {[
                "Ожидает",
                "Назначен",
                "Проведен",
                "Перенос",
                "Оплата",
                "Клиент отказ",
                "Каспий отказ",
              ].map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
            <tr>
              {[
                "Клиент",
                "Телефон",
                "Дата/Время",
                "РОП",
                "Преподаватель",
                "Статус",
                "Оплата",
              ].map((header) => (
                <th
                  key={header}
                  className="px-8 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider"
                >
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {filteredEntries.map((entry, index) => (
              <tr
                key={entry.id}
                onClick={() => onOpenDetails(entry, readOnly)}
                className={`hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 cursor-pointer transition-all ${
                  index % 2 === 0 ? "bg-white" : "bg-gray-50"
                }`}
              >
                <td className="px-8 py-6 whitespace-nowrap">
                  <div className="font-bold text-gray-900">
                    {entry.clientName}
                  </div>
                </td>
                <td className="px-8 py-6 whitespace-nowrap text-sm text-gray-600 font-medium">
                  {formatPhoneNumber(entry.phone)}
                </td>
                <td className="px-8 py-6 whitespace-nowrap text-sm text-gray-600 font-medium">
                  {entry.trialDate} {entry.trialTime}
                </td>
                <td className="px-8 py-6 whitespace-nowrap text-sm text-gray-600 font-medium">
                  {entry.rop}
                </td>
                <td className="px-8 py-6 whitespace-nowrap text-sm text-gray-600 font-medium">
                  {entry.assignedTeacher || "---"}
                </td>
                <td className="px-8 py-6 whitespace-nowrap">
                  <span
                    className={`inline-flex px-3 py-2 text-xs font-bold rounded-full shadow-sm ${getStatusBadge(
                      entry.status || "Ожидает"
                    )}`}
                  >
                    {entry.status || "Ожидает"}
                  </span>
                </td>
                <td className="px-8 py-6 whitespace-nowrap text-sm font-bold">
                  {entry.paymentAmount > 0 ? (
                    <span className="text-green-600">
                      {entry.paymentAmount.toLocaleString("ru-RU")} ₸
                    </span>
                  ) : (
                    <span className="text-gray-400">---</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {filteredEntries.length === 0 && (
        <div className="text-center py-16">
          <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <BookOpen className="w-10 h-10 text-gray-400" />
          </div>
          <p className="text-gray-500 font-semibold text-lg">
            Записи не найдены
          </p>
          <p className="text-sm text-gray-400 mt-2">
            Попробуйте изменить фильтры поиска
          </p>
        </div>
      )}
    </div>
  );
};

const LeaderboardView = ({
  entries,
  ropList,
  currentUser,
  plans,
  onSavePlans,
}) => {
  const [showPlanModal, setShowPlanModal] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const toDateString = (date) => date.toISOString().split("T")[0];
  const [dateRange, setDateRange] = useState({
    startDate: toDateString(new Date()),
    endDate: toDateString(new Date()),
  });

  const handleDateChange = (e) => {
    setDateRange((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const filteredEntries = useMemo(() => {
    const start = dateRange.startDate ? new Date(dateRange.startDate) : null;
    const end = dateRange.endDate ? new Date(dateRange.endDate) : null;
    if (start) start.setHours(0, 0, 0, 0);
    if (end) end.setHours(23, 59, 59, 999);

    return entries.filter((entry) => {
      const entryDate = new Date(entry.createdAt);
      return (!start || entryDate >= start) && (!end || entryDate <= end);
    });
  }, [entries, dateRange]);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);
    return () => clearInterval(timer);
  }, []);

  const leaderboardData = useMemo(() => {
    if (!ropList || ropList.length === 0) return [];
    const stats = {};
    ropList.forEach((rop) => {
      stats[rop.name] = {
        trials: 0,
        cash: 0,
        plan: plans[rop.name] || 0,
        trialPlan: plans[`${rop.name}_trial`] || 0,
      };
    });
    filteredEntries.forEach((entry) => {
      if (stats[entry.rop]) {
        stats[entry.rop].trials += 1;
        if (entry.status === "Оплата") {
          stats[entry.rop].cash += Number(entry.paymentAmount) || 0;
        }
      }
    });

    const dataForSorting = Object.entries(stats).map(([name, data]) => ({
      name,
      ...data,
      cashProgress:
        data.plan > 0 ? Math.min((data.cash / data.plan) * 100, 100) : 0,
      trialProgress:
        data.trialPlan > 0
          ? Math.min((data.trials / data.trialPlan) * 100, 100)
          : 0,
      cashRemaining: Math.max(data.plan - data.cash, 0),
      trialRemaining: Math.max(data.trialPlan - data.trials, 0),
    }));

    const totalCashInPeriod = dataForSorting.reduce(
      (sum, rop) => sum + rop.cash,
      0
    );

    if (totalCashInPeriod > 0) {
      return dataForSorting.sort((a, b) => b.cash - a.cash);
    } else {
      return dataForSorting.sort((a, b) => b.trials - a.trials);
    }
  }, [filteredEntries, ropList, plans]);

  const hourlyProgress = useMemo(() => {
    const now = currentTime;
    const today = now.toISOString().split("T")[0];

    const todayEntries = entries.filter((entry) => {
      const entryDate = new Date(entry.createdAt);
      return entryDate.toISOString().split("T")[0] === today;
    });

    const hourlyCounts = Array(24).fill(0);
    todayEntries.forEach((entry) => {
      const entryHour = new Date(entry.createdAt).getHours();
      hourlyCounts[entryHour]++;
    });

    const hourlyTarget = 12;
    const currentHour = now.getHours();
    const currentHourEntries = hourlyCounts[currentHour];
    const progress = Math.min((currentHourEntries / hourlyTarget) * 100, 100);

    return {
      current: currentHourEntries,
      target: hourlyTarget,
      progress: progress,
      remaining: Math.max(hourlyTarget - currentHourEntries, 0),
    };
  }, [entries, currentTime]);

  const totalTrials = filteredEntries.length;
  const totalCash = leaderboardData.reduce((sum, rop) => sum + rop.cash, 0);
  const totalPlan = leaderboardData.reduce((sum, rop) => sum + rop.plan, 0);
  const totalTrialPlan = leaderboardData.reduce(
    (sum, rop) => sum + rop.trialPlan,
    0
  );

  return (
    <div className="w-full mx-auto space-y-8">
      <div
        className={`flex items-center ${
          currentUser?.role === "public" ? "justify-center" : "justify-end"
        }`}
      >
        {currentUser?.role === "public" && (
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-r from-yellow-400 to-yellow-600 rounded-3xl mb-6 shadow-2xl">
              <TrendingUp className="w-12 h-12 text-white" />
            </div>
            <h2 className="text-4xl font-black text-gray-900 mb-4">
              Команданың нәтижесі
            </h2>
            <p className="text-gray-600 text-lg">
              Результаты работы по пробным урокам
            </p>
          </div>
        )}
        {currentUser?.role === "admin" && (
          <button
            onClick={() => setShowPlanModal(true)}
            className="flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-2xl hover:from-blue-600 hover:to-blue-700 transition-all font-bold shadow-lg"
          >
            <Target className="w-5 h-5" />
            Установить планы
          </button>
        )}
      </div>

      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <h3 className="font-bold text-lg text-gray-900 mb-4">Фильтр по дате</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Начальная дата
            </label>
            <input
              type="date"
              name="startDate"
              value={dateRange.startDate}
              onChange={handleDateChange}
              className="w-full p-3 border-2 border-gray-200 rounded-xl font-medium"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Конечная дата
            </label>
            <input
              type="date"
              name="endDate"
              value={dateRange.endDate}
              onChange={handleDateChange}
              className="w-full p-3 border-2 border-gray-200 rounded-xl font-medium"
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-3xl p-6 text-white shadow-2xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm font-semibold uppercase tracking-wide">
                Жалпы пробный
              </p>
              <p className="text-3xl font-black mt-2">{totalTrials}</p>
              {totalTrialPlan > 0 && (
                <p className="text-blue-200 text-sm mt-1">
                  План: {totalTrialPlan}
                </p>
              )}
            </div>
            <div className="w-14 h-14 bg-blue-400 rounded-2xl flex items-center justify-center shadow-lg">
              <BookOpen className="w-7 h-7 text-white" />
            </div>
          </div>
        </div>
        <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-3xl p-6 text-white shadow-2xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm font-semibold uppercase tracking-wide">
                Жалпы касса
              </p>
              <p className="text-3xl font-black mt-2">
                {totalCash.toLocaleString("ru-RU")} ₸
              </p>
              {totalPlan > 0 && (
                <p className="text-green-200 text-sm mt-1">
                  План: {totalPlan.toLocaleString("ru-RU")} ₸
                </p>
              )}
            </div>
            <div className="w-14 h-14 bg-green-400 rounded-2xl flex items-center justify-center shadow-lg">
              <TrendingUp className="w-7 h-7 text-white" />
            </div>
          </div>
        </div>
        <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-3xl p-6 text-white shadow-2xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100 text-sm font-semibold uppercase tracking-wide">
                Касса осталось
              </p>
              <p className="text-3xl font-black mt-2">
                {Math.max(totalPlan - totalCash, 0).toLocaleString("ru-RU")} ₸
              </p>
              <p className="text-purple-200 text-sm mt-1">
                {totalPlan > 0
                  ? `${Math.round((totalCash / totalPlan) * 100)}%`
                  : "0%"}{" "}
                выполнено
              </p>
            </div>
            <div className="w-14 h-14 bg-purple-400 rounded-2xl flex items-center justify-center shadow-lg">
              <Target className="w-7 h-7 text-white" />
            </div>
          </div>
        </div>
        <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-3xl p-6 text-white shadow-2xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-100 text-sm font-semibold uppercase tracking-wide">
                Пробный осталось
              </p>
              <p className="text-3xl font-black mt-2">
                {Math.max(totalTrialPlan - totalTrials, 0)}
              </p>
              <p className="text-orange-200 text-sm mt-1">
                {totalTrialPlan > 0
                  ? `${Math.round((totalTrials / totalTrialPlan) * 100)}%`
                  : "0%"}{" "}
                выполнено
              </p>
            </div>
            <div className="w-14 h-14 bg-orange-400 rounded-2xl flex items-center justify-center shadow-lg">
              <Users className="w-7 h-7 text-white" />
            </div>
          </div>
        </div>
      </div>
      <div className="bg-white rounded-3xl shadow-2xl border border-gray-100">
        <div className="p-8 border-b border-gray-200">
          <h3 className="text-2xl font-bold text-gray-900">
            Рейтинг с прогрессом по планам
          </h3>
        </div>
        <div className="divide-y divide-gray-200">
          {leaderboardData.map((rop, index) => (
            <div
              key={rop.name}
              className="p-8 hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-6">
                  <div
                    className={`w-16 h-16 bg-gradient-to-r ${getRankColor(
                      index
                    )} rounded-2xl flex items-center justify-center text-white font-black shadow-lg`}
                  >
                    {typeof getRankIcon(index) === "string" &&
                    getRankIcon(index).length > 1 ? (
                      <span className="text-2xl">{getRankIcon(index)}</span>
                    ) : (
                      <span className="text-xl">{getRankIcon(index)}</span>
                    )}
                  </div>
                  <div>
                    <h4 className="font-bold text-xl text-gray-900">
                      {rop.name}
                    </h4>
                    <div className="flex gap-4 text-sm text-gray-500 font-medium">
                      <span>{rop.trials} пробных уроков</span>
                      {rop.trialPlan > 0 && <span>План: {rop.trialPlan}</span>}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-3xl font-black text-green-600">
                    {rop.cash.toLocaleString("ru-RU")} ₸
                  </p>
                  {rop.plan > 0 && (
                    <p className="text-sm text-gray-500 font-medium">
                      Осталось: {rop.cashRemaining.toLocaleString("ru-RU")} ₸
                    </p>
                  )}
                </div>
              </div>
              <div className="space-y-4">
                {rop.plan > 0 && (
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-semibold text-gray-700">
                        Прогресс по кассе
                      </span>
                      <span className="text-sm font-bold text-green-600">
                        {Math.round(rop.cashProgress)}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div
                        className="bg-gradient-to-r from-green-400 to-green-600 h-3 rounded-full transition-all duration-500"
                        style={{ width: `${rop.cashProgress}%` }}
                      ></div>
                    </div>
                  </div>
                )}
                {rop.trialPlan > 0 && (
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-semibold text-gray-700">
                        Прогресс по пробным
                      </span>
                      <span className="text-sm font-bold text-blue-600">
                        {Math.round(rop.trialProgress)}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div
                        className="bg-gradient-to-r from-blue-400 to-blue-600 h-3 rounded-full transition-all duration-500"
                        style={{ width: `${rop.trialProgress}%` }}
                      ></div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-3xl p-8 text-white shadow-2xl">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-2xl font-bold mb-2 flex items-center gap-3">
              <Clock className="w-8 h-8" />
              Почасовой прогресс
            </h3>
            <p className="text-indigo-100">
              Цель: {hourlyProgress.target} пробных уроков в час
            </p>
          </div>
          <div className="text-right">
            <p className="text-4xl font-black">
              {hourlyProgress.current}/{hourlyProgress.target}
            </p>
            <p className="text-indigo-200 text-sm">
              Текущий час: {currentTime.getHours()}:00
            </p>
          </div>
        </div>
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-indigo-100 font-semibold">
              Прогресс за текущий час
            </span>
            <span className="text-white font-bold text-lg">
              {Math.round(hourlyProgress.progress)}%
            </span>
          </div>
          <div className="w-full bg-indigo-400 rounded-full h-4">
            <div
              className="bg-gradient-to-r from-yellow-400 to-orange-500 h-4 rounded-full transition-all duration-1000 shadow-lg"
              style={{ width: `${hourlyProgress.progress}%` }}
            ></div>
          </div>
          <div className="flex justify-between text-sm text-indigo-200">
            <span>Зарегистрировано: {hourlyProgress.current}</span>
            <span>Осталось: {hourlyProgress.remaining}</span>
          </div>
        </div>
      </div>

      <PlanModal
        isVisible={showPlanModal}
        onClose={() => setShowPlanModal(false)}
        ropList={ropList}
        plans={plans}
        onSavePlans={onSavePlans}
      />
    </div>
  );
};
const ConversionView = ({ entries, teacherSchedule }) => {
  const [filters, setFilters] = useState({ startDate: "", endDate: "" });

  const handleFilterChange = (e) => {
    setFilters((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const filteredEntries = useMemo(() => {
    const startDate = filters.startDate ? new Date(filters.startDate) : null;
    if (startDate) startDate.setUTCHours(0, 0, 0, 0);

    const endDate = filters.endDate ? new Date(filters.endDate) : null;
    if (endDate) endDate.setUTCHours(23, 59, 59, 999);

    return entries.filter((entry) => {
      const entryDate = new Date(entry.createdAt);
      let dateMatch = true;

      if (startDate && endDate) {
        dateMatch = entryDate && entryDate >= startDate && entryDate <= endDate;
      } else if (startDate) {
        dateMatch = entryDate && entryDate >= startDate;
      } else if (endDate) {
        dateMatch = entryDate && entryDate <= endDate;
      }

      return dateMatch;
    });
  }, [entries, filters]);

  const conversionData = useMemo(() => {
    if (!teacherSchedule?.teachers?.length) return [];
    const stats = {};
    teacherSchedule.teachers.forEach((teacher) => {
      stats[teacher] = { name: teacher, conducted: 0, payments: 0 };
    });
    filteredEntries.forEach((entry) => {
      if (entry.assignedTeacher && stats[entry.assignedTeacher]) {
        if (["Проведен", "Оплата", "Клиент отказ", "Каспий отказ"].includes(entry.status)) {
          stats[entry.assignedTeacher].conducted += 1;
        }
        if (entry.status === "Оплата") {
          stats[entry.assignedTeacher].payments += 1;
        }
      }
    });
    return Object.values(stats)
      .map((data) => ({
        ...data,
        conversion:
          data.conducted > 0
            ? ((data.payments / data.conducted) * 100).toFixed(1)
            : 0,
      }))
      // .sort((a, b) => b.conversion - a.conversion);
      .sort((a, b) => {
  if (b.conducted !== a.conducted) {
    return b.conducted - a.conducted;
  }
  return b.conversion - a.conversion;
});

  }, [filteredEntries, teacherSchedule?.teachers]);

  const getConversionColor = (conversion) => {
    if (conversion >= 70)
      return "text-green-600 bg-gradient-to-r from-green-100 to-green-200";
    if (conversion >= 50)
      return "text-yellow-600 bg-gradient-to-r from-yellow-100 to-yellow-200";
    if (conversion >= 30)
      return "text-orange-600 bg-gradient-to-r from-orange-100 to-orange-200";
    return "text-red-600 bg-gradient-to-r from-red-100 to-red-200";
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
      <div className="p-8 border-b border-gray-100 bg-gradient-to-r from-purple-50 to-pink-50">
        <h3 className="font-bold text-xl text-gray-900 flex items-center gap-3">
          <TrendingUp className="w-6 h-6 text-purple-600" />
          Конверсия учителей
        </h3>
        <p className="text-gray-600 mt-2">
          Эффективность преобразования пробных уроков в оплаты
        </p>
      </div>
      <div className="p-8 bg-gray-50 border-b border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-2">
              Начало периода
            </label>
            <input
              type="date"
              name="startDate"
              value={filters.startDate}
              onChange={handleFilterChange}
              className="w-full p-3 border-2 border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-purple-500 font-medium"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-2">
              Конец периода
            </label>
            <input
              type="date"
              name="endDate"
              value={filters.endDate}
              onChange={handleFilterChange}
              className="w-full p-3 border-2 border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-purple-500 font-medium"
            />
          </div>
          <div className="flex items-end">
            <button
              onClick={() => setFilters({ startDate: "", endDate: "" })}
              className="w-full px-4 py-3 bg-gradient-to-r from-gray-400 to-gray-500 text-white rounded-xl hover:from-gray-500 hover:to-gray-600 transition-all font-bold"
            >
              Сбросить
            </button>
          </div>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
            <tr>
              <th className="px-8 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                Преподаватель
              </th>
              <th className="px-8 py-4 text-center text-xs font-bold text-gray-700 uppercase tracking-wider">
                Проведено уроков
              </th>
              <th className="px-8 py-4 text-center text-xs font-bold text-gray-700 uppercase tracking-wider">
                Оплаты
              </th>
              <th className="px-8 py-4 text-center text-xs font-bold text-gray-700 uppercase tracking-wider">
                Конверсия
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {conversionData.map((teacher, index) => (
              <tr
                key={teacher.name}
                className="hover:bg-gradient-to-r hover:from-purple-50 hover:to-pink-50 transition-all"
              >
                <td className="px-8 py-6 whitespace-nowrap">
                  <div className="flex items-center gap-4">
                    <div
                      className={`w-10 h-10 rounded-2xl flex items-center justify-center text-sm font-bold shadow-lg ${
                        index < 3
                          ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white"
                          : "bg-gradient-to-r from-gray-200 to-gray-300 text-gray-600"
                      }`}
                    >
                      {index + 1}
                    </div>
                    <div className="font-bold text-gray-900">
                      {teacher.name}
                    </div>
                  </div>
                </td>
                <td className="px-8 py-6 whitespace-nowrap text-center">
                  <span className="font-bold text-gray-900 text-lg">
                    {teacher.conducted}
                  </span>
                </td>
                <td className="px-8 py-6 whitespace-nowrap text-center">
                  <span className="font-bold text-green-600 text-lg">
                    {teacher.payments}
                  </span>
                </td>
                <td className="px-8 py-6 whitespace-nowrap text-center">
                  <span
                    className={`inline-flex px-4 py-2 text-sm font-bold rounded-full shadow-lg ${getConversionColor(
                      teacher.conversion
                    )}`}
                  >
                    {teacher.conversion}%
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {conversionData.length === 0 && (
        <div className="text-center py-16">
          <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <TrendingUp className="w-10 h-10 text-gray-400" />
          </div>
          <p className="text-gray-500 font-semibold text-lg">
            Нет данных для отображения
          </p>
        </div>
      )}
    </div>
  );
};
const TeacherScheduleView = ({
  entries,
  teacherSchedule,
  currentUser,
  onOpenDetails,
  onToggleBlockSlot,
  blockedSlots,
  selectedDate,
  onDateChange,
}) => {
  const myAssignedEntries = useMemo(() => {
    const map = new Map();
    if (currentUser?.name) {
      entries
        .filter(
          (entry) =>
            entry.assignedTeacher === currentUser.name &&
            entry.trialDate === selectedDate
        )
        .forEach((e) => {
          map.set(e.assignedTime, e);
        });
    }
    return map;
  }, [entries, currentUser, selectedDate]);

  const blockedSlotsMap = useMemo(() => {
    const map = new Map();
    blockedSlots
      .filter((s) => s.teacher === currentUser.name && s.date === selectedDate)
      .forEach((slot) => map.set(slot.time, true));
    return map;
  }, [blockedSlots, currentUser, selectedDate]);

  if (!currentUser) return <Spinner />;

  return (
    <div className="min-w-[1000px] mx-auto">
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
        <div className="p-8 border-b border-gray-100 bg-gradient-to-r from-green-50 to-emerald-50">
          <div className="flex flex-wrap justify-between items-center gap-4">
            <h3 className="font-bold text-xl text-gray-900 flex items-center gap-3">
              <Calendar className="w-6 h-6 text-green-600" />
              Мой график - {currentUser.name}
            </h3>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => onDateChange(e.target.value)}
              className="p-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all font-medium"
            />
          </div>
          <p className="text-gray-600 mt-2">
            Ваши назначенные уроки на{" "}
            {new Date(selectedDate + "T00:00:00").toLocaleDateString("ru-RU", {
              day: "numeric",
              month: "long",
            })}
          </p>
        </div>
        <div className="p-8">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr>
                  <th className="p-4 border-b-2 border-gray-200 font-bold text-gray-900 text-left w-1/4">
                    Время
                  </th>
                  <th className="p-4 border-b-2 border-gray-200 font-bold text-gray-900 text-left w-3/4">
                    Статус/Ученик
                  </th>
                </tr>
              </thead>
              <tbody>
                {teacherSchedule.timeSlots.map((time) => {
                  const entry = myAssignedEntries.get(time);
                  const isBlocked = blockedSlotsMap.has(time);
                  return (
                    <tr
                      key={time}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="p-4 border-b border-gray-100 font-bold text-gray-700">
                        {time}
                      </td>
                      <td
                        className={`p-3 border-b border-gray-100 h-20 cursor-pointer`}
                        onClick={() =>
                          !entry &&
                          onToggleBlockSlot(
                            selectedDate,
                            currentUser.name,
                            time
                          )
                        }
                      >
                        {entry ? (
                          <div
                            onClick={(e) => {
                              e.stopPropagation();
                              onOpenDetails(entry);
                            }}
                            className={`rounded-2xl p-4 transition-all hover:scale-[1.02] shadow-lg transform ${getAppointmentColorForStatus(
                              entry.status
                            )}`}
                          >
                            <div className="flex justify-between items-center">
                              <div>
                                <p className="font-bold text-lg">
                                  {entry.clientName}
                                </p>
                                <p className="text-sm opacity-90">
                                  {formatPhoneNumber(entry.phone)}
                                </p>
                              </div>
                              <div className="text-right">
                                <p className="text-sm opacity-90 font-semibold">
                                  {entry.rop}
                                </p>
                                {entry.comment && (
                                  <p className="text-xs opacity-75 truncate max-w-[150px]">
                                    {entry.comment}
                                  </p>
                                )}
                              </div>
                            </div>
                          </div>
                        ) : isBlocked ? (
                          <div className="h-full bg-gray-200 rounded-2xl flex items-center justify-center text-gray-500 font-semibold">
                            <Lock className="w-5 h-5 mr-2" /> Заблокировано
                          </div>
                        ) : (
                          <div className="h-full bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl border-2 border-dashed border-blue-200 flex items-center justify-center text-blue-400 hover:border-blue-400 hover:bg-blue-100 font-semibold">
                            <Unlock className="w-5 h-5 mr-2" /> Свободно
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
const TeacherAnalyticsView = ({ entries, currentUser }) => {
  const [timeFilter, setTimeFilter] = useState("month"); // 'day', 'week', 'month'

  const filteredEntries = useMemo(() => {
    const now = new Date();
    const teacherEntries = entries.filter(
      (e) => e.assignedTeacher === currentUser.name
    );

    if (timeFilter === "day") {
      const today = now.toISOString().split("T")[0];
      return teacherEntries.filter((e) => e.trialDate === today);
    }
    if (timeFilter === "week") {
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(now.getDate() - 7);
      return teacherEntries.filter((e) => new Date(e.createdAt) > oneWeekAgo);
    }
    if (timeFilter === "month") {
      const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      return teacherEntries.filter(
        (e) => new Date(e.createdAt) >= firstDayOfMonth
      );
    }
    return teacherEntries;
  }, [entries, currentUser, timeFilter]);

  const stats = useMemo(() => {
    const conducted = filteredEntries.filter((e) =>
      ["Проведен", "Оплата"].includes(e.status)
    ).length;

    const payments = filteredEntries.filter(
      (e) => e.status === "Оплата"
    ).length;

    const cash = filteredEntries
      .filter((e) => e.status === "Оплата")
      .reduce((sum, entry) => sum + (Number(entry.paymentAmount) || 0), 0);

    const typeMultiplier = (type) => {
      switch (type) {
        case "Gold":
        case "Чек":
          return 1; // 100%
        case "Red":
        case "Halyk":
          return 0.88; // 88%
        case "Рассрочка":
          return 0.85; // 85%
        default:
          return 1; // по умолчанию без среза
      }
    };

    const salary = filteredEntries.reduce((sum, e) => {
      const amount = Number(e.paymentAmount) || 0;
      const base = amount * typeMultiplier(e.paymentType);
      const commission = base * 0.05; // 5%
      const lessonBonus = e.status === "Проведен" ? 400 : 0;
      return sum + commission + lessonBonus;
    }, 0);

    const conversion =
      conducted > 0 ? parseFloat(((payments / conducted) * 100).toFixed(1)) : 0;

    return { conducted, payments, cash, conversion, salary };
  }, [filteredEntries]);

  const StatCard = ({ title, value, icon, gradient }) => (
    <div className={`rounded-3xl p-6 text-white shadow-2xl ${gradient}`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="opacity-80 text-lg font-semibold uppercase tracking-wide">
            {title}
          </p>
          <p className="text-5xl font-black mt-2">{value}</p>
        </div>
        <div className="w-20 h-20 bg-white/20 rounded-2xl flex items-center justify-center shadow-lg">
          {icon}
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-w-[1000px] space-y-8">
      <div className="flex justify-start gap-2 bg-gray-100 p-2 rounded-2xl">
        <button
          onClick={() => setTimeFilter("day")}
          className={`px-4 py-2 rounded-xl font-semibold ${
            timeFilter === "day"
              ? "bg-white text-blue-600 shadow-md"
              : "text-gray-500"
          }`}
        >
          День
        </button>
        <button
          onClick={() => setTimeFilter("week")}
          className={`px-4 py-2 rounded-xl font-semibold ${
            timeFilter === "week"
              ? "bg-white text-blue-600 shadow-md"
              : "text-gray-500"
          }`}
        >
          Неделя
        </button>
        <button
          onClick={() => setTimeFilter("month")}
          className={`px-4 py-2 rounded-xl font-semibold ${
            timeFilter === "month"
              ? "bg-white text-blue-600 shadow-md"
              : "text-gray-500"
          }`}
        >
          Месяц
        </button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
        <StatCard
          title="Проведено уроков"
          value={stats.conducted}
          icon={<Check size={40} className="text-white" />}
          gradient="bg-gradient-to-r from-blue-500 to-blue-600"
        />
        <StatCard
          title="Оплаты"
          value={stats.payments}
          icon={<CheckCircle size={40} className="text-white" />}
          gradient="bg-gradient-to-r from-emerald-500 to-emerald-600"
        />
        <StatCard
          title="Конверсия"
          value={`${stats.conversion}%`}
          icon={<TrendingUp size={40} className="text-white" />}
          gradient="bg-gradient-to-r from-purple-500 to-purple-600"
        />
        <StatCard
          title="Касса"
          value={`${stats.cash.toLocaleString("ru-RU")} ₸`}
          icon={<DollarSign size={40} className="text-white" />}
          gradient="bg-gradient-to-r from-green-500 to-green-600"
        />

        <StatCard
          title="Зарплата"
          value={`${Math.round(stats.salary).toLocaleString("ru-RU")} ₸`}
          icon={<DollarSign size={40} className="text-white" />}
          gradient="bg-gradient-to-r from-green-500 to-green-600"
        />
      </div>
    </div>
  );
};
const TeacherDashboard = (props) => {
  const [teacherTab, setTeacherTab] = useState("schedule");

  return (
    <div className="space-y-6">
      <div className="flex gap-2 bg-gray-100 p-2 rounded-2xl flex-wrap">
        <button
          onClick={() => setTeacherTab("schedule")}
          className={`px-6 py-3 rounded-xl text-sm font-bold transition-all shadow-sm ${
            teacherTab === "schedule"
              ? "bg-white text-blue-600 shadow-lg"
              : "text-gray-600 hover:bg-gray-50"
          }`}
        >
          Мой График
        </button>
        <button
          onClick={() => setTeacherTab("analytics")}
          className={`px-6 py-3 rounded-xl text-sm font-bold transition-all shadow-sm ${
            teacherTab === "analytics"
              ? "bg-white text-blue-600 shadow-lg"
              : "text-gray-600 hover:bg-gray-50"
          }`}
        >
          Моя Аналитика
        </button>
      </div>
      {teacherTab === "schedule" && <TeacherScheduleView {...props} />}
      {teacherTab === "analytics" && <TeacherAnalyticsView {...props} />}
    </div>
  );
};


const StatCard = ({ title, value, icon, gradient }) => (
  <div className={`rounded-3xl p-6 text-white shadow-2xl ${gradient}`}>
    <div className="flex items-center justify-between">
      <div>
        <p className="opacity-80 text-lg font-semibold uppercase tracking-wide">
          {title}
        </p>
        <p className="text-5xl font-black mt-2">{value}</p>
      </div>
      <div className="w-20 h-20 bg-white/20 rounded-2xl flex items-center justify-center shadow-lg">
        {icon}
      </div>
    </div>
  </div>
);

const FunnelStatCard = ({ title, count, total, icon, colorClass }) => {
  const rate = total > 0 ? (count / total) * 100 : 0;
  return (
    <div className={`p-5 rounded-2xl border-2 text-white ${colorClass}`}>
      <div className="flex items-center justify-between mb-2">
        <h4 className="font-bold text-base">{title}</h4>
        {icon}
      </div>
      <p className="text-4xl font-black">{count}</p>
      <div className="w-full bg-white/20 rounded-full h-1.5 mt-3">
        <div
          className="bg-white h-1.5 rounded-full"
          style={{ width: `${rate}%` }}
        ></div>
      </div>
      <p className="text-right text-xs font-semibold opacity-90 mt-1">
        {rate.toFixed(1)}% от всех заявок
      </p>
    </div>
  );
};

const BreakdownList = ({ title, data }) => (
  <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
    <h3 className="font-bold text-xl text-gray-900 mb-6">{title}</h3>
    <div
      className="w-full"
      style={{ height: `${Math.max(120, data.length * 45)}px` }}
    >
      {data.length > 0 ? (
        <ResponsiveContainer>
          <BarChart
            layout="vertical"
            data={data}
            margin={{ top: 5, right: 50, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" horizontal={false} />
            <XAxis type="number" hide />
            <YAxis
              yAxisId={0}
              dataKey="name"
              type="category"
              axisLine={false}
              tickLine={false}
              width={100}
              style={{ fontSize: "12px" }}
            />
            <YAxis
              yAxisId={1}
              orientation="right"
              dataKey="amount"
              type="category"
              axisLine={false}
              tickLine={false}
              tickFormatter={(value) => `${value.toLocaleString("ru-RU")} ₸`}
              style={{ fontSize: "12px", fill: "#6b7280" }}
            />
            <Tooltip
              formatter={(value) => `${value.toLocaleString("ru-RU")} ₸`}
            />
            <Bar
              yAxisId={0}
              dataKey="amount"
              name="Касса"
              fill="#3b82f6"
              radius={[0, 4, 4, 0]}
              maxBarSize={25}
            >
              <LabelList
                dataKey="name"
                position="insideLeft"
                style={{ fill: "white", fontSize: "12px", fontWeight: "bold" }}
              />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      ) : (
        <div className="flex items-center justify-center h-full">
          <p className="text-gray-500 text-center py-8">
            Нет данных для отображения.
          </p>
        </div>
      )}
    </div>
  </div>
);

const TrialSourceChart = ({ title, data }) => (
  <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
    <h3 className="font-bold text-xl text-gray-900 mb-6">{title}</h3>
    <div
      className="w-full"
      style={{ height: `${Math.max(120, data.length * 45)}px` }}
    >
      {data.length > 0 ? (
        <ResponsiveContainer>
          <BarChart
            layout="vertical"
            data={data}
            margin={{ top: 5, right: 50, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" horizontal={false} />
            <XAxis type="number" hide />
            <YAxis
              yAxisId={0}
              dataKey="name"
              type="category"
              axisLine={false}
              tickLine={false}
              width={120}
              style={{ fontSize: "12px" }}
            />
            <YAxis
              yAxisId={1}
              orientation="right"
              dataKey="count"
              type="category"
              axisLine={false}
              tickLine={false}
              tickFormatter={(value) => `${value}`}
              style={{ fontSize: "12px", fill: "#6b7280" }}
            />
            <Tooltip
              formatter={(value, name) => [`${value} пробных`, "Количество"]}
            />
            <Bar
              yAxisId={0}
              dataKey="count"
              name="Пробные"
              fill="#8884d8"
              radius={[0, 4, 4, 0]}
              maxBarSize={25}
            >
              <LabelList
                dataKey="name"
                position="insideLeft"
                style={{ fill: "white", fontSize: "12px", fontWeight: "bold" }}
              />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      ) : (
        <div className="flex items-center justify-center h-full">
          <p className="text-gray-500 text-center py-8">
            Нет данных для отображения.
          </p>
        </div>
      )}
    </div>
  </div>
);

const CombinedCashTrialsChart = ({ data }) => {
  const chartData = data.labels.map((label, i) => ({
    name: label,
    trials: data.trials[i],
    cash: data.cash[i],
  }));

  const formatCashTick = (tick) => {
    if (tick >= 1000) return `${(tick / 1000).toFixed(0)}k`;
    return tick;
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8">
      <h3 className="font-bold text-xl text-gray-900">
        График: Пробный сабақ и Касса
      </h3>
      <p className="text-gray-500 text-sm mb-4">
        Динамика пробных уроков и кассы за выбранный период
      </p>
      <ResponsiveContainer width="100%" height={450}>
        <ComposedChart
          data={chartData}
          margin={{ top: 20, right: 30, left: 0, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" vertical={false} />
          <XAxis dataKey="name" angle={-30} textAnchor="end" height={50} />
          <YAxis
            yAxisId="left"
            stroke="#f97316"
            label={{
              value: "Пробные",
              angle: -90,
              position: "insideLeft",
              fill: "#f97316",
            }}
          />
          <YAxis
            yAxisId="right"
            orientation="right"
            stroke="#4ade80"
            tickFormatter={formatCashTick}
            label={{
              value: "Касса (₸)",
              angle: -90,
              position: "insideRight",
              fill: "#4ade80",
            }}
          />
          <Tooltip
            formatter={(value, name) =>
              name === "Касса" ? `${value.toLocaleString("ru-RU")} ₸` : value
            }
          />
          <Legend />
          <Bar
            yAxisId="right"
            dataKey="cash"
            name="Касса"
            fill="#4ade80"
            radius={[4, 4, 0, 0]}
          />
          <Line
            yAxisId="left"
            type="monotone"
            dataKey="trials"
            name="Пробные"
            stroke="#f97316"
            strokeWidth={3}
            dot={{ r: 4 }}
            activeDot={{ r: 6 }}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
};

const ReachabilityChart = ({ stats }) => {
  const { scheduled, conducted, rate } = stats;
  const data = [{ name: "Доходимость", value: rate }];

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 flex flex-col items-center justify-center">
      <h3 className="font-bold text-xl text-gray-900 mb-4">
        Доходимость уроков
      </h3>
      <div className="relative w-40 h-40">
        <ResponsiveContainer>
          <RadialBarChart
            innerRadius="80%"
            outerRadius="100%"
            data={data}
            startAngle={90}
            endAngle={-270}
          >
            <RadialBar
              background
              clockWise
              dataKey="value"
              fill="#10b981"
              cornerRadius={10}
            />
            <Tooltip />
            <text
              x="50%"
              y="50%"
              textAnchor="middle"
              dominantBaseline="middle"
              className="text-3xl font-black text-teal-600"
            >
              {`${rate.toFixed(1)}%`}
            </text>
          </RadialBarChart>
        </ResponsiveContainer>
      </div>
      <p className="mt-4 text-lg font-bold text-gray-800">
        Проведено: {conducted} из {scheduled}
      </p>
      <p className="text-sm text-gray-500">назначенных уроков</p>
    </div>
  );
};

const AnalyticsView = ({ entries, ropList }) => {
  const toDateString = (date) => date.toISOString().slice(0, 10);

  const getInitialDateRange = () => {
    const today = new Date();
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    return {
      startDate: toDateString(startOfMonth),
      endDate: toDateString(today),
    };
  };

  const [filters, setFilters] = useState({
    ...getInitialDateRange(),
    source: "",
    rop: "",
    activeQuickFilter: "month",
  });

  const filteredEntries = useMemo(() => {
    const start = filters.startDate ? new Date(filters.startDate) : null;
    const end = filters.endDate ? new Date(filters.endDate) : null;

    if (start) start.setHours(0, 0, 0, 0);
    if (end) end.setHours(23, 59, 59, 999);

    return entries.filter((entry) => {
      const entryDate = new Date(entry.createdAt);
      const dateMatch =
        (!start || entryDate >= start) && (!end || entryDate <= end);
      const sourceMatch = !filters.source || entry.source === filters.source;
      const ropMatch = !filters.rop || entry.rop === filters.rop;
      return dateMatch && sourceMatch && ropMatch;
    });
  }, [entries, filters]);

  useEffect(() => {
    console.log("Фильтр:", filters);
    console.log("Фильтрованные заявки:", filteredEntries.length);
    console.log(
      "Статусы:",
      filteredEntries.map((e) => e.status)
    );
    console.log(
      "Оплаты:",
      filteredEntries.filter((e) => e.status === "Оплата")
    );
  }, [filteredEntries, filters]);

  const {
    totalCash,
    averageCheck,
    sourceStats,
    ropStats,
    funnelStats,
    correlationData,
    reachabilityStats,
    trialSourceStats,
  } = useMemo(() => {
    const paidEntries = filteredEntries.filter(
      (entry) => entry.status === "Оплата"
    );
    const cash = paidEntries.reduce(
      (sum, entry) => sum + (Number(entry.paymentAmount) || 0),
      0
    );
    const paymentsCount = paidEntries.length;
    const avgCheck = paymentsCount > 0 ? cash / paymentsCount : 0;

    const tempSourceStats = {};
    const tempRopStats = {};
    const tempTrialSourceStats = {};

    filteredEntries.forEach((entry) => {
      if (entry.source) {
        tempTrialSourceStats[entry.source] =
          (tempTrialSourceStats[entry.source] || 0) + 1;
      }
      if (entry.status === "Оплата") {
        const amount = Number(entry.paymentAmount) || 0;
        if (entry.source)
          tempSourceStats[entry.source] =
            (tempSourceStats[entry.source] || 0) + amount;
        if (entry.rop)
          tempRopStats[entry.rop] = (tempRopStats[entry.rop] || 0) + amount;
      }
    });

    const scheduledTrials = filteredEntries.filter((e) =>
      ["Назначен", "Проведен", "Оплата"].includes(e.status)
    ).length;
    const conductedTrials = filteredEntries.filter((e) =>
      ["Проведен", "Оплата"].includes(e.status)
    ).length;

    console.log(filteredEntries);
    const funnel = {
      total: filteredEntries.length,
      conducted: conductedTrials,
      paid: paymentsCount,
      refused: filteredEntries.filter((e) =>
        ["Клиент отказ", "Каспий отказ"].includes(e.status)
      ).length,
      rescheduled: filteredEntries.filter((e) => e.status === "Перенос").length,
    };

    const dataByDay = {};
    const start = new Date(filters.startDate + "T00:00:00");
    const end = new Date(filters.endDate + "T00:00:00");
    if (start <= end) {
      for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
        const day = toDateString(d);
        dataByDay[day] = { trials: 0, cash: 0 };
      }

      filteredEntries.forEach((entry) => {
        const day = toDateString(new Date(entry.createdAt));
        if (dataByDay[day]) {
          dataByDay[day].trials += 1;
          if (entry.status === "Оплата") {
            dataByDay[day].cash += Number(entry.paymentAmount) || 0;
          }
        }
      });
    }
    const sortedDays = Object.keys(dataByDay).sort();
    const correlation = {
      labels: sortedDays.map((day) =>
        new Date(day + "T00:00:00").toLocaleDateString("ru-RU", {
          day: "numeric",
          month: "short",
        })
      ),
      trials: sortedDays.map((day) => dataByDay[day].trials),
      cash: sortedDays.map((day) => dataByDay[day].cash),
    };

    const reachability = {
      scheduled: scheduledTrials,
      conducted: conductedTrials,
      rate: scheduledTrials > 0 ? (conductedTrials / scheduledTrials) * 100 : 0,
    };

    return {
      totalCash: cash,
      averageCheck: avgCheck,
      sourceStats: Object.entries(tempSourceStats)
        .map(([name, amount]) => ({ name, amount }))
        .sort((a, b) => b.amount - a.amount),
      ropStats: Object.entries(tempRopStats)
        .map(([name, amount]) => ({ name, amount }))
        .sort((a, b) => b.amount - a.amount),
      trialSourceStats: Object.entries(tempTrialSourceStats)
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count), // Corrected this line
      funnelStats: funnel,
      correlationData: correlation,
      reachabilityStats: reachability,
    };
  }, [filteredEntries, filters.startDate, filters.endDate]);

  const handleFilterChange = (e) => {
    setFilters((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
      activeQuickFilter: "",
    }));
  };

  const handleQuickFilter = (period) => {
    const today = new Date();
    let startDate;
    if (period === "day") {
      startDate = today;
    } else if (period === "week") {
      startDate = new Date(
        today.getFullYear(),
        today.getMonth(),
        today.getDate() - 6
      );
    } else if (period === "month") {
      startDate = new Date(today.getFullYear(), today.getMonth(), 1);
    }
    setFilters((prev) => ({
      ...prev,
      startDate: toDateString(startDate),
      endDate: toDateString(today),
      activeQuickFilter: period,
    }));
  };

  return (
    <div className="space-y-8">
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <div className="flex flex-wrap items-center justify-between gap-y-4">
          <h3 className="font-bold text-xl text-gray-900 flex items-center gap-3 w-full sm:w-auto">
            <Filter className="w-6 h-6 text-blue-600" />
            Фильтры аналитики
          </h3>
          <div className="flex gap-2 bg-gray-100 p-1 rounded-xl">
            {["day", "week", "month"].map((period) => (
              <button
                key={period}
                onClick={() => handleQuickFilter(period)}
                className={`px-4 py-2 rounded-lg font-semibold text-sm transition-all ${
                  filters.activeQuickFilter === period
                    ? "bg-white text-blue-600 shadow"
                    : "text-gray-500"
                }`}
              >
                {period === "day"
                  ? "День"
                  : period === "week"
                  ? "Неделя"
                  : "Месяц"}
              </button>
            ))}
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Начало периода
            </label>
            <input
              type="date"
              name="startDate"
              value={filters.startDate}
              onChange={handleFilterChange}
              className="w-full p-3 border-2 border-gray-200 rounded-xl font-medium"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Конец периода
            </label>
            <input
              type="date"
              name="endDate"
              value={filters.endDate}
              onChange={handleFilterChange}
              className="w-full p-3 border-2 border-gray-200 rounded-xl font-medium"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Источник
            </label>
            <select
              name="source"
              value={filters.source}
              onChange={handleFilterChange}
              className="w-full p-3 border-2 border-gray-200 rounded-xl font-medium"
            >
              <option value="">Все источники</option>
              {ALL_SOURCES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              РОП
            </label>
            <select
              name="rop"
              value={filters.rop}
              onChange={handleFilterChange}
              className="w-full p-3 border-2 border-gray-200 rounded-xl font-medium"
            >
              <option value="">Все РОП</option>
              {ropList.map((r) => (
                <option key={r.id} value={r.name}>
                  {r.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div>
        <h3 className="font-bold text-2xl text-gray-900 mb-4">
          Воронка за период
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <FunnelStatCard
            title="Всего заявок"
            count={funnelStats.total}
            total={funnelStats.total}
            icon={<BookCopy size={24} />}
            colorClass="bg-gray-500 border-gray-600"
          />
          {/* <FunnelStatCard
            title="Проведено"
            count={funnelStats.conducted}
            total={funnelStats.total}
            icon={<UserCheck size={24} />}
            colorClass="bg-blue-500 border-blue-600"
          /> */}
          <FunnelStatCard
            title="Оплаты"
            count={funnelStats.paid}
            total={funnelStats.total}
            icon={<CheckCircle size={24} />}
            colorClass="bg-green-500 border-green-600"
          />
          <FunnelStatCard
            title="Отказы"
            count={funnelStats.refused}
            total={funnelStats.total}
            icon={<XCircle size={24} />}
            colorClass="bg-red-500 border-red-600"
          />
          <FunnelStatCard
            title="Переносы"
            count={funnelStats.rescheduled}
            total={funnelStats.total}
            icon={<History size={24} />}
            colorClass="bg-orange-500 border-orange-600"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <StatCard
          title="Общая касса"
          value={`${totalCash.toLocaleString("ru-RU")} ₸`}
          icon={<DollarSign className="w-10 h-10 text-white" />}
          gradient="bg-gradient-to-r from-green-500 to-green-600"
        />
        <StatCard
          title="Средний чек"
          value={`${averageCheck.toLocaleString("ru-RU", {
            maximumFractionDigits: 0,
          })} ₸`}
          icon={<PieChartIcon className="w-10 h-10 text-white" />}
          gradient="bg-gradient-to-r from-purple-500 to-purple-600"
        />
        <ReachabilityChart stats={reachabilityStats} />
      </div>

      <CombinedCashTrialsChart data={correlationData} />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <BreakdownList title="Касса по источникам" data={sourceStats} />
        <BreakdownList title="Касса по РОП" data={ropStats} />
      </div>

      <div className="mt-8">
        <TrialSourceChart
          title="Количество пробных по источникам"
          data={trialSourceStats}
        />
      </div>
    </div>
  );
};

const AdminPage = ({
  tabs,
  activeTab,
  setActiveTab,
  currentUser,
  onBack,
  readOnly,
  selectedDate,
  onDateChange,
  plans,
  onSavePlans,
  ...props
}) => {
  const renderAdminView = () => {
    switch (activeTab) {
      case "trials-list":
        return (
          <TrialsListView
            {...props}
            onOpenDetails={props.onOpenDetails}
            readOnly={readOnly}
          />
        );
      case "leaderboard":
        return (
          <LeaderboardView
            {...props}
            currentUser={currentUser}
            plans={plans}
            onSavePlans={onSavePlans}
          />
        );
      case "conversion":
        return (
          <ConversionView {...props} teacherSchedule={props.teacherSchedule} />
        );
      case "analytics":
        return <AnalyticsView {...props} />;
      case "users":
        return <UserManagementView {...props} />;
      case "notifications": // Новая вкладка
        return <TeacherNotificationSender />;
      case "distribution":
      default:
        return (
          <DistributionView
            {...props}
            readOnly={readOnly}
            onOpenDetails={props.onOpenDetails}
            selectedDate={selectedDate}
            onDateChange={onDateChange}
          />
        );
    }
  };

  return (
    <section className="space-y-8">
      <div className="flex flex-wrap justify-between items-center gap-6 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        {onBack && (
          <button
            onClick={onBack}
            className="flex items-center gap-3 text-blue-600 hover:text-blue-800 font-bold transition-colors bg-blue-50 px-4 py-2 rounded-xl hover:bg-blue-100"
          >
            <ArrowLeft size={20} />
            Назад
          </button>
        )}
        <div className="flex gap-2 bg-gray-100 p-2 rounded-2xl flex-wrap">
          {tabs
            .filter(
              (tab) =>
                !readOnly && (currentUser.role === "admin" || !tab.adminOnly)
            )
            .map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-6 py-3 rounded-xl text-sm font-bold transition-all shadow-sm ${
                  activeTab === tab.id
                    ? "bg-white text-blue-600 shadow-lg transform scale-105"
                    : "text-gray-600 hover:bg-gray-50"
                }`}
              >
                {tab.label}
              </button>
            ))}
        </div>
        <div className="text-sm text-gray-600 font-bold bg-gray-100 px-4 py-2 rounded-xl">
          {new Date().toLocaleDateString("ru-RU", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </div>
      </div>
      {renderAdminView()}
    </section>
  );
};

const UserManagementView = ({ users, onSaveUser, onDeleteUser }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentUserToEdit, setCurrentUserToEdit] = useState(null);

  const handleAddNew = () => {
    setCurrentUserToEdit(null);
    setIsModalOpen(true);
  };

  const handleEdit = (user) => {
    setCurrentUserToEdit(user);
    setIsModalOpen(true);
  };

  const handleSave = (userData) => {
    onSaveUser(userData);
    setIsModalOpen(false);
  };

  const handleDelete = (userId) => {
    // Replace with a custom modal in a real app
    const isConfirmed = window.confirm(
      "Вы уверены, что хотите удалить этого пользователя?"
    );
    if (isConfirmed) {
      onDeleteUser(userId);
    }
  };

  return (
    <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">
          Управление пользователями
        </h2>
        <button
          onClick={handleAddNew}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-semibold rounded-xl shadow-lg hover:from-blue-600 hover:to-blue-700 transition-all"
        >
          <Plus size={18} />
          Добавить пользователя
        </button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-gray-50">
              <th className="p-4 font-bold text-gray-600">Имя</th>
              <th className="p-4 font-bold text-gray-600">Логин</th>
              <th className="p-4 font-bold text-gray-600">Роль</th>
              <th className="p-4 font-bold text-gray-600 text-right">
                Действия
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {users.map((user) => (
              <tr key={user.id}>
                <td className="p-4 font-medium text-gray-900">{user.name}</td>
                <td className="p-4 text-gray-600">{user.username}</td>
                <td className="p-4 text-gray-600">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      user.role === "admin"
                        ? "bg-red-100 text-red-700"
                        : user.role === "rop"
                        ? "bg-blue-100 text-blue-700"
                        : "bg-green-100 text-green-700"
                    }`}
                  >
                    {user.role}
                  </span>
                </td>
                <td className="p-4 flex justify-end gap-2">
                  <button
                    onClick={() => handleEdit(user)}
                    className="p-2 text-gray-500 hover:text-blue-600 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <Edit size={18} />
                  </button>
                  <button
                    onClick={() => handleDelete(user.id)}
                    className="p-2 text-gray-500 hover:text-red-600 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <Trash2 size={18} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {isModalOpen && (
        <UserModal
          user={currentUserToEdit}
          onClose={() => setIsModalOpen(false)}
          onSave={handleSave}
        />
      )}
    </div>
  );
};

const UserModal = ({ user, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    id: user?.id || null,
    name: user?.name || "",
    username: user?.username || "",
    password: "",
    role: user?.role || "teacher",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (
      !formData.name ||
      !formData.username ||
      (!formData.id && !formData.password)
    ) {
      // Replace with a custom modal/toast in a real app
      alert("Пожалуйста, заполните все обязательные поля.");
      return;
    }
    onSave(formData);
  };

  return (
    <Modal isVisible={true} onClose={onClose} size="md">
      <div className="p-8">
        <h3 className="text-2xl font-bold mb-6">
          {user ? "Редактировать пользователя" : "Добавить пользователя"}
        </h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Имя
            </label>
            <input
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="w-full p-3 border-2 border-gray-200 rounded-xl"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Логин
            </label>
            <input
              name="username"
              value={formData.username}
              onChange={handleChange}
              className="w-full p-3 border-2 border-gray-200 rounded-xl"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Пароль
            </label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className="w-full p-3 border-2 border-gray-200 rounded-xl"
              placeholder={user ? "Оставьте пустым, чтобы не менять" : ""}
              required={!user}
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Роль
            </label>
            <select
              name="role"
              value={formData.role}
              onChange={handleChange}
              className="w-full p-3 border-2 border-gray-200 rounded-xl"
            >
              <option value="teacher">Учитель</option>
              <option value="rop">РОП</option>
              <option value="admin">Администратор</option>
            </select>
          </div>
          <div className="flex justify-end gap-4 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg font-semibold"
            >
              Отмена
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-blue-600 text-white rounded-lg font-semibold"
            >
              Сохранить
            </button>
          </div>
        </form>
      </div>
    </Modal>
  );
};

// =================================================================
//                          MAIN APP COMPONENT
// =================================================================

export default function App() {
  const [view, setView] = useState("form");
  const [adminTab, setAdminTab] = useState("distribution");
  const [currentUser, setCurrentUser] = useState(null);
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [plans, setPlans] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [entries, setEntries] = useState([]);
  const [blockedSlots, setBlockedSlots] = useState([]);
  const [users, setUsers] = useState(initialUsers);

  const ropList = useMemo(() => users.filter((u) => u.role === "rop"), [users]);
  const teacherList = useMemo(
    () => users.filter((u) => u.role === "teacher").map((t) => t.name),
    [users]
  );
  const [teacherSchedule, setTeacherSchedule] = useState({
    teachers: teacherList,
    timeSlots: generateTimeSlots(),
  });

  useEffect(() => {
    setTeacherSchedule({
      teachers: teacherList,
      timeSlots: generateTimeSlots(),
    });
  }, [teacherList]);

  const [toast, setToast] = useState({
    isVisible: false,
    message: "",
    type: "",
  });
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState(null);
  const [isDetailsReadOnly, setIsDetailsReadOnly] = useState(false);

  const showToastMessage = useCallback((message, type = "success") => {
    setToast({ isVisible: true, message, type });
    setTimeout(() => setToast((prev) => ({ ...prev, isVisible: false })), 4000);
  }, []);

  const fetchEntries = useCallback(async () => {
    try {
      const response = await fetch(`${API_URL}/api/entries`);
      if (!response.ok) {
        throw new Error("Не удалось загрузить данные заявок с сервера");
      }
      const data = await response.json();
      const formattedData = data.map((entry) => ({
        ...entry,
        createdAt: new Date(entry.createdAt),
      }));
      setEntries(formattedData);
    } catch (error) {
      console.error("Ошибка при загрузке заявок:", error);
      showToastMessage("Не удалось загрузить данные заявок", "error");
    }
  }, [showToastMessage]);

  const fetchBlockedSlots = useCallback(async () => {
    try {
      const response = await fetch(`${API_URL}/api/blocked-slots`);
      if (!response.ok) {
        throw new Error("Не удалось загрузить заблокированные слоты");
      }
      const data = await response.json();
      setBlockedSlots(data);
    } catch (error) {
      console.error("Ошибка при загрузке заблокированных слотов:", error);
      showToastMessage("Не удалось загрузить данные о блокировках", "error");
    }
  }, [showToastMessage]);

  // Effect for initial data loading and session restoration
  useEffect(() => {
    const loadInitialData = async () => {
      setIsLoading(true);
      const loggedInUser = localStorage.getItem("currentUser");
      if (loggedInUser) {
        const user = JSON.parse(loggedInUser);
        setCurrentUser(user);
        setView("dashboard");
      }
      await Promise.all([fetchEntries(), fetchBlockedSlots()]);
      setIsLoading(false);
    };
    loadInitialData();
  }, [fetchEntries, fetchBlockedSlots]);

  // Effect for periodic data fetching (polling)
  useEffect(() => {
    if (currentUser) {
      // Only fetch if user is logged in
      const interval = setInterval(() => {
        fetchEntries();
        fetchBlockedSlots();
      }, 15000); // every 15 seconds

      return () => clearInterval(interval); // Cleanup on unmount
    }
  }, [currentUser, fetchEntries, fetchBlockedSlots]);

  const handleLogin = (username, password) => {
    const user = users.find(
      (u) => u.username === username && u.password === password
    );
    if (user) {
      const userToStore = { name: user.name, role: user.role };
      localStorage.setItem("currentUser", JSON.stringify(userToStore));
      setCurrentUser(userToStore);
      setShowLoginModal(false);
      showToastMessage(`С возвращением, ${user.name}!`, "success");
      setAdminTab(user.role === "teacher" ? "schedule" : "distribution");
      setView("dashboard");
      return true;
    }
    return false;
  };

  const handleLogout = () => {
    localStorage.removeItem("currentUser");
    setCurrentUser(null);
    setView("form");
    showToastMessage("Вы вышли из системы.", "success");
  };

  const handleCloseDetails = () => {
    setShowDetailsModal(false);
    setSelectedEntry(null);
  };

  const handleOpenDetails = (entry, readOnly = false) => {
    if (!entry?.id) {
      showToastMessage("Ошибка: данные записи повреждены", "error");
      return;
    }

    setSelectedEntry(entry);
    let isModalReadOnly = readOnly;
    if (currentUser) {
      if (
        currentUser.role === "admin" ||
        (currentUser.role === "teacher" &&
          entry.assignedTeacher === currentUser.name)
      ) {
        isModalReadOnly = false;
      } else {
        isModalReadOnly = true;
      }
    } else {
      isModalReadOnly = true;
    }
    setIsDetailsReadOnly(isModalReadOnly);
    setShowDetailsModal(true);
  };

  const handleSavePlans = async (newPlans) => {
    setPlans(newPlans);
    showToastMessage("Планы сохранены (локально)", "success");
  };

  const handleWebhook = async (originalEntry, updatedEntry) => {
    const wasAssigned =
      originalEntry.assignedTeacher && originalEntry.assignedTime;
    const isNowAssigned =
      updatedEntry.assignedTeacher && updatedEntry.assignedTime;

    const cleanedPhone = cleanPhoneNumberForApi(originalEntry.phone);

    
    const teacher_number = 
         getTeacherNumberByName(originalEntry.assignedTeacher);



       const lessonIdentifier = `Сәлеметсізбе! Сізге ${originalEntry.clientName} есімді клиент пробный сабаққа жазылды. \n\n👤Номері: ${originalEntry.phone}\n💬Карточкасы: ${originalEntry.comment}`;
      const payload = {
        message: lessonIdentifier,
        number: teacher_number,
      };
    if (
      wasAssigned &&
      (!isNowAssigned ||
        ["Перенос", "Клиент отказ", "Каспий отказ"].includes(
          updatedEntry.status
        )) && teacher_number !== null
    ) {
      try {
        await fetch(RESCHEDULE_WEBHOOK_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        showToastMessage("Уведомление об отмене урока отправлено", "info");
      } catch (e) {
        console.error("Ошибка при отправке вебхука отмены:", e);
        showToastMessage("Ошибка отправки вебхука отмены", "error");
      }
    }

    // Случай 2: Назначение нового урока (ранее не был назначен)
    if (!wasAssigned && isNowAssigned && teacher_number !== null) {
      try {
        await fetch(WEBHOOK_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        showToastMessage("Уведомление о новом уроке отправлено", "info");
      } catch (e) {
        console.error("Ошибка при отправке вебхука назначения:", e);
        showToastMessage("Ошибка отправки вебхука назначения", "error");
      }
    }

    // Случай 3: Перенос назначенного урока на другое время/дату
    if (
      wasAssigned &&
      isNowAssigned && 
      (originalEntry.assignedTime !== updatedEntry.assignedTime ||
        originalEntry.trialDate !== updatedEntry.trialDate) && teacher_number !== null
    ) {
      try {
        await fetch(RESCHEDULE_WEBHOOK_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        showToastMessage("Уведомление о переносе урока отправлено", "info");
      } catch (e) {
        console.error("Ошибка при отправке вебхука переноса:", e);
        showToastMessage("Ошибка отправки вебхука переноса", "error");
      }
    }
  };

  const handleUpdateEntry = async (entryId, dataToUpdate) => {
    const originalEntry = entries.find((e) => e.id === entryId);
    if (!originalEntry) {
      showToastMessage(
        "Не удалось найти исходную запись для обновления.",
        "error"
      );
      return;
    }

    // Оптимистичное обновление
    const updatedEntries = entries.map((entry) =>
      entry.id === entryId ? { ...entry, ...dataToUpdate } : entry
    );
    setEntries(updatedEntries);

    try {
      // 1. Обновляем основную базу данных
      const response = await fetch(`${API_URL}/api/entries/${entryId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(dataToUpdate),
      });

      if (!response.ok) {
        throw new Error("Ошибка при обновлении на сервере");
      }
      showToastMessage("Данные успешно обновлены!", "success");

      // 2. Логика вебхуков
      await handleWebhook(originalEntry, dataToUpdate);

      // 3. Обновляем Google Sheets
      const sheetUpdateData = {
        action: "update",
        phone: dataToUpdate.phone,
        status: dataToUpdate.status,
      };
      fetch(GOOGLE_SCRIPT_URL, {
        method: "POST",
        mode: "no-cors",
        body: JSON.stringify(sheetUpdateData),
      }).catch((err) =>
        console.error("Ошибка при обновлении статуса в Google Sheets:", err)
      );
    } catch (error) {
      console.error("Ошибка при обновлении заявки:", error);
      showToastMessage("Не удалось обновить данные на сервере", "error");
      setEntries(entries); // Откат оптимистичного обновления
    }
  };

  const handleSaveDetails = async (entryId, dataToUpdate) => {
    await handleUpdateEntry(entryId, dataToUpdate);
  };

  const handleFormSubmit = async (data) => {
    const creationDate = new Date();
    const newEntryData = {
      ...data,
      createdAt: creationDate.toISOString(),
      status: "Ожидает",
    };

    try {
      const response = await fetch(`${API_URL}/api/entries`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newEntryData),
      });

      if (!response.ok) {
        throw new Error("Ошибка при отправке на сервер");
      }

      const savedEntry = await response.json();

      setEntries((prev) => [
        { ...savedEntry, createdAt: new Date(savedEntry.createdAt) },
        ...prev,
      ]);

      showToastMessage("Заявка успешно сохранена на сервере!", "success");

      const sheetData = {
        ...newEntryData,
        createdAt: creationDate.toLocaleString("ru-RU", {
          timeZone: "Asia/Almaty",
        }),
      };

      fetch(GOOGLE_SCRIPT_URL, {
        method: "POST",
        mode: "no-cors",
        body: JSON.stringify(sheetData),
      }).catch((err) =>
        console.error("Ошибка при отправке в Google Sheets:", err)
      );
    } catch (error) {
      console.error("Ошибка при сохранении заявки:", error);
      showToastMessage("Не удалось сохранить заявку на сервере", "error");
    }
  };

  const handleToggleBlockSlot = async (date, teacher, time) => {
    const docId = `${date}_${teacher}_${time}`;
    const isBlocked = blockedSlots.some((slot) => slot.id === docId);

    const originalSlots = [...blockedSlots];
    if (isBlocked) {
      setBlockedSlots((prev) => prev.filter((slot) => slot.id !== docId));
    } else {
      setBlockedSlots((prev) => [...prev, { id: docId, date, teacher, time }]);
    }

    try {
      if (isBlocked) {
        const response = await fetch(`${API_URL}/api/blocked-slots/${docId}`, {
          method: "DELETE",
        });
        if (!response.ok) throw new Error("Ошибка при разблокировке");
        showToastMessage("Слот разблокирован", "success");
      } else {
        const response = await fetch(`${API_URL}/api/blocked-slots`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: docId, date, teacher, time }),
        });
        if (!response.ok) throw new Error("Ошибка при блокировке");
        showToastMessage("Слот заблокирован", "success");
      }
    } catch (error) {
      console.error("Ошибка при изменении блокировки:", error);
      showToastMessage("Не удалось изменить статус слота", "error");
      setBlockedSlots(originalSlots);
    }
  };

  const handleSaveUser = (userData) => {
    if (userData.id) {
      setUsers(
        users.map((u) =>
          u.id === userData.id
            ? { ...u, ...userData, password: userData.password || u.password }
            : u
        )
      );
      showToastMessage("Пользователь обновлен!", "success");
    } else {
      const newUser = { ...userData, id: Date.now().toString() };
      setUsers([...users, newUser]);
      showToastMessage("Пользователь добавлен!", "success");
    }
  };

  const handleDeleteUser = (userId) => {
    setUsers(users.filter((u) => u.id !== userId));
    showToastMessage("Пользователь удален!", "success");
  };

  const dashboardTabs = [
    { id: "distribution", label: "Распределение", adminOnly: true },
    { id: "trials-list", label: "Список пробных", adminOnly: false },
    { id: "leaderboard", label: "Рейтинг", adminOnly: false },
    { id: "conversion", label: "Конверсия", adminOnly: true },
    { id: "analytics", label: "Аналитика", adminOnly: true },
    { id: "users", label: "Пользователи", adminOnly: true },
    { id: "notifications", label: "Уведомления", adminOnly: true },
  ];

  const publicUser = { name: "Guest", role: "public" };

  const renderHeader = () => {
    if (!currentUser) return null;
    return (
      <header className="mb-8 p-4 md:p-8  bg-white rounded-2xl border border-gray-100 shadow-sm">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
          <div>
            <h2 className="text-2xl md:text-3xl font-black text-gray-900">
              Панель управления
            </h2>
            <p className="text-gray-600 mt-2 font-medium">
              {currentUser.name} •{" "}
              {currentUser.role === "admin"
                ? "Администратор"
                : currentUser.role === "teacher"
                ? "Преподаватель"
                : "РОП"}
            </p>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white font-bold rounded-xl shadow-lg hover:from-red-600 hover:to-red-700 transition-all"
          >
            Выйти
          </button>
        </div>
      </header>
    );
  };

  const PublicScheduleModal = ({ onClose, initialDate, ...props }) => {
    const [localDate, setLocalDate] = useState(initialDate);

    const assignedEntriesMap = useMemo(() => {
      const map = new Map();
      props.entries.forEach((e) => {
        if (e.assignedTeacher && e.assignedTime && e.trialDate) {
          // Ensure trialDate exists
          map.set(`${e.assignedTeacher}-${e.trialDate}-${e.assignedTime}`, e);
        }
      });
      return map;
    }, [props.entries]); // Depend only on entries, localDate is not needed here

    const blockedSlotsMap = useMemo(() => {
      const map = new Map();
      props.blockedSlots.forEach((slot) => {
        if (slot.teacher && slot.date && slot.time) {
          // Ensure all parts exist
          map.set(`${slot.teacher}_${slot.date}_${slot.time}`, true);
        }
      });
      return map;
    }, [props.blockedSlots]); // Depend only on blockedSlots, localDate is not needed here

    return (
      <Modal isVisible={true} onClose={onClose} size="full">
        <div className="p-4 md:p-8 border-b border-gray-200 bg-gradient-to-r from-green-50 to-emerald-50">
          <div className="flex flex-wrap justify-between items-center gap-4">
            <h3 className="font-bold text-xl md:text-2xl text-gray-900 flex items-center gap-3">
              <Calendar className="w-6 h-6 md:w-8 md:h-8 text-green-600" />
              График преподавателей
            </h3>
            <input
              type="date"
              value={localDate}
              onChange={(e) => setLocalDate(e.target.value)}
              className="p-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all font-medium"
            />
            <button
              onClick={onClose}
              className="p-3 rounded-xl hover:bg-white/50 transition-colors text-gray-500 hover:text-gray-700"
            >
              <X size={24} />
            </button>
          </div>
        </div>
        <div className="flex-1 overflow-auto p-4 md:p-8">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr>
                  <th className="sticky top-0 left-0 bg-white p-4 border-b-2 border-gray-200 font-bold text-gray-900 text-left min-w-[100px] z-10">
                    Время
                  </th>
                  {props.teacherSchedule.teachers.map((teacher) => (
                    <th
                      key={teacher}
                      className="sticky top-0 bg-white p-4 border-b-2 border-gray-200 font-bold text-gray-900 min-w-[140px] text-center"
                    >
                      {teacher}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {props.teacherSchedule.timeSlots.map((time) => (
                  <tr key={time} className="hover:bg-gray-50 transition-colors">
                    <td className="sticky left-0 bg-white p-4 border-b border-gray-100 font-bold text-sm text-gray-700 z-10">
                      {time}
                    </td>
                    {props.teacherSchedule.teachers.map((teacher) => {
                      // Correctly access entries and blocked slots using the full key
                      const entry = assignedEntriesMap.get(
                        `${teacher}-${localDate}-${time}`
                      );
                      const isBlocked = blockedSlotsMap.has(
                        `${teacher}_${localDate}_${time}`
                      );
                      return (
                        <td
                          key={`${teacher}-${time}`}
                          className="p-2 border-b border-gray-100 h-20 text-center"
                        >
                          <div
                            onClick={() =>
                              !entry &&
                              props.onToggleBlockSlot(localDate, teacher, time)
                            }
                            className={`h-full w-full rounded-xl border flex flex-col items-center justify-center p-1 text-xs font-semibold transition-all ${
                              entry
                                ? `${getAppointmentColorForStatus(
                                    entry.status
                                  )} cursor-pointer`
                                : isBlocked
                                ? "bg-gray-200 border-gray-200"
                                : "bg-green-50 border-green-200"
                            }`}
                          >
                            {entry ? (
                              <div
                                onClick={(e) => {
                                  e.stopPropagation();
                                  props.onOpenDetails(entry, true);
                                }}
                                className={`h-full w-full flex flex-col items-center justify-center text-white rounded-lg p-2 text-xs font-semibold cursor-pointer transition-all hover:scale-105 shadow-lg transform ${getAppointmentColorForStatus(
                                  entry.status
                                )}`}
                              >
                                <span className="font-bold truncate">
                                  {entry.clientName}
                                </span>
                                <span className="opacity-80 truncate">
                                  {entry.status}
                                </span>
                                {entry.paymentAmount > 0 && (
                                  <span className="opacity-80 truncate">
                                    {entry.paymentAmount.toLocaleString(
                                      "ru-RU"
                                    )}{" "}
                                    ₸
                                  </span>
                                )}
                              </div>
                            ) : isBlocked ? (
                              <Lock className="w-5 h-5 text-gray-400" />
                            ) : (
                              <Check className="w-5 h-5 text-green-400" />
                            )}
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </Modal>
    );
  };

  const renderView = () => {
    if (isLoading) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white flex justify-center items-center">
          <Spinner />
        </div>
      );
    }

    switch (view) {
      case "form":
        return (
          <FormPage
            onFormSubmit={handleFormSubmit}
            ropList={ropList}
            showToast={showToastMessage}
            onShowRating={() => setView("rating")}
            onShowSchedule={() => setView("schedule")}
            onShowAdminLogin={() => setShowLoginModal(true)}
          />
        );
      case "rating":
        return (
          <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white p-4 md:p-8">
            <AdminPage
              readOnly={true}
              tabs={dashboardTabs.filter((t) => !t.adminOnly)}
              activeTab="leaderboard"
              setActiveTab={() => {}}
              currentUser={publicUser}
              onBack={() => setView("form")}
              entries={entries}
              ropList={ropList}
              onOpenDetails={handleOpenDetails}
              teacherSchedule={teacherSchedule}
              selectedDate={selectedDate}
              onDateChange={setSelectedDate}
              plans={plans}
              onSavePlans={handleSavePlans}
              blockedSlots={blockedSlots}
              onToggleBlockSlot={handleToggleBlockSlot}
              onUpdateEntry={handleUpdateEntry}
            />
          </div>
        );
      case "schedule":
        return (
          <PublicScheduleModal
            onClose={() => setView("form")}
            initialDate={selectedDate}
            entries={entries}
            teacherSchedule={teacherSchedule}
            blockedSlots={blockedSlots}
            onOpenDetails={handleOpenDetails}
            onToggleBlockSlot={handleToggleBlockSlot} // Pass to PublicScheduleModal
          />
        );

      case "dashboard":
        if (!currentUser) {
          setView("form");
          return null;
        }
        const commonProps = {
          entries,
          blockedSlots,
          onToggleBlockSlot: handleToggleBlockSlot,
          ropList,
          teacherSchedule,
          showToast: showToastMessage,
          onOpenDetails: handleOpenDetails,
          selectedDate,
          onDateChange: setSelectedDate,
          plans,
          onSavePlans: handleSavePlans,
          currentUser,
          onUpdateEntry: handleUpdateEntry,
          users,
          onSaveUser: handleSaveUser,
          onDeleteUser: handleDeleteUser,
        };

        const dashboardContent = (() => {
          switch (currentUser.role) {
            case "admin":
              return (
                <AdminPage
                  {...commonProps}
                  tabs={dashboardTabs}
                  activeTab={adminTab}
                  setActiveTab={setAdminTab}
                />
              );
            case "teacher":
              return <TeacherDashboard {...commonProps} />;
            case "rop":
              return (
                <AdminPage
                  {...commonProps}
                  readOnly={true}
                  tabs={dashboardTabs.filter((t) => !t.adminOnly)}
                  activeTab={adminTab}
                  setActiveTab={setAdminTab}
                />
              );
            default:
              handleLogout();
              return null;
          }
        })();

        return (
          <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white flex justify-center">
            <div className="w-full p-[2rem]">
              {renderHeader()}
              {dashboardContent}
            </div>
          </div>
        );
      default:
        return (
          <FormPage
            onFormSubmit={handleFormSubmit}
            ropList={ropList}
            showToast={showToastMessage}
            onShowRating={() => setView("rating")}
            onShowSchedule={() => setView("schedule")}
            onShowAdminLogin={() => setShowLoginModal(true)}
          />
        );
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white font-sans">
      <Toast
        message={toast.message}
        type={toast.type}
        isVisible={toast.isVisible}
      />
      <LoginModal
        isVisible={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        onLogin={handleLogin}
      />
      <DetailsModal
        entry={selectedEntry}
        onClose={handleCloseDetails}
        onSave={handleSaveDetails}
        readOnly={isDetailsReadOnly}
        showToast={showToastMessage}
      />
      {renderView()}
    </div>
  );
}
