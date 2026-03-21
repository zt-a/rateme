import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';import { useAuth } from '../contexts/useAuth';
import { api } from '../services/api';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { RoleBadge } from '../components/RoleBadge';
import { toast } from 'sonner';

export function Profile() {
  const { t } = useTranslation();
  const { user, refreshUser } = useAuth();
  const [username, setUsername] = useState('');
  const [phone, setPhone] = useState('');
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      setUsername(user.username || '');
      setPhone(user.phone?.toString() || '');
    }
  }, [user]);

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
                <TabsList className="grid w-full grid-cols-2 bg-zinc-800">
                  <TabsTrigger value="profile">{t('profile')}</TabsTrigger>
                  <TabsTrigger value="password">{t('changePassword')}</TabsTrigger>
                </TabsList>

                <TabsContent value="profile" className="space-y-4">
                  <form onSubmit={handleUpdateProfile} className="space-y-4">
                    <div className="space-y-2">
                      <Label className="text-white">{t('email')}</Label>
                      <Input
                        value={user.email}
                        disabled
                        className="bg-zinc-800 border-zinc-700 text-zinc-400"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="username" className="text-white">
                        {t('username')}
                      </Label>
                      <Input
                        id="username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        className="bg-zinc-800 border-zinc-700 text-white"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="phone" className="text-white">
                        {t('phone')}
                      </Label>
                      <Input
                        id="phone"
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="bg-zinc-800 border-zinc-700 text-white"
                      />
                    </div>

                    <Button
                      type="submit"
                      disabled={loading}
                      className="w-full bg-gradient-to-r from-purple-600 to-pink-600"
                    >
                      {loading ? t('loading') : t('save')}
                    </Button>
                  </form>
                </TabsContent>

                <TabsContent value="password" className="space-y-4">
                  <form onSubmit={handleChangePassword} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="oldPassword" className="text-white">
                        {t('oldPassword')}
                      </Label>
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
                      <Label htmlFor="newPassword" className="text-white">
                        {t('newPassword')}
                      </Label>
                      <Input
                        id="newPassword"
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        required
                        className="bg-zinc-800 border-zinc-700 text-white"
                      />
                    </div>

                    <Button
                      type="submit"
                      disabled={loading}
                      className="w-full bg-gradient-to-r from-purple-600 to-pink-600"
                    >
                      {loading ? t('loading') : t('changePassword')}
                    </Button>
                  </form>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
