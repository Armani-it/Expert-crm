
import React from "react";

import {
  CheckCircle
} from "lucide-react";

import Modal from "./Modal"

const SuccessModal = ({ isVisible, onClose }) => (
  <Modal isVisible={isVisible} onClose={onClose} size="md">
    <div className="p-8 text-center">
      <div className="w-20 h-20 bg-gradient-to-r from-green-100 to-green-200 rounded-full flex items-center justify-center mx-auto mb-6">
        <CheckCircle className="w-10 h-10 text-green-600" />
      </div>
      <h3 className="text-2xl font-bold text-gray-900 mb-3">Заявка принята!</h3>
      <p className="text-gray-600 mb-8 leading-relaxed">
        Ваша заявка успешно отправлена. Наши специалисты свяжутся с вами в
        ближайшее время.
      </p>
      <button
        onClick={onClose}
        className="w-full bg-gradient-to-r from-green-500 to-green-600 text-white py-4 px-8 rounded-xl hover:from-green-600 hover:to-green-700 transition-all font-semibold shadow-lg"
      >
        Понятно
      </button>
    </div>
  </Modal>
);


export default SuccessModal;