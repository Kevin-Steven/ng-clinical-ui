import { Component, inject, computed, ChangeDetectionStrategy } from '@angular/core';
import { isSameDate } from '../utils/date.utils';
import { CalendarService } from '../services/calendar.service';
import { CalendarDay, CalendarEvent } from '../interface/calendar.model';

@Component({
  selector: 'app-calendar-month',
  templateUrl: './calendar-month.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CalendarMonth {
  private readonly calendarService = inject(CalendarService);

  protected readonly weekDays = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'] as const;

  protected readonly currentDate = this.calendarService.currentDate;
  protected readonly currentMonthName = this.calendarService.currentMonthName;

  protected readonly days = computed<CalendarDay[]>(() => {
    const curr = this.currentDate();
    const year = curr.getFullYear();
    const month = curr.getMonth();
    const today = new Date();

    const firstDayOfMonth = new Date(year, month, 1);
    const lastDayOfMonth = new Date(year, month + 1, 0);

    // Ajuste Lunes (0=Lunes... 6=Domingo)
    let startDayIndex = firstDayOfMonth.getDay() - 1;
    if (startDayIndex === -1) startDayIndex = 6;

    const daysArr: CalendarDay[] = [];
    const eventsMap = this.calendarService.eventsForCurrentMonth();

    // A. DÍAS PREVIOS
    const prevMonthLastDay = new Date(year, month, 0).getDate();
    for (let i = startDayIndex - 1; i >= 0; i--) {
      const dayVal = prevMonthLastDay - i;
      const d = new Date(year, month - 1, dayVal);
      daysArr.push(this.createDayObject(d, false, eventsMap));
    }

    // B. DÍAS DEL MES ACTUAL
    for (let i = 1; i <= lastDayOfMonth.getDate(); i++) {
      const d = new Date(year, month, i);
      const isToday = isSameDate(today, d);
      daysArr.push(this.createDayObject(d, true, eventsMap, isToday));
    }

    // C. DÍAS POSTERIORES
    const remainingSlots = 42 - daysArr.length;
    for (let i = 1; i <= remainingSlots; i++) {
      const d = new Date(year, month + 1, i);
      daysArr.push(this.createDayObject(d, false, eventsMap));
    }

    return daysArr;
  });

  private createDayObject(
    date: Date,
    isCurrentMonth: boolean,
    eventsMap: Record<string, CalendarEvent[]>,
    isToday = false
  ): CalendarDay {
    const isoDateKey = this.toISODate(date);

    return {
      dayNumber: date.getDate(),
      dayName: '',
      date,
      isoDate: isoDateKey,
      isCurrentMonth,
      isToday,
      events: eventsMap[isoDateKey] || []
    };
  }

  private toISODate(date: Date): string {
    const y = date.getFullYear();
    const m = (date.getMonth() + 1).toString().padStart(2, '0');
    const d = date.getDate().toString().padStart(2, '0');
    return `${y}-${m}-${d}`;
  }

  protected selectDay(day: CalendarDay): void {
    if (day.isCurrentMonth) {
      this.calendarService.selectDate(day.date);
      this.calendarService.changeView('day');
    }
  }
}
