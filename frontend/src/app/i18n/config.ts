import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

const resources = {
  ru: {
    translation: {
      // Navigation
      home: 'Главная',
      profile: 'Профиль',
      myProfile: 'Мой профиль',
      adminPanel: 'Панель администратора',
      logout: 'Выйти',
      login: 'Войти',
      register: 'Регистрация',

      // Actions
      like: 'Нравится',
      dislike: 'Не нравится',
      save: 'Сохранить',
      cancel: 'Отмена',
      delete: 'Удалить',
      restore: 'Восстановить',
      submit: 'Отправить',
      search: 'Поиск',
      edit: 'Редактировать',
      create: 'Создать',

      // Person fields
      name: 'Имя',
      fullName: 'Полное имя',
      description: 'Описание',
      studyPlace: 'Место учёбы',
      workPlace: 'Место работы',
      relationshipStatus: 'Семейный статус',
      birthYear: 'Год рождения',
      gender: 'Пол',
      male: 'Мужской',
      female: 'Женский',
      other: 'Другой',

      // Comments
      comments: 'Комментарии',
      addComment: 'Добавить комментарий',
      noComments: 'Нет комментариев',

      // Rating
      rating: 'Рейтинг',
      ratings: 'Рейтинги',
      topPersons: 'Топ персон по рейтингу',
      page: 'Страница',
      prev: 'Назад',
      next: 'Далее',
      likes: 'Нравится',
      dislikes: 'Не нравится',

      // Auth
      email: 'Email',
      password: 'Пароль',
      oldPassword: 'Старый пароль',
      newPassword: 'Новый пароль',
      forgotPassword: 'Забыли пароль?',
      resetPassword: 'Сбросить пароль',
      changePassword: 'Изменить пароль',

      // User fields
      username: 'Имя пользователя',
      phone: 'Телефон',

      // Admin
      users: 'Пользователи',
      persons: 'Все персоны',
      administrator: 'Администратор',
      moderator: 'Модератор',
      user: 'Пользователь',
      role: 'Роль',
      status: 'Статус',
      actions: 'Действия',

      // Photo
      uploadPhoto: 'Загрузить фото',
      photos: 'Фотографии',

      // Messages
      loginSuccess: 'Вход выполнен успешно',
      logoutSuccess: 'Выход выполнен успешно',
      registerSuccess: 'Регистрация прошла успешно',
      updateSuccess: 'Обновлено успешно',
      deleteSuccess: 'Удалено успешно',
      error: 'Ошибка',
      loading: 'Загрузка...',
      noData: 'Нет данных',

      // Social
      instagram: 'Instagram',
      telegram: 'Telegram',

      // Footer
      navigation: 'Навигация',
      information: 'Информация',
      contact: 'Контакты',
      footerDescription: 'Платформа для оценки и рейтинга',
      allRightsReserved: 'Все права защищены.',
      madeWith: 'Сделано с',
      inKyrgyzstan: 'в Кыргызстане',

      // Pages
      about: 'О нас',
      aboutSubtitle: 'Узнайте больше о платформе RateMe',
      ourMission: 'Наша миссия',
      privacy: 'Политика конфиденциальности',
      terms: 'Условия использования',
      contactUs: 'Обратная связь',
      reportProblem: 'Сообщить о проблеме',
      requestRemoval: 'Запросить удаление данных',

      // Report
      reportTitle: 'Жалобы и запросы',
      reportType: 'Тип запроса',
      reportMessage: 'Описание проблемы',
      reportSuccess: 'Жалоба отправлена успешно',
      reportPending: 'На рассмотрении',
      reportReviewed: 'Рассмотрено',
      reportResolved: 'Решено',
      reportRejected: 'Отклонено',
      removalRequest: 'Удаление данных',
      complaint: 'Жалоба',
      incorrectData: 'Неверная информация',

      addPerson: 'Добавить персону',
      addPersonSubtitle: 'После добавления персона будет отправлена на проверку модератором',


      myPersons: 'Мои персоны',

    },


    
  },
  ky: {
    translation: {
      // Navigation
      home: 'Башкы бет',
      profile: 'Профиль',
      myProfile: 'Менин профилим',
      adminPanel: 'Администратор панели',
      logout: 'Чыгуу',
      login: 'Кирүү',
      register: 'Катталуу',

      // Actions
      like: 'Жактым',
      dislike: 'Жактырбадым',
      save: 'Сактоо',
      cancel: 'Жокко чыгаруу',
      delete: 'Өчүрүү',
      restore: 'Калыбына келтирүү',
      submit: 'Жиберүү',
      search: 'Издөө',
      edit: 'Түзөтүү',
      create: 'Түзүү',

      // Person fields
      name: 'Аты',
      fullName: 'Толук аты',
      description: 'Баяндама',
      studyPlace: 'Окуу жери',
      workPlace: 'Иш жери',
      relationshipStatus: 'Үй-бүлөлүк абал',
      birthYear: 'Туулган жылы',
      gender: 'Жынысы',
      male: 'Эркек',
      female: 'Аял',
      other: 'Башка',

      // Comments
      comments: 'Комментарийлер',
      addComment: 'Комментарий кошуу',
      noComments: 'Комментарийлер жок',

      // Rating
      rating: 'Рейтинг',
      ratings: 'Рейтингдер',
      topPersons: 'Рейтинг боюнча топ персондор',
      page: 'Бет',
      prev: 'Артка',
      next: 'Алдыга',
      likes: 'Жактым',
      dislikes: 'Жактырбадым',

      // Auth
      email: 'Email',
      password: 'Сыр сөз',
      oldPassword: 'Эски сыр сөз',
      newPassword: 'Жаңы сыр сөз',
      forgotPassword: 'Сыр сөздү унуттуңузбу?',
      resetPassword: 'Сыр сөздү алмаштыруу',
      changePassword: 'Сыр сөздү өзгөртүү',

      // User fields
      username: 'Колдонуучу аты',
      phone: 'Телефон',

      // Admin
      users: 'Колдонуучулар',
      persons: 'Бардык персондор',
      administrator: 'Администратор',
      moderator: 'Модератор',
      user: 'Колдонуучу',
      role: 'Ролу',
      status: 'Статус',
      actions: 'Аракеттер',

      // Photo
      uploadPhoto: 'Сүрөт жүктөө',
      photos: 'Сүрөттөр',

      // Messages
      loginSuccess: 'Кирүү ийгиликтүү',
      logoutSuccess: 'Чыгуу ийгиликтүү',
      registerSuccess: 'Каттоо ийгиликтүү',
      updateSuccess: 'Жаңыртуу ийгиликтүү',
      deleteSuccess: 'Өчүрүү ийгиликтүү',
      error: 'Ката',
      loading: 'Жүктөлүүдө...',
      noData: 'Маалымат жок',

      // Social
      instagram: 'Instagram',
      telegram: 'Telegram',

      // Footer
      navigation: 'Навигация',
      information: 'Маалымат',
      contact: 'Байланыш',
      footerDescription: 'Баалоо жана рейтинг платформасы',
      allRightsReserved: 'Бардык укуктар корголгон.',
      madeWith: 'Жасалган',
      inKyrgyzstan: 'Кыргызстанда',

      // Pages
      about: 'Биз жөнүндө',
      aboutSubtitle: 'RateMe платформасы жөнүндө көбүрөөк билиңиз',
      ourMission: 'Биздин миссия',
      privacy: 'Купуялык саясаты',
      terms: 'Колдонуу шарттары',
      contactUs: 'Кайтарым байланыш',
      reportProblem: 'Көйгөй жөнүндө кабарлоо',
      requestRemoval: 'Маалыматты өчүрүүнү суроо',

      // Report
      reportTitle: 'Арыздар жана суроолор',
      reportType: 'Суроонун түрү',
      reportMessage: 'Көйгөйдүн баяндамасы',
      reportSuccess: 'Арыз ийгиликтүү жиберилди',
      reportPending: 'Каралууда',
      reportReviewed: 'Каралды',
      reportResolved: 'Чечилди',
      reportRejected: 'Четке кагылды',
      removalRequest: 'Маалыматты өчүрүү',
      complaint: 'Арыз',
      incorrectData: 'Туура эмес маалымат',

      addPerson: 'Персон кошуу',
      addPersonSubtitle: 'Кошулгандан кийин персон модератордун текшерүүсүнө жиберилет',

      myPersons: 'Менин персондорум',
    },
  },
  en: {
    translation: {
      // Navigation
      home: 'Home',
      profile: 'Profile',
      myProfile: 'My Profile',
      adminPanel: 'Admin Panel',
      logout: 'Logout',
      login: 'Login',
      register: 'Register',

      // Actions
      like: 'Like',
      dislike: 'Dislike',
      save: 'Save',
      cancel: 'Cancel',
      delete: 'Delete',
      restore: 'Restore',
      submit: 'Submit',
      search: 'Search',
      edit: 'Edit',
      create: 'Create',

      // Person fields
      name: 'Name',
      fullName: 'Full Name',
      description: 'Description',
      studyPlace: 'Study Place',
      workPlace: 'Work Place',
      relationshipStatus: 'Relationship Status',
      birthYear: 'Birth Year',
      gender: 'Gender',
      male: 'Male',
      female: 'Female',
      other: 'Other',

      // Comments
      comments: 'Comments',
      addComment: 'Add Comment',
      noComments: 'No comments',

      // Rating
      rating: 'Rating',
      ratings: 'Ratings',
      topPersons: 'Top persons by rating',
      page: 'Page',
      prev: 'Previous',
      next: 'Next',
      likes: 'Likes',
      dislikes: 'Dislikes',

      // Auth
      email: 'Email',
      password: 'Password',
      oldPassword: 'Old Password',
      newPassword: 'New Password',
      forgotPassword: 'Forgot Password?',
      resetPassword: 'Reset Password',
      changePassword: 'Change Password',

      // User fields
      username: 'Username',
      phone: 'Phone',

      // Admin
      users: 'Users',
      persons: 'All Persons',
      administrator: 'Admin',
      moderator: 'Moderator',
      user: 'User',
      role: 'Role',
      status: 'Status',
      actions: 'Actions',

      // Photo
      uploadPhoto: 'Upload Photo',
      photos: 'Photos',

      // Messages
      loginSuccess: 'Login successful',
      logoutSuccess: 'Logout successful',
      registerSuccess: 'Registration successful',
      updateSuccess: 'Updated successfully',
      deleteSuccess: 'Deleted successfully',
      error: 'Error',
      loading: 'Loading...',
      noData: 'No data',

      // Social
      instagram: 'Instagram',
      telegram: 'Telegram',

      // Footer
      navigation: 'Navigation',
      information: 'Information',
      contact: 'Contact',
      footerDescription: 'Rating and review platform',
      allRightsReserved: 'All rights reserved.',
      madeWith: 'Made with',
      inKyrgyzstan: 'in Kyrgyzstan',

      // Pages
      about: 'About Us',
      aboutSubtitle: 'Learn more about the RateMe platform',
      ourMission: 'Our Mission',
      privacy: 'Privacy Policy',
      terms: 'Terms of Use',
      contactUs: 'Contact Us',
      reportProblem: 'Report a Problem',
      requestRemoval: 'Request Data Removal',

      // Report
      reportTitle: 'Reports and Requests',
      reportType: 'Request Type',
      reportMessage: 'Problem Description',
      reportSuccess: 'Report submitted successfully',
      reportPending: 'Pending',
      reportReviewed: 'Reviewed',
      reportResolved: 'Resolved',
      reportRejected: 'Rejected',
      removalRequest: 'Data Removal',
      complaint: 'Complaint',
      incorrectData: 'Incorrect Information',

      addPerson: 'Add Person',
      addPersonSubtitle: 'After adding, the person will be sent for moderator review',

      myPersons: 'My Persons',
    },
  },
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'ru',
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage'],
    },
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;