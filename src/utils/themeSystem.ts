
import { Theme } from '../types/achievements';

export const themes: Theme[] = [
  {
    id: 'blue',
    name: 'Ocean Blue',
    primary: 'from-blue-600 to-blue-800',
    secondary: 'bg-blue-50 text-blue-700 border-blue-200',
    gradient: 'bg-gradient-to-br from-blue-600 to-blue-800'
  },
  {
    id: 'green',
    name: 'Forest Green',
    primary: 'from-green-600 to-green-800',
    secondary: 'bg-green-50 text-green-700 border-green-200',
    gradient: 'bg-gradient-to-br from-green-600 to-green-800'
  },
  {
    id: 'purple',
    name: 'Royal Purple',
    primary: 'from-purple-600 to-purple-800',
    secondary: 'bg-purple-50 text-purple-700 border-purple-200',
    gradient: 'bg-gradient-to-br from-purple-600 to-purple-800'
  },
  {
    id: 'red',
    name: 'Crimson Red',
    primary: 'from-red-600 to-red-800',
    secondary: 'bg-red-50 text-red-700 border-red-200',
    gradient: 'bg-gradient-to-br from-red-600 to-red-800'
  }
];

export const getTheme = (): Theme => {
  const savedTheme = localStorage.getItem('user_theme');
  return themes.find(theme => theme.id === savedTheme) || themes[0];
};

export const setTheme = (themeId: string) => {
  localStorage.setItem('user_theme', themeId);
};

export const isThemeUnlocked = (score: number): boolean => {
  return score >= 100;
};
