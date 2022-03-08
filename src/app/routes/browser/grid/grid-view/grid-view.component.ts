import { Component } from '@angular/core';
import { Router } from '@angular/router';

import { Grid } from '@/core/type';
import { DataService, NotificationService } from '@/core/services';

@Component({
  selector: 'page-grid-view',
  templateUrl: './grid-view.component.html',
  styleUrls: ['./grid-view.component.scss'],
})
export class GridViewComponent {
  grid = new Grid();

  constructor(
    public router: Router,
    public dataService: DataService,
    public notificationService: NotificationService,
  ) {
    if (this.dataService.file) {
      try {
        if (this.dataService.file.text) {
          const jsonGrid = JSON.parse(this.dataService.file.text);
          this.grid = jsonGrid;
        }
      } catch (e) {
        this.notificationService.error('Grid invalid');
        this.close();
      }
    } else {
      this.close();
    }
  }

  copy(value: string): void {
    navigator.clipboard.writeText(value);
    this.notificationService.success('Copied');
  }

  close(): void {
    this.dataService.file = undefined;
    this.router.navigate(['/browser']);
  }
}
