import { Routes } from '@angular/router';
import { CalendarUi } from './calendar/calendar';
import { UiDatePicker } from './date-picker/ui-datepicker';
import { PageOne } from './page/page-one';

export const routes: Routes = [
  {
    path: '',
    component: CalendarUi,
  },
  {
    path: 'date',
    component: UiDatePicker,
  },
  {
    path: 'main',
    component: PageOne,
  }
];
