
import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'app-component-card',
  imports: [],
  templateUrl: './component-card.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ComponentCard {

  title = input<string>();
  desc = input<string>('');
  className = input<string>('');
}
