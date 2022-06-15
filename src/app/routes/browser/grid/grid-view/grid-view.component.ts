import { Component, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';

import * as Proto from 'src/proto';
import { Grid, GridRow, GridType, LocationType } from '@/core/type';
import { DataService, NotificationService, LocationService } from '@/core/services';
import { ControlsService } from 'browser/services';

@Component({
  selector: 'page-grid-view',
  templateUrl: './grid-view.component.html',
  styleUrls: ['./grid-view.component.scss'],
})
export class GridViewComponent implements OnDestroy {
  grid: Grid;
  gridType = GridType;
  reloadSub = new Subscription();

  constructor(
    public router: Router,
    public dataService: DataService,
    public notificationService: NotificationService,
    public locationService: LocationService,
    public controlsService: ControlsService,
  ) {
    this.start();
    this.reloadSub = this.locationService.fileChanges.subscribe(type => {
      if (type === LocationType.Grid) {
        this.update();
      }
    });
  }

  start(): void {
    if (this.locationService.file) {
      this.update();
    } else {
      this.notificationService.error('Grid not found');
      this.locationService.cancel();
      this.close();
    }
  }

  update(): void {
    this.dataService.decryptFile(this.locationService.file);
    this.locationService.updateParent(this.locationService.file);
    try {
      this.loadProto(this.locationService.file.block.binary);
    } catch (e) {
      this.notificationService.error('Grid invalid');
      this.close();
    }
  }

  loadProto(binary: Uint8Array): void {
    this.grid = new Grid();
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
    this.locationService.updatePath(this.locationService.folder);
    this.router.navigate(['/browser']);
  }

  ngOnDestroy() {
    this.reloadSub.unsubscribe();
  }
}
