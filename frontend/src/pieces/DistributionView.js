import React, { useState, useEffect, useMemo } from "react";

import {
  Calendar,
  Users,
  Clock,
  ArrowLeft,
  Plus,
  History,
  Lock,
  Search,
} from "lucide-react";

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

const DistributionView = ({
  entries,
  teacherSchedule,
  showToast,
  onOpenDetails,
  onUpdateEntry,
  readOnly = false,
  selectedDate,
  onDateChange,
  blockedSlots,
  onToggleBlockSlot,
}) => {
  const [draggedItem, setDraggedItem] = useState(null);
  const [dragOverCell, setDragOverCell] = useState(null);
  const [selectedEntryForMobile, setSelectedEntryForMobile] = useState(null);
  const [cellToBlock, setCellToBlock] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchReScheduleQuery, setSearchReScheduleQuery] = useState("");
  const [activeTab, setActiveTab] = useState("new");
  const [filteredRescheduledEntries, setFilteredRescheduledEntries] = useState(
    []
  );

  const today = new Date().toISOString().split("T")[0];
  const [rescheduleDate, setRescheduleDate] = useState(selectedDate || today);

  const isMobile = useMemo(() => {
    if (typeof window !== "undefined") {
      return window.innerWidth < 768;
    }
    return false;
  }, []);

  const handleDragStart = (e, entry) => {
    if (readOnly || isMobile) return;
    setDraggedItem(entry);
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", entry.id);
  };

  const handleDrop = async (e, teacher, time) => {
    e.preventDefault();
    setDragOverCell(null);
    if (!draggedItem || readOnly || isMobile) return;
    const cellKey = `${selectedDate}_${teacher}_${time}`;
    if (blockedSlots.some((slot) => slot.id === cellKey)) {
      showToast("Этот слот заблокирован", "error");
      return;
    }

    onUpdateEntry(draggedItem.id, {
      ...draggedItem,
      assignedTeacher: teacher,
      assignedTime: time,
      status: "Назначен",
      trialDate: selectedDate || draggedItem.trialDate,
    });
    setDraggedItem(null);
  };

  const handleDragOver = (e) => {
    if (!readOnly && !isMobile) e.preventDefault();
  };

  const handleDragEnter = (e, teacher, time) => {
    if (!readOnly && !isMobile) setDragOverCell(`${teacher}-${time}`);
  };

  const handleDragLeave = (e) => {
    if (!readOnly && !isMobile) setDragOverCell(null);
  };

  const handleEntryClick = (entry) => {
    if (readOnly) {
      onOpenDetails(entry, true);
      return;
    }
    if (isMobile) {
      if (selectedEntryForMobile?.id === entry.id) {
        setSelectedEntryForMobile(null); // Deselect
      } else {
        setSelectedEntryForMobile(entry); // Select
      }
    } else {
      onOpenDetails(entry, readOnly);
    }
  };

  const handleCellClick = (teacher, time) => {
    if (readOnly) return;
    const cellKey = `${selectedDate}_${teacher}_${time}`;
    const isCellBlocked = blockedSlots.some((slot) => slot.id === cellKey);
    const isCellOccupied = entries.some(
      (e) =>
        e.assignedTeacher === teacher &&
        e.assignedTime === time &&
        e.trialDate === selectedDate
    );

    if (isMobile) {
      if (selectedEntryForMobile) {
        // Logic for placing an entry
        if (!isCellBlocked && !isCellOccupied) {
          onUpdateEntry(selectedEntryForMobile.id, {
            ...selectedEntryForMobile,
            assignedTeacher: teacher,
            assignedTime: time,
            status: "Назначен",
            trialDate: selectedDate,
          });
          setSelectedEntryForMobile(null);
          setCellToBlock(null);
        }
      } else {
        // Logic for blocking a cell (double tap)
        if (!isCellOccupied) {
          if (cellToBlock === cellKey) {
            onToggleBlockSlot(selectedDate, teacher, time);
            setCellToBlock(null);
          } else {
            setCellToBlock(cellKey);
            showToast("Нажмите еще раз для блокировки", "info");
            setTimeout(() => {
              setCellToBlock((prev) => (prev === cellKey ? null : prev));
            }, 3000);
          }
        }
      }
    } else {
      // Desktop logic (single click to block)
      if (!isCellOccupied) {
        onToggleBlockSlot(selectedDate, teacher, time);
      }
    }
  };

  const filteredBaseEntries = useMemo(() => {
    if (!searchQuery) return entries;
    const lowercasedQuery = searchQuery.toLowerCase();
    return entries.filter(
      (entry) =>
        entry.clientName.toLowerCase().includes(lowercasedQuery) ||
        (entry.phone &&
          entry.phone
            .replace(/\D/g, "")
            .includes(lowercasedQuery.replace(/\D/g, "")))
    );
  }, [entries, searchQuery]);

  const unassignedEntries = useMemo(() => {
    return filteredBaseEntries.filter((e) => {
      const isUnassigned = !e.assignedTeacher;
      const hasNoStatusOrPending = !e.status || e.status === "Ожидает";
      const isFutureOrToday = !e.trialDate || e.trialDate >= today;
      return isUnassigned && hasNoStatusOrPending && isFutureOrToday;
    });
  }, [filteredBaseEntries, today]);

  const rescheduledEntries = useMemo(() => {
    return filteredBaseEntries.filter((e) => {
      const isRescheduled = e.status === "Перенос";
      const isPastAndUnassigned =
        !e.assignedTeacher && e.trialDate && e.trialDate < today;
      return isRescheduled || isPastAndUnassigned;
    });
  }, [filteredBaseEntries, today]);

  const assignedEntriesMap = useMemo(() => {
    const map = new Map();
    entries
      .filter(
        (e) =>
          e.assignedTeacher && e.assignedTime && e.trialDate === selectedDate
      )
      .forEach((e) => {
        map.set(`${e.assignedTeacher}-${e.assignedTime}`, e);
      });
    return map;
  }, [entries, selectedDate]);

  const blockedSlotsMap = useMemo(() => {
    const map = new Map();
    blockedSlots.forEach((slot) => map.set(slot.id, true));
    return map;
  }, [blockedSlots]);

  useEffect(() => {
    if (activeTab === "rescheduled" && selectedDate) {
      setRescheduleDate(selectedDate);
    }
  }, [activeTab, selectedDate]);

  // удаляй весь блок filteredRescheduledEntriesS useMemo — он больше не нужен

  useEffect(() => {
    const q = (searchReScheduleQuery || "").toLowerCase().replace(/\D/g, "");

    // сначала по дате
    const byDate = !rescheduleDate
      ? rescheduledEntries
      : rescheduledEntries.filter((e) => e.trialDate === rescheduleDate);

    // затем по запросу (имя/телефон)
    const byQuery = !searchReScheduleQuery
      ? byDate
      : byDate.filter((e) => {
          const nameOk = (e.clientName || "")
            .toLowerCase()
            .includes((searchReScheduleQuery || "").toLowerCase());

          const digits = (e.phone || "").replace(/\D/g, "");
          const phoneOk = digits.includes(q);

          return nameOk || phoneOk;
        });

    setFilteredRescheduledEntries(byQuery);
  }, [rescheduleDate, searchReScheduleQuery, rescheduledEntries]);

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <h3 className="font-bold text-lg text-gray-900">Фильтр по дате</h3>
          <div className="flex items-center gap-4">
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => onDateChange(e.target.value)}
              className="p-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all font-medium"
            />
          </div>
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {!readOnly && (
          <div className="lg:col-span-1">
            <div className="lg:sticky lg:top-24 space-y-6 max-h-[calc(100vh-7rem)] overflow-y-auto p-1 rounded-2xl">
              {/* Tabs header */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
                <div className="px-2 pt-2">
                  <div className="grid grid-cols-2 gap-2 p-1 bg-gray-100 rounded-xl">
                    <button
                      onClick={() => setActiveTab("new")}
                      className={`py-2 px-3 rounded-lg font-semibold text-sm transition-all
          ${
            activeTab === "new"
              ? "bg-white text-gray-900 shadow"
              : "text-gray-600 hover:text-gray-900"
          }`}
                    >
                      Новые&nbsp;заявки
                      <span
                        className="ml-2 inline-flex items-center justify-center text-xs font-bold
          px-2 py-0.5 rounded-full bg-blue-100 text-blue-700"
                      >
                        {unassignedEntries.length}
                      </span>
                    </button>
                    <button
                      onClick={() => setActiveTab("rescheduled")}
                      className={`py-2 px-3 rounded-lg font-semibold text-sm transition-all
          ${
            activeTab === "rescheduled"
              ? "bg-white text-gray-900 shadow"
              : "text-gray-600 hover:text-gray-900"
          }`}
                    >
                      Перенесённые
                      <span
                        className="ml-2 inline-flex items-center justify-center text-xs font-bold
          px-2 py-0.5 rounded-full bg-red-100 text-red-700"
                      >
                        {rescheduledEntries.length}
                      </span>
                    </button>
                  </div>
                </div>

                <div className="p-4">
                  <div className="relative">
                    {activeTab === "new" ? (
                      <input
                        type="text"
                        placeholder="Поиск в новых: имя или телефон..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full p-3 pl-10 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500"
                      />
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <div className="relative">
                          <input
                            type="text"
                            placeholder="Поиск: телефон..."
                            value={searchReScheduleQuery}
                            onChange={(e) =>
                              setSearchReScheduleQuery(e.target.value)
                            }
                            className="w-full p-3 pl-10 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 font-medium"
                          />
                          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        </div>

                        <input
                          type="date"
                          value={rescheduleDate}
                          max={today}
                          onChange={(e) => setRescheduleDate(e.target.value)}
                          className="w-full p-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 font-medium"
                        />
                      </div>
                    )}
                    {activeTab === "new" && (
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    )}
                  </div>
                </div>
              </div>

              {/* Контент вкладок */}
              {activeTab === "new" ? (
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
                  <div className="p-6 border-b border-gray-100 bg-gradient-to-r from-blue-50 to-indigo-50">
                    <h3 className="font-bold text-lg text-gray-900 flex items-center gap-3">
                      <div className="w-4 h-4 bg-blue-400 rounded-full animate-pulse"></div>
                      Новые заявки
                      <span className="ml-auto bg-gradient-to-r from-blue-500 to-indigo-500 text-white text-sm font-bold px-3 py-1 rounded-full">
                        {unassignedEntries.length}
                      </span>
                    </h3>
                  </div>
                  <div className="p-6">
                    <div className="space-y-4 max-h-[55vh] overflow-y-auto">
                      {unassignedEntries.length > 0 ? (
                        unassignedEntries.map((entry) => (
                          <div
                            key={entry.id}
                            draggable={!readOnly && !isMobile}
                            onDragStart={(e) => handleDragStart(e, entry)}
                            onClick={() => handleEntryClick(entry)}
                            className={`p-4 bg-gradient-to-br from-blue-50 to-indigo-50 border-2 rounded-xl transition-all
                ${!readOnly ? "cursor-pointer" : ""} 
                ${
                  !readOnly && !isMobile
                    ? "cursor-grab active:cursor-grabbing hover:shadow-lg hover:from-blue-100 hover:to-indigo-100 hover:border-blue-300 transform hover:-translate-y-1"
                    : ""
                } 
                ${
                  draggedItem?.id === entry.id
                    ? "opacity-50 scale-95 rotate-2"
                    : ""
                } 
                ${
                  selectedEntryForMobile?.id === entry.id
                    ? "border-blue-500 ring-2 ring-blue-500"
                    : "border-blue-200"
                }`}
                          >
                            <div className="flex items-center justify-between mb-2">
                              <p className="font-bold text-gray-900 text-sm">
                                {entry.clientName}
                              </p>
                              <div className="text-gray-400">
                                <ArrowLeft className="w-4 h-4" />
                              </div>
                            </div>
                            <p className="text-xs text-gray-600 mb-2 flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {entry.trialDate} {entry.trialTime}
                            </p>
                            <p className="text-xs text-blue-700 bg-blue-200 px-2 py-1 rounded-full inline-flex items-center gap-1 font-semibold">
                              <Users className="w-3 h-3" />
                              {entry.rop}
                            </p>
                          </div>
                        ))
                      ) : (
                        <div className="text-center py-12">
                          <div className="w-16 h-8 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Calendar className="w-8 h-8 text-gray-400" />
                          </div>
                          <p className="text-gray-500 font-medium text-sm">
                            Нет новых заявок
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
                  <div className="p-6 border-b border-gray-100 bg-gradient-to-r from-red-50 to-orange-50">
                    <h3 className="font-bold text-lg text-gray-900 flex items-center gap-3">
                      <div className="w-4 h-4 bg-red-400 rounded-full animate-pulse"></div>
                      Перенесённые
                      <span className="ml-auto bg-gradient-to-r from-red-500 to-orange-500 text-white text-sm font-bold px-3 py-1 rounded-full">
                        {filteredRescheduledEntries.length}
                      </span>
                    </h3>
                  </div>
                  <div className="p-6">
                    <div className="space-y-4 max-h-[55vh] overflow-y-auto">
                      {filteredRescheduledEntries.length > 0 ? (
                        filteredRescheduledEntries.map((entry) => (
                          <div
                            key={entry.id}
                            draggable={!readOnly && !isMobile}
                            onDragStart={(e) => handleDragStart(e, entry)}
                            onClick={() => handleEntryClick(entry)}
                            className={`p-4 bg-gradient-to-br from-red-50 to-orange-50 border-2 rounded-xl transition-all
                ${!readOnly ? "cursor-pointer" : ""} 
                ${
                  !readOnly && !isMobile
                    ? "cursor-grab active:cursor-grabbing hover:shadow-lg hover:from-red-100 hover:to-orange-100 hover:border-red-300 transform hover:-translate-y-1"
                    : ""
                } 
                ${
                  draggedItem?.id === entry.id
                    ? "opacity-50 scale-95 rotate-2"
                    : ""
                } 
                ${
                  selectedEntryForMobile?.id === entry.id
                    ? "border-red-500 ring-2 ring-red-500"
                    : "border-red-200"
                }`}
                          >
                            <div className="flex items-center justify-between mb-2">
                              <p className="font-bold text-gray-900 text-sm">
                                {entry.clientName}
                              </p>
                              <div className="text-gray-400">
                                <ArrowLeft className="w-4 h-4" />
                              </div>
                            </div>
                            <p className="text-xs text-gray-600 mb-2 flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {entry.trialDate} {entry.trialTime}
                            </p>
                            <p className="text-xs text-red-700 bg-red-200 px-2 py-1 rounded-full inline-flex items-center gap-1 font-semibold">
                              <Users className="w-3 h-3" />
                              {entry.rop}
                            </p>
                          </div>
                        ))
                      ) : (
                        <div className="text-center py-8">
                          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <History className="w-8 h-8 text-gray-400" />
                          </div>
                          <p className="text-gray-500 font-medium text-sm">
                            Нет перенесённых заявок
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
        <div className={readOnly ? "lg:col-span-4" : "lg:col-span-3"}>
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
            <div className="p-6 border-b border-gray-100 bg-gradient-to-r from-blue-50 to-indigo-50">
              <h3 className="font-bold text-lg text-gray-900 flex items-center gap-3">
                <Calendar className="w-6 h-6 text-blue-600" />
                График преподавателей
                {selectedDate && (
                  <span className="text-sm text-blue-600 bg-blue-100 px-3 py-1 rounded-full font-semibold">
                    {new Date(selectedDate + "T00:00:00").toLocaleDateString(
                      "ru-RU",
                      {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      }
                    )}
                  </span>
                )}
              </h3>
            </div>
            <div className="p-6">
              <div className="overflow-auto max-h-[70vh]">
                <table className="w-full border-collapse relative">
                  <thead>
                    <tr>
                      <th className="sticky top-0 left-0 bg-gray-100 p-3 border-b-2 border-gray-200 font-bold text-gray-900 text-left min-w-[100px] z-30 text-sm">
                        Время
                      </th>
                      {teacherSchedule.teachers.map((teacher) => (
                        <th
                          key={teacher}
                          className="sticky top-0 bg-gray-100 p-3 border-b-2 border-gray-200 font-bold text-gray-900 min-w-[80px] text-center text-sm z-20"
                        >
                          {teacher}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {teacherSchedule.timeSlots.map((time) => (
                      <tr
                        key={time}
                        className="hover:bg-gray-50 transition-colors"
                      >
                        <td className="sticky left-0 bg-white p-3 border-b border-gray-100 font-bold text-xs text-gray-700 z-10">
                          {time}
                        </td>
                        {teacherSchedule.teachers.map((teacher) => {
                          const assignedEntry = assignedEntriesMap.get(
                            `${teacher}-${time}`
                          );
                          const cellKey = `${selectedDate}_${teacher}_${time}`;
                          const isBlocked = blockedSlotsMap.has(cellKey);
                          const isDragOver =
                            dragOverCell === `${teacher}-${time}`;
                          const isPrimedForBlock = cellToBlock === cellKey;

                          let cellClasses =
                            "p-2 border-b border-gray-100 h-16 transition-all";
                          if (!readOnly && !assignedEntry) {
                            cellClasses += " cursor-pointer";
                          }

                          if (isBlocked) {
                            cellClasses += " bg-gray-200 hover:bg-gray-300";
                          } else if (!assignedEntry && !readOnly) {
                            if (isDragOver && !isMobile) {
                              cellClasses +=
                                " bg-gradient-to-br from-green-200 to-emerald-200 border-green-400 animate-pulse scale-105 border-2 border-dashed";
                            } else if (selectedEntryForMobile && isMobile) {
                              cellClasses +=
                                " bg-blue-200 border-blue-400 border-2 border-dashed";
                            } else if (isPrimedForBlock && isMobile) {
                              cellClasses +=
                                " bg-yellow-200 border-yellow-400 border-2 border-dashed";
                            } else {
                              cellClasses +=
                                " bg-gradient-to-br from-green-50 to-emerald-50 hover:from-green-100 hover:to-emerald-100 border-2 border-dashed border-green-300";
                            }
                          }

                          return (
                            <td
                              key={cellKey}
                              onDragOver={handleDragOver}
                              onDragEnter={(e) =>
                                handleDragEnter(e, teacher, time)
                              }
                              onDragLeave={handleDragLeave}
                              onDrop={(e) => handleDrop(e, teacher, time)}
                              onClick={() => handleCellClick(teacher, time)}
                              className={cellClasses}
                            >
                              {assignedEntry ? (
                                <div
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    onOpenDetails(assignedEntry, readOnly);
                                  }}
                                  draggable={!readOnly && !isMobile}
                                  onDragStart={(e) =>
                                    handleDragStart(e, assignedEntry)
                                  }
                                  className={`w-full h-full flex items-center justify-center text-white rounded-lg p-2 text-xs font-semibold cursor-pointer transition-all hover:scale-105 shadow-lg transform ${getAppointmentColorForStatus(
                                    assignedEntry.status
                                  )} ${
                                    draggedItem?.id === assignedEntry.id
                                      ? "opacity-50 scale-95 rotate-1"
                                      : ""
                                  }`}
                                >
                                  <p className="font-bold truncate text-xs max-w-[100px] min-w-[100px]">
                                    {assignedEntry.clientName}
                                  </p>
                                </div>
                              ) : isBlocked ? (
                                <div className="h-full flex items-center justify-center text-gray-500">
                                  <Lock className="w-5 h-5" />
                                </div>
                              ) : !readOnly ? (
                                <div className="h-full flex items-center justify-center text-green-400 font-semibold  max-w-[116px] min-w-[116px]">
                                  <Plus className="w-5 h-5" />
                                </div>
                              ) : null}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
export default DistributionView;