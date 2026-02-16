# 🏥 ng-med-ui

> Componentes Angular para sistemas de salud en Ecuador

[![Angular](https://img.shields.io/badge/Angular-21-red.svg)](https://angular.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue.svg)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4.0-38bdf8.svg)](https://tailwindcss.com/)

Componentes UI modernos para agendamiento de citas y gestión clínica. Conformes con normativas MSP/ACESS de Ecuador.

---

## ✨ Componentes

- 📅 Calendario (Mes, Semana, Día)
- 🗓️ DatePicker
- 📆 DateRangePicker

---

## 📦 Instalación

```bash
npm install ng-med-ui
🚀 Uso
typescript
import { CalendarMonth, UiDatePicker, UiDateRangePicker } from 'ng-med-ui';

@Component({
  imports: [CalendarMonth, UiDatePicker, UiDateRangePicker],
  template: `
    <calendar-month [events]="citas()" />
    <ui-datepicker [formControl]="fecha" />
    <ui-daterange-picker [formControl]="rango" />
  `
})
export class MiComponente {}
📸 Screenshots
Calendario - Vista Mes
Calendario Mes

![image alt][([/docs/screenshots/calendar-month.png](https://github.com/Kevin-Steven/ng-clinical-ui/blob/773e0645b0e2227fec6158fbaf0ef8536f135d09/calendar-day.png))](https://github.com/Kevin-Steven/ng-clinical-ui/blob/ba41b53f339afc7ab547d4ca1b1fb06edc390c54/docs/screenshots/calendar-day.png)

Calendario - Vista Semana
Calendario Semana

![image alt](/docs/screenshots/calendar-week.png)

Calendario - Vista Día
Calendario Día

![image alt](/docs/screenshots/calendar-day.png)

DatePicker
DatePicker

![image alt](/docs/screenshots/datepicker.png)

DateRangePicker
DateRangePicker

![image alt](/docs/screenshots/daterange-picker.png)

🎨 Características
⚡ Angular 21 Signals

🌙 Dark mode incluido

♿ Accesible (WCAG 2.1)

🎨 Personalizable con Tailwind

📱 Responsive

🏥 Normativa Ecuador
Compatible con:

Historia Clínica Única (HCU)

Estándares ACESS

📄 Licencia
MIT © kevin_barzola

🔗 Links
Documentación

Reportar bug

⭐ Dale una estrella si te sirvió

text

***

