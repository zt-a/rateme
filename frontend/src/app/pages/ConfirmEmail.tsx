import { useSearchParams, Link } from 'react-router';
import { CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { Button } from '../components/ui/button';

export function ConfirmEmail() {
  const [params] = useSearchParams();
  const status = params.get('status');

  const getContent = () => {
    switch (status) {
      case 'success':
        return {
          icon: <CheckCircle className="w-16 h-16 text-green-400" />,
          title: 'Email подтверждён',
          description: 'Теперь вы можете пользоваться всеми возможностями аккаунта.',
        };
      case 'already':
        return {
          icon: <AlertCircle className="w-16 h-16 text-yellow-400" />,
          title: 'Уже подтверждено',
          description: 'Ваш email уже был подтверждён ранее.',
        };
      default:
        return {
          icon: <XCircle className="w-16 h-16 text-red-400" />,
          title: 'Ошибка подтверждения',
          description: 'Ссылка недействительна или устарела.',
        };
    }
  };

  const { icon, title, description } = getContent();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-950">
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-8 max-w-md w-full text-center shadow-xl">

        <div className="flex justify-center mb-6">
          {icon}
        </div>

        <h1 className="text-2xl font-bold text-white mb-2">
          {title}
        </h1>

        <p className="text-zinc-400 mb-6">
          {description}
        </p>

        <Link to="/">
          <Button className="w-full bg-gradient-to-r from-purple-600 to-pink-600">
            На главную
          </Button>
        </Link>

      </div>
    </div>
  );
}