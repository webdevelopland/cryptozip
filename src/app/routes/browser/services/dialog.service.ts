import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';

import { Node } from '@/core/type';
import { DataService, ZipService, NotificationService } from '@/core/services';
import { ConfirmDialogComponent } from '@/shared/dialogs';
import {
  ContextDialogComponent,
  RenameDialogComponent,
  AddDialogComponent,
  TagDialogComponent,
  SortDialogComponent,
} from '../dialogs';
import { FileService } from './file.service';
import { BranchService } from './branch.service';

@Injectable()
export class DialogService {
  constructor(
    public dataService: DataService,
    public zipService: ZipService,
    public fileService: FileService,
    public branchService: BranchService,
    public notificationService: NotificationService,
    private matDialog: MatDialog,
  ) { }

  openContextmenu(node: Node): void {
    if (!node.isSelected) {
      this.branchService.unselectAll();
      node.isSelected = true;
    }
    this.matDialog.open(ContextDialogComponent, { panelClass: 'context-dialog' })
      .afterClosed().subscribe(res => {
        switch (res) {
          case 'delete': this.askToDelete(); break;
          case 'copy': this.fileService.copy(); break;
          case 'cut': this.fileService.cut(); break;
          case 'rename': this.openRenameDialog(node); break;
          case 'send': this.fileService.transferTo(); break;
          case 'export': this.zipService.export(node, node.name); break;
          case 'tags': this.openTagsDialog(node); break;
          case 'properties': this.fileService.showProperties(node); break;
        }
      });
  }

  openRenameDialog(node: Node): void {
    this.branchService.unselectAll();
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
    this.branchService.unselectAll();
    node.isSelected = true;
    this.matDialog.open(TagDialogComponent, {
      data: node
    }).afterClosed().subscribe(() => {
      this.dataService.updateNode(node);
      this.dataService.modify();
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
      data: { message: this.dataService.folder.sortBy }
    })
      .afterClosed().subscribe(sortBy => {
        if (sortBy) {
          this.dataService.folder.sortBy = sortBy;
          this.dataService.sort(this.dataService.folder);
        }
      });
  }
}
