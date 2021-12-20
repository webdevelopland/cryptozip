import { Component } from '@angular/core';

import { DataService } from '@/core/services';
import { HeaderService } from './header.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
})
export class HeaderComponent {
  constructor(
    public dataService: DataService,
    public headerService: HeaderService,
  ) { }

  exit(): void {
    this.headerService.isMenu = false;
    this.dataService.destroy();
  }

  print(): void {
    console.log(this.dataService.data);
    this.headerService.isMenu = false;
  }

  toggleMenu(): void {
    this.headerService.isMenu = !this.headerService.isMenu;
  }
}
