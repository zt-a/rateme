import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Trash2, RotateCcw } from 'lucide-react';
import { api } from '../../services/api';
import { Button } from '../../components/ui/button';
import { RoleBadge } from '../../components/RoleBadge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../components/ui/select';
import { Card } from '../../components/ui/card';
import { Switch } from '../../components/ui/switch';
import { Label } from '../../components/ui/label';
import { toast } from 'sonner';

export function AdminUsers() {
  const { t } = useTranslation();
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [includeDeleted, setIncludeDeleted] = useState(false);

  useEffect(() => {
    loadUsers();
  }, [includeDeleted]);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const data = await api.adminListUsers(0, 100, includeDeleted);
      setUsers(data);
    } catch (error: any) {
      toast.error(error.message || t('error'));
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = async (userId: number, role: string) => {
    try {
      const isModerator = role === 'moderator' || role === 'admin';
      const isAdmin = role === 'admin';
      await api.adminSetUserRole(userId, isModerator, isAdmin);
      toast.success(t('updateSuccess'));
      loadUsers();
    } catch (error: any) {
      toast.error(error.message || t('error'));
    }
  };

  const handleDelete = async (userId: number) => {
    if (!confirm(t('delete') + '?')) return;

    try {
      await api.adminDeleteUser(userId, false);
      toast.success(t('deleteSuccess'));
      loadUsers();
    } catch (error: any) {
      toast.error(error.message || t('error'));
    }
  };

  const handleRestore = async (userId: number) => {
    try {
      await api.adminRestoreUser(userId);
      toast.success(t('updateSuccess'));
      loadUsers();
    } catch (error: any) {
      toast.error(error.message || t('error'));
    }
  };

  return (
    <Card className="bg-zinc-900 border-zinc-800 p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-white">{t('users')}</h2>
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
      </div>

      {loading ? (
        <div className="text-center text-zinc-400 py-8">{t('loading')}</div>
      ) : (
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-zinc-800 hover:bg-zinc-800/50">
                <TableHead className="text-zinc-400">ID</TableHead>
                <TableHead className="text-zinc-400">{t('email')}</TableHead>
                <TableHead className="text-zinc-400">{t('username')}</TableHead>
                <TableHead className="text-zinc-400">{t('role')}</TableHead>
                <TableHead className="text-zinc-400">{t('status')}</TableHead>
                <TableHead className="text-zinc-400">{t('actions')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id} className="border-zinc-800 hover:bg-zinc-800/50">
                  <TableCell className="text-white">{user.id}</TableCell>
                  <TableCell className="text-white">{user.email}</TableCell>
                  <TableCell className="text-white">{user.username || '-'}</TableCell>
                  <TableCell>
                    <Select
                      value={
                        user.is_admin ? 'admin' : user.is_moderator ? 'moderator' : 'user'
                      }
                      onValueChange={(value) => handleRoleChange(user.id, value)}
                    >
                      <SelectTrigger className="w-32 bg-zinc-800 border-zinc-700">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-zinc-800 border-zinc-700">
                        <SelectItem value="user">{t('user')}</SelectItem>
                        <SelectItem value="moderator">{t('moderator')}</SelectItem>
                        <SelectItem value="admin">{t('administrator')}</SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell>
                    {user.deleted_at ? (
                      <span className="text-red-500">Deleted</span>
                    ) : user.is_active ? (
                      <span className="text-green-500">Active</span>
                    ) : (
                      <span className="text-yellow-500">Inactive</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      {user.deleted_at ? (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleRestore(user.id)}
                          className="border-green-700 text-green-500 hover:bg-green-900"
                        >
                          <RotateCcw className="w-4 h-4" />
                        </Button>
                      ) : (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDelete(user.id)}
                          className="border-red-700 text-red-500 hover:bg-red-900"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
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
