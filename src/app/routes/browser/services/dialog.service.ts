import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';

import { Node } from '@/core/type';
import { DataService, ZipService, NotificationService, LocationService } from '@/core/services';
import { ConfirmDialogComponent, SortDialogComponent } from '@/shared/dialogs';
import {
  ContextDialogComponent,
  RenameDialogComponent,
  AddDialogComponent,
  TagDialogComponent,
  IndexDialogComponent,
} from '../dialogs';
import { FileService } from './file.service';
import { BranchService } from './branch.service';

@Injectable()
export class DialogService {
  constructor(
    private matDialog: MatDialog,
    public dataService: DataService,
    public zipService: ZipService,
    public fileService: FileService,
    public branchService: BranchService,
    public notificationService: NotificationService,
    public locationService: LocationService,
  ) { }

  openContextmenu(node: Node): void {
    if (!node.isSelected) {
      this.dataService.unselectAll();
      node.isSelected = true;
    }
    this.matDialog.open(ContextDialogComponent, { panelClass: 'context-dialog' })
      .afterClosed().subscribe(res => {
        switch (res) {
          case 'delete': this.askToDelete(); break;
          case 'copy': this.fileService.copy(); break;
          case 'cut': this.fileService.cut(); break;
          case 'rename': this.openRenameDialog(node); break;
          case 'transfer': this.fileService.transferTo(); break;
          case 'link': this.fileService.createLink(node); break;
          case 'export': this.zipService.export(node, node.name); break;
          case 'tags': this.openTagsDialog(node); break;
          case 'index': this.openIndexDialog(node); break;
          case 'properties': this.fileService.showProperties(node); break;
        }
      });
  }

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
        this.locationService.updateNode(node);
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
        node.index = index;
        this.locationService.updateNode(node);
        this.dataService.modify();
      }
    });
  }

  showAddDialog(): void {
    this.matDialog.open(AddDialogComponent, { panelClass: 'context-dialog' })
      .afterClosed().subscribe(res => {
        if (res) {
          switch (res.type) {
            case 'add-file': this.fileService.addTxtFile(); break;
            case 'add-folder': this.fileService.addFolder(); break;
            case 'add-grid': this.fileService.addGrid(); break;
            case 'import-file': this.fileService.importFiles(res.list); break;
            case 'import-folder': this.fileService.importFolder(res.list); break;
          }
        }
      });
  }

  showSortDialog(): void {
    this.matDialog.open(SortDialogComponent, {
      panelClass: 'context-dialog',
      data: { message: this.locationService.folder.sortBy }
    })
      .afterClosed().subscribe(sortBy => {
        if (sortBy) {
          this.locationService.folder.sortBy = sortBy;
          this.dataService.sort(this.locationService.folder);
        }
      });
  }
}
