import { Component, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';

import { Folder } from '@/core/type';
import { DataService, NotificationService, EventService, ClipboardService } from '@/core/services';
import { parsePath } from '@/core/functions';
import { MouseService, FileService, GetService, DialogService, BranchService } from './services';

@Component({
  selector: 'page-browser',
  templateUrl: './browser.component.html',
  styleUrls: ['./browser.component.scss'],
})
export class BrowserComponent implements OnDestroy {
  subs: Subscription[] = [];

  constructor(
    public dataService: DataService,
    private notificationService: NotificationService,
    private eventService: EventService,
    public clipboardService: ClipboardService,

    public mouseService: MouseService,
    public fileService: FileService,
    public getService: GetService,
    public dialogService: DialogService,
    public branchService: BranchService,
  ) {
    this.keyboardEvents();
  }

  back(): void {
    const parentPath: string = parsePath(this.dataService.folder.path).parent;
    if (parentPath !== '/') {
      const parentId: string = this.dataService.pathMap[parentPath];
      const parent = this.dataService.nodeMap[parentId] as Folder;
      this.branchService.unselectAll();
      if (!parent) {
        this.notificationService.crash(parentPath + ': parent not found');
      }
      this.dataService.folder = parent;
    }
  }

  keyboardEvents(): void {
    this.subs.push(this.eventService.keydown.subscribe(event => {
      if (event.code === 'KeyX' && event.ctrlKey) {
        event.preventDefault();
        this.fileService.cut();
      }
      if (event.code === 'KeyC' && event.ctrlKey) {
        event.preventDefault();
        this.fileService.copy();
      }
      if (event.code === 'KeyV' && event.ctrlKey) {
        event.preventDefault();
        this.fileService.paste();
      }
      if (event.code === 'Delete') {
        event.preventDefault();
        this.dialogService.askToDelete();
      }
      if (event.code === 'Equal' && event.ctrlKey) {
        event.preventDefault();
        this.fileService.addFile();
      }
      if (event.code === 'Minus' && event.ctrlKey) {
        event.preventDefault();
        this.fileService.addFolder();
      }
    }));
  }

  sub(sub: Subscription): void {
    this.subs.push(sub);
  }

  ngOnDestroy() {
    this.subs.forEach(sub => sub.unsubscribe());
    this.mouseService.destroy();
    this.fileService.destroy();
  }
}
