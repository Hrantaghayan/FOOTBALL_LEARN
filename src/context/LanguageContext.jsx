import { createContext, useContext, useState } from 'react'

const translations = {
  en: {
    // Login
    'login.title': 'Football Dock',
    'login.subtitle': 'Sign in to continue',
    'login.email': 'Email',
    'login.email.placeholder': 'Enter your email',
    'login.password': 'Password',
    'login.password.placeholder': 'Enter your password',
    'login.button': 'Login',
    'login.error': 'Invalid email or password.',

    // Header
    'header.logout': 'Logout',

    // App main page
    'app.addLeague': 'Add League ({count}/8)',
    'app.addMoreLeagues': 'Add More Leagues',
    'app.print': 'Print',
    'app.resetAll': 'Reset All',
    'app.secondPage': 'Go to Second Page',
    'app.games': 'Games',
    'app.createSchedule': 'Create Game Schedule',

    // Modal
    'modal.editLeague': 'Edit League',
    'modal.addNewLeague': 'Add New League',
    'modal.leaguesAdded': '{count} Leagues Added',
    'modal.leagueName': 'League Name',
    'modal.leagueName.placeholder': 'e.g., Premier League',
    'modal.leagueLogo': 'League Logo (Optional)',
    'modal.uploadLogo': '+ Upload Logo',
    'modal.teamNames': 'Team Names (11 teams required)',
    'modal.team': 'Team {num}',
    'modal.error.name': 'Please enter a league name',
    'modal.error.teams': 'Please enter all 11 teams ({count}/11 entered)',
    'modal.updateLeague': 'Update League',
    'modal.addLeague': 'Add League',
    'modal.cancel': 'Cancel',

    // LeaguesGrid
    'grid.empty': 'No leagues added yet. Add your first league to get started!',

    // SecondPage
    'second.backToMain': 'Back to Main',
    'second.uploadBg': 'Upload Background',
    'second.uploadLogo': 'Upload Team Logo ({count}/24)',

    // GamesPage
    'games.backToMain': 'Back to Main',
    'games.addRow': '+ Row',
    'games.removeRow': '− Row',
    'games.addColumn': '+ Column',
    'games.removeColumn': '− Column',
    'games.hideNumbers': 'Hide #',
    'games.showNumbers': 'Show #',
    'games.hideImages': 'Hide Images',
    'games.showImages': 'Show Images',
    'games.showHiddenColumns': 'Show Hidden Columns',
    'games.print': 'Print / Save PDF',
    'games.snapshot': 'Snapshot',
    'games.clearTable': 'Clear Table',
    'games.changeBg': 'Change BG',
    'games.uploadBg': 'Upload BG',
    'games.removeBg': 'Remove BG',
    'games.title': 'Games',
    'games.column': 'Column {num}',

    // SchedulePage headers
    'schedule.header.date': 'Date',
    'schedule.header.team1': 'Team 1',
    'schedule.header.time': 'Time',
    'schedule.header.team2': 'Team 2',

    // GamesPage headers
    'games.header.date': 'Date',
    'games.header.homeTeam': 'Home Team',
    'games.header.awayTeam': 'Away Team',
    'games.header.score': 'Score',
    'games.header.venue': 'Venue',
    'games.header.status': 'Status',

    // SchedulePage
    'schedule.back': 'Back',
    'schedule.addRow': '+ Row',
    'schedule.removeRow': '− Row',
    'schedule.addColumn': '+ Column',
    'schedule.removeColumn': '− Column',
    'schedule.hideNumbers': 'Hide #',
    'schedule.showNumbers': 'Show #',
    'schedule.hideImages': 'Hide Images',
    'schedule.showImages': 'Show Images',
    'schedule.showHiddenCols': 'Show Hidden Cols',
    'schedule.print': 'Print / PDF',
    'schedule.snapshot': 'Snapshot',
    'schedule.changeBg': 'Change BG',
    'schedule.uploadBg': 'Upload BG',
    'schedule.removeBg': 'Remove BG',
    'schedule.clear': 'Clear',
    'schedule.titlePlaceholder': 'Schedule Title',
    'schedule.defaultTitle': 'Game Schedule',
    'schedule.column': 'Col {num}',
  },
  ru: {
    // Login
    'login.title': 'Football Dock',
    'login.subtitle': 'Войдите, чтобы продолжить',
    'login.email': 'Электронная почта',
    'login.email.placeholder': 'Введите email',
    'login.password': 'Пароль',
    'login.password.placeholder': 'Введите пароль',
    'login.button': 'Войти',
    'login.error': 'Неверный email или пароль.',

    // Header
    'header.logout': 'Выйти',

    // App main page
    'app.addLeague': 'Добавить лигу ({count}/8)',
    'app.addMoreLeagues': 'Добавить ещё лиги',
    'app.print': 'Печать',
    'app.resetAll': 'Сбросить всё',
    'app.secondPage': 'На вторую страницу',
    'app.games': 'Игры',
    'app.createSchedule': 'Создать расписание',

    // Modal
    'modal.editLeague': 'Редактировать лигу',
    'modal.addNewLeague': 'Добавить новую лигу',
    'modal.leaguesAdded': 'Лиг добавлено: {count}',
    'modal.leagueName': 'Название лиги',
    'modal.leagueName.placeholder': 'напр., Премьер-лига',
    'modal.leagueLogo': 'Логотип лиги (необязательно)',
    'modal.uploadLogo': '+ Загрузить логотип',
    'modal.teamNames': 'Названия команд (необходимо 11)',
    'modal.team': 'Команда {num}',
    'modal.error.name': 'Пожалуйста, введите название лиги',
    'modal.error.teams': 'Введите все 11 команд ({count}/11 введено)',
    'modal.updateLeague': 'Обновить лигу',
    'modal.addLeague': 'Добавить лигу',
    'modal.cancel': 'Отмена',

    // LeaguesGrid
    'grid.empty': 'Лиги ещё не добавлены. Добавьте свою первую лигу!',

    // SecondPage
    'second.backToMain': 'На главную',
    'second.uploadBg': 'Загрузить фон',
    'second.uploadLogo': 'Загрузить логотип ({count}/24)',

    // GamesPage
    'games.backToMain': 'На главную',
    'games.addRow': '+ Строка',
    'games.removeRow': '− Строка',
    'games.addColumn': '+ Столбец',
    'games.removeColumn': '− Столбец',
    'games.hideNumbers': 'Скрыть #',
    'games.showNumbers': 'Показать #',
    'games.hideImages': 'Скрыть фото',
    'games.showImages': 'Показать фото',
    'games.showHiddenColumns': 'Показать скрытые',
    'games.print': 'Печать / PDF',
    'games.snapshot': 'Снимок',
    'games.clearTable': 'Очистить таблицу',
    'games.changeBg': 'Сменить фон',
    'games.uploadBg': 'Загрузить фон',
    'games.removeBg': 'Убрать фон',
    'games.title': 'Игры',
    'games.column': 'Столбец {num}',

    // SchedulePage headers
    'schedule.header.date': 'Дата',
    'schedule.header.team1': 'Команда 1',
    'schedule.header.time': 'Время',
    'schedule.header.team2': 'Команда 2',

    // GamesPage headers
    'games.header.date': 'Дата',
    'games.header.homeTeam': 'Хозяева',
    'games.header.awayTeam': 'Гости',
    'games.header.score': 'Счёт',
    'games.header.venue': 'Место',
    'games.header.status': 'Статус',

    // SchedulePage
    'schedule.back': 'Назад',
    'schedule.addRow': '+ Строка',
    'schedule.removeRow': '− Строка',
    'schedule.addColumn': '+ Столбец',
    'schedule.removeColumn': '− Столбец',
    'schedule.hideNumbers': 'Скрыть #',
    'schedule.showNumbers': 'Показать #',
    'schedule.hideImages': 'Скрыть фото',
    'schedule.showImages': 'Показать фото',
    'schedule.showHiddenCols': 'Показать скрытые',
    'schedule.print': 'Печать / PDF',
    'schedule.snapshot': 'Снимок',
    'schedule.changeBg': 'Сменить фон',
    'schedule.uploadBg': 'Загрузить фон',
    'schedule.removeBg': 'Убрать фон',
    'schedule.clear': 'Очистить',
    'schedule.titlePlaceholder': 'Название расписания',
    'schedule.defaultTitle': 'Расписание игр',
    'schedule.column': 'Ст {num}',
  },
}

const LanguageContext = createContext(null)

export function LanguageProvider({ children }) {
  const [lang, setLang] = useState(
    () => localStorage.getItem('appLanguage') || 'en'
  )

  function t(key, params = {}) {
    let str = translations[lang]?.[key] ?? translations['en'][key] ?? key
    for (const [k, v] of Object.entries(params)) {
      str = str.replace(`{${k}}`, v)
    }
    return str
  }

  function switchLanguage(newLang) {
    localStorage.setItem('appLanguage', newLang)
    setLang(newLang)
  }

  return (
    <LanguageContext.Provider value={{ lang, t, switchLanguage }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  return useContext(LanguageContext)
}
