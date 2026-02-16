import { Component, inject, computed } from '@angular/core';
import { DatePipe, SlicePipe } from '@angular/common';
import { CalendarService } from '../services/calendar.service';
import { CalendarEvent } from '../interface/calendar.model';

interface ProcessedWeekEvent extends CalendarEvent {
  gridColumn: number;
  gridRowStart: number;
  gridRowSpan: number;
}

@Component({
  selector: 'app-week-view',
  imports: [DatePipe, SlicePipe],
  templateUrl: './week-view.html',
})
export class WeekView {
  private readonly calendarService = inject(CalendarService);

  protected readonly hours = Array.from({ length: 24 }, (_, i) => i);
  protected readonly currentWeekStart = this.calendarService.currentWeekStart;

  protected readonly weekDays = computed(() => {
    const start = this.currentWeekStart();
    const today = new Date();

    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(start);
      d.setDate(d.getDate() + i);
      return {
        date: d,
        dayName: new Intl.DateTimeFormat('es-ES', { weekday: 'short' }).format(d),
        dayNumber: d.getDate(),
        isToday: d.toDateString() === today.toDateString()
      };
    });
  });

  protected readonly processedEvents = computed<ProcessedWeekEvent[]>(() => {
    const weekEvents = this.calendarService.eventsForCurrentWeek();

    return weekEvents.map(event => {
      const startHour = event.start.getHours();
      const startMin = event.start.getMinutes();
      const durationMinutes = (event.end.getTime() - event.start.getTime()) / (1000 * 60);

      // Grid: 12 filas por hora (cada 5 min)
      const rowStart = (startHour * 12) + Math.floor(startMin / 5) + 2;
      const span = Math.ceil(durationMinutes / 5);

      // Columna: Lunes=1, Domingo=7
      let dayIndex = event.start.getDay();
      dayIndex = dayIndex === 0 ? 7 : dayIndex;

      return {
        ...event,
        gridColumn: dayIndex,
        gridRowStart: rowStart,
        gridRowSpan: span
      };
    });
  });
}
