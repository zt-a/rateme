import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Trash2, Edit2, Check, X } from 'lucide-react';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';import { useAuth } from '../contexts/useAuth';
import { api } from '../services/api';
import { toast } from 'sonner';

interface CommentItemProps {
  comment: {
    id: number;
    text: string;
    user_id: number;
    person_id: number;
    created_at: string;
  };
  onUpdate: () => void;
}

export function CommentItem({ comment, onUpdate }: CommentItemProps) {
  const { t } = useTranslation();
  const { user, isModerator, isAdmin } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(comment.text);
  const [loading, setLoading] = useState(false);

  const canEdit = user?.id === comment.user_id;
  const canDelete = canEdit || isModerator || isAdmin;

  const handleUpdate = async () => {
    if (!editText.trim()) return;

    setLoading(true);
    try {
      await api.updateComment(comment.person_id, comment.id, editText);
      setIsEditing(false);
      toast.success(t('updateSuccess'));
      onUpdate();
    } catch (error: any) {
      toast.error(error.message || t('error'));
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm(t('delete') + '?')) return;

    setLoading(true);
    try {
      await api.deleteComment(comment.person_id, comment.id);
      toast.success(t('deleteSuccess'));
      onUpdate();
    } catch (error: any) {
      toast.error(error.message || t('error'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-zinc-900 rounded-lg p-4 border border-zinc-800">
      <div className="flex items-start justify-between mb-2">
        <div className="text-sm text-zinc-400">
          {new Date(comment.created_at).toLocaleDateString()}
        </div>
        {(canEdit || canDelete) && !isEditing && (
          <div className="flex gap-2">
            {canEdit && (
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setIsEditing(true)}
                disabled={loading}
              >
                <Edit2 className="w-4 h-4" />
              </Button>
            )}
            {canDelete && (
              <Button
                size="sm"
                variant="ghost"
                onClick={handleDelete}
                disabled={loading}
                className="text-red-500 hover:text-red-400"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            )}
          </div>
        )}
      </div>

      {isEditing ? (
        <div className="space-y-2">
          <Textarea
            value={editText}
            onChange={(e) => setEditText(e.target.value)}
            className="bg-zinc-800 border-zinc-700"
          />
          <div className="flex gap-2">
            <Button
              size="sm"
              onClick={handleUpdate}
              disabled={loading}
              className="bg-gradient-to-r from-purple-600 to-pink-600"
            >
              <Check className="w-4 h-4 mr-1" />
              {t('save')}
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                setIsEditing(false);
                setEditText(comment.text);
              }}
              disabled={loading}
            >
              <X className="w-4 h-4 mr-1" />
              {t('cancel')}
            </Button>
          </div>
        </div>
      ) : (
        <p className="text-white">{comment.text}</p>
      )}
    </div>
  );
}
