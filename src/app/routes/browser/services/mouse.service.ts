import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription, timer } from 'rxjs';

import { Node, File, Folder } from '@/core/type';
import { DataService, EventService, MediaService, NotificationService } from '@/core/services';
import { FileService } from './file.service';
import { GetService } from './get.service';
import { DialogService } from './dialog.service';
import { BranchService } from './branch.service';

@Injectable()
export class MouseService {
  touchSub = new Subscription();

  constructor(
    private router: Router,
    private dataService: DataService,
    private eventService: EventService,
    private notificationService: NotificationService,
    private mediaService: MediaService,
    private fileService: FileService,
    private getService: GetService,
    private dialogService: DialogService,
    private branchService: BranchService,
  ) { }

  click(node: Node): void {
    node.isSelected = !node.isSelected;
  }

  dblclick(node: Node): void {
    this.branchService.unselectAll();
    node.isSelected = true;
    if (node instanceof Folder) {
      this.branchService.unselectAll();
      this.dataService.updatePath(node);
    } else {
      this.dataService.file = node as File;
      switch (this.mediaService.getMediaType(node.name)) {
        case 'text': this.router.navigate(['/browser/text']); break;
        case 'image': this.router.navigate(['/browser/image']); break;
        case 'grid': this.router.navigate(['/browser/grid']); break;
        default: this.notificationService.warning("Binary file can't be opened");
      }
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
