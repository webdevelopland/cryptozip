import { Component, ViewChild, ElementRef, AfterViewInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { Subscription } from 'rxjs';

import { GridType } from '@/core/type';
import { DataService, NotificationService, EventService, LocationService } from '@/core/services';
import { compareBinary } from '@/core/functions';
import { ConfirmDialogComponent } from '@/shared/dialogs';
import { GridService, DragService, PopupService } from './services';

@Component({
  selector: 'page-grid-edit',
  templateUrl: './grid-edit.component.html',
  styleUrls: ['./grid-edit.component.scss'],
})
export class GridEditComponent implements AfterViewInit, OnDestroy {
  gridType = GridType;
  gridTypeLabels = ['', 'Text Block', 'Input', 'Password', 'Label Textarea', 'Hidden'];
  fileSub = new Subscription();
  keySub = new Subscription();
  @ViewChild('gridRef') gridRef: ElementRef;
  @ViewChild('flexRef') flexRef: ElementRef;

  constructor(
    public router: Router,
    private matDialog: MatDialog,
    public dataService: DataService,
    private notificationService: NotificationService,
    private eventService: EventService,
    public locationService: LocationService,
    public gridService: GridService,
    public dragService: DragService,
    public popupService: PopupService,
  ) {
    this.eventService.isEditing = true;
    this.start();
  }

  start(): void {
    if (this.locationService.file) {
      this.dataService.decryptFile(this.locationService.file);
      this.locationService.updateParent(this.locationService.file);
      try {
        this.gridService.loadProto(this.locationService.file.block.binary);
      } catch (e) {
        this.notificationService.error('Grid invalid');
        this.close();
      }
      this.popupService.events();
      this.keyEvents();
      this.checkModified();
    } else {
      this.notificationService.error('Grid not found');
      this.locationService.cancel();
      this.close();
    }
  }

  ngAfterViewInit() {
    this.dragService.init(this.gridRef.nativeElement, this.flexRef.nativeElement);
  }

  keyEvents(): void {
    this.keySub = this.eventService.keydown.subscribe(event => {
      if (event.code === 'KeyS' && event.ctrlKey) {
        event.preventDefault();
        this.save();
      }
      this.popupService.popup.hide();
    });
  }

  add(type: string): void {
    switch (type) {
      case 'inputblock': this.gridService.addInput(); break;
      case 'textarea': this.gridService.addTextarea(); break;
      case 'password': this.gridService.addPassword(); break;
      case 'textblock': this.gridService.addTextblock(); break;
      case 'hiddenblock': this.gridService.addHiddenblock(); break;
    }
    this.dragService.update();
  }

  save(): void {
    this.locationService.file.block.binary = this.gridService.getProto();
    this.locationService.updateNodeAndAllParents(this.locationService.file);
    this.dataService.modifyAndRefresh();
    this.notificationService.success('Grid saved');
  }

  tryBack(): void {
    this.checkSave(() => this.locationService.back());
  }

  tryClose(): void {
    this.checkSave(() => this.close());
  }

  tryPreview(): void {
    this.checkSave(() => this.preview());
  }

  checkSave(callback: Function): void {
    if (compareBinary(this.locationService.file.block.binary, this.gridService.getProto())) {
      callback();
    } else {
      this.matDialog.open(ConfirmDialogComponent, {
        data: { message: 'You have unsaved progress. Close?' },
        autoFocus: false,
      }).afterClosed().subscribe(confirm => {
        if (confirm) {
          callback();
        }
      });
    }
  }

  checkModified(): void {
    this.fileSub = this.dataService.fileChanges.subscribe(() => {
      const isFileModified: boolean = !compareBinary(
        this.locationService.file.block.binary,
        this.gridService.getProto(),
      );
      this.dataService.isFileModified = isFileModified;
    });
  }

  preview(): void {
    this.router.navigate(['/browser/grid']);
  }

  close(): void {
    this.locationService.updatePath(this.locationService.folder);
    this.router.navigate(['/browser']);
  }

  ngOnDestroy() {
    this.gridService.grid = undefined;
    this.eventService.isEditing = false;
    this.dataService.isFileModified = false;
    this.keySub.unsubscribe();
    this.fileSub.unsubscribe();
    this.popupService.destroy();
  }
}
