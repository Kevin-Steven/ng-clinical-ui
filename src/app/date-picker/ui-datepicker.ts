import { Component, signal, computed, inject, ElementRef, HostListener, forwardRef, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { addMonths, isSameDate } from '../calendar/utils/date.utils';

@Component({
  selector: 'ui-datepicker',
  imports: [CommonModule],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => UiDatePicker),
      multi: true
    }
  ],
  templateUrl: './ui-datepicker.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class UiDatePicker implements ControlValueAccessor {
  private elementRef = inject(ElementRef);

  // ESTADO
  isOpen = signal(false);

  // 'value' es la fecha seleccionada real (comunica con el formulario)
  value = signal<Date | null>(null);

  // 'viewDate' es el mes que estamos mirando en el popup (independiente de la selección)
  viewDate = signal(new Date());

  // --- CÁLCULOS (Tu misma lógica de CalendarMonth) ---

  viewMonthName = computed(() => {
    return new Intl.DateTimeFormat('es-ES', { month: 'long', year: 'numeric' })
      .format(this.viewDate());
  });

  formattedValue = computed(() => {
    const v = this.value();
    if (!v) return '';
    return new Intl.DateTimeFormat('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' }).format(v);
  });

  calendarDays = computed(() => {
    const curr = this.viewDate();
    const year = curr.getFullYear();
    const month = curr.getMonth();
    const selected = this.value();
    const today = new Date();

    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);

    // Lunes = 0
    let startDayIdx = firstDay.getDay() - 1;
    if (startDayIdx === -1) startDayIdx = 6;

    const days = [];

    // Previos
    const prevLast = new Date(year, month, 0).getDate();
    for (let i = startDayIdx - 1; i >= 0; i--) {
      const d = new Date(year, month - 1, prevLast - i);
      days.push(this.createDay(d, false, selected, today));
    }

    // Actuales
    for (let i = 1; i <= lastDay.getDate(); i++) {
      const d = new Date(year, month, i);
      days.push(this.createDay(d, true, selected, today));
    }

    // Siguientes (rellenar hasta 35 o 42)
    const remaining = 42 - days.length;
    for (let i = 1; i <= remaining; i++) {
      const d = new Date(year, month + 1, i);
      days.push(this.createDay(d, false, selected, today));
    }

    return days;
  });

  // --- ACCIONES ---

  toggleOpen() {
    this.isOpen.update(v => !v);
    // Si abrimos y tenemos valor, sincronizamos la vista al mes de la selección
    if (this.isOpen() && this.value()) {
      this.viewDate.set(new Date(this.value()!));
    }
  }

  navigateMonth(delta: number) {
    this.viewDate.update(d => addMonths(d, delta));
  }

  selectDate(date: Date) {
    this.value.set(date);
    this.onChange(date); // Notificar a Angular Forms
    this.onTouched();
    this.isOpen.set(false);
  }

  selectToday() {
    const today = new Date();
    this.selectDate(today);
  }

  // --- HELPERS ---

  private createDay(date: Date, isCurrentMonth: boolean, selected: Date | null, today: Date) {
    return {
      date,
      dayNumber: date.getDate(),
      isoDate: date.toISOString(),
      isCurrentMonth,
      isToday: isSameDate(date, today),
      isSelected: selected ? isSameDate(date, selected) : false
    };
  }

  getDayClasses(day: any): string {
    if (day.isCurrentMonth) {
      return 'bg-white text-gray-900';
    }
    return 'bg-gray-50 text-gray-400';
  }

  // --- CONTROL VALUE ACCESSOR (Boilerplate necesario) ---

  onChange = (value: Date) => {};
  onTouched = () => {};

  writeValue(obj: any): void {
    if (obj && obj instanceof Date) {
      this.value.set(obj);
      this.viewDate.set(new Date(obj)); // Sincronizar vista también
    } else if (obj === null) {
      this.value.set(null);
    }
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  // Cerrar al hacer click fuera
  @HostListener('document:click', ['$event'])
  onClickOutside(event: MouseEvent) {
    if (!this.elementRef.nativeElement.contains(event.target)) {
      this.isOpen.set(false);
    }
  }
}
