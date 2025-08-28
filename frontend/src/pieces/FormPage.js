
import React, { useState, useEffect } from "react";
import {
  Calendar,
  Users,
  TrendingUp,
  BookOpen,
} from "lucide-react";

import { useLocation } from "react-router-dom";

import SuccessModal from "./SuccessModal"

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

const FormPage = ({
  onFormSubmit,
  ropList,
  showToast,
  onShowRating,
  onShowAdminLogin,
  onShowSchedule,
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [phone, setPhone] = useState("");

  const location = useLocation();
  const [clientName, setClientName] = useState("");
  const [rop, setRop] = useState("");
  const [trialDate, setTrialDate] = useState("");
  const [trialTime, setTrialTime] = useState("");
  const [source, setSource] = useState("");
  const [comment, setComment] = useState("");
  const [id, setId] = useState("");

  const handlePhoneInputChange = (e) => {
    const rawValue = e.target.value;
    let digits = rawValue.replace(/\D/g, "");

    if (digits.length === 0) {
      setPhone("");
      return;
    }

    if (digits.startsWith("8")) {
      digits = "7" + digits.slice(1);
    }

    if (!digits.startsWith("7")) {
      digits = "7" + digits;
    }

    digits = digits.slice(0, 11);

    let formatted = `+${digits[0]}`;
    if (digits.length > 1) {
      formatted += ` (${digits.slice(1, 4)}`;
    }
    if (digits.length >= 5) {
      formatted += `) ${digits.slice(4, 7)}`;
    }
    if (digits.length >= 8) {
      formatted += `-${digits.slice(7, 9)}`;
    }
    if (digits.length >= 10) {
      formatted += `-${digits.slice(9, 11)}`;
    }

    setPhone(formatted);
  };

  function formatPhone(rawValue) {
    let digits = rawValue.replace(/\D/g, "");

    if (digits.length === 0) return "";

    if (digits.startsWith("8")) {
      digits = "7" + digits.slice(1);
    }
    if (!digits.startsWith("7")) {
      digits = "7" + digits;
    }

    digits = digits.slice(0, 11);

    let formatted = `+${digits[0]}`;
    if (digits.length > 1) {
      formatted += ` (${digits.slice(1, 4)}`;
    }
    if (digits.length >= 5) {
      formatted += `) ${digits.slice(4, 7)}`;
    }
    if (digits.length >= 8) {
      formatted += `-${digits.slice(7, 9)}`;
    }
    if (digits.length >= 10) {
      formatted += `-${digits.slice(9, 11)}`;
    }

    setPhone(formatted);
  }

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData.entries());
    data.phone = phone;
    data.clientName = clientName;
    data.rop = rop;
    data.comment = comment;
    data.sourse = source;

    if (!data.rop) {
      showToast("Пожалуйста, выберите РОП", "error");
      setIsSubmitting(false);
      return;
    }

    await onFormSubmit(data);

    fetch(
      `https://us-central1-akcent-academy.cloudfunctions.net/deleteCard?id=${id}`
    )
      .then((res) => {
        console.log(id);
        if (!res.ok) throw new Error("Ошибка при удалении");
        return res.json();
      })
      .then(() => {
        setIsSubmitting(false);
        e.target.reset();
        setPhone("");
        setShowSuccess(true);
      })
      .catch((error) => {
        console.error("Ошибка удаления:", error);
        alert("Не удалось удалить карточку");
      });
  };

  useEffect(() => {
    const params = new URLSearchParams(location.search);

    const clientNameParam = params.get("clientName");
    const phoneParam = params.get("phone");
    const ropParam = params.get("rop");
    const dateParam = params.get("trialDate");
    const timeParam = params.get("trialTime");
    const sourceParam = params.get("sourse");
    const commentParam = params.get("comment");
    const id_ = params.get("id");

    if (clientNameParam) setClientName(clientNameParam);
    if (phoneParam) formatPhone(phoneParam);
    if (ropParam) setRop(ropParam);
    if (id_) setId(id_);

    if (dateParam && dateParam.length > 2) {
      setTrialDate(dateParam);
    } else {
      const today = new Date().toISOString().split("T")[0];
      setTrialDate(today);
    }
    if (timeParam && timeParam.length > 2) {
      setTrialTime(timeParam);
    } else {
      setTrialTime("00:00");
    }
    if (sourceParam) setSource(sourceParam);
    if (commentParam) setComment(commentParam);
    console.log(trialDate);

    // Clean URL
    if ([...params.keys()].length > 0) {
      window.history.replaceState({}, "", window.location.pathname);
    }
  }, [location.search, trialDate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white flex justify-center">
      <div className="w-full md:w-[60%] mx-auto pt-12 pb-20 px-6">
        <SuccessModal
          isVisible={showSuccess}
          onClose={() => setShowSuccess(false)}
        />
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl mb-6 shadow-lg">
            <BookOpen className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl font-black text-gray-900 mb-4">
            Регистрация пробного урока
          </h1>
          <p className="text-gray-600 text-lg"></p>
        </div>
        <div className="flex flex-wrap justify-center gap-4 mb-12">
          <button
            onClick={onShowRating}
            className="flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-semibold rounded-xl shadow-lg hover:from-blue-600 hover:to-blue-700 transition-all"
          >
            <TrendingUp className="w-5 h-5" />
            Команданың нәтижесі
          </button>
        </div>
        <div className="bg-white rounded-3xl shadow-xl border border-gray-100">
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-8 rounded-t-3xl">
            <h2 className="text-2xl font-bold text-white">Форма регистрации</h2>
            <p className="text-blue-100 mt-2">
              Заполните все поля для записи на урок
            </p>
          </div>
          <form onSubmit={handleFormSubmit} className="p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="md:col-span-2">
                <label
                  htmlFor="client-name"
                  className="block text-sm font-bold text-gray-700 mb-3"
                >
                  Имя клиента
                </label>
                <input
                  type="text"
                  id="client-name"
                  name="clientName"
                  required
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  autoComplete="off"
                  className="w-full p-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all font-medium"
                  placeholder="Введите полное имя"
                />
              </div>
              <div>
                <label
                  htmlFor="phone-number"
                  className="block text-sm font-bold text-gray-700 mb-3"
                >
                  Номер телефона
                </label>
                <input
                  type="tel"
                  id="phone-number"
                  name="phone"
                  value={phone}
                  onChange={handlePhoneInputChange}
                  placeholder="+7 (___) ___-__-__"
                  required
                  autoComplete="off"
                  className="w-full p-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all font-medium"
                />
              </div>
              <div>
                <label
                  htmlFor="rop-select"
                  className="block text-sm font-bold text-gray-700 mb-3"
                >
                  РОП
                </label>
                <select
                  id="rop-select"
                  name="rop"
                  required
                  defaultValue=""
                  value={rop}
                  onChange={(e) => setRop(e.target.value)}
                  className="w-full p-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all font-medium"
                >
                  <option value="" disabled>
                    Выберите РОП
                  </option>
                  {ropList.map((rop) => (
                    <option key={rop.id} value={rop.name}>
                      {rop.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label
                  htmlFor="trial-date"
                  className="block text-sm font-bold text-gray-700 mb-3"
                >
                  Дата пробы
                </label>
                <input
                  type="date"
                  id="trial-date"
                  name="trialDate"
                  value={trialDate}
                  onChange={(e) => setTrialDate(e.target.value)}
                  required
                  className="w-full p-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all font-medium"
                />
              </div>
              <div>
                <label
                  htmlFor="trial-time"
                  className="block text-sm font-bold text-gray-700 mb-3"
                >
                  Время пробы
                </label>
                <input
                  type="time"
                  id="trial-time"
                  name="trialTime"
                  value={trialTime}
                  onChange={(e) => setTrialTime(e.target.value)}
                  required
                  className="w-full p-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all font-medium"
                />
              </div>
              <div className="md:col-span-2">
                <label
                  htmlFor="source-select"
                  className="block text-sm font-bold text-gray-700 mb-3"
                >
                  Откуда пришел клиент?
                </label>
                <select
                  name="source"
                  id="source-select"
                  required
                  defaultValue=""
                  value={source}
                  onChange={(e) => setSource(e.target.value)}
                  className="w-full p-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all font-medium"
                >
                  <option value="" disabled>
                    Выберите источник
                  </option>
                  {ALL_SOURCES.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>
              <div className="md:col-span-2">
                <label
                  htmlFor="comment"
                  className="block text-sm font-bold text-gray-700 mb-3"
                >
                  Комментарий
                </label>
                <textarea
                  id="comment"
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  name="comment"
                  rows={4}
                  autoComplete="off"
                  className="w-full p-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all resize-none font-medium"
                  placeholder="Дополнительная информация о целях изучения..."
                />
              </div>
            </div>
            <div className="mt-10">
              <button
                type="submit"
                disabled={isSubmitting}
                className={`w-full font-bold py-5 px-8 rounded-2xl transition-all shadow-xl transform ${
                  isSubmitting
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 hover:shadow-2xl hover:-translate-y-0.5"
                } text-white`}
              >
                {isSubmitting ? (
                  <div className="flex items-center justify-center gap-3">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Отправка заявки...
                  </div>
                ) : (
                  "Отправить заявку"
                )}
              </button>
            </div>
          </form>
        </div>
        <div className="flex flex-wrap justify-center gap-4 mt-8">
          <button
            onClick={onShowSchedule}
            className="flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white font-semibold rounded-xl shadow-lg hover:from-green-600 hover:to-green-700 transition-all"
          >
            <Calendar className="w-5 h-5" />
            График учителей
          </button>
          <button
            onClick={onShowAdminLogin}
            className="flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-semibold rounded-xl shadow-lg hover:from-blue-600 hover:to-blue-700 transition-all"
          >
            <Users className="w-5 h-5" />
            Войти в систему
          </button>
        </div>
      </div>
    </div>
  );
};
export default FormPage