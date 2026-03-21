import { Link } from 'react-router';
import { useTranslation } from 'react-i18next';
import { Home, Mail, Shield, FileText, AlertTriangle, Heart } from 'lucide-react';

export function Footer() {
  const { t } = useTranslation();

  return (
    <footer className="bg-zinc-950 border-t border-zinc-800 mt-auto">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 mb-8">

          {/* Лого */}
          <div className="space-y-3">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg flex items-center justify-center">
                <Home className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                RateMe
              </span>
            </Link>
            <p className="text-zinc-500 text-sm">
              {t('footerDescription') || 'Платформа для оценки и рейтинга'}
            </p>
          </div>

          {/* Навигация */}
          <div className="space-y-3">
            <h3 className="text-white font-semibold text-sm uppercase tracking-wider">
              {t('navigation') || 'Навигация'}
            </h3>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-zinc-400 hover:text-white transition-colors text-sm flex items-center gap-2">
                  <Home className="w-3.5 h-3.5" />
                  {t('home')}
                </Link>
              </li>
              <li>
                <Link to="/ratings" className="text-zinc-400 hover:text-yellow-400 transition-colors text-sm flex items-center gap-2">
                  <Shield className="w-3.5 h-3.5" />
                  {t('ratings')}
                </Link>
              </li>
            </ul>
          </div>

          {/* Информация */}
          <div className="space-y-3">
            <h3 className="text-white font-semibold text-sm uppercase tracking-wider">
              {t('information') || 'Информация'}
            </h3>
            <ul className="space-y-2">
              <li>
                <Link to="/about" className="text-zinc-400 hover:text-white transition-colors text-sm flex items-center gap-2">
                  <FileText className="w-3.5 h-3.5" />
                  {t('about') || 'О нас'}
                </Link>
              </li>
              <li>
                <Link to="/privacy" className="text-zinc-400 hover:text-white transition-colors text-sm flex items-center gap-2">
                  <Shield className="w-3.5 h-3.5" />
                  {t('privacy') || 'Политика конфиденциальности'}
                </Link>
              </li>
              <li>
                <Link to="/terms" className="text-zinc-400 hover:text-white transition-colors text-sm flex items-center gap-2">
                  <FileText className="w-3.5 h-3.5" />
                  {t('terms') || 'Условия использования'}
                </Link>
              </li>
            </ul>
          </div>

          {/* Контакты */}
          <div className="space-y-3">
            <h3 className="text-white font-semibold text-sm uppercase tracking-wider">
              {t('contact') || 'Контакты'}
            </h3>
            <ul className="space-y-2">
              <li>
                <Link to="/contact" className="text-zinc-400 hover:text-white transition-colors text-sm flex items-center gap-2">
                  <Mail className="w-3.5 h-3.5" />
                  {t('contactUs') || 'Обратная связь'}
                </Link>
              </li>
              <li>
                <Link to="/report" className="text-zinc-400 hover:text-red-400 transition-colors text-sm flex items-center gap-2">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    {t('reportProblem') || 'Сообщить о проблеме'}
                </Link>
              </li>
              <li>
                <Link to="/takedown" className="text-zinc-400 hover:text-red-400 transition-colors text-sm flex items-center gap-2">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  {t('requestRemoval') || 'Запросить удаление данных'}
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Разделитель */}
        <div className="border-t border-zinc-800 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-zinc-500 text-sm">
            © {new Date().getFullYear()} RateMe. {t('allRightsReserved') || 'Все права защищены.'}
          </p>
          <p className="text-zinc-600 text-xs flex items-center gap-1">
            {t('madeWith') || 'Сделано с'} <Heart className="w-3 h-3 text-pink-500" /> {t('inKyrgyzstan') || 'в Кыргызстане'}
          </p>
        </div>
      </div>
    </footer>
  );
}