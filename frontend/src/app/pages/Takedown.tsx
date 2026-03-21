import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { AlertTriangle, Shield } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { Label } from '../components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select';
import { api } from '../services/api';
import { toast } from 'sonner';

export function Takedown() {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    type: 'removal_request',
    person_url: '',
    message: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.createReport({
        name: formData.name,
        email: formData.email,
        type: formData.type,
        message: `URL: ${formData.person_url}\n\n${formData.message}`,
      });
      toast.success('Запрос отправлен! Модераторы рассмотрят его в течение 48 часов.');
      setFormData({ name: '', email: '', type: 'removal_request', person_url: '', message: '' });
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
            <div className="w-12 h-12 bg-gradient-to-r from-red-600 to-orange-600 rounded-xl flex items-center justify-center">
              <AlertTriangle className="w-6 h-6 text-white" />
            </div>
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-red-400 to-orange-400 bg-clip-text text-transparent mb-2">
            {t('requestRemoval') || 'Запрос на удаление'}
          </h1>
          <p className="text-zinc-400">Если вы хотите удалить свои данные с платформы — заполните форму ниже</p>
        </div>

        <div className="bg-zinc-900 border border-red-900/30 rounded-2xl p-8 mb-6">
          <div className="flex items-start gap-3 text-sm text-zinc-400">
            <Shield className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-white mb-1">Ваши права</p>
              <p>Согласно нашей политике, любой человек имеет право запросить удаление своих персональных данных с платформы. Мы рассматриваем все запросы в течение 48 часов.</p>
            </div>
          </div>
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
              <Label className="text-white">Тип запроса</Label>
              <Select
                value={formData.type}
                onValueChange={(value) => setFormData({ ...formData, type: value })}
              >
                <SelectTrigger className="bg-zinc-800 border-zinc-700 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-zinc-800 border-zinc-700">
                  <SelectItem value="removal_request">Удаление моих данных</SelectItem>
                  <SelectItem value="incorrect_data">Неверная информация</SelectItem>
                  <SelectItem value="complaint">Жалоба</SelectItem>
                  <SelectItem value="other">Другое</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-white">Ссылка на страницу</Label>
              <Input
                value={formData.person_url}
                onChange={(e) => setFormData({ ...formData, person_url: e.target.value })}
                className="bg-zinc-800 border-zinc-700 text-white"
                placeholder="https://rateme.kg/persons/123"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-white">Описание</Label>
              <Textarea
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                required
                className="bg-zinc-800 border-zinc-700 text-white"
                placeholder="Опишите вашу ситуацию подробно..."
                rows={5}
              />
            </div>
            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-500 hover:to-orange-500"
            >
              <AlertTriangle className="w-4 h-4 mr-2" />
              {loading ? t('loading') : 'Отправить запрос'}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}