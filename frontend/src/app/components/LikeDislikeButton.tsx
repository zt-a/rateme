import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Heart, HeartOff } from 'lucide-react';
import { Button } from './ui/button';
import { api } from '../services/api';
import { toast } from 'sonner';

interface LikeDislikeButtonProps {
  personId: number;
  initialLikes: number;
  initialDislikes: number;
  initialReaction: 'like' | 'dislike' | null;
  onUpdate?: () => void;
}

export function LikeDislikeButton({
  personId,
  initialLikes,
  initialDislikes,
  initialReaction,
  onUpdate,
}: LikeDislikeButtonProps) {
  const { t } = useTranslation();
  const [likes, setLikes] = useState(initialLikes);
  const [dislikes, setDislikes] = useState(initialDislikes);
  const [userReaction, setUserReaction] = useState<'like' | 'dislike' | null>(initialReaction);
  const [loading, setLoading] = useState(false);

  const handleReaction = async (type: 'like' | 'dislike') => {
    if (loading) return;
    setLoading(true);
    try {
      if (userReaction === type) {
        await api.removeReaction(personId);
        setUserReaction(null);
        if (type === 'like') {
          setLikes(prev => prev - 1);
        } else {
          setDislikes(prev => prev - 1);
        }
      } else {
        await api.reactToPerson(personId, type);
        if (userReaction === 'like') {
          setLikes(prev => prev - 1);
          setDislikes(prev => prev + 1);
        } else if (userReaction === 'dislike') {
          setDislikes(prev => prev - 1);
          setLikes(prev => prev + 1);
        } else {
          if (type === 'like') {
            setLikes(prev => prev + 1);
          } else {
            setDislikes(prev => prev + 1);
          }
        }
        setUserReaction(type);
      }
      onUpdate?.();
    } catch (error: any) {
      toast.error(error.message || t('error'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex gap-4">
      <Button
        size="lg"
        onClick={() => handleReaction('like')}
        disabled={loading}
        className={`flex-1 text-lg ${
          userReaction === 'like'
            ? 'bg-gradient-to-r from-pink-600 to-pink-500'
            : 'bg-zinc-800 hover:bg-zinc-700'
        }`}
      >
        <Heart className={`w-5 h-5 mr-2 ${userReaction === 'like' ? 'fill-current' : ''}`} />
        {t('like')} ({likes})
      </Button>
      <Button
        size="lg"
        onClick={() => handleReaction('dislike')}
        disabled={loading}
        className={`flex-1 text-lg ${
          userReaction === 'dislike'
            ? 'bg-gradient-to-r from-zinc-700 to-zinc-600'
            : 'bg-zinc-800 hover:bg-zinc-700'
        }`}
      >
        <HeartOff className={`w-5 h-5 mr-2 ${userReaction === 'dislike' ? 'fill-current' : ''}`} />
        {t('dislike')} ({dislikes})
      </Button>
    </div>
  );
}