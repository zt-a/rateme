import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Trash2, RotateCcw } from 'lucide-react';
import { api } from '../../services/api';
import { Button } from '../../components/ui/button';
import { Card } from '../../components/ui/card';
import { Switch } from '../../components/ui/switch';
import { Label } from '../../components/ui/label';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../components/ui/table';
import { toast } from 'sonner';

export function AdminComments() {
  const { t } = useTranslation();
  const [comments, setComments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [includeDeleted, setIncludeDeleted] = useState(false);

  useEffect(() => {
    loadComments();
  }, [includeDeleted]);

  const loadComments = async () => {
    setLoading(true);
    try {
      const data = await api.adminListComments(0, 100, includeDeleted);
      setComments(data);
    } catch (error: any) {
      toast.error(error.message || t('error'));
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (commentId: number) => {
    if (!confirm(t('delete') + '?')) return;

    try {
      await api.adminDeleteComment(commentId, false);
      toast.success(t('deleteSuccess'));
      loadComments();
    } catch (error: any) {
      toast.error(error.message || t('error'));
    }
  };

  const handleRestore = async (commentId: number) => {
    try {
      await api.adminRestoreComment(commentId);
      toast.success(t('updateSuccess'));
      loadComments();
    } catch (error: any) {
      toast.error(error.message || t('error'));
    }
  };

  return (
    <Card className="bg-zinc-900 border-zinc-800 p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-white">{t('comments')}</h2>
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
                <TableHead className="text-zinc-400">User ID</TableHead>
                <TableHead className="text-zinc-400">Person ID</TableHead>
                <TableHead className="text-zinc-400">{t('comments')}</TableHead>
                <TableHead className="text-zinc-400">Date</TableHead>
                <TableHead className="text-zinc-400">{t('status')}</TableHead>
                <TableHead className="text-zinc-400">{t('actions')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {comments.map((comment) => (
                <TableRow key={comment.id} className="border-zinc-800 hover:bg-zinc-800/50">
                  <TableCell className="text-white">{comment.id}</TableCell>
                  <TableCell className="text-white">{comment.user_id}</TableCell>
                  <TableCell className="text-white">{comment.person_id}</TableCell>
                  <TableCell className="text-white max-w-md truncate">
                    {comment.text}
                  </TableCell>
                  <TableCell className="text-white">
                    {new Date(comment.created_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    {comment.deleted_at ? (
                      <span className="text-red-500">Deleted</span>
                    ) : (
                      <span className="text-green-500">Active</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      {comment.deleted_at ? (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleRestore(comment.id)}
                          className="border-green-700 text-green-500 hover:bg-green-900"
                        >
                          <RotateCcw className="w-4 h-4" />
                        </Button>
                      ) : (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDelete(comment.id)}
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
