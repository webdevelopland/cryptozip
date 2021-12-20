import { Injectable } from '@angular/core';
import { Subscription, timer } from 'rxjs';

import { Node, File, Folder } from '@/core/type';
import { DataService, EventService } from '@/core/services';
import { ConfirmDialogComponent } from '@/shared/dialogs';
import { FileService } from './file.service';
import { GetService } from './get.service';
import { DialogService } from './dialog.service';
import { BranchService } from './branch.service';

@Injectable()
export class MouseService {
  touchSub = new Subscription();

  constructor(
    private dataService: DataService,
    private eventService: EventService,
    private fileService: FileService,
    private getService: GetService,
    private dialogService: DialogService,
    private branchService: BranchService,
  ) { }

  click(node: Node): void {
    node.isSelected = !node.isSelected;
  }

  dblclick(node: Node): void {
    if (node instanceof Folder) {
      this.branchService.unselectAll();
      this.dataService.folder = node;
    } else {
      console.log(node);
    }
  }

  contextmenu(event: MouseEvent, node: Node): void {
    event.preventDefault();
    this.dialogService.openContextmenu(node);
  }

  touchstart(node: Node): void {
    if (this.eventService.isApple) {
      this.touchSub.unsubscribe();
      this.touchSub = timer(500).subscribe(() => {
        this.dialogService.openContextmenu(node);
      });
    }
  }

  touchend(): void {
    this.touchSub.unsubscribe();
  }

  destroy(): void {
    this.touchSub.unsubscribe();
  }
}
