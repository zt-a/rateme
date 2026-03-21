import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Mail, Send } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { Label } from '../components/ui/label';
import { api } from '../services/api';
import { toast } from 'sonner';

export function Contact() {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.createReport({
        name: formData.name,
        email: formData.email,
        type: 'other',
        message: formData.message,
      });
      toast.success('Сообщение отправлено! Мы свяжемся с вами в ближайшее время.');
      setFormData({ name: '', email: '', message: '' });
    } catch (error: any) {
      toast.error(error.message || t('error'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-950">
      <div className="container mx-auto px-4 py-16 max-w-2xl">
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-12 h-12 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl flex items-center justify-center">
              <Mail className="w-6 h-6 text-white" />
            </div>
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent mb-2">
            {t('contactUs') || 'Обратная связь'}
          </h1>
          <p className="text-zinc-400">Мы всегда готовы помочь и ответить на ваши вопросы</p>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label className="text-white">Ваше имя</Label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                className="bg-zinc-800 border-zinc-700 text-white"
                placeholder="Введите ваше имя"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-white">Email</Label>
              <Input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
                className="bg-zinc-800 border-zinc-700 text-white"
                placeholder="your@email.com"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-white">Сообщение</Label>
              <Textarea
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                required
                className="bg-zinc-800 border-zinc-700 text-white"
                placeholder="Напишите ваше сообщение..."
                rows={5}
              />
            </div>
            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600"
            >
              <Send className="w-4 h-4 mr-2" />
              {loading ? t('loading') : 'Отправить'}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}