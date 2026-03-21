import { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router';
import { useTranslation } from 'react-i18next';
import { Instagram, Send, MapPin, Briefcase, GraduationCap, Calendar, Heart, ChevronLeft, ChevronRight, Phone } from 'lucide-react';
import { api } from '../services/api';
import { LikeDislikeButton } from '../components/LikeDislikeButton';
import { CommentItem } from '../components/CommentItem';
import { Button } from '../components/ui/button';
import { Textarea } from '../components/ui/textarea';
import { Badge } from '../components/ui/badge';
import { Progress } from '../components/ui/progress';
import { useAuth } from '../contexts/useAuth';
import { toast } from 'sonner';

const API_BASE_URL = 'http://localhost:8000';

export function PersonDetail() {
  const { id } = useParams<{ id: string }>();
  const { t } = useTranslation();
  const { isAuthenticated } = useAuth();
  const [person, setPerson] = useState<any>(null);
  const [comments, setComments] = useState<any[]>([]);
  const [commentText, setCommentText] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedPhoto, setSelectedPhoto] = useState(0);
  const [hovered, setHovered] = useState(false);
  const [animating, setAnimating] = useState(false);
  const [direction, setDirection] = useState<'left' | 'right'>('right');
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (id) {
      loadPerson();
      loadComments();
    }
  }, [id]);

  // Автосвайп
  useEffect(() => {
    if (!person || person.photos.length <= 1) return;
    timerRef.current = setInterval(() => {
      goTo('right');
    }, 4000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [person]);

  const goTo = (dir: 'left' | 'right', index?: number) => {
    if (animating || !person) return;
    setDirection(dir);
    setAnimating(true);
    setTimeout(() => {
      if (index !== undefined) {
        setSelectedPhoto(index);
      } else {
        setSelectedPhoto(prev =>
          dir === 'right'
            ? (prev + 1) % person.photos.length
            : (prev - 1 + person.photos.length) % person.photos.length
        );
      }
      setAnimating(false);
    }, 300);
  };

  const handlePrev = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    goTo('left');
  };

  const handleNext = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    goTo('right');
  };

  const loadPerson = async () => {
    try {
      const data = await api.getPerson(Number(id));
      setPerson(data);
      setLoading(false);
    } catch (error) {
      console.error('Failed to load person:', error);
      setLoading(false);
    }
  };

  const loadComments = async () => {
    try {
      const data = await api.listComments(Number(id));
      setComments(data);
    } catch (error) {
      console.error('Failed to load comments:', error);
    }
  };

  const handleAddComment = async () => {
    if (!commentText.trim()) return;
    try {
      await api.createComment(Number(id), commentText);
      setCommentText('');
      toast.success(t('updateSuccess'));
      loadComments();
    } catch (error: any) {
      toast.error(error.message || t('error'));
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-950 flex items-center justify-center">
        <div className="text-white">{t('loading')}</div>
      </div>
    );
  }

  if (!person) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-950 flex items-center justify-center">
        <div className="text-white">{t('noData')}</div>
      </div>
    );
  }

  const photos = person.photos.length > 0
    ? person.photos.map((p: any) => `${API_BASE_URL}/${p.file_path}`)
    : ['https://images.unsplash.com/photo-1511367461989-f85a21fda167?w=800'];

  const ratingPercent = Math.min(100, (person.rating / 100) * 100);

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-950">
      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-2 gap-8">

          {/* Photo Gallery */}
          <div className="space-y-4">
            <div
              className="aspect-[3/4] rounded-2xl overflow-hidden relative"
              onMouseEnter={() => setHovered(true)}
              onMouseLeave={() => setHovered(false)}
            >
              <img
                src={photos[selectedPhoto]}
                alt={person.name}
                className="w-full h-full object-cover"
                style={{
                  transition: 'opacity 0.3s ease, transform 0.3s ease',
                  opacity: animating ? 0 : 1,
                  transform: animating
                    ? `translateX(${direction === 'right' ? '-30px' : '30px'})`
                    : 'translateX(0)',
                }}
              />

              {/* Кнопки навигации */}
              {photos.length > 1 && hovered && (
                <>
                  <button
                    onClick={handlePrev}
                    className="absolute left-3 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full p-2 transition-all"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button
                    onClick={handleNext}
                    className="absolute right-3 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full p-2 transition-all"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </>
              )}

              {/* Точки */}
              {photos.length > 1 && (
                <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
                  {photos.map((_: any, i: number) => (
                    <button
                      key={i}
                      onClick={() => goTo(i > selectedPhoto ? 'right' : 'left', i)}
                      className="rounded-full transition-all duration-300"
                      style={{
                        width: i === selectedPhoto ? '20px' : '8px',
                        height: '8px',
                        background: i === selectedPhoto ? 'white' : 'rgba(255,255,255,0.4)',
                      }}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Миниатюры */}
            {photos.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-1">
                {person.photos.map((photo: any, index: number) => (
                  <button
                    key={photo.id}
                    onClick={() => goTo(index > selectedPhoto ? 'right' : 'left', index)}
                    className="flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden transition-all duration-300"
                    style={{
                      border: selectedPhoto === index ? '2px solid #ec4899' : '2px solid transparent',
                      opacity: selectedPhoto === index ? 1 : 0.6,
                    }}
                  >
                    <img
                      src={`${API_BASE_URL}/${photo.file_path}`}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Profile Info */}
          <div className="space-y-6">
            <div>
              <h1 className="text-4xl font-bold text-white mb-2">{person.full_name}</h1>
              <p className="text-xl text-zinc-400">@{person.name}</p>
            </div>

            {/* Rating */}
            <div className="bg-zinc-900 rounded-xl p-6 border border-zinc-800">
              <div className="flex items-center justify-between mb-3">
                <span className="text-zinc-400">{t('rating')}</span>
                <Badge className="bg-gradient-to-r from-purple-600 to-pink-600 text-lg px-4 py-1">
                  {person.rating}
                </Badge>
              </div>
              <Progress value={ratingPercent} className="h-3" />
            </div>

            {/* Like/Dislike Buttons */}
            {isAuthenticated && person && (
              <LikeDislikeButton
                key={person.id + String(person.user_reaction)}
                personId={person.id}
                initialLikes={person.likes_count}
                initialDislikes={person.dislikes_count}
                initialReaction={person.user_reaction}
                onUpdate={loadPerson}
              />
            )}

            {/* Info */}
            <div className="bg-zinc-900 rounded-xl p-6 border border-zinc-800 space-y-4">
              {person.description && (
                <p className="text-white">{person.description}</p>
              )}
              {person.birth_year && (
                <div className="flex items-center gap-3 text-zinc-300">
                  <Calendar className="w-5 h-5 text-pink-500" />
                  <span>{t('birthYear')}: {person.birth_year}</span>
                </div>
              )}
              {person.gender && (
                <div className="flex items-center gap-3 text-zinc-300">
                  <Heart className="w-5 h-5 text-pink-500" />
                  <span>{t('gender')}: {t(person.gender)}</span>
                </div>
              )}
              {person.study_place && (
                <div className="flex items-center gap-3 text-zinc-300">
                  <GraduationCap className="w-5 h-5 text-pink-500" />
                  <span>{person.study_place}</span>
                </div>
              )}
              {person.work_place && (
                <div className="flex items-center gap-3 text-zinc-300">
                  <Briefcase className="w-5 h-5 text-pink-500" />
                  <span>{person.work_place}</span>
                </div>
              )}
              {person.relationship_status && (
                <div className="flex items-center gap-3 text-zinc-300">
                  <MapPin className="w-5 h-5 text-pink-500" />
                  <span>{person.relationship_status}</span>
                </div>
              )}
              {person.phone && (
                <div className="flex items-center gap-3 text-zinc-300">
                    <Phone className="w-5 h-5 text-pink-500" />
                    <span>{person.phone}</span>
                </div>
              )}
            </div>

            {/* Social Links */}
            {(person.instagram || person.telegram) && (
              <div className="flex gap-4">
                {person.instagram && (
                  <a href={`https://instagram.com/${person.instagram}`} target="_blank" rel="noopener noreferrer" className="flex-1">
                    <Button variant="outline" className="w-full">
                      <Instagram className="w-5 h-5 mr-2" />
                      Instagram
                    </Button>
                  </a>
                )}
                {person.telegram && (
                  <a href={`https://t.me/${person.telegram}`} target="_blank" rel="noopener noreferrer" className="flex-1">
                    <Button variant="outline" className="w-full">
                      <Send className="w-5 h-5 mr-2" />
                      Telegram
                    </Button>
                  </a>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Comments Section */}
        <div className="mt-12 max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold text-white mb-6">
            {t('comments')} ({comments.length})
          </h2>
          {isAuthenticated && (
            <div className="bg-zinc-900 rounded-xl p-6 border border-zinc-800 mb-6">
              <Textarea
                placeholder={t('addComment')}
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                className="bg-zinc-800 border-zinc-700 mb-4"
                rows={3}
              />
              <Button
                onClick={handleAddComment}
                className="bg-gradient-to-r from-purple-600 to-pink-600"
              >
                {t('submit')}
              </Button>
            </div>
          )}
          <div className="space-y-4">
            {comments.length === 0 ? (
              <div className="text-center text-zinc-400 py-8">{t('noComments')}</div>
            ) : (
              comments.map((comment) => (
                <CommentItem key={comment.id} comment={comment} onUpdate={loadComments} />
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}