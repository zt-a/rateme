import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Search, Trophy, Users, Heart, ChevronLeft, ChevronRight, UserPlus } from 'lucide-react';
import { Link } from 'react-router';
import { Input } from '../components/ui/input';
import { PersonCard } from '../components/PersonCard';
import { Button } from '../components/ui/button';
import { api } from '../services/api';
import { useAuth } from '../contexts/useAuth';

const LIMIT = 20;

export function Home() {
  const { t } = useTranslation();
  const { isAuthenticated } = useAuth();
  const [persons, setPersons] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(0);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  useEffect(() => {
    loadPersons(page);
  }, [page]);

  const loadPersons = async (currentPage: number) => {
    setLoading(true);
    try {
      const skip = currentPage * LIMIT;
      const data = await api.listPersons(skip, LIMIT);
      setPersons(data.items);
      setTotal(data.total);
      setTotalPages(data.pages);
    } catch (error) {
      console.error('Failed to load persons:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredPersons = persons.filter(person =>
    person.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    person.full_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-950">

      {/* Hero секция */}
      <div className="bg-gradient-to-b from-zinc-900 to-zinc-950 border-b border-zinc-800">
        <div className="container mx-auto px-4 py-12 text-center">
          <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-purple-400 bg-clip-text text-transparent mb-4">
            RateMe
          </h1>
          <p className="text-zinc-400 text-lg mb-8 max-w-xl mx-auto">
            Оценивай, голосуй и смотри рейтинги популярных людей
          </p>

          {/* Статистика */}
          <div className="flex items-center justify-center gap-8 mb-8">
            <div className="text-center">
              <p className="text-2xl font-bold text-white">{total}</p>
              <p className="text-zinc-500 text-sm flex items-center gap-1">
                <Users className="w-3 h-3" /> Персон
              </p>
            </div>
            <div className="w-px h-8 bg-zinc-700" />
            <div className="text-center">
              <p className="text-2xl font-bold text-white">∞</p>
              <p className="text-zinc-500 text-sm flex items-center gap-1">
                <Heart className="w-3 h-3" /> Оценок
              </p>
            </div>
            <div className="w-px h-8 bg-zinc-700" />
            <div className="text-center">
              <Link to="/ratings" className="group">
                <p className="text-2xl font-bold text-yellow-400 group-hover:text-yellow-300">TOP</p>
                <p className="text-zinc-500 text-sm flex items-center gap-1">
                  <Trophy className="w-3 h-3" /> Рейтинг
                </p>
              </Link>
            </div>
          </div>

          {/* Кнопки */}
          <div className="flex gap-3 justify-center">
            <Link to="/ratings">
              <Button variant="outline" className="border-zinc-700 gap-2">
                <Trophy className="w-4 h-4 text-yellow-400" />
                Топ рейтинг
              </Button>
            </Link>
            {isAuthenticated && (
              <Link to="/add-person">
                <Button className="bg-gradient-to-r from-purple-600 to-pink-600 gap-2">
                  <UserPlus className="w-4 h-4" />
                  {t('addPerson') || 'Добавить персону'}
                </Button>
              </Link>
            )}
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">

        {/* Поиск */}
        <div className="mb-6">
          <div className="relative max-w-2xl mx-auto">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400" />
            <Input
              type="text"
              placeholder={t('search')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12 py-6 bg-zinc-900 border-zinc-800 text-white text-lg"
            />
          </div>
        </div>

        {/* Счётчик и страница */}
        {!searchQuery && (
          <div className="flex items-center justify-between mb-4">
            <p className="text-zinc-500 text-sm">
              Всего: <span className="text-white font-medium">{total}</span> персон
            </p>
            <p className="text-zinc-500 text-sm">
              Страница <span className="text-white">{page + 1}</span> из <span className="text-white">{totalPages || 1}</span>
            </p>
          </div>
        )}

        {/* Сетка персон */}
        {loading ? (
          <div className="text-center text-zinc-400 py-20">{t('loading')}</div>
        ) : filteredPersons.length === 0 ? (
          <div className="text-center text-zinc-400 py-20">{t('noData')}</div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
              {filteredPersons.map((person) => (
                <PersonCard
                  key={person.id + String(person.user_reaction)}
                  person={person}
                />
              ))}
            </div>

            {/* Пагинация */}
            {!searchQuery && totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-10">
                <Button
                  variant="outline"
                  onClick={() => setPage(p => p - 1)}
                  disabled={page === 0 || loading}
                  className="border-zinc-700 gap-2"
                >
                  <ChevronLeft className="w-4 h-4" />
                  {t('prev') || 'Назад'}
                </Button>

                {/* Номера страниц */}
                <div className="flex gap-1">
                  {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                    let pageNum = i;
                    if (totalPages > 5) {
                      if (page <= 2) pageNum = i;
                      else if (page >= totalPages - 3) pageNum = totalPages - 5 + i;
                      else pageNum = page - 2 + i;
                    }
                    return (
                      <Button
                        key={pageNum}
                        size="sm"
                        variant={page === pageNum ? 'default' : 'outline'}
                        onClick={() => setPage(pageNum)}
                        disabled={loading}
                        className={`w-9 ${page === pageNum ? 'bg-gradient-to-r from-purple-600 to-pink-600 border-0' : 'border-zinc-700'}`}
                      >
                        {pageNum + 1}
                      </Button>
                    );
                  })}
                </div>

                <Button
                  variant="outline"
                  onClick={() => setPage(p => p + 1)}
                  disabled={page >= totalPages - 1 || loading}
                  className="border-zinc-700 gap-2"
                >
                  {t('next') || 'Далее'}
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}