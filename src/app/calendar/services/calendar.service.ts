import { Injectable, signal, computed } from '@angular/core';
import { CalendarEvent, CalendarView } from '../interface/calendar.model';
import { addDays, addMonths, getStartOfWeek, isSameDate } from '../utils/date.utils';

@Injectable({
  providedIn: 'root'
})
export class CalendarService {
  // Estado global del calendario
  private readonly _currentDate = signal(new Date());
  private readonly _selectedView = signal<CalendarView>('month');
  private readonly _events = signal<CalendarEvent[]>([]);

  // Exposición como readonly
  readonly currentDate = this._currentDate.asReadonly();
  readonly selectedView = this._selectedView.asReadonly();
  readonly events = this._events.asReadonly();

  // Computados útiles
  readonly currentWeekStart = computed(() => getStartOfWeek(this._currentDate()));

  readonly currentMonthName = computed(() =>
    new Intl.DateTimeFormat('es-ES', { month: 'long', year: 'numeric' })
      .format(this._currentDate())
  );

  readonly eventsForCurrentDate = computed(() =>
    this.getEventsForDate(this._currentDate())
  );

  readonly eventsForCurrentWeek = computed(() =>
    this.getEventsForWeek(this.currentWeekStart())
  );

  readonly eventsForCurrentMonth = computed(() =>
    this.getEventsForMonth(this._currentDate())
  );

  // Métodos de navegación
  nextDay(): void {
    this._currentDate.update(date => addDays(date, 1));
  }

  prevDay(): void {
    this._currentDate.update(date => addDays(date, -1));
  }

  nextWeek(): void {
    this._currentDate.update(date => addDays(date, 7));
  }

  prevWeek(): void {
    this._currentDate.update(date => addDays(date, -7));
  }

  nextMonth(): void {
    this._currentDate.update(date => addMonths(date, 1));
  }

  prevMonth(): void {
    this._currentDate.update(date => addMonths(date, -1));
  }

  goToToday(): void {
    this._currentDate.set(new Date());
  }

  selectDate(date: Date): void {
    this._currentDate.set(new Date(date));
  }

  changeView(view: CalendarView): void {
    this._selectedView.set(view);
  }

  // Gestión de eventos
  addEvent(event: Omit<CalendarEvent, 'id'>): void {
    const newEvent: CalendarEvent = {
      ...event,
      id: Date.now(), // En producción usa UUID
    };
    this._events.update(events => [...events, newEvent]);
  }

  updateEvent(id: number, updates: Partial<CalendarEvent>): void {
    this._events.update(events =>
      events.map(evt => evt.id === id ? { ...evt, ...updates } : evt)
    );
  }

  deleteEvent(id: number): void {
    this._events.update(events => events.filter(evt => evt.id !== id));
  }

  loadEvents(events: CalendarEvent[]): void {
    this._events.set(events);
  }

  // Helpers de consulta
  private getEventsForDate(date: Date): CalendarEvent[] {
    return this._events().filter(event =>
      isSameDate(event.start, date)
    );
  }

  private getEventsForWeek(weekStart: Date): CalendarEvent[] {
    const weekEnd = addDays(weekStart, 7);
    return this._events().filter(event =>
      event.start >= weekStart && event.start < weekEnd
    );
  }

  private getEventsForMonth(date: Date): Record<string, CalendarEvent[]> {
    const year = date.getFullYear();
    const month = date.getMonth();
    const monthEvents = this._events().filter(event =>
      event.start.getFullYear() === year && event.start.getMonth() === month
    );

    // Agrupar por fecha ISO
    return monthEvents.reduce((acc, event) => {
      const key = this.toISODate(event.start);
      if (!acc[key]) acc[key] = [];
      acc[key].push(event);
      return acc;
    }, {} as Record<string, CalendarEvent[]>);
  }

  private toISODate(date: Date): string {
    const y = date.getFullYear();
    const m = (date.getMonth() + 1).toString().padStart(2, '0');
    const d = date.getDate().toString().padStart(2, '0');
    return `${y}-${m}-${d}`;
  }
}
