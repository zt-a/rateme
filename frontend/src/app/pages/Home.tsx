import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Search } from 'lucide-react';
import { Input } from '../components/ui/input';
import { PersonCard } from '../components/PersonCard';
import { Button } from '../components/ui/button';
import { api } from '../services/api';

export function Home() {
  const { t } = useTranslation();
  const [persons, setPersons] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const LIMIT = 20;

  useEffect(() => {
    loadPersons(page);
  }, [page]);

  const loadPersons = async (currentPage: number) => {
    setLoading(true);
    try {
      const skip = currentPage * LIMIT;
      const data = await api.listPersons(skip, LIMIT);
      if (currentPage === 0) {
        setPersons(data);
      } else {
        setPersons(prev => [...prev, ...data]);
      }
      setHasMore(data.length === LIMIT);
    } catch (error) {
      console.error('Failed to load persons:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadMore = () => {
    setPage(prev => prev + 1);
  };

  const filteredPersons = persons.filter(person =>
    person.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    person.full_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-950">
      <div className="container mx-auto px-4 py-8">
        {/* Search Bar */}
        <div className="mb-8">
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

        {/* Person Grid */}
        {loading && persons.length === 0 ? (
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

            {hasMore && !searchQuery && (
              <div className="flex justify-center mt-8">
                <Button
                  onClick={loadMore}
                  disabled={loading}
                  className="bg-gradient-to-r from-purple-600 to-pink-600 px-8"
                >
                  {loading ? t('loading') : 'Load More'}
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}