import { Component, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';

import { Folder, Node } from '@/core/type';
import { Path } from '@/core/functions';
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
  isFocus: boolean = false;
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
      this.dataService.updatePath(parent);
    }
  }

  open(): void {
    this.dataService.path = Path.join(this.dataService.path);
    this.dataService.path = this.dataService.path || '/';
    const id: string = this.dataService.pathMap[this.dataService.path];
    if (id) {
      const node: Node = this.dataService.nodeMap[id];
      if (node instanceof Folder) {
        this.dataService.folder = node;
      } else {
        this.notificationService.warning('Not a folder');
      }
    } else {
      this.notificationService.warning('Not found');
    }
  }

  keyboardEvents(): void {
    this.subs.push(this.eventService.keydown.subscribe(event => {
      if (this.eventService.isDialog) {
        // Disable, if dialog is open
        return;
      }
      if (event.code === 'KeyX' && event.ctrlKey && !this.isFocus) {
        this.fileService.cut();
      }
      if (event.code === 'KeyC' && event.ctrlKey && !this.isFocus) {
        this.fileService.copy();
      }
      if (event.code === 'KeyV' && event.ctrlKey && !this.isFocus) {
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
      if (event.key === 'Enter' && this.isFocus) {
        event.preventDefault();
        this.open();
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
      if (event.code === 'Backspace' && !this.isFocus) {
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
      if (event.code === 'KeyA' && event.ctrlKey && !this.isFocus) {
        event.preventDefault();
        this.dataService.folder.nodes.forEach(node => node.isSelected = true);
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

  focus(): void {
    this.isFocus = true;
  }

  blur(): void {
    this.isFocus = false;
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
