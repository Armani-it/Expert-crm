
import React, { useState, useEffect } from "react";
import {
  X,
  Target,
} from "lucide-react";


import Modal from "./Modal"

const PlanModal = ({ isVisible, onClose, ropList, plans, onSavePlans }) => {
  const [localPlans, setLocalPlans] = useState({});
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const initialPlans = {};
    ropList.forEach((rop) => {
      initialPlans[rop.name] = plans[rop.name] || 0;
      initialPlans[`${rop.name}_trial`] = plans[`${rop.name}_trial`] || 0;
    });
    setLocalPlans(initialPlans);
  }, [isVisible, plans, ropList]);

  const handlePlanChange = (ropName, planType, value) => {
    const key = planType === "cash" ? ropName : `${ropName}_trial`;
    setLocalPlans((prev) => ({ ...prev, [key]: Number(value) }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    await onSavePlans(localPlans); // Эта функция пока работает локально
    setIsSaving(false);
    onClose();
  };

  return (
    <Modal isVisible={isVisible} onClose={onClose} size="2xl">
      <div className="p-8 border-b border-gray-100">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-3">
              <Target className="w-6 h-6 text-blue-600" />
              Установка планов для РОП
            </h3>
            <p className="text-gray-600">
              Задайте месячные цели по кассе и количеству пробных уроков.
            </p>
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
        <div className="space-y-6">
          {ropList.map((rop) => (
            <div
              key={rop.id}
              className="p-6 bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl"
            >
              <h4 className="font-bold text-gray-900 mb-4">{rop.name}</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    План по кассе (₸)
                  </label>
                  <input
                    type="number"
                    value={localPlans[rop.name] || ""}
                    onChange={(e) =>
                      handlePlanChange(rop.name, "cash", e.target.value)
                    }
                    className="w-full p-3 border border-gray-300 rounded-xl bg-white focus:ring-2 focus:ring-blue-500"
                    placeholder="0"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    План по пробным
                  </label>
                  <input
                    type="number"
                    value={localPlans[`${rop.name}_trial`] || ""}
                    onChange={(e) =>
                      handlePlanChange(rop.name, "trial", e.target.value)
                    }
                    className="w-full p-3 border border-gray-300 rounded-xl bg-white focus:ring-2 focus:ring-blue-500"
                    placeholder="0"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="p-8 bg-gradient-to-r from-gray-50 to-gray-100 border-t border-gray-200">
        <div className="flex justify-end gap-4">
          <button
            onClick={onClose}
            className="px-8 py-3 bg-white border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors font-semibold"
          >
            Отмена
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="px-8 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all font-semibold disabled:opacity-50 shadow-lg"
          >
            {isSaving ? "Сохранение..." : "Сохранить планы"}
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default PlanModal;