import { useState } from 'react';
import { useNavigate } from 'react-router';
import { useTranslation } from 'react-i18next';
import { UserPlus, Upload, X, Loader2, CheckCircle } from 'lucide-react';
import { api } from '../services/api';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { Label } from '../components/ui/label';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '../components/ui/select';
import { toast } from 'sonner';

export function AddPerson() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [photos, setPhotos] = useState<File[]>([]);
  const [formData, setFormData] = useState({
    name: '',
    full_name: '',
    description: '',
    gender: 'other',
    birth_year: '',
    phone: '',
    email: '',
    study_place: '',
    work_place: '',
    relationship_status: '',
    instagram: '',
    telegram: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Защита от повторной отправки
    if (loading || submitted) return;

    setLoading(true);
    try {
      const data = {
        ...formData,
        birth_year: formData.birth_year ? Number(formData.birth_year) : null,
        phone: formData.phone ? Number(formData.phone) : null,
        email: formData.email || null,
      };

      const person = await api.createPerson(data);

      if (photos.length > 0) {
        for (const file of photos) {
          await api.uploadPhoto(person.id, file);
        }
      }

      setSubmitted(true);
    } catch (error: any) {
      toast.error(error.message || t('error'));
      setLoading(false);
    }
  };

  // Показываем страницу успеха
  if (submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-950 flex items-center justify-center">
        <div className="text-center max-w-md px-4">
          <div className="w-20 h-20 bg-green-500/20 border border-green-500/30 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-10 h-10 text-green-400" />
          </div>
          <h2 className="text-3xl font-bold text-white mb-3">Персона добавлена!</h2>
          <p className="text-zinc-400 mb-8">
            Ваша заявка отправлена на проверку модератором. Вы можете отслеживать статус в профиле.
          </p>
          <div className="flex gap-3 justify-center">
            <Button
              onClick={() => navigate('/profile')}
              className="bg-gradient-to-r from-purple-600 to-pink-600"
            >
              Мои персоны
            </Button>
            <Button
              variant="outline"
              onClick={() => navigate('/')}
              className="border-zinc-700"
            >
              На главную
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-950">
      {/* Overlay при загрузке */}
      {loading && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center">
          <div className="bg-zinc-900 border border-zinc-700 rounded-2xl p-8 text-center">
            <Loader2 className="w-12 h-12 text-purple-400 animate-spin mx-auto mb-4" />
            <p className="text-white font-semibold">Отправляем заявку...</p>
            <p className="text-zinc-400 text-sm mt-1">Пожалуйста подождите</p>
          </div>
        </div>
      )}

      <div className="container mx-auto px-4 py-12 max-w-2xl">

        {/* Header */}
        <div className="text-center mb-10">
          <div className="w-14 h-14 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl flex items-center justify-center mx-auto mb-4">
            <UserPlus className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent mb-2">
            {t('addPerson') || 'Добавить персону'}
          </h1>
          <p className="text-zinc-400">
            {t('addPersonSubtitle') || 'После добавления персона будет отправлена на проверку модератором'}
          </p>
        </div>

        {/* Информационный блок */}
        <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4 mb-6">
          <p className="text-yellow-400 text-sm">
            ⚠️ Персона появится на сайте только после одобрения модератором. Убедитесь что информация достоверна.
          </p>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-8">
          <form onSubmit={handleSubmit} className="space-y-5">

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-white">{t('name')} *</Label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  disabled={loading}
                  className="bg-zinc-800 border-zinc-700 text-white"
                  placeholder="Никнейм или имя"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-white">{t('fullName')} *</Label>
                <Input
                  value={formData.full_name}
                  onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                  required
                  disabled={loading}
                  className="bg-zinc-800 border-zinc-700 text-white"
                  placeholder="Полное имя"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-white">{t('description')}</Label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                disabled={loading}
                className="bg-zinc-800 border-zinc-700 text-white"
                placeholder="Краткое описание..."
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-white">{t('gender')}</Label>
                <Select
                  value={formData.gender}
                  onValueChange={(v) => setFormData({ ...formData, gender: v })}
                  disabled={loading}
                >
                  <SelectTrigger className="bg-zinc-800 border-zinc-700 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-zinc-800 border-zinc-700">
                    <SelectItem value="male">{t('male')}</SelectItem>
                    <SelectItem value="female">{t('female')}</SelectItem>
                    <SelectItem value="other">{t('other')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-white">{t('birthYear')}</Label>
                <Input
                  type="number"
                  value={formData.birth_year}
                  onChange={(e) => setFormData({ ...formData, birth_year: e.target.value })}
                  disabled={loading}
                  className="bg-zinc-800 border-zinc-700 text-white"
                  placeholder="2000"
                  min="1900"
                  max={new Date().getFullYear()}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-white">{t('studyPlace')}</Label>
                <Input
                  value={formData.study_place}
                  onChange={(e) => setFormData({ ...formData, study_place: e.target.value })}
                  disabled={loading}
                  className="bg-zinc-800 border-zinc-700 text-white"
                  placeholder="Университет, школа..."
                />
              </div>
              <div className="space-y-2">
                <Label className="text-white">{t('workPlace')}</Label>
                <Input
                  value={formData.work_place}
                  onChange={(e) => setFormData({ ...formData, work_place: e.target.value })}
                  disabled={loading}
                  className="bg-zinc-800 border-zinc-700 text-white"
                  placeholder="Место работы..."
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-white">Instagram</Label>
                <Input
                  value={formData.instagram}
                  onChange={(e) => setFormData({ ...formData, instagram: e.target.value })}
                  disabled={loading}
                  className="bg-zinc-800 border-zinc-700 text-white"
                  placeholder="username"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-white">Telegram</Label>
                <Input
                  value={formData.telegram}
                  onChange={(e) => setFormData({ ...formData, telegram: e.target.value })}
                  disabled={loading}
                  className="bg-zinc-800 border-zinc-700 text-white"
                  placeholder="username"
                />
              </div>
            </div>

            {/* Фото */}
            <div className="space-y-2">
              <Label className="text-white">Фото</Label>
              <div
                className={`border-2 border-dashed rounded-xl p-6 text-center transition-colors ${
                  loading
                    ? 'border-zinc-800 cursor-not-allowed opacity-50'
                    : 'border-zinc-700 cursor-pointer hover:border-purple-500'
                }`}
                onClick={() => !loading && document.getElementById('photo-input')?.click()}
              >
                <Upload className="w-8 h-8 text-zinc-500 mx-auto mb-2" />
                <p className="text-zinc-400 text-sm">Нажмите чтобы добавить фото</p>
                <p className="text-zinc-600 text-xs mt-1">Можно добавить несколько</p>
              </div>
              <input
                id="photo-input"
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                disabled={loading}
                onChange={(e) => {
                  if (e.target.files) {
                    setPhotos(prev => [...prev, ...Array.from(e.target.files!)]);
                  }
                }}
              />
              {photos.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {photos.map((file, i) => (
                    <div key={i} className="relative">
                      <img src={URL.createObjectURL(file)} className="w-24 h-24 object-cover rounded-lg" />
                      {!loading && (
                        <button
                          type="button"
                          onClick={() => setPhotos(photos.filter((_, idx) => idx !== i))}
                          className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex gap-3 pt-2">
              <Button
                type="submit"
                disabled={loading || submitted}
                className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Отправляем...
                  </>
                ) : (
                  <>
                    <UserPlus className="w-4 h-4 mr-2" />
                    {t('addPerson') || 'Добавить персону'}
                  </>
                )}
              </Button>
              <Button
                type="button"
                variant="outline"
                disabled={loading}
                onClick={() => navigate(-1)}
                className="border-zinc-700"
              >
                {t('cancel')}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}