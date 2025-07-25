import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Phone, UserIcon, Calendar, MapPin, Save, Trash2 } from 'lucide-react';

function CardList() {
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(true);
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

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen text-gray-500 text-xl">
        Загрузка...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 py-10 px-4">
      <div className="max-w-4xl mx-auto">
        <h2 className="text-3xl font-bold mb-8 text-center text-gray-800">Список клиентов</h2>

        {cards.length === 0 ? (
          <p className="text-center text-gray-600">Пусто</p>
        ) : (
          <div className="space-y-6">
            {cards.map((card) => (
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
