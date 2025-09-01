import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Phone, UserIcon, Calendar, MapPin, Save, Trash2 } from 'lucide-react';

function CardList() {
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(true);

  // NEW: filters & sort state
  const [filters, setFilters] = useState({ rop: '', sourse: '' });
  const [sortOrder, setSortOrder] = useState('desc'); // 'asc' | 'desc'

  const navigate = useNavigate();

  // Fetch cards
  const fetchCards = () => {
    setLoading(true);
    fetch('https://us-central1-akcent-academy.cloudfunctions.net/getCardsList')
      .then((res) => res.json())
      .then((data) => {
        setCards(data.cards || []);
        setLoading(false);
      })
      .catch((error) => {
        console.error('Error fetching cards:', error);
        setLoading(false);
      });
  };

  useEffect(() => {
    localStorage.removeItem("currentUser");
    fetchCards();
  }, []);

  // Handle use/save
  const handleUse = (card) => {
    const query = new URLSearchParams(card).toString();
    navigate('/?' + query);
  };

  // Handle delete
  const handleDelete = (id) => {
    if (!window.confirm('Удалить эту запись?')) return;

    fetch(`https://us-central1-akcent-academy.cloudfunctions.net/deleteCard?id=${id}`)
      .then((res) => {
        if (!res.ok) throw new Error('Ошибка при удалении');
        return res.json();
      })
      .then(() => {
        fetchCards(); // Refresh list
      })
      .catch((error) => {
        console.error('Ошибка удаления:', error);
        alert('Не удалось удалить карточку');
      });
  };

  // ===== Helpers for filtering/sorting =====
  const norm = (v) => (v || '').trim().toLowerCase();

  const tsFromCard = (c) => {
    // Build a timestamp from trialDate + trialTime; empty/malformed -> 0 (goes to end)
    if (!c?.trialDate && !c?.trialTime) return 0;
    const date = (c.trialDate || '1970-01-01').trim();
    const time = (c.trialTime || '00:00').trim().padStart(5, '0'); // 9:5 -> 09:05
    const dt = new Date(`${date}T${time}`);
    const t = dt.getTime();
    return Number.isNaN(t) ? 0 : t;
  };

  // Build unique dropdown options, keep first-seen original casing for display
  const ropOptions = useMemo(() => {
    const m = new Map();
    cards.forEach((c) => {
      const v = (c.rop || '').trim();
      if (v) {
        const key = v.toLowerCase();
        if (!m.has(key)) m.set(key, v);
      }
    });
    return Array.from(m.values()).sort((a, b) => a.localeCompare(b, 'ru'));
  }, [cards]);

  const sourseOptions = useMemo(() => {
    const m = new Map();
    cards.forEach((c) => {
      const v = (c.sourse || '').trim();
      if (v) {
        const key = v.toLowerCase();
        if (!m.has(key)) m.set(key, v);
      }
    });
    return Array.from(m.values()).sort((a, b) => a.localeCompare(b, 'ru'));
  }, [cards]);

  // Apply filters + sorting
  const visibleCards = useMemo(() => {
    const filtered = cards.filter((c) => {
      const ropOk = !filters.rop || norm(c.rop) === norm(filters.rop);
      const sourseOk = !filters.sourse || norm(c.sourse) === norm(filters.sourse);
      return ropOk && sourseOk;
    });

    const sorted = [...filtered].sort((a, b) => {
      const ta = tsFromCard(a);
      const tb = tsFromCard(b);
      if (ta === tb) return 0;
      return sortOrder === 'asc' ? ta - tb : tb - ta;
    });

    return sorted;
  }, [cards, filters, sortOrder]);

  const clearFilters = () => setFilters({ rop: '', sourse: '' });

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen text-gray-500 text-xl">
        Загрузка...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 py-10 px-4">
      <div className="max-w-5xl mx-auto">
        <h2 className="text-3xl font-bold mb-6 text-center text-gray-800">Список клиентов</h2>

        {/* Filters / Controls */}
        <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
            <div className="flex flex-col">
              <label className="text-sm text-gray-600 mb-1">Роп</label>
              <select
                className="bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-sm"
                value={filters.rop}
                onChange={(e) => setFilters((f) => ({ ...f, rop: e.target.value }))}
              >
                <option value="">Все</option>
                {ropOptions.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex flex-col">
              <label className="text-sm text-gray-600 mb-1">Источник</label>
              <select
                className="bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-sm"
                value={filters.sourse}
                onChange={(e) => setFilters((f) => ({ ...f, sourse: e.target.value }))}
              >
                <option value="">Все</option>
                {sourseOptions.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex flex-col">
              <label className="text-sm text-gray-600 mb-1">Сортировка по дате пробного</label>
              <select
                className="bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-sm"
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value)}
              >
                <option value="desc">Новые сверху (DESC)</option>
                <option value="asc">Старые сверху (ASC)</option>
              </select>
            </div>

            <div className="flex gap-2 md:justify-end">
              <button
                onClick={clearFilters}
                className="w-full md:w-auto inline-flex items-center justify-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-800 px-4 py-2 rounded-xl text-sm font-medium border border-gray-200"
                title="Сбросить фильтры"
              >
                Сбросить
              </button>
              <button
                onClick={fetchCards}
                className="w-full md:w-auto inline-flex items-center justify-center gap-2 bg-white hover:bg-gray-50 text-gray-800 px-4 py-2 rounded-xl text-sm font-medium border border-gray-200"
                title="Обновить список"
              >
                Обновить
              </button>
            </div>
          </div>

          <div className="mt-3 text-xs text-gray-500">
            Найдено: <span className="font-semibold">{visibleCards.length}</span>
            {cards.length ? ` из ${cards.length}` : ''}
          </div>
        </div>

        {/* Results */}
        {visibleCards.length === 0 ? (
          <p className="text-center text-gray-600">Пусто</p>
        ) : (
          <div className="space-y-6">
            {visibleCards.map((card) => (
              <div
                key={card.id}
                className="bg-white p-6 rounded-2xl shadow hover:shadow-lg transition-shadow border border-gray-100"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
                      <UserIcon className="w-5 h-5 text-blue-500" />
                      {card.clientName}
                    </h3>
                    <p className="text-gray-600 mt-1">{card.comment}</p>

                    <div className="mt-4 space-y-1 text-sm text-gray-600">
                      <div className="flex items-center gap-2">
                        <Phone className="w-4 h-4 text-blue-400" />
                        <span>{card.phone}</span>
                      </div>
                      {card.sourse && (
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4 text-green-400" />
                          <span>{card.sourse}</span>
                        </div>
                      )}
                      {(card.trialDate || card.trialTime) && (
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-purple-400" />
                          <span>
                            {card.trialDate || '-'} в {card.trialTime || '-'}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-2">
                    <button
                      onClick={() => handleUse(card)}
                      className="inline-flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-xl text-sm font-medium shadow"
                    >
                      <Save className="w-4 h-4" />
                      Сохранить
                    </button>
                    <button
                      onClick={() => handleDelete(card.id)}
                      className="inline-flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-xl text-sm font-medium shadow"
                    >
                      <Trash2 className="w-4 h-4" />
                      Удалить
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default CardList;
