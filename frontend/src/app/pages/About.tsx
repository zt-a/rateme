import { useTranslation } from 'react-i18next';
import { Shield, Heart, Users, Trophy } from 'lucide-react';

export function About() {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-950">
      <div className="container mx-auto px-4 py-16 max-w-4xl">
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent mb-4">
            {t('about') || 'О нас'}
          </h1>
          <p className="text-zinc-400 text-lg">
            {t('aboutSubtitle') || 'Узнайте больше о платформе RateMe'}
          </p>
        </div>

        <div className="space-y-8">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-8">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg flex items-center justify-center">
                <Heart className="w-5 h-5 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-white">{t('ourMission') || 'Наша миссия'}</h2>
            </div>
            <p className="text-zinc-400 leading-relaxed">
              RateMe — это открытая платформа для оценки и рейтинга людей. Мы стремимся создать честное и прозрачное сообщество, где каждый может выразить своё мнение.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 text-center">
              <Users className="w-10 h-10 text-purple-400 mx-auto mb-3" />
              <h3 className="text-white font-semibold text-lg mb-2">Сообщество</h3>
              <p className="text-zinc-400 text-sm">Тысячи пользователей из Кыргызстана и СНГ</p>
            </div>
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 text-center">
              <Trophy className="w-10 h-10 text-yellow-400 mx-auto mb-3" />
              <h3 className="text-white font-semibold text-lg mb-2">Рейтинги</h3>
              <p className="text-zinc-400 text-sm">Честная система оценок на основе голосов</p>
            </div>
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 text-center">
              <Shield className="w-10 h-10 text-pink-400 mx-auto mb-3" />
              <h3 className="text-white font-semibold text-lg mb-2">Безопасность</h3>
              <p className="text-zinc-400 text-sm">Модерация контента и защита данных</p>
            </div>
          </div>

          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-8">
            <h2 className="text-2xl font-bold text-white mb-4">Правила платформы</h2>
            <ul className="space-y-3 text-zinc-400">
              <li className="flex items-start gap-2">
                <span className="text-pink-400 mt-1">•</span>
                Запрещено публиковать ложную информацию о людях
              </li>
              <li className="flex items-start gap-2">
                <span className="text-pink-400 mt-1">•</span>
                Уважительное отношение к другим пользователям
              </li>
              <li className="flex items-start gap-2">
                <span className="text-pink-400 mt-1">•</span>
                Любой человек может запросить удаление своих данных
              </li>
              <li className="flex items-start gap-2">
                <span className="text-pink-400 mt-1">•</span>
                Модераторы рассматривают все жалобы в течение 48 часов
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}