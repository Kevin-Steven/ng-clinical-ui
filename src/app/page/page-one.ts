import { Component } from '@angular/core';
import { UiDatePicker } from "../date-picker/ui-datepicker";
import { ComponentCard } from "./component-card/component-card";
import { CalendarUi } from "../calendar/calendar";
import { UiDateRangePicker } from "../date-picker/ui-daterange-picker/ui-daterange-picker";

@Component({
  selector: 'app-test',
  templateUrl: './page-one.html',
  imports: [UiDatePicker, ComponentCard, CalendarUi, UiDateRangePicker]
})

export class PageOne {

}
