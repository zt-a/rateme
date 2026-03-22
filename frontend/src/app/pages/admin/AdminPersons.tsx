import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Trash2, RotateCcw, Plus, Edit, Shield } from 'lucide-react';
import { api } from '../../services/api';
import { Button } from '../../components/ui/button';
import { Card } from '../../components/ui/card';
import { Switch } from '../../components/ui/switch';
import { Label } from '../../components/ui/label';
import { Input } from '../../components/ui/input';
import { Textarea } from '../../components/ui/textarea';
import { Badge } from '../../components/ui/badge';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '../../components/ui/table';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from '../../components/ui/dialog';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '../../components/ui/select';
import { toast } from 'sonner';

import { getPhotoUrl } from '../../services/config';

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

export function AdminPersons() {
  const { t } = useTranslation();
  const [persons, setPersons] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [includeDeleted, setIncludeDeleted] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [statusDialogOpen, setStatusDialogOpen] = useState(false);
  const [editingPerson, setEditingPerson] = useState<any>(null);
  const [statusPerson, setStatusPerson] = useState<any>(null);
  const [photos, setPhotos] = useState<File[]>([]);
  const [statusForm, setStatusForm] = useState({
    status: '',
    consent_note: '',
    contact_email: '',
  });
  const [formData, setFormData] = useState({
    name: '',
    full_name: '',
    description: '',
    gender: 'other',
    birth_year: '',
    phone: '',
    study_place: '',
    work_place: '',
    relationship_status: '',
    instagram: '',
    telegram: '',
  });

  useEffect(() => {
    loadPersons();
  }, [includeDeleted]);

  const loadPersons = async () => {
    setLoading(true);
    try {
      const data = await api.adminListPersons(0, 100, includeDeleted);
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

  const handleOpenDialog = async (person?: any) => {
    if (person) {
      try {
        const fullPerson = await api.adminGetPerson(person.id);
        setEditingPerson(fullPerson);
        setFormData({
          name: fullPerson.name,
          full_name: fullPerson.full_name,
          description: fullPerson.description || '',
          gender: fullPerson.gender,
          birth_year: fullPerson.birth_year?.toString() || '',
          phone: fullPerson.phone?.toString() || '',
          study_place: fullPerson.study_place || '',
          work_place: fullPerson.work_place || '',
          relationship_status: fullPerson.relationship_status || '',
          instagram: fullPerson.instagram || '',
          telegram: fullPerson.telegram || '',
        });
      } catch (error: any) {
        toast.error(error.message || t('error'));
        return;
      }
    } else {
      setEditingPerson(null);
      setFormData({
        name: '',
        full_name: '',
        description: '',
        gender: 'other',
        birth_year: '',
        phone: '',
        study_place: '',
        work_place: '',
        relationship_status: '',
        instagram: '',
        telegram: '',
      });
    }
    setPhotos([]);
    setDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const data = {
      ...formData,
      birth_year: formData.birth_year ? Number(formData.birth_year) : null,
      phone: formData.phone ? Number(formData.phone) : null,
    };
    try {
      let person: any;
      if (editingPerson) {
        person = await api.adminUpdatePerson(editingPerson.id, data);
      } else {
        person = await api.adminCreatePerson(data);
      }
      if (photos.length > 0) {
        for (const file of photos) {
          await api.uploadPhoto(person.id, file);
        }
      }
      toast.success(t('updateSuccess'));
      setDialogOpen(false);
      setPhotos([]);
      loadPersons();
    } catch (error: any) {
      toast.error(error.message || t('error'));
    }
  };

  const handleDelete = async (personId: number) => {
    if (!confirm(t('delete') + '?')) return;
    try {
      await api.adminDeletePerson(personId, false);
      toast.success(t('deleteSuccess'));
      loadPersons();
    } catch (error: any) {
      toast.error(error.message || t('error'));
    }
  };

  const handleRestore = async (personId: number) => {
    try {
      await api.adminRestorePerson(personId);
      toast.success(t('updateSuccess'));
      loadPersons();
    } catch (error: any) {
      toast.error(error.message || t('error'));
    }
  };

  const handleDeletePhoto = async (photoId: number) => {
    if (!editingPerson) return;
    try {
      await api.deletePhoto(editingPerson.id, photoId);
      setEditingPerson({
        ...editingPerson,
        photos: editingPerson.photos.filter((p: any) => p.id !== photoId),
      });
    } catch (error: any) {
      toast.error(error.message || t('error'));
    }
  };

  return (
    <Card className="bg-zinc-900 border-zinc-800 p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-white">{t('persons')}</h2>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Switch
              id="include-deleted"
              checked={includeDeleted}
              onCheckedChange={setIncludeDeleted}
            />
            <Label htmlFor="include-deleted" className="text-white">
              Show deleted
            </Label>
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button
                onClick={() => handleOpenDialog()}
                className="bg-gradient-to-r from-purple-600 to-pink-600"
              >
                <Plus className="w-4 h-4 mr-2" />
                {t('create')}
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-zinc-900 border-zinc-800 max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="text-white">
                  {editingPerson ? t('edit') : t('create')} Person
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-white">{t('name')}</Label>
                    <Input value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required className="bg-zinc-800 border-zinc-700 text-white" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-white">{t('fullName')}</Label>
                    <Input value={formData.full_name} onChange={(e) => setFormData({ ...formData, full_name: e.target.value })} required className="bg-zinc-800 border-zinc-700 text-white" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-white">{t('description')}</Label>
                  <Textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} className="bg-zinc-800 border-zinc-700 text-white" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-white">{t('gender')}</Label>
                    <Select value={formData.gender} onValueChange={(value) => setFormData({ ...formData, gender: value })}>
                      <SelectTrigger className="bg-zinc-800 border-zinc-700 text-white"><SelectValue /></SelectTrigger>
                      <SelectContent className="bg-zinc-800 border-zinc-700">
                        <SelectItem value="male">{t('male')}</SelectItem>
                        <SelectItem value="female">{t('female')}</SelectItem>
                        <SelectItem value="other">{t('other')}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-white">{t('birthYear')}</Label>
                    <Input type="number" value={formData.birth_year} onChange={(e) => setFormData({ ...formData, birth_year: e.target.value })} className="bg-zinc-800 border-zinc-700 text-white" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-white">{t('studyPlace')}</Label>
                    <Input value={formData.study_place} onChange={(e) => setFormData({ ...formData, study_place: e.target.value })} className="bg-zinc-800 border-zinc-700 text-white" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-white">{t('workPlace')}</Label>
                    <Input value={formData.work_place} onChange={(e) => setFormData({ ...formData, work_place: e.target.value })} className="bg-zinc-800 border-zinc-700 text-white" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-white">{t('relationshipStatus')}</Label>
                    <Input value={formData.relationship_status} onChange={(e) => setFormData({ ...formData, relationship_status: e.target.value })} className="bg-zinc-800 border-zinc-700 text-white" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-white">{t('phone')}</Label>
                    <Input type="number" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} className="bg-zinc-800 border-zinc-700 text-white" placeholder="996700000000" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-white">Instagram</Label>
                    <Input value={formData.instagram} onChange={(e) => setFormData({ ...formData, instagram: e.target.value })} className="bg-zinc-800 border-zinc-700 text-white" placeholder="username" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-white">Telegram</Label>
                    <Input value={formData.telegram} onChange={(e) => setFormData({ ...formData, telegram: e.target.value })} className="bg-zinc-800 border-zinc-700 text-white" placeholder="username" />
                  </div>
                </div>

                {/* Новые фото */}
                <div className="space-y-2">
                  <Label className="text-white">Фото</Label>
                  <Input type="file" accept="image/*" multiple onChange={(e) => { if (e.target.files) setPhotos(prev => [...prev, ...Array.from(e.target.files!)]); }} className="bg-zinc-800 border-zinc-700 text-white" />
                  {photos.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {photos.map((file, i) => (
                        <div key={i} className="relative">
                          <img src={URL.createObjectURL(file)} className="w-20 h-20 object-cover rounded" />
                          <button type="button" onClick={() => setPhotos(photos.filter((_, idx) => idx !== i))} className="absolute top-0 right-0 bg-red-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">×</button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Загруженные фото */}
                {editingPerson?.photos?.length > 0 && (
                  <div className="space-y-2">
                    <Label className="text-white">Загруженные фото</Label>
                    <div className="flex flex-wrap gap-2">
                      {editingPerson.photos.map((photo: any) => (
                        <div key={photo.id} className="relative">
                          <img src={getPhotoUrl(photo.file_path)} className="w-20 h-20 object-cover rounded" />
                          <button type="button" onClick={() => handleDeletePhoto(photo.id)} className="absolute top-0 right-0 bg-red-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">×</button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex gap-2">
                  <Button type="submit" className="bg-gradient-to-r from-purple-600 to-pink-600">{t('save')}</Button>
                  <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>{t('cancel')}</Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Диалог смены статуса */}
      <Dialog open={statusDialogOpen} onOpenChange={setStatusDialogOpen}>
        <DialogContent className="bg-zinc-900 border-zinc-800 max-w-md">
          <DialogHeader>
            <DialogTitle className="text-white">
              Статус персоны — {statusPerson?.name}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="text-white">Статус</Label>
              <Select value={statusForm.status} onValueChange={(v) => setStatusForm({ ...statusForm, status: v })}>
                <SelectTrigger className="bg-zinc-800 border-zinc-700 text-white"><SelectValue /></SelectTrigger>
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
              <Label className="text-white">Email персоны (для уведомления)</Label>
              <Input
                value={statusForm.contact_email}
                onChange={(e) => setStatusForm({ ...statusForm, contact_email: e.target.value })}
                className="bg-zinc-800 border-zinc-700 text-white"
                placeholder="person@email.com"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-white">Заметка модератора</Label>
              <Textarea
                value={statusForm.consent_note}
                onChange={(e) => setStatusForm({ ...statusForm, consent_note: e.target.value })}
                className="bg-zinc-800 border-zinc-700 text-white"
                placeholder="Заметка о контакте с персоной..."
                rows={3}
              />
            </div>
            <div className="flex gap-2">
              <Button onClick={handleStatusSubmit} className="bg-gradient-to-r from-purple-600 to-pink-600 flex-1">
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
              <TableRow className="border-zinc-800 hover:bg-zinc-800/50">
                <TableHead className="text-zinc-400">ID</TableHead>
                <TableHead className="text-zinc-400">{t('name')}</TableHead>
                <TableHead className="text-zinc-400">{t('fullName')}</TableHead>
                <TableHead className="text-zinc-400">{t('rating')}</TableHead>
                <TableHead className="text-zinc-400">Статус персоны</TableHead>
                <TableHead className="text-zinc-400">{t('status')}</TableHead>
                <TableHead className="text-zinc-400">{t('actions')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {persons.map((person) => (
                <TableRow key={person.id} className="border-zinc-800 hover:bg-zinc-800/50">
                  <TableCell className="text-white">{person.id}</TableCell>
                  <TableCell className="text-white">{person.name}</TableCell>
                  <TableCell className="text-white">{person.full_name}</TableCell>
                  <TableCell className="text-white">{person.rating}</TableCell>
                  <TableCell>
                    <Badge className={`border ${statusColors[person.status] || statusColors.pending}`}>
                      {statusLabels[person.status] || person.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {person.deleted_at ? (
                      <span className="text-red-500">Deleted</span>
                    ) : (
                      <span className="text-green-500">Active</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      {person.deleted_at ? (
                        <Button size="sm" variant="outline" onClick={() => handleRestore(person.id)} className="border-green-700 text-green-500 hover:bg-green-900">
                          <RotateCcw className="w-4 h-4" />
                        </Button>
                      ) : (
                        <>
                          <Button size="sm" variant="outline" onClick={() => handleOpenStatusDialog(person)} className="border-purple-700 text-purple-400 hover:bg-purple-900" title="Сменить статус">
                            <Shield className="w-4 h-4" />
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => handleOpenDialog(person)} className="border-blue-700 text-blue-500 hover:bg-blue-900">
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => handleDelete(person.id)} className="border-red-700 text-red-500 hover:bg-red-900">
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </>
                      )}
                    </div>
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