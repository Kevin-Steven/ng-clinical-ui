import { Component, inject, computed, signal, ChangeDetectionStrategy } from '@angular/core';
import { addMonths, isSameDate } from '../utils/date.utils';
import { DatePipe, TitleCasePipe } from '@angular/common';
import { CalendarEvent } from '../interface/calendar.model';
import { CalendarService } from '../services/calendar.service';

interface ProcessedDayEvent extends CalendarEvent {
  gridRowStart: number;
  gridRowSpan: number;
}

const MINI_CAL_FORMATTER = new Intl.DateTimeFormat('es-ES', { month: 'long', year: 'numeric' });
@Component({
  selector: 'app-day-view',
  imports: [DatePipe, TitleCasePipe],
  templateUrl: './day-view.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DayView {
  private readonly calendarService = inject(CalendarService);

  protected readonly hours = Array.from({ length: 24 }, (_, i) => i);
  protected readonly currentDate = this.calendarService.currentDate;

  // Mini calendario tiene su propia navegación independiente
  private readonly miniCalendarDate = signal(new Date());

  protected readonly currentMonthName = computed(() =>
  MINI_CAL_FORMATTER.format(this.miniCalendarDate())
);

  protected readonly dayEvents = computed<ProcessedDayEvent[]>(() => {
    const events = this.calendarService.eventsForCurrentDate();

    return events.map(event => {
      const startH = event.start.getHours();
      const startM = event.start.getMinutes();
      const durationM = (event.end.getTime() - event.start.getTime()) / 60000;

      // Grid: 48 filas (30 min cada una)
      const rowStart = (startH * 2) + Math.floor(startM / 30) + 2;
      const span = Math.ceil(durationM / 30);

      return { ...event, gridRowStart: rowStart, gridRowSpan: span };
    });
  });

  protected readonly miniCalendarDays = computed(() => {
    const curr = this.miniCalendarDate();
    const year = curr.getFullYear();
    const month = curr.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const today = new Date();
    const selectedDate = this.currentDate();

    let startDayIdx = firstDay.getDay() - 1;
    if (startDayIdx === -1) startDayIdx = 6;

    const days = [];

    // Días previos
    const prevLast = new Date(year, month, 0).getDate();
    for (let i = startDayIdx - 1; i >= 0; i--) {
      const d = new Date(year, month - 1, prevLast - i);
      days.push({
        dayNumber: prevLast - i,
        isCurrentMonth: false,
        date: d,
        isoDate: d.toISOString(),
        isSelected: isSameDate(d, selectedDate),
        isToday: isSameDate(d, today)
      });
    }

    // Días del mes
    for (let i = 1; i <= lastDay.getDate(); i++) {
      const d = new Date(year, month, i);
      days.push({
        dayNumber: i,
        isCurrentMonth: true,
        date: d,
        isoDate: d.toISOString(),
        isSelected: isSameDate(d, selectedDate),
        isToday: isSameDate(d, today)
      });
    }

    // Días siguientes
    const remaining = 42 - days.length;
    for (let i = 1; i <= remaining; i++) {
      const d = new Date(year, month + 1, i);
      days.push({
        dayNumber: i,
        isCurrentMonth: false,
        date: d,
        isoDate: d.toISOString(),
        isSelected: isSameDate(d, selectedDate),
        isToday: isSameDate(d, today)
      });
    }

    return days;
  });

  protected prevMonth(): void {
    this.miniCalendarDate.update(d => addMonths(d, -1));
  }

  protected nextMonth(): void {
    this.miniCalendarDate.update(d => addMonths(d, 1));
  }

  protected selectDate(date: Date): void {
    this.calendarService.selectDate(date);
  }
}
