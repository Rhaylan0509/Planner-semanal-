export type DayOfWeek = 'Segunda' | 'Terça' | 'Quarta' | 'Quinta' | 'Sexta' | 'Sábado' | 'Domingo';
export type Periodo = 'Manhã' | 'Tarde' | 'Noite';

export const ALL_DAYS: DayOfWeek[] = ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado', 'Domingo'];
export const ALL_PERIODS: Periodo[] = ['Manhã', 'Tarde', 'Noite'];

export interface ColorTheme {
  name: string;
  bg: string;
  text: string;
  tagBg: string;
  tagText: string;
  border: string;
  dot: string;
}

export const PASTEL_COLORS: ColorTheme[] = [
  { name: 'white', bg: 'bg-white', text: 'text-slate-800', tagBg: 'bg-slate-100', tagText: 'text-slate-700', border: 'border-slate-300', dot: 'bg-slate-400' },
  { name: 'rose', bg: 'bg-rose-100', text: 'text-rose-800', tagBg: 'bg-rose-200/70', tagText: 'text-rose-900', border: 'border-rose-300', dot: 'bg-rose-400' },
  { name: 'sky', bg: 'bg-sky-100', text: 'text-sky-800', tagBg: 'bg-sky-200/70', tagText: 'text-sky-900', border: 'border-sky-300', dot: 'bg-sky-400' },
  { name: 'teal', bg: 'bg-teal-100', text: 'text-teal-800', tagBg: 'bg-teal-200/70', tagText: 'text-teal-900', border: 'border-teal-300', dot: 'bg-teal-400' },
  { name: 'amber', bg: 'bg-amber-100', text: 'text-amber-800', tagBg: 'bg-amber-200/70', tagText: 'text-amber-900', border: 'border-amber-300', dot: 'bg-amber-400' },
  { name: 'violet', bg: 'bg-violet-100', text: 'text-violet-800', tagBg: 'bg-violet-200/70', tagText: 'text-violet-900', border: 'border-violet-300', dot: 'bg-violet-400' },
  { name: 'lime', bg: 'bg-lime-100', text: 'text-lime-800', tagBg: 'bg-lime-200/70', tagText: 'text-lime-900', border: 'border-lime-300', dot: 'bg-lime-400' },
  { name: 'slate', bg: 'bg-slate-200', text: 'text-slate-800', tagBg: 'bg-slate-300/70', tagText: 'text-slate-900', border: 'border-slate-400', dot: 'bg-slate-500' },
];

export interface Task {
  id: string;
  title: string;
  content: string;
  tags: string[];
  day: DayOfWeek;
  periodo: Periodo;
  completed: boolean;
  color: string; // name of the color from PASTEL_COLORS
  isBlock: boolean;
}