import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router';
import { useTranslation } from 'react-i18next';
import { Heart, HeartOff, ChevronLeft, ChevronRight } from 'lucide-react';
import { Card, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { api } from '../services/api';
import { toast } from 'sonner';
import { useAuth } from '../contexts/useAuth';

const API_BASE_URL = 'http://localhost:8000';
const FALLBACK = 'https://images.unsplash.com/photo-1511367461989-f85a21fda167?w=400';

interface PersonCardProps {
  person: {
    id: number;
    name: string;
    full_name: string;
    gender: 'male' | 'female' | 'other';
    likes_count: number;
    dislikes_count: number;
    rating: number;
    photos: Array<{ id: number; file_path: string }>;
    user_reaction?: 'like' | 'dislike' | null;
  };
}

export function PersonCard({ person }: PersonCardProps) {
  const { t } = useTranslation();
  const { isAuthenticated } = useAuth();
  const [current, setCurrent] = useState(0);
  const [hovered, setHovered] = useState(false);
  const [animating, setAnimating] = useState(false);
  const [direction, setDirection] = useState<'left' | 'right'>('right');
  const [likes, setLikes] = useState(person.likes_count);
  const [dislikes, setDislikes] = useState(person.dislikes_count);
  const [userReaction, setUserReaction] = useState<'like' | 'dislike' | null>(person.user_reaction || null);
  const [loading, setLoading] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const photos = person.photos.length > 0
    ? person.photos.map(p => `${API_BASE_URL}/${p.file_path}`)
    : [FALLBACK];

  const goTo = (dir: 'left' | 'right') => {
    if (animating || photos.length <= 1) return;
    setDirection(dir);
    setAnimating(true);
    setTimeout(() => {
      setCurrent(prev =>
        dir === 'right'
          ? (prev + 1) % photos.length
          : (prev - 1 + photos.length) % photos.length
      );
      setAnimating(false);
    }, 250);
  };

  useEffect(() => {
    if (photos.length <= 1) return;
    timerRef.current = setInterval(() => goTo('right'), 3000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [photos.length]);

  const handlePrev = (e: React.MouseEvent) => {
    e.preventDefault(); e.stopPropagation();
    if (timerRef.current) clearInterval(timerRef.current);
    goTo('left');
  };

  const handleNext = (e: React.MouseEvent) => {
    e.preventDefault(); e.stopPropagation();
    if (timerRef.current) clearInterval(timerRef.current);
    goTo('right');
  };

  const handleReaction = async (e: React.MouseEvent, type: 'like' | 'dislike') => {
    e.preventDefault(); e.stopPropagation();
    if (!isAuthenticated) { toast.error(t('login')); return; }
    if (loading) return;
    setLoading(true);
    try {
      if (userReaction === type) {
        await api.removeReaction(person.id);
        setUserReaction(null);
        if (type === 'like') setLikes(p => p - 1);
        else setDislikes(p => p - 1);
      } else {
        await api.reactToPerson(person.id, type);
        if (userReaction === 'like') { setLikes(p => p - 1); setDislikes(p => p + 1); }
        else if (userReaction === 'dislike') { setDislikes(p => p - 1); setLikes(p => p + 1); }
        else { if (type === 'like') setLikes(p => p + 1); else setDislikes(p => p + 1); }
        setUserReaction(type);
      }
    } catch (error: any) {
      toast.error(error.message || t('error'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Link to={`/persons/${person.id}`}>
      <Card className="overflow-hidden hover:shadow-xl transition-all duration-300 hover:scale-105 bg-gradient-to-br from-zinc-900 to-zinc-950 border-zinc-800">
        <div
          className="aspect-[3/4] relative overflow-hidden"
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
        >
          <img
            src={photos[current]}
            alt={person.name}
            className="w-full h-full object-cover"
            style={{
              transition: 'opacity 0.25s ease, transform 0.25s ease',
              opacity: animating ? 0 : 1,
              transform: animating
                ? `translateX(${direction === 'right' ? '-20px' : '20px'})`
                : 'translateX(0)',
            }}
          />

          <div className="absolute top-3 right-3">
            <Badge className="bg-gradient-to-r from-purple-600 to-pink-600 border-0">
              {person.rating}
            </Badge>
          </div>

          {photos.length > 1 && hovered && (
            <>
              <button
                onClick={handlePrev}
                className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full p-1 transition-all"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={handleNext}
                className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full p-1 transition-all"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </>
          )}

          {photos.length > 1 && (
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
              {photos.map((_, i) => (
                <button
                  key={i}
                  onClick={(e) => { e.preventDefault(); e.stopPropagation(); setCurrent(i); }}
                  className="rounded-full transition-all duration-300"
                  style={{
                    width: i === current ? '16px' : '6px',
                    height: '6px',
                    background: i === current ? 'white' : 'rgba(255,255,255,0.4)',
                  }}
                />
              ))}
            </div>
          )}
        </div>

        <CardContent className="p-4">
          <h3 className="font-semibold text-lg text-white mb-3 truncate">
            {person.name}
          </h3>
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              disabled={loading}
              onClick={(e) => handleReaction(e, 'like')}
              className={`flex-1 ${userReaction === 'like' ? 'bg-gradient-to-r from-pink-600 to-pink-500' : 'bg-zinc-800 hover:bg-zinc-700'}`}
            >
              <Heart className={`w-4 h-4 mr-1 ${userReaction === 'like' ? 'fill-current' : ''}`} />
              {likes}
            </Button>
            <Button
              size="sm"
              disabled={loading}
              onClick={(e) => handleReaction(e, 'dislike')}
              className={`flex-1 ${userReaction === 'dislike' ? 'bg-zinc-600' : 'bg-zinc-800 hover:bg-zinc-700'}`}
            >
              <HeartOff className={`w-4 h-4 mr-1 ${userReaction === 'dislike' ? 'fill-current' : ''}`} />
              {dislikes}
            </Button>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}