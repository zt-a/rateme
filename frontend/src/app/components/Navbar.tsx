import { Link, useNavigate } from 'react-router';
import { useTranslation } from 'react-i18next';
import { User, LogOut, Shield, Home, Globe, Trophy, UserPlus } from 'lucide-react';
import { Button } from './ui/button';
import { useAuth } from '../contexts/useAuth';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import { toast } from 'sonner';
import { useLocation } from 'react-router';

export function Navbar() {
  const { t, i18n } = useTranslation();
  const { user, logout, isAuthenticated, isAdmin, isModerator } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    toast.success(t('logoutSuccess'));
    navigate('/');
  };

  const changeLanguage = (lang: string) => {
    i18n.changeLanguage(lang);
    localStorage.setItem('i18nextLng', lang);
  };

  const currentLang = i18n.language === 'ru' ? 'РУС' : i18n.language === 'ky' ? 'КЫР' : 'ENG';
  const isRatings = location.pathname === '/ratings';

  return (
    <nav className="sticky top-0 z-50 bg-zinc-950 border-b border-zinc-800 backdrop-blur-lg bg-opacity-90">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">

          {/* Лого + навигация */}
          <div className="flex items-center gap-4">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg flex items-center justify-center flex-shrink-0">
                <Home className="w-5 h-5 text-white" />
              </div>
              {/* Название только на десктопе */}
              <span className="hidden sm:block text-xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                RateMe
              </span>
            </Link>

            {/* Рейтинг — заметная кнопка */}
            <Link to="/ratings">
              <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
                isRatings
                  ? 'bg-gradient-to-r from-yellow-500/20 to-amber-500/20 border border-yellow-500/40 text-yellow-400'
                  : 'bg-zinc-800/80 border border-zinc-700 text-zinc-300 hover:border-yellow-500/50 hover:text-yellow-400 hover:bg-zinc-800'
              }`}>
                <Trophy className={`w-4 h-4 ${isRatings ? 'text-yellow-400' : ''}`} />
                <span className="text-sm font-medium">{t('ratings')}</span>
              </div>
            </Link>
            <Link to="/add-person">
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all bg-zinc-800/80 border border-zinc-700 text-zinc-300 hover:border-purple-500/50 hover:text-purple-400 hover:bg-zinc-800">
                <UserPlus className="w-4 h-4" />
                <span className="text-sm font-medium hidden sm:inline">{t('addPerson') || 'Добавить'}</span>
              </div>
            </Link>
          </div>

          {/* Правая часть */}
          <div className="flex items-center gap-2">

            {/* Смена языка */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button size="sm" variant="outline" className="flex items-center gap-1.5 border-zinc-700 text-zinc-300 hover:text-white h-8 px-2">
                  <Globe className="w-3.5 h-3.5" />
                  <span className="text-xs font-medium">{currentLang}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="bg-zinc-900 border-zinc-800 min-w-[80px]">
                <DropdownMenuItem
                  onClick={() => changeLanguage('ru')}
                  className={`cursor-pointer text-sm ${i18n.language === 'ru' ? 'text-pink-400 font-semibold' : 'text-white'}`}
                >
                  РУС
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => changeLanguage('ky')}
                  className={`cursor-pointer text-sm ${i18n.language === 'ky' ? 'text-pink-400 font-semibold' : 'text-white'}`}
                >
                  КЫР
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => changeLanguage('en')}
                  className={`cursor-pointer text-sm ${i18n.language === 'en' ? 'text-pink-400 font-semibold' : 'text-white'}`}
                >
                  ENG
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Пользователь */}
            {isAuthenticated ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="flex items-center gap-2 border-zinc-700 h-8 px-2 sm:px-3">
                    <User className="w-4 h-4" />
                    <span className="hidden sm:inline text-sm">{user?.username || user?.email}</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 bg-zinc-900 border-zinc-800">
                  <DropdownMenuItem asChild>
                    <Link to="/profile" className="flex items-center gap-2 cursor-pointer text-white">
                      <User className="w-4 h-4" />
                      {t('myProfile')}
                    </Link>
                  </DropdownMenuItem>
                  {(isAdmin) && (
                    <>
                      <DropdownMenuSeparator className="bg-zinc-800" />
                      <DropdownMenuItem asChild>
                        <Link to="/admin" className="flex items-center gap-2 cursor-pointer text-white">
                          <Shield className="w-4 h-4" />
                          {t('adminPanel')}
                        </Link>
                      </DropdownMenuItem>
                    </>
                  )}
                  {(isAdmin || isModerator) && (
                    <>
                      <DropdownMenuSeparator className="bg-zinc-800" />
                      {isModerator && !isAdmin && (
                        <DropdownMenuItem asChild>
                          <Link to="/moderator" className="flex items-center gap-2 cursor-pointer text-white">
                            <Shield className="w-4 h-4" />
                            Панель модератора
                          </Link>
                        </DropdownMenuItem>
                      )}
                    </>
                  )}
                  <DropdownMenuSeparator className="bg-zinc-800" />
                  <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-white">
                    <LogOut className="w-4 h-4 mr-2" />
                    {t('logout')}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="flex gap-2">
                <Button variant="outline" className="border-zinc-700 h-8 px-3 text-sm" asChild>
                  <Link to="/login">{t('login')}</Link>
                </Button>
                <Button className="bg-gradient-to-r from-purple-600 to-pink-600 hidden sm:flex h-8 px-3 text-sm" asChild>
                  <Link to="/register">{t('register')}</Link>
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}