import { useState, useEffect } from 'react';
import { Link } from 'react-router';
import { useTranslation } from 'react-i18next';
import { Trophy, Medal, Award, ChevronLeft, ChevronRight } from 'lucide-react';
import { api } from '../services/api';
import { Button } from '../components/ui/button';
import { API_BASE_URL } from '../services/config';

const LIMIT = 10;
const FALLBACK = 'https://images.unsplash.com/photo-1511367461989-f85a21fda167?w=200';

export function Ratings() {
  const { t } = useTranslation();
  const [persons, setPersons] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    loadRatings();
  }, [page]);

  const loadRatings = async () => {
    setLoading(true);
    try {
      const data = await api.getRatings(page * LIMIT, LIMIT);
      setPersons(data);
      setHasMore(data.length === LIMIT);
    } catch (error) {
      console.error('Failed to load ratings:', error);
    } finally {
      setLoading(false);
    }
  };

  const getPhoto = (person: any) =>
    person?.photos[0]?.file_path
      ? `${API_BASE_URL}/${person.photos[0].file_path}`
      : FALLBACK;

  const getRankIcon = (index: number) => {
    const globalIndex = page * LIMIT + index;
    if (globalIndex === 0) return <Trophy className="w-6 h-6 text-yellow-400" />;
    if (globalIndex === 1) return <Medal className="w-6 h-6 text-zinc-300" />;
    if (globalIndex === 2) return <Award className="w-6 h-6 text-amber-600" />;
    return null;
  };

  const getRankStyle = (index: number) => {
    const globalIndex = page * LIMIT + index;
    if (globalIndex === 0) return 'from-yellow-500/20 to-yellow-600/5 border-yellow-500/30';
    if (globalIndex === 1) return 'from-zinc-400/20 to-zinc-500/5 border-zinc-400/30';
    if (globalIndex === 2) return 'from-amber-700/20 to-amber-800/5 border-amber-700/30';
    return 'from-zinc-900 to-zinc-950 border-zinc-800';
  };

  const getRatingColor = (globalIndex: number) => {
    if (globalIndex === 0) return 'text-yellow-400';
    if (globalIndex === 1) return 'text-zinc-300';
    if (globalIndex === 2) return 'text-amber-600';
    return 'text-white';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-950">
      <div className="container mx-auto px-4 py-8">

        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Trophy className="w-10 h-10 text-yellow-400" />
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-yellow-400 via-pink-400 to-purple-400 bg-clip-text text-transparent">
              {t('ratings')}
            </h1>
            <Trophy className="w-10 h-10 text-yellow-400" />
          </div>
          <p className="text-zinc-400 text-lg">{t('topPersons')}</p>
        </div>

        {/* Top 3 подиум — только на первой странице */}
        {page === 0 && !loading && persons.length >= 3 && (
          <div className="flex items-end justify-center gap-2 md:gap-4 mb-16">

            {/* 2 место */}
            <Link to={`/persons/${persons[1]?.id}`} className="flex flex-col items-center gap-3 w-32 md:w-48 cursor-pointer group">
              <div className="relative">
                <img
                  src={getPhoto(persons[1])}
                  className="w-20 h-20 md:w-24 md:h-24 rounded-full object-cover border-4 border-zinc-400 group-hover:border-zinc-300 transition-all"
                  alt={persons[1]?.name}
                />
                <div className="absolute -bottom-2 -right-2 w-7 h-7 md:w-8 md:h-8 bg-zinc-400 rounded-full flex items-center justify-center text-black font-bold text-sm">
                  2
                </div>
              </div>
              <div className="bg-gradient-to-t from-zinc-400/20 to-transparent border border-zinc-400/30 rounded-t-xl w-full p-3 text-center group-hover:border-zinc-300/50 transition-all" style={{ height: '80px' }}>
                <p className="text-white font-semibold truncate text-sm md:text-base">{persons[1]?.name}</p>
                <p className="text-zinc-400 text-xs md:text-sm">{persons[1]?.rating} pts</p>
              </div>
            </Link>

            {/* 1 место */}
            <Link to={`/persons/${persons[0]?.id}`} className="flex flex-col items-center gap-3 w-36 md:w-56 cursor-pointer group">
              <Trophy className="w-7 h-7 md:w-8 md:h-8 text-yellow-400" />
              <div className="relative">
                <img
                  src={getPhoto(persons[0])}
                  className="w-24 h-24 md:w-32 md:h-32 rounded-full object-cover border-4 border-yellow-400 shadow-lg shadow-yellow-400/30 group-hover:shadow-yellow-400/50 transition-all"
                  alt={persons[0]?.name}
                />
                <div className="absolute -bottom-2 -right-2 w-8 h-8 md:w-9 md:h-9 bg-yellow-400 rounded-full flex items-center justify-center text-black font-bold">
                  1
                </div>
              </div>
              <div className="bg-gradient-to-t from-yellow-500/20 to-transparent border border-yellow-500/30 rounded-t-xl w-full p-3 text-center group-hover:border-yellow-400/50 transition-all" style={{ height: '110px' }}>
                <p className="text-white font-semibold truncate text-sm md:text-base">{persons[0]?.name}</p>
                <p className="text-yellow-400 text-xs md:text-sm font-bold">{persons[0]?.rating} pts</p>
              </div>
            </Link>

            {/* 3 место */}
            <Link to={`/persons/${persons[2]?.id}`} className="flex flex-col items-center gap-3 w-32 md:w-48 cursor-pointer group">
              <div className="relative">
                <img
                  src={getPhoto(persons[2])}
                  className="w-20 h-20 md:w-24 md:h-24 rounded-full object-cover border-4 border-amber-600 group-hover:border-amber-500 transition-all"
                  alt={persons[2]?.name}
                />
                <div className="absolute -bottom-2 -right-2 w-7 h-7 md:w-8 md:h-8 bg-amber-600 rounded-full flex items-center justify-center text-black font-bold text-sm">
                  3
                </div>
              </div>
              <div className="bg-gradient-to-t from-amber-700/20 to-transparent border border-amber-700/30 rounded-t-xl w-full p-3 text-center group-hover:border-amber-600/50 transition-all" style={{ height: '60px' }}>
                <p className="text-white font-semibold truncate text-sm md:text-base">{persons[2]?.name}</p>
                <p className="text-zinc-400 text-xs md:text-sm">{persons[2]?.rating} pts</p>
              </div>
            </Link>
          </div>
        )}

        {/* Список */}
        {loading ? (
          <div className="text-center text-zinc-400 py-20">{t('loading')}</div>
        ) : (
          <>
            <div className="space-y-3 max-w-3xl mx-auto mb-8">
              {persons.map((person, index) => {
                const globalIndex = page * LIMIT + index;
                return (
                  <Link
                    key={person.id}
                    to={`/persons/${person.id}`}
                    className={`flex items-center gap-4 bg-gradient-to-r ${getRankStyle(index)} border rounded-xl p-4 transition-all hover:scale-[1.01] hover:brightness-110 cursor-pointer`}
                  >
                    {/* Позиция */}
                    <div className="flex items-center justify-center w-10 flex-shrink-0">
                      {getRankIcon(index) || (
                        <span className="text-xl font-bold text-zinc-500">
                          {globalIndex + 1}
                        </span>
                      )}
                    </div>

                    {/* Фото */}
                    <img
                      src={getPhoto(person)}
                      className="w-14 h-14 md:w-16 md:h-16 rounded-full object-cover flex-shrink-0"
                      alt={person.name}
                    />

                    {/* Инфо */}
                    <div className="flex-1 min-w-0">
                      <h3 className="text-white font-semibold text-base md:text-lg truncate">{person.name}</h3>
                      <p className="text-zinc-400 text-sm truncate">{person.full_name}</p>
                    </div>

                    {/* Рейтинг */}
                    <div className="text-right flex-shrink-0">
                      <div className={`text-xl md:text-2xl font-bold ${getRatingColor(globalIndex)}`}>
                        {person.rating}
                      </div>
                      <div className="text-zinc-500 text-xs">pts</div>
                    </div>
                  </Link>
                );
              })}
            </div>

            {/* Пагинация */}
            <div className="flex items-center justify-center gap-4">
              <Button
                variant="outline"
                onClick={() => setPage(p => p - 1)}
                disabled={page === 0}
                className="flex items-center gap-2 border-zinc-700"
              >
                <ChevronLeft className="w-4 h-4" />
                {t('prev') || 'Назад'}
              </Button>
              <span className="text-zinc-400">
                {t('page') || 'Страница'} {page + 1}
              </span>
              <Button
                variant="outline"
                onClick={() => setPage(p => p + 1)}
                disabled={!hasMore}
                className="flex items-center gap-2 border-zinc-700"
              >
                {t('next') || 'Далее'}
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}