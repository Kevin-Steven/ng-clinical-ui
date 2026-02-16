import { Component, signal, computed, inject, ElementRef, HostListener, forwardRef, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { addDays, addMonths, getStartOfWeek, isDateInRange, isSameDate } from '../../calendar/utils/date.utils';

export interface DateRange {
  start: Date | null;
  end: Date | null;
}

@Component({
  selector: 'ui-daterange-picker',
  imports: [CommonModule],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => UiDateRangePicker),
      multi: true
    }
  ],
  templateUrl: './ui-daterange-picker.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class UiDateRangePicker implements ControlValueAccessor {
  private elementRef = inject(ElementRef);

  // ESTADO
  isOpen = signal(false);

  // Rango seleccionado
  value = signal<DateRange>({ start: null, end: null });

  // Fecha temporal mientras se selecciona (para preview del rango)
  hoverDate = signal<Date | null>(null);

  // Vista del calendario
  viewDate = signal(new Date());

  // --- CÁLCULOS ---

  viewMonthName = computed(() => {
    return new Intl.DateTimeFormat('es-ES', { month: 'long', year: 'numeric' })
      .format(this.viewDate());
  });

  formattedValue = computed(() => {
    const range = this.value();
    if (!range.start) return '';
    if (!range.end) return new Intl.DateTimeFormat('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' }).format(range.start);

    const start = new Intl.DateTimeFormat('es-ES', { day: '2-digit', month: 'short' }).format(range.start);
    const end = new Intl.DateTimeFormat('es-ES', { day: '2-digit', month: 'short', year: 'numeric' }).format(range.end);
    return `${start} - ${end}`;
  });

  calendarDays = computed(() => {
    const curr = this.viewDate();
    const year = curr.getFullYear();
    const month = curr.getMonth();
    const range = this.value();
    const hover = this.hoverDate();
    const today = new Date();

    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);

    let startDayIdx = firstDay.getDay() - 1;
    if (startDayIdx === -1) startDayIdx = 6;

    const days = [];

    // Previos
    const prevLast = new Date(year, month, 0).getDate();
    for (let i = startDayIdx - 1; i >= 0; i--) {
      const d = new Date(year, month - 1, prevLast - i);
      days.push(this.createDay(d, false, range, today, hover));
    }

    // Actuales
    for (let i = 1; i <= lastDay.getDate(); i++) {
      const d = new Date(year, month, i);
      days.push(this.createDay(d, true, range, today, hover));
    }

    // Siguientes
    const remaining = 42 - days.length;
    for (let i = 1; i <= remaining; i++) {
      const d = new Date(year, month + 1, i);
      days.push(this.createDay(d, false, range, today, hover));
    }

    return days;
  });

  // --- ACCIONES ---

  toggleOpen() {
    this.isOpen.update(v => !v);
    if (this.isOpen() && this.value().start) {
      this.viewDate.set(new Date(this.value().start!));
    }
  }

  navigateMonth(delta: number) {
    this.viewDate.update(d => addMonths(d, delta));
  }

  selectDate(date: Date) {
    const current = this.value();

    // Lógica de selección de rango
    if (!current.start || (current.start && current.end)) {
      // Primera fecha o reiniciar rango
      this.value.set({ start: date, end: null });
    } else {
      // Segunda fecha
      if (date < current.start) {
        // Si es anterior, intercambiar
        this.value.set({ start: date, end: current.start });
      } else {
        this.value.set({ start: current.start, end: date });
      }
      this.onChange(this.value());
      this.onTouched();
      this.isOpen.set(false);
    }
  }

  onDateHover(date: Date) {
    this.hoverDate.set(date);
  }

  clearHover() {
    this.hoverDate.set(null);
  }

  selectThisWeek() {
    const today = new Date();
    const start = getStartOfWeek(today);
    const end = addDays(start, 6);
    this.value.set({ start, end });
    this.onChange(this.value());
    this.onTouched();
    this.isOpen.set(false);
  }

  selectThisMonth() {
    const today = new Date();
    const start = new Date(today.getFullYear(), today.getMonth(), 1);
    const end = new Date(today.getFullYear(), today.getMonth() + 1, 0);
    this.value.set({ start, end });
    this.onChange(this.value());
    this.onTouched();
    this.isOpen.set(false);
  }

  // --- HELPERS ---

  private createDay(date: Date, isCurrentMonth: boolean, range: DateRange, today: Date, hover: Date | null) {
    const isStart = range.start ? isSameDate(date, range.start) : false;
    const isEnd = range.end ? isSameDate(date, range.end) : false;
    const isInRange = range.start && range.end ? isDateInRange(date, range.start, range.end) : false;

    // Preview del rango mientras se hace hover
    const isInHoverRange = range.start && !range.end && hover
      ? isDateInRange(date, range.start, hover)
      : false;

    return {
      date,
      dayNumber: date.getDate(),
      isoDate: date.toISOString(),
      isCurrentMonth,
      isToday: isSameDate(date, today),
      isStart,
      isEnd,
      isInRange,
      isInHoverRange
    };
  }

  // --- CONTROL VALUE ACCESSOR ---

  onChange = (value: DateRange) => {};
  onTouched = () => {};

  writeValue(obj: any): void {
    if (obj && obj.start instanceof Date) {
      this.value.set(obj);
      this.viewDate.set(new Date(obj.start));
    } else {
      this.value.set({ start: null, end: null });
    }
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  @HostListener('document:click', ['$event'])
  onClickOutside(event: MouseEvent) {
    if (!this.elementRef.nativeElement.contains(event.target)) {
      this.isOpen.set(false);
      this.hoverDate.set(null);
    }
  }
}
