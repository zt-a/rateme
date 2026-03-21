import { useState } from 'react';
import { useNavigate } from 'react-router';
import { useTranslation } from 'react-i18next';
import { UserPlus, Upload, X } from 'lucide-react';
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

      toast.success('Персона добавлена! Ожидает проверки модератором.');
      navigate('/');
    } catch (error: any) {
      toast.error(error.message || t('error'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-950">
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

            {/* Основные данные */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-white">{t('name')} *</Label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
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
                className="bg-zinc-800 border-zinc-700 text-white"
                placeholder="Краткое описание..."
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-white">{t('gender')}</Label>
                <Select value={formData.gender} onValueChange={(v) => setFormData({ ...formData, gender: v })}>
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
                  className="bg-zinc-800 border-zinc-700 text-white"
                  placeholder="Университет, школа..."
                />
              </div>
              <div className="space-y-2">
                <Label className="text-white">{t('workPlace')}</Label>
                <Input
                  value={formData.work_place}
                  onChange={(e) => setFormData({ ...formData, work_place: e.target.value })}
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
                  className="bg-zinc-800 border-zinc-700 text-white"
                  placeholder="username"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-white">Telegram</Label>
                <Input
                  value={formData.telegram}
                  onChange={(e) => setFormData({ ...formData, telegram: e.target.value })}
                  className="bg-zinc-800 border-zinc-700 text-white"
                  placeholder="username"
                />
              </div>
            </div>

            {/* Фото */}
            <div className="space-y-2">
              <Label className="text-white">Фото</Label>
              <div
                className="border-2 border-dashed border-zinc-700 rounded-xl p-6 text-center cursor-pointer hover:border-purple-500 transition-colors"
                onClick={() => document.getElementById('photo-input')?.click()}
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
                      <img
                        src={URL.createObjectURL(file)}
                        className="w-24 h-24 object-cover rounded-lg"
                      />
                      <button
                        type="button"
                        onClick={() => setPhotos(photos.filter((_, idx) => idx !== i))}
                        className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex gap-3 pt-2">
              <Button
                type="submit"
                disabled={loading}
                className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600"
              >
                <UserPlus className="w-4 h-4 mr-2" />
                {loading ? t('loading') : t('addPerson') || 'Добавить персону'}
              </Button>
              <Button
                type="button"
                variant="outline"
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