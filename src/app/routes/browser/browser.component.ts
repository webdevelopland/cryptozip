import { Component, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';

import { Folder } from '@/core/type';
import {
  DataService, ZipService, NotificationService, EventService, ClipboardService,
} from '@/core/services';
import { parsePath } from '@/core/functions';
import { HeaderService } from '@/core/components/header';
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
    private headerService: HeaderService,
    private zipService: ZipService,
    private notificationService: NotificationService,
    private eventService: EventService,
    public clipboardService: ClipboardService,

    public mouseService: MouseService,
    public fileService: FileService,
    public getService: GetService,
    public dialogService: DialogService,
    public branchService: BranchService,
  ) {
    this.headerEvents();
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

  headerEvents(): void {
    this.sub(this.headerService.editChanges.subscribe(() => {
      // Meta editing. Archive id, password, etc
      console.log('edit');
    }));
    this.sub(this.headerService.downloadChanges.subscribe(() => {
      this.dataService.update();
      this.zipService.zip(this.dataService.data, this.dataService.password);
    }));
    this.sub(this.headerService.deleteChanges.subscribe(() => {
      console.log('delete');
    }));
    this.sub(this.headerService.saveChanges.subscribe(() => {
      this.dataService.update();
      console.log(this.dataService.data);
    }));
    this.sub(this.headerService.exportChanges.subscribe(() => {
      this.zipService.export(this.dataService.data.root);
    }));
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
