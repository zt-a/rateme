import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { AlertTriangle } from 'lucide-react';
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

export function Report() {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    type: 'complaint',
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
        message: formData.person_url
          ? `URL: ${formData.person_url}\n\n${formData.message}`
          : formData.message,
      });
      setSubmitted(true);
      toast.success('Жалоба отправлена!');
    } catch (error: any) {
      toast.error(error.message || t('error'));
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-950 flex items-center justify-center">
        <div className="text-center max-w-md px-4">
          <div className="w-16 h-16 bg-green-500/20 border border-green-500/30 rounded-full flex items-center justify-center mx-auto mb-6">
            <AlertTriangle className="w-8 h-8 text-green-400" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-3">Жалоба отправлена</h2>
          <p className="text-zinc-400 mb-6">
            Мы рассмотрим вашу жалобу в течение 48 часов и свяжемся с вами по указанному email.
          </p>
          <Button
            onClick={() => setSubmitted(false)}
            variant="outline"
            className="border-zinc-700"
          >
            Отправить ещё одну
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-950">
      <div className="container mx-auto px-4 py-16 max-w-2xl">
        <div className="text-center mb-12">
          <div className="w-14 h-14 bg-gradient-to-r from-red-600 to-orange-600 rounded-xl flex items-center justify-center mx-auto mb-4">
            <AlertTriangle className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-red-400 to-orange-400 bg-clip-text text-transparent mb-2">
            {t('reportProblem') || 'Сообщить о проблеме'}
          </h1>
          <p className="text-zinc-400">Помогите нам сделать платформу лучше</p>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-white">Ваше имя</Label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  className="bg-zinc-800 border-zinc-700 text-white"
                  placeholder="Имя"
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
            </div>

            <div className="space-y-2">
              <Label className="text-white">Тип проблемы</Label>
              <Select
                value={formData.type}
                onValueChange={(value) => setFormData({ ...formData, type: value })}
              >
                <SelectTrigger className="bg-zinc-800 border-zinc-700 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-zinc-800 border-zinc-700">
                  <SelectItem value="complaint">Жалоба на контент</SelectItem>
                  <SelectItem value="removal_request">Запрос на удаление данных</SelectItem>
                  <SelectItem value="incorrect_data">Неверная информация</SelectItem>
                  <SelectItem value="other">Техническая проблема</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-white">Ссылка на страницу <span className="text-zinc-500">(необязательно)</span></Label>
              <Input
                value={formData.person_url}
                onChange={(e) => setFormData({ ...formData, person_url: e.target.value })}
                className="bg-zinc-800 border-zinc-700 text-white"
                placeholder="https://..."
              />
            </div>

            <div className="space-y-2">
              <Label className="text-white">Описание проблемы</Label>
              <Textarea
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                required
                className="bg-zinc-800 border-zinc-700 text-white"
                placeholder="Опишите проблему подробно..."
                rows={5}
              />
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-500 hover:to-orange-500"
            >
              <AlertTriangle className="w-4 h-4 mr-2" />
              {loading ? t('loading') : 'Отправить жалобу'}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}