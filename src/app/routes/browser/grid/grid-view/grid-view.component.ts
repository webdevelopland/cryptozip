import { Component } from '@angular/core';
import { Router } from '@angular/router';

import * as Proto from 'src/proto';
import { Grid, GridRow, GridType } from '@/core/type';
import { DataService, NotificationService } from '@/core/services';

@Component({
  selector: 'page-grid-view',
  templateUrl: './grid-view.component.html',
  styleUrls: ['./grid-view.component.scss'],
})
export class GridViewComponent {
  grid = new Grid();
  gridType = GridType;

  constructor(
    public router: Router,
    public dataService: DataService,
    public notificationService: NotificationService,
  ) {
    this.dataService.decryptThisFile();
    this.start();
  }

  start(): void {
    if (this.dataService.file) {
      try {
        if (this.dataService.file.isBinary && this.dataService.file.block.binary) {
          this.loadProto(this.dataService.file.block.binary);
        }
      } catch (e) {
        this.notificationService.error('Grid invalid');
        this.close();
      }
    } else {
      this.close();
    }
  }

  loadProto(binary: Uint8Array): void {
    const grid: Proto.Grid = Proto.Grid.deserializeBinary(binary);
    grid.getRowList().forEach(protoRow => {
      const row = new GridRow();
      row.type = protoRow.getType() as GridType;
      row.label = protoRow.getLabel();
      row.value = protoRow.getValue();
      this.grid.rows.push(row);
    });
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
