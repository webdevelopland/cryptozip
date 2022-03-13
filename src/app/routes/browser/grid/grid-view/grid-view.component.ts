import { Component } from '@angular/core';
import { Router } from '@angular/router';

import { Grid, GridRow } from '@/core/type';
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
          this.loadJSON(JSON.parse(this.dataService.file.text));
        }
      } catch (e) {
        this.notificationService.error('Grid invalid');
        this.close();
      }
    } else {
      this.close();
    }
  }

  loadJSON(jsonGrid: any): void {
    if (jsonGrid && jsonGrid.rows && jsonGrid.rows.length > 0) {
      jsonGrid.rows.forEach(jsonRow => {
        const row = new GridRow();
        row.type = jsonRow.type;
        row.label = jsonRow.label;
        row.value = jsonRow.value;
        this.grid.rows.push(row);
      });
    }
  }

  togglePass(row: GridRow): void {
    if (row.visibility === 'text') {
      row.visibility = 'password';
    } else {
      row.visibility = 'text';
    }
  }

  copy(value: string): void {
    navigator.clipboard.writeText(value);
    this.notificationService.success('Copied');
  }

  close(): void {
    this.router.navigate(['/browser']);
  }
}
