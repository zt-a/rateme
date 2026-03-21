import { useTranslation } from 'react-i18next';
import { Shield } from 'lucide-react';

export function Privacy() {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-950">
      <div className="container mx-auto px-4 py-16 max-w-4xl">
        <div className="text-center mb-12">
          <div className="w-14 h-14 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl flex items-center justify-center mx-auto mb-4">
            <Shield className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent mb-2">
            {t('privacy') || 'Политика конфиденциальности'}
          </h1>
          <p className="text-zinc-500 text-sm">Последнее обновление: март 2026</p>
        </div>

        <div className="space-y-6">
          {[
            {
              title: '1. Сбор информации',
              content: 'Мы собираем информацию, которую вы предоставляете нам напрямую: email, имя пользователя, а также данные об активности на платформе (лайки, комментарии, оценки). Мы не продаём ваши данные третьим лицам.'
            },
            {
              title: '2. Использование данных',
              content: 'Ваши данные используются для обеспечения работы платформы, улучшения сервиса и обеспечения безопасности. Мы можем использовать анонимизированные данные для аналитики.'
            },
            {
              title: '3. Хранение данных',
              content: 'Мы храним ваши данные на защищённых серверах. Пароли хранятся в зашифрованном виде. Мы применяем современные меры безопасности для защиты вашей информации.'
            },
            {
              title: '4. Ваши права',
              content: 'Вы имеете право запросить удаление ваших данных с платформы, получить копию своих данных, исправить неточную информацию, а также отозвать согласие на обработку данных.'
            },
            {
              title: '5. Данные о персонах',
              content: 'Информация о персонах публикуется пользователями платформы. Если вы обнаружили свои данные и хотите их удалить — воспользуйтесь формой запроса на удаление. Мы рассматриваем все запросы в течение 48 часов.'
            },
            {
              title: '6. Cookies',
              content: 'Мы используем cookies для поддержания сессии и улучшения работы сайта. Вы можете отключить cookies в настройках браузера, однако это может повлиять на функциональность платформы.'
            },
            {
              title: '7. Изменения политики',
              content: 'Мы оставляем за собой право изменять данную политику. При существенных изменениях мы уведомим пользователей через email или уведомление на платформе.'
            },
            {
              title: '8. Контакты',
              content: 'По вопросам конфиденциальности свяжитесь с нами через форму обратной связи или напишите на наш email.'
            },
          ].map((section) => (
            <div key={section.title} className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
              <h2 className="text-white font-bold text-lg mb-3">{section.title}</h2>
              <p className="text-zinc-400 leading-relaxed">{section.content}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}