import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { WeekView } from './week-view/week-view';
import { CalendarMonth } from './calendar-month/calendar-month';
import { DayView } from './day-view/day-view';
import { DatePipe, TitleCasePipe } from '@angular/common';
import { CalendarService } from './services/calendar.service';

const DAY_FORMATTER = new Intl.DateTimeFormat('es-ES', { weekday: 'long' });
const FULL_DATE_FORMATTER = new Intl.DateTimeFormat('es-ES', { day: 'numeric', month: 'long', year: 'numeric' });
@Component({
  selector: 'app-calendar',
  imports: [WeekView, CalendarMonth, DayView, DatePipe, TitleCasePipe],
  templateUrl: './calendar.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CalendarUi {
  protected readonly calendarService = inject(CalendarService);

  readonly currentDayName = computed(() =>
    DAY_FORMATTER.format(this.currentDate())
  );

  readonly currentFullDate = computed(() =>
    FULL_DATE_FORMATTER.format(this.currentDate())
  );
  // Exponer signals del servicio para el template
  readonly view = this.calendarService.selectedView;
  readonly currentDate = this.calendarService.currentDate;
  readonly currentWeekStart = this.calendarService.currentWeekStart;
  readonly currentMonthName = this.calendarService.currentMonthName;

  // Métodos delegados
  changeView = this.calendarService.changeView.bind(this.calendarService);
  prevWeek = this.calendarService.prevWeek.bind(this.calendarService);
  nextWeek = this.calendarService.nextWeek.bind(this.calendarService);
  goToToday = this.calendarService.goToToday.bind(this.calendarService);

  navigate(direction: 'prev' | 'next') {
    const v = this.view();
    if (direction === 'prev') {
      if (v === 'month') this.calendarService.prevMonth();
      if (v === 'week') this.calendarService.prevWeek();
      if (v === 'day') this.calendarService.prevDay();
    } else {
      if (v === 'month') this.calendarService.nextMonth();
      if (v === 'week') this.calendarService.nextWeek();
      if (v === 'day') this.calendarService.nextDay();
    }
  }
}
