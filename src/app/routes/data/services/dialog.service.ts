import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';

import { Node } from '@/core/type';
import { DataService } from '@/core/services';
import { ConfirmDialogComponent } from '@/shared/dialogs';
import { ContextDialogComponent, RenameDialogComponent, AddDialogComponent } from '../dialogs';
import { FileService } from './file.service';
import { BranchService } from './branch.service';

@Injectable()
export class DialogService {
  constructor(
    public dataService: DataService,
    public fileService: FileService,
    public branchService: BranchService,
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
        }
      });
  }

  openRenameDialog(node: Node): void {
    this.branchService.unselectAll();
    node.isSelected = true;
    this.matDialog.open(RenameDialogComponent, {
      data: { message: node.name }
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

  showAddDialog(): void {
    this.matDialog.open(AddDialogComponent, { panelClass: 'context-dialog' })
      .afterClosed().subscribe(res => {
        if (res) {
          switch (res.type) {
            case 'add-file': this.fileService.addFile(); break;
            case 'add-folder': this.fileService.addFolder(); break;
            case 'import-file': this.fileService.importFiles(res.list); break;
            case 'import-folder': this.fileService.importFolder(res.list); break;
          }
        }
      });
  }
}
