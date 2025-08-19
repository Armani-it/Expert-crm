
import React, { useState } from "react";
import Modal from "./Modal"
import {
  Users,
} from "lucide-react";

const LoginModal = ({ isVisible, onClose, onLogin }) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoggingIn(true);
    const success = await onLogin(username, password);
    if (!success) {
      setError("Неверный логин или пароль");
    }
    setIsLoggingIn(false);
  };
  return (
    <Modal isVisible={isVisible} onClose={onClose} size="sm">
      <div className="p-8">
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-gradient-to-r from-blue-100 to-blue-200 rounded-full flex items-center justify-center mx-auto mb-6">
            <Users className="w-10 h-10 text-blue-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-3">
            Вход в систему
          </h2>
          <p className="text-gray-600">Введите свои учетные данные</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              Логин
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full p-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
              placeholder="Введите логин"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              Пароль
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
              placeholder="Введите пароль"
              required
            />
          </div>
          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-xl">
              <p className="text-red-600 text-sm text-center font-medium">
                {error}
              </p>
            </div>
          )}
          <div className="flex gap-4 pt-6">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-4 bg-white border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors font-semibold"
            >
              Отмена
            </button>
            <button
              type="submit"
              disabled={isLoggingIn}
              className="flex-1 px-6 py-4 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all disabled:opacity-50 font-semibold shadow-lg"
            >
              {isLoggingIn ? "Вход..." : "Войти"}
            </button>
          </div>
        </form>
      </div>
    </Modal>
  );
};
export default LoginModal;