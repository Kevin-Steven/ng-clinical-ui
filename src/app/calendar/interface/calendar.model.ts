export type CalendarView = 'month' | 'week' | 'day';

export interface CalendarEvent {
  readonly id: number;
  readonly title: string;
  readonly start: Date;
  readonly end: Date;
  readonly color?: string;
  readonly time?: string; // Para display rápido (ej: "10AM")
}

export interface CalendarDay {
  readonly date: Date;
  readonly isoDate: string;
  readonly dayName: string;
  readonly dayNumber: number;
  readonly isToday: boolean;
  readonly isCurrentMonth?: boolean;
  readonly isSelected?: boolean;
  readonly events?: ReadonlyArray<CalendarEvent>;
}
