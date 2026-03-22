import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';
import { UserPlus } from 'lucide-react';
import { useAuth } from '../contexts/useAuth';
import { api } from '../services/api';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Badge } from '../components/ui/badge';
import { RoleBadge } from '../components/RoleBadge';
import { toast } from 'sonner';

import { getPhotoUrl } from '../services/config';

const statusColors: Record<string, string> = {
  pending:   'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  contacted: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  agreed:    'bg-purple-500/20 text-purple-400 border-purple-500/30',
  rejected:  'bg-red-500/20 text-red-400 border-red-500/30',
  published: 'bg-green-500/20 text-green-400 border-green-500/30',
};

const statusLabels: Record<string, string> = {
  pending:   'Ожидает проверки',
  contacted: 'Связались с персоной',
  agreed:    'Согласился',
  rejected:  'Отклонено',
  published: 'Опубликован',
};

export function Profile() {
  const { t } = useTranslation();
  const { user, refreshUser } = useAuth();
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [phone, setPhone] = useState('');
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [myPersons, setMyPersons] = useState<any[]>([]);
  const [personsLoading, setPersonsLoading] = useState(false);

  useEffect(() => {
    if (user) {
      setUsername(user.username || '');
      setPhone(user.phone?.toString() || '');
    }
  }, [user]);

  const loadMyPersons = async () => {
    setPersonsLoading(true);
    try {
      const data = await api.getMyPersons();
      setMyPersons(data);
    } catch (error: any) {
      toast.error(error.message || t('error'));
    } finally {
      setPersonsLoading(false);
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.updateMe({
        username: username || undefined,
        phone: phone ? Number(phone) : undefined,
      });
      toast.success(t('updateSuccess'));
      refreshUser();
    } catch (error: any) {
      toast.error(error.message || t('error'));
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.changePassword(oldPassword, newPassword);
      toast.success(t('updateSuccess'));
      setOldPassword('');
      setNewPassword('');
    } catch (error: any) {
      toast.error(error.message || t('error'));
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-950">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <Card className="bg-zinc-900 border-zinc-800">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-3xl bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                  {t('myProfile')}
                </CardTitle>
                <RoleBadge isAdmin={user.is_admin} isModerator={user.is_moderator} />
              </div>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="profile" className="w-full">
                <TabsList className="grid w-full grid-cols-3 bg-zinc-800">
                  <TabsTrigger value="profile">{t('profile')}</TabsTrigger>
                  <TabsTrigger value="password">{t('changePassword')}</TabsTrigger>
                  <TabsTrigger value="persons" onClick={loadMyPersons}>
                    {t('myPersons') || 'Мои персоны'}
                  </TabsTrigger>
                </TabsList>

                {/* Профиль */}
                <TabsContent value="profile" className="space-y-4">
                  <form onSubmit={handleUpdateProfile} className="space-y-4">
                    <div className="space-y-2">
                      <Label className="text-white">{t('email')}</Label>
                      <Input value={user.email} disabled className="bg-zinc-800 border-zinc-700 text-zinc-400" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="username" className="text-white">{t('username')}</Label>
                      <Input
                        id="username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        className="bg-zinc-800 border-zinc-700 text-white"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone" className="text-white">{t('phone')}</Label>
                      <Input
                        id="phone"
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="bg-zinc-800 border-zinc-700 text-white"
                      />
                    </div>
                    <Button type="submit" disabled={loading} className="w-full bg-gradient-to-r from-purple-600 to-pink-600">
                      {loading ? t('loading') : t('save')}
                    </Button>
                  </form>
                </TabsContent>

                {/* Пароль */}
                <TabsContent value="password" className="space-y-4">
                  <form onSubmit={handleChangePassword} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="oldPassword" className="text-white">{t('oldPassword')}</Label>
                      <Input
                        id="oldPassword"
                        type="password"
                        value={oldPassword}
                        onChange={(e) => setOldPassword(e.target.value)}
                        required
                        className="bg-zinc-800 border-zinc-700 text-white"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="newPassword" className="text-white">{t('newPassword')}</Label>
                      <Input
                        id="newPassword"
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        required
                        className="bg-zinc-800 border-zinc-700 text-white"
                      />
                    </div>
                    <Button type="submit" disabled={loading} className="w-full bg-gradient-to-r from-purple-600 to-pink-600">
                      {loading ? t('loading') : t('changePassword')}
                    </Button>
                  </form>
                </TabsContent>

                {/* Мои персоны */}
                <TabsContent value="persons" className="space-y-4">
                  <div className="flex items-center justify-between">
                    <p className="text-zinc-400 text-sm">Персоны которые вы добавили</p>
                    <Button
                      size="sm"
                      onClick={() => navigate('/add-person')}
                      className="bg-gradient-to-r from-purple-600 to-pink-600"
                    >
                      <UserPlus className="w-4 h-4 mr-1" />
                      {t('addPerson') || 'Добавить'}
                    </Button>
                  </div>

                  {personsLoading ? (
                    <div className="text-center text-zinc-400 py-8">{t('loading')}</div>
                  ) : myPersons.length === 0 ? (
                    <div className="text-center py-10">
                      <UserPlus className="w-12 h-12 text-zinc-700 mx-auto mb-3" />
                      <p className="text-zinc-500">Вы ещё не добавили ни одной персоны</p>
                      <Button
                        onClick={() => navigate('/add-person')}
                        className="mt-4 bg-gradient-to-r from-purple-600 to-pink-600"
                      >
                        Добавить первую
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {myPersons.map((person) => (
                        <div
                          key={person.id}
                          className="flex items-center gap-3 bg-zinc-800 rounded-xl p-3 cursor-pointer hover:bg-zinc-700 transition-colors"
                          onClick={() => navigate(`/persons/${person.id}`)}
                        >
                          {/* Фото */}
                          <img
                            src={person.photos[0]?.file_path
                              ? getPhotoUrl(person.photos[0].file_path)
                              : 'https://images.unsplash.com/photo-1511367461989-f85a21fda167?w=100'}
                            className="w-12 h-12 rounded-full object-cover flex-shrink-0"
                            alt={person.name}
                          />

                          {/* Инфо */}
                          <div className="flex-1 min-w-0">
                            <p className="text-white font-medium truncate">{person.name}</p>
                            <p className="text-zinc-400 text-sm truncate">{person.full_name}</p>
                          </div>

                          {/* Статус */}
                          <Badge className={`border flex-shrink-0 ${statusColors[person.status] || statusColors.pending}`}>
                            {statusLabels[person.status] || person.status}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}