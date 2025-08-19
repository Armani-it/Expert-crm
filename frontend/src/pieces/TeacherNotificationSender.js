
import React, { useState } from "react";
import {
  CheckCircle,
  Send,
  XCircle,
  Loader,
} from "lucide-react";

const WEBHOOK_URL = "https://api.akcent.online/webhook";


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


const TeacherNotificationSender = () => {
  const [teacherName, setTeacherName] = useState("");
  const [studentPhone, setStudentPhone] = useState("");
  const [lessonTime, setLessonTime] = useState("");
  const [status, setStatus] = useState({
    sending: false,
    message: "",
    isError: false,
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus({ sending: true, message: "", isError: false });

    const dataToSend = {
      teacherName,
      phone: cleanPhoneNumberForApi(studentPhone),
      lessonTime,
    };
    const options = {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(dataToSend),
    };

    try {
      const response = await fetch(WEBHOOK_URL, options);
      if (response.ok) {
        const responseText = await response.text();
        setStatus({
          sending: false,
          message: `Уведомление успешно отправлено! Ответ сервера: ${responseText}`,
          isError: false,
        });
        setTeacherName("");
        setStudentPhone("");
        setLessonTime("");
      } else {
        const errorText = await response.text();
        throw new Error(
          `Ошибка сервера: ${response.status} ${response.statusText}. ${errorText}`
        );
      }
    } catch (error) {
      console.error("Критическая ошибка при отправке:", error);
      setStatus({
        sending: false,
        message: `Ошибка сети: ${error.message}`,
        isError: true,
      });
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto bg-white rounded-2xl shadow-xl p-8 space-y-6">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-800">
          Отправить уведомление учителю
        </h1>
        <p className="text-gray-500 mt-2">
          Заполните данные для отправки через вебхук.
        </p>
      </div>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label
            htmlFor="teacherName"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Имя учителя
          </label>
          <input
            id="teacherName"
            type="text"
            value={teacherName}
            onChange={(e) => setTeacherName(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 transition"
            placeholder="например, Асем"
            required
          />
        </div>
        <div>
          <label
            htmlFor="studentPhone"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Телефон ученика
          </label>
          <input
            id="studentPhone"
            type="tel"
            value={studentPhone}
            onChange={(e) => setStudentPhone(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 transition"
            placeholder="например, 77071234567"
            required
          />
        </div>
        <div>
          <label
            htmlFor="lessonTime"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Время урока
          </label>
          <input
            id="lessonTime"
            type="time"
            value={lessonTime}
            onChange={(e) => setLessonTime(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 transition"
            required
          />
        </div>
        <div>
          <button
            type="submit"
            disabled={status.sending}
            className="w-full flex items-center justify-center bg-blue-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-blue-700 disabled:bg-blue-400 transition-all duration-300"
          >
            {status.sending ? (
              <>
                <Loader className="animate-spin mr-2" size={20} />
                Отправка...
              </>
            ) : (
              <>
                <Send className="mr-2" size={20} />
                Отправить
              </>
            )}
          </button>
        </div>
      </form>
      {status.message && (
        <div
          className={`p-4 rounded-lg flex items-center text-sm font-medium ${
            status.isError
              ? "bg-red-100 text-red-700"
              : "bg-green-100 text-green-700"
          }`}
        >
          {status.isError ? (
            <XCircle className="mr-3" />
          ) : (
            <CheckCircle className="mr-3" />
          )}
          {status.message}
        </div>
      )}
    </div>
  );
};

export default TeacherNotificationSender;