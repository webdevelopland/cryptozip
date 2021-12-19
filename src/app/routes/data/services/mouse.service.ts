import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Subscription, timer } from 'rxjs';

import { Node, File, Folder } from '@/core/type';
import { DataService, EventService } from '@/core/services';
import { ConfirmDialogComponent } from '@/shared/dialogs';
import { ContextDialogComponent } from '../context-dialog';
import { RenameDialogComponent } from '../rename-dialog';
import { FileService } from './file.service';
import { GetService } from './get.service';

@Injectable()
export class MouseService {
  touchSub = new Subscription();

  constructor(
    public dataService: DataService,
    public eventService: EventService,
    public fileService: FileService,
    public getService: GetService,
    private matDialog: MatDialog,
  ) { }

  click(node: Node): void {
    node.isSelected = !node.isSelected;
  }

  dblclick(node: Node): void {
    if (node instanceof Folder) {
      this.getService.unselectAll();
      this.dataService.folder = node;
    } else {
      console.log(node);
    }
  }

  contextmenu(event: MouseEvent, node: Node): void {
    event.preventDefault();
    this.openContextmenu(node);
  }

  touchstart(node: Node): void {
    if (this.eventService.isApple) {
      this.touchSub.unsubscribe();
      this.touchSub = timer(500).subscribe(() => {
        this.openContextmenu(node);
      });
    }
  }

  touchend(): void {
    this.touchSub.unsubscribe();
  }

  openContextmenu(node: Node): void {
    if (!node.isSelected) {
      this.getService.unselectAll();
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
    this.getService.unselectAll();
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
      data: { message: 'Delete the nodes?' }
    }).afterClosed().subscribe(res => {
      if (res) {
        this.fileService.delete()
      }
    });
  }

  destroy(): void {
    this.touchSub.unsubscribe();
  }
}
