import { Component } from '@angular/core';

import { SwitchPlateConfiguratorComponent } from './components/switch-plate-configurator.component';

@Component({
  selector: 'app-root',
  imports: [SwitchPlateConfiguratorComponent],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent {
  title = 'SwitchConfiguratorPlan';
}
