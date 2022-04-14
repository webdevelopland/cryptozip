import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';

import { Node } from '@/core/type';
import { DataService, ZipService, NotificationService, LocationService } from '@/core/services';
import { ConfirmDialogComponent } from '@/shared/dialogs';
import {
  RenameDialogComponent,
  TagDialogComponent,
  IndexDialogComponent,
} from '../dialogs';
import { FileService } from './file.service';
import { BranchService } from './branch.service';
import { ControlsService } from './controls.service';

@Injectable()
export class DialogService {
  constructor(
    private matDialog: MatDialog,
    private dataService: DataService,
    private zipService: ZipService,
    private fileService: FileService,
    private branchService: BranchService,
    private notificationService: NotificationService,
    private locationService: LocationService,
    private controlsService: ControlsService,
  ) { }

  openRenameDialog(node: Node): void {
    this.dataService.unselectAll();
    node.isSelected = true;
    this.matDialog.open(RenameDialogComponent, {
      data: node
    }).afterClosed().subscribe(newName => {
      if (newName) {
        this.fileService.rename(node, newName);
      }
    });
  }

  askToDelete(): void {
    this.matDialog.open(ConfirmDialogComponent, {
      data: { message: 'Delete the nodes?' },
      autoFocus: false,
    }).afterClosed().subscribe(res => {
      if (res) {
        this.fileService.delete();
      }
    });
  }

  openTagsDialog(node: Node): void {
    this.dataService.unselectAll();
    node.isSelected = true;
    this.matDialog.open(TagDialogComponent, {
      data: node
    }).afterClosed().subscribe(tags => {
      if (tags !== undefined) {
        node.tags = tags;
        this.locationService.updateNodeAndAllParents(node);
        this.dataService.modify();
      }
    });
  }

  openIndexDialog(node: Node): void {
    this.dataService.unselectAll();
    node.isSelected = true;
    this.matDialog.open(IndexDialogComponent, {
      data: node
    }).afterClosed().subscribe(index => {
      if (index !== undefined) {
        if (-2147483648 > index || index > 2147483647) {
          this.notificationService.error('Index is too big');
          return;
        }
        node.index = index;
        this.locationService.updateNodeAndAllParents(node);
        this.dataService.modify();
      }
    });
  }
}
