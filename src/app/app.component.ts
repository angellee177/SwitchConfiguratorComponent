import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { SwitchPlateConfiguratorComponent } from './components/switch-plate-configurator.component';

@Component({
    selector: 'app-root',
    imports: [CommonModule, RouterOutlet, SwitchPlateConfiguratorComponent],
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'SwitchConfiguratorPlan';
}
