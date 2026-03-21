import { useTranslation } from 'react-i18next';
import { Badge } from './ui/badge';

interface RoleBadgeProps {
  isAdmin: boolean;
  isModerator: boolean;
}

export function RoleBadge({ isAdmin, isModerator }: RoleBadgeProps) {
  const { t } = useTranslation();

  if (isAdmin) {
    return (
      <Badge className="bg-gradient-to-r from-red-600 to-red-500">
        {t('administrator')}
      </Badge>
    );
  }

  if (isModerator) {
    return (
      <Badge className="bg-gradient-to-r from-blue-600 to-blue-500">
        {t('moderator')}
      </Badge>
    );
  }

  return (
    <Badge variant="outline" className="border-zinc-700">
      {t('user')}
    </Badge>
  );
}
