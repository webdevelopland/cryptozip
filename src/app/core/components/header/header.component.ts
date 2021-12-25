import { Component } from '@angular/core';
import { Router } from '@angular/router';

import { DataService, EventService } from '@/core/services';
import { HeaderService } from './header.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
})
export class HeaderComponent {
  constructor(
    private router: Router,
    public dataService: DataService,
    public headerService: HeaderService,
    private eventService: EventService,
  ) { }

  exit(): void {
    this.headerService.isMenu = false;
    this.dataService.destroy();
    this.router.navigate(['/']);
  }

  print(): void {
    console.log(this.dataService.data);
    this.headerService.isMenu = false;
  }

  toggleMenu(): void {
    this.headerService.isMenu = !this.headerService.isMenu;
  }
}
