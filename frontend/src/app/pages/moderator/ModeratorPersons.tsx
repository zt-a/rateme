import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Shield } from 'lucide-react';
import { api } from '../../services/api';
import { Button } from '../../components/ui/button';
import { Card } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Label } from '../../components/ui/label';
import { Input } from '../../components/ui/input';
import { Textarea } from '../../components/ui/textarea';
import { Switch } from '../../components/ui/switch';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '../../components/ui/table';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from '../../components/ui/dialog';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '../../components/ui/select';
import { toast } from 'sonner';

const API_BASE_URL = 'http://localhost:8000';

const statusColors: Record<string, string> = {
  pending:   'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  contacted: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  agreed:    'bg-purple-500/20 text-purple-400 border-purple-500/30',
  rejected:  'bg-red-500/20 text-red-400 border-red-500/30',
  published: 'bg-green-500/20 text-green-400 border-green-500/30',
};

const statusLabels: Record<string, string> = {
  pending:   'Ожидает',
  contacted: 'Связались',
  agreed:    'Согласился',
  rejected:  'Отказался',
  published: 'Опубликован',
};

export function ModeratorPersons() {
  const { t } = useTranslation();
  const [persons, setPersons] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [includeDeleted, setIncludeDeleted] = useState(false);
  const [statusFilter, setStatusFilter] = useState('all');
  const [statusDialogOpen, setStatusDialogOpen] = useState(false);
  const [statusPerson, setStatusPerson] = useState<any>(null);
  const [statusForm, setStatusForm] = useState({
    status: '',
    consent_note: '',
    contact_email: '',
  });

  useEffect(() => {
    loadPersons();
  }, [includeDeleted]);

  const loadPersons = async () => {
    setLoading(true);
    try {
      const data = await api.moderatorListPersons(0, 100, includeDeleted);
      setPersons(data);
    } catch (error: any) {
      toast.error(error.message || t('error'));
    } finally {
      setLoading(false);
    }
  };

  const handleOpenStatusDialog = (person: any) => {
    setStatusPerson(person);
    setStatusForm({
      status: person.status || 'pending',
      consent_note: person.consent_note || '',
      contact_email: person.contact_email || person.email || '',
    });
    setStatusDialogOpen(true);
  };

  const handleStatusSubmit = async () => {
    if (!statusPerson) return;
    try {
      await api.updatePersonStatus(statusPerson.id, {
        status: statusForm.status,
        consent_note: statusForm.consent_note || undefined,
        contact_email: statusForm.contact_email || undefined,
      });
      toast.success(t('updateSuccess'));
      setStatusDialogOpen(false);
      loadPersons();
    } catch (error: any) {
      toast.error(error.message || t('error'));
    }
  };

  const filteredPersons = statusFilter === 'all'
    ? persons
    : persons.filter(p => p.status === statusFilter);

  return (
    <Card className="bg-zinc-900 border-zinc-800 p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-white">{t('persons')}</h2>
        <div className="flex items-center gap-3">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-44 bg-zinc-800 border-zinc-700 text-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-zinc-800 border-zinc-700">
              <SelectItem value="all">Все статусы</SelectItem>
              <SelectItem value="pending">Ожидают</SelectItem>
              <SelectItem value="contacted">Связались</SelectItem>
              <SelectItem value="agreed">Согласились</SelectItem>
              <SelectItem value="rejected">Отказались</SelectItem>
              <SelectItem value="published">Опубликованы</SelectItem>
            </SelectContent>
          </Select>
          <div className="flex items-center gap-2">
            <Switch
              id="include-deleted"
              checked={includeDeleted}
              onCheckedChange={setIncludeDeleted}
            />
            <Label htmlFor="include-deleted" className="text-white text-sm">
              Удалённые
            </Label>
          </div>
        </div>
      </div>

      {/* Диалог смены статуса */}
      <Dialog open={statusDialogOpen} onOpenChange={setStatusDialogOpen}>
        <DialogContent className="bg-zinc-900 border-zinc-800 max-w-md">
          <DialogHeader>
            <DialogTitle className="text-white">
              Статус — {statusPerson?.name}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="text-white">Статус</Label>
              <Select value={statusForm.status} onValueChange={(v) => setStatusForm({ ...statusForm, status: v })}>
                <SelectTrigger className="bg-zinc-800 border-zinc-700 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-zinc-800 border-zinc-700">
                  <SelectItem value="pending">Ожидает</SelectItem>
                  <SelectItem value="contacted">Связались</SelectItem>
                  <SelectItem value="agreed">Согласился</SelectItem>
                  <SelectItem value="rejected">Отказался</SelectItem>
                  <SelectItem value="published">Опубликован</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-white">Email персоны</Label>
              <Input
                value={statusForm.contact_email}
                onChange={(e) => setStatusForm({ ...statusForm, contact_email: e.target.value })}
                className="bg-zinc-800 border-zinc-700 text-white"
                placeholder="person@email.com"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-white">Заметка</Label>
              <Textarea
                value={statusForm.consent_note}
                onChange={(e) => setStatusForm({ ...statusForm, consent_note: e.target.value })}
                className="bg-zinc-800 border-zinc-700 text-white"
                rows={3}
              />
            </div>
            <div className="flex gap-2">
              <Button onClick={handleStatusSubmit} className="bg-gradient-to-r from-blue-600 to-purple-600 flex-1">
                Сохранить
              </Button>
              <Button variant="outline" onClick={() => setStatusDialogOpen(false)} className="border-zinc-700">
                {t('cancel')}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {loading ? (
        <div className="text-center text-zinc-400 py-8">{t('loading')}</div>
      ) : (
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-zinc-800">
                <TableHead className="text-zinc-400">ID</TableHead>
                <TableHead className="text-zinc-400">Фото</TableHead>
                <TableHead className="text-zinc-400">{t('name')}</TableHead>
                <TableHead className="text-zinc-400">{t('fullName')}</TableHead>
                <TableHead className="text-zinc-400">Статус</TableHead>
                <TableHead className="text-zinc-400">Email</TableHead>
                <TableHead className="text-zinc-400">{t('actions')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredPersons.map((person) => (
                <TableRow key={person.id} className="border-zinc-800 hover:bg-zinc-800/50">
                  <TableCell className="text-white">{person.id}</TableCell>
                  <TableCell>
                    <img
                      src={person.photos[0]?.file_path
                        ? `${API_BASE_URL}/${person.photos[0].file_path}`
                        : 'https://images.unsplash.com/photo-1511367461989-f85a21fda167?w=60'}
                      className="w-10 h-10 rounded-full object-cover"
                      alt={person.name}
                    />
                  </TableCell>
                  <TableCell className="text-white">{person.name}</TableCell>
                  <TableCell className="text-zinc-400">{person.full_name}</TableCell>
                  <TableCell>
                    <Badge className={`border ${statusColors[person.status] || statusColors.pending}`}>
                      {statusLabels[person.status] || person.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-zinc-400 text-sm">
                    {person.contact_email || person.email || '—'}
                  </TableCell>
                  <TableCell>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleOpenStatusDialog(person)}
                      className="border-purple-700 text-purple-400 hover:bg-purple-900"
                    >
                      <Shield className="w-4 h-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </Card>
  );
}