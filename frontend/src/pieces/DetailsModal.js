
import React, { useState, useEffect } from "react";
import {
  X,
  Users,
  BookOpen,
  BarChart3,
  UserCheck,
  Clock,
  Phone,
  MapPin,
  Mail,
} from "lucide-react";
import Modal from "./Modal"

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


const DetailsModal = ({
  entry,
  onClose,
  onSave,
  showToast,
  readOnly = false,
}) => {
  const [currentStatus, setCurrentStatus] = useState(
    entry?.status || "Ожидает"
  );
  const [trialDate, setTrialDate] = useState(entry?.trialDate || "");
  const [paymentType, setPaymentType] = useState(entry?.paymentType || "");
  const [packageType, setPackageType] = useState(entry?.packageType || "");
  const [paymentAmount, setPaymentAmount] = useState(entry?.paymentAmount || 0);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (entry) {
      setCurrentStatus(entry.status || "Ожидает");
      setTrialDate(entry.trialDate || "");
      setPaymentType(entry.paymentType || "");
      setPackageType(entry.packageType || "");
      setPaymentAmount(entry.paymentAmount || 0);
    }
  }, [entry]);

  if (!entry) return null;

  const handleSave = async () => {
    if (currentStatus === "Перенос" && !trialDate) {
      showToast("Пожалуйста, выберите новую дату для переноса.", "error");
      return;
    }

    setIsSaving(true);
    const isPaymentStatus = ["Проведен", "Оплата"].includes(currentStatus);
    const isRescheduled = currentStatus === "Перенос";

    await onSave(entry.id, {
      ...entry, // Передаем все поля, чтобы не потерять данные
      status: currentStatus,
      trialDate: trialDate,
      assignedTeacher: isRescheduled ? null : entry.assignedTeacher,
      assignedTime: isRescheduled ? null : entry.assignedTime,
      paymentType: isPaymentStatus ? paymentType : null,
      packageType: isPaymentStatus ? packageType : null,
      paymentAmount: isPaymentStatus
        ? Number.parseFloat(paymentAmount) || 0
        : 0,
    });

    setIsSaving(false);
    onClose();
  };

  const showPaymentFields = ["Проведен", "Оплата"].includes(currentStatus);
  const getStatusColor = (status) => {
    const colors = {
      Ожидает: "bg-yellow-50 text-yellow-700 border-yellow-200",
      Назначен: "bg-blue-50 text-blue-700 border-blue-200",
      Проведен: "bg-green-50 text-green-700 border-green-200",
      Оплата: "bg-emerald-50 text-emerald-700 border-emerald-200",
      Перенос: "bg-orange-50 text-orange-700 border-orange-200",
      "Клиент отказ": "bg-red-50 text-red-700 border-red-200",
      "Каспий отказ": "bg-red-50 text-red-700 border-red-200",
    };
    return colors[status] || "bg-gray-50 text-gray-700 border-gray-200";
  };

  return (
    <Modal isVisible={!!entry} onClose={onClose} size="xl">
      <div className="p-8 border-b border-gray-100">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              Анкета ученика
            </h3>
            <div
              className={`inline-flex items-center px-4 py-2 rounded-xl text-sm font-semibold border ${getStatusColor(
                entry.status || "Ожидает"
              )}`}
            >
              {entry.status || "Ожидает"}
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-3 rounded-xl hover:bg-gray-100 transition-colors"
          >
            <X size={24} />
          </button>
        </div>
      </div>
      <div className="flex-grow overflow-y-auto p-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-6">
            <div className="bg-gradient-to-br from-gray-50 to-gray-100 p-6 rounded-2xl">
              <h4 className="font-bold text-gray-900 mb-4 flex items-center gap-3">
                <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                  <Users className="w-4 h-4 text-white" />
                </div>
                Информация о клиенте
              </h4>
              <div className="space-y-4 text-sm">
                <div className="flex items-center gap-3">
                  <UserCheck className="w-5 h-5 text-gray-400" />
                  <div>
                    <span className="text-gray-500 block">Клиент</span>
                    <p className="font-semibold text-gray-900">
                      {entry.clientName}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Phone className="w-5 h-5 text-gray-400" />
                  <div>
                    <span className="text-gray-500 block">Телефон</span>
                    <p className="font-semibold text-gray-900">
                      {formatPhoneNumber(entry.phone)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <MapPin className="w-5 h-5 text-gray-400" />
                  <div>
                    <span className="text-gray-500 block">Источник</span>
                    <p className="font-semibold text-gray-900">
                      {entry.source}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="space-y-6">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-2xl">
              <h4 className="font-bold text-gray-900 mb-4 flex items-center gap-3">
                <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center">
                  <BookOpen className="w-4 h-4 text-white" />
                </div>
                Детали урока
              </h4>
              <div className="space-y-4 text-sm">
                <div className="flex items-center gap-3">
                  <Clock className="w-5 h-5 text-gray-400" />
                  <div>
                    <span className="text-gray-500 block">
                      Дата/Время пробы
                    </span>
                    <p className="font-semibold text-gray-900">
                      {entry.trialDate} в {entry.trialTime}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Users className="w-5 h-5 text-gray-400" />
                  <div>
                    <span className="text-gray-500 block">РОП</span>
                    <p className="font-semibold text-gray-900">{entry.rop}</p>
                  </div>
                </div>
                {entry.assignedTeacher && (
                  <div className="flex items-center gap-3">
                    <UserCheck className="w-5 h-5 text-gray-400" />
                    <div>
                      <span className="text-gray-500 block">Преподаватель</span>
                      <p className="font-semibold text-gray-900">
                        {entry.assignedTeacher}
                      </p>
                    </div>
                  </div>
                )}
                <div className="flex items-start gap-3">
                  <Mail className="w-5 h-5 text-gray-400 mt-1" />
                  <div>
                    <span className="text-gray-500 block">Комментарий</span>
                    <p className="font-semibold text-gray-900">
                      {entry.comment || "Нет комментария"}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        {!readOnly && (
          <div className="mt-8 pt-8 border-t border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Статус урока
                </label>
                <select
                  value={currentStatus}
                  onChange={(e) => setCurrentStatus(e.target.value)}
                  className="w-full p-4 border border-gray-200 rounded-xl bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all font-medium"
                >
                  {[
                    "Ожидает",
                    "Назначен",
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
              <div>
                <label
                  htmlFor="trial-date-modal"
                  className="block text-sm font-semibold text-gray-700 mb-3"
                >
                  Новая дата пробы
                </label>
                <input
                  type="date"
                  id="trial-date-modal"
                  name="trialDate"
                  value={trialDate}
                  onChange={(e) => setTrialDate(e.target.value)}
                  required
                  className="w-full p-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all font-medium"
                />
              </div>
              {showPaymentFields && (
                <div className="md:col-span-2 bg-gradient-to-br from-emerald-50 to-emerald-100 p-6 rounded-2xl border border-emerald-200">
                  <h4 className="font-bold text-emerald-900 mb-6 flex items-center gap-3">
                    <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center">
                      <BarChart3 className="w-4 h-4 text-white" />
                    </div>
                    Детали оплаты
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-emerald-700 mb-2">
                        Тип оплаты
                      </label>
                      <select
                        value={paymentType}
                        onChange={(e) => setPaymentType(e.target.value)}
                        className="w-full p-3 border border-emerald-300 rounded-xl bg-white focus:ring-2 focus:ring-emerald-500"
                      >
                        <option value="">Не выбрано</option>
                        <option value="Gold">Kaspi Gold</option>
                        <option value="Red">Kaspi Red</option>
                        <option value="Рассрочка">Kaspi Рассрочка</option>
                        <option value="Halyk">Halyk</option>
                        <option value="Предоплаты">Предоплаты</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-emerald-700 mb-2">
                        Пакет
                      </label>
                      <select
                        value={packageType}
                        onChange={(e) => setPackageType(e.target.value)}
                        className="w-full p-3 border border-emerald-300 rounded-xl bg-white focus:ring-2 focus:ring-emerald-500"
                      >
                        <option value="">Не выбрано</option>
                        <option value="Жеке">Жеке</option>
                        <option value="Топпен">Топпен</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Сумма (₸)
                      </label>
                      <input
                        type="number"
                        value={paymentAmount}
                        onChange={(e) => setPaymentAmount(e.target.value)}
                        className="w-full p-3 border border-emerald-300 rounded-xl bg-white focus:ring-2 focus:ring-emerald-500"
                        placeholder="0"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
      <div className="p-8 bg-gradient-to-r from-gray-50 to-gray-100 border-t border-gray-200">
        <div className="flex justify-end gap-4">
          <button
            onClick={onClose}
            className="px-8 py-3 bg-white border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors font-semibold"
          >
            Закрыть
          </button>
          {!readOnly && (
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="px-8 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all font-semibold disabled:opacity-50 shadow-lg"
            >
              {isSaving ? "Сохранение..." : "Сохранить"}
            </button>
          )}
        </div>
      </div>
    </Modal>
  );
};

export default DetailsModal;