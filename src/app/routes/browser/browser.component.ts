import { Component, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';

import { Folder } from '@/core/type';
import {
  DataService, NotificationService, EventService, ClipboardService, MediaService, SearchService
} from '@/core/services';
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
    public router: Router,
    public dataService: DataService,
    private notificationService: NotificationService,
    private eventService: EventService,
    public clipboardService: ClipboardService,
    public mediaService: MediaService,
    private searchService: SearchService,
    private headerService: HeaderService,

    public mouseService: MouseService,
    public fileService: FileService,
    public getService: GetService,
    public dialogService: DialogService,
    public branchService: BranchService,
  ) {
    this.keyboardEvents();
  }

  back(): void {
    const parent: Folder = this.dataService.getParent(this.dataService.folder);
    if (parent && this.dataService.folder.path !== '/') {
      this.branchService.unselectAll();
      this.dataService.folder.isSelected = true;
      this.dataService.folder = parent;
    }
  }

  keyboardEvents(): void {
    this.subs.push(this.eventService.keydown.subscribe(event => {
      if (this.eventService.isDialog) {
        // Disable, if dialog is open
        return;
      }
      if (event.code === 'KeyX' && event.ctrlKey) {
        this.fileService.cut();
      }
      if (event.code === 'KeyC' && event.ctrlKey) {
        this.fileService.copy();
      }
      if (event.code === 'KeyV' && event.ctrlKey) {
        event.preventDefault();
        this.fileService.paste();
      }
      if (event.code === 'KeyF' && event.ctrlKey) {
        event.preventDefault();
        this.headerService.search();
        this.router.navigate(['/browser/search']);
      }
      if (event.code === 'Delete') {
        event.preventDefault();
        this.dialogService.askToDelete();
      }
      if (event.code === 'Equal' && event.ctrlKey) {
        event.preventDefault();
        this.fileService.addTxtFile();
      }
      if (event.code === 'Minus' && event.ctrlKey) {
        event.preventDefault();
        this.fileService.addFolder();
      }
      if (event.code === 'BracketRight' && event.ctrlKey) {
        event.preventDefault();
        this.fileService.addGrid();
      }
      if (event.code === 'Backspace') {
        event.preventDefault();
        this.back();
      }
      if (event.code === 'F2') {
        event.preventDefault();
        for (const node of this.dataService.folder.nodes) {
          if (node.isSelected) {
            this.dialogService.openRenameDialog(node);
            break;
          }
        }
      }
      if (event.code === 'KeyA' && event.altKey) {
        event.preventDefault();
        this.branchService.unselectAll();
      }
      if (event.code === 'KeyC' && event.altKey) {
        event.preventDefault();
        this.fileService.transferTo();
      }
      if (event.code === 'KeyV' && event.altKey) {
        event.preventDefault();
        this.fileService.readClipboard();
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
