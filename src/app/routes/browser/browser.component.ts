import { Component, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';

import { Folder, Node } from '@/core/type';
import { Path } from '@/core/functions';
import {
  DataService,
  NotificationService,
  EventService,
  ClipboardService,
  MediaService,
  SearchService,
  LocationService,
} from '@/core/services';
import { HeaderService } from '@/core/components/header';
import {
  MouseService,
  FileService,
  GetService,
  DialogService,
  BranchService,
  ControlsService,
} from './services';

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
    private locationService: LocationService,

    public mouseService: MouseService,
    public fileService: FileService,
    public getService: GetService,
    public dialogService: DialogService,
    public branchService: BranchService,
    public controlsService: ControlsService,
  ) {
    this.keyboardEvents();
    this.controlsService.events();
  }

  up(): void {
    const parent: Folder = this.locationService.getParent(this.locationService.folder);
    if (parent && this.locationService.folder.path !== '/') {
      this.dataService.unselectAll();
      this.locationService.folder.isSelected = true;
      this.locationService.updatePath(parent);
    }
  }

  open(): void {
    this.locationService.path = Path.join(this.locationService.path);
    this.locationService.path = this.locationService.path || '/';
    const id: string = this.dataService.pathMap[this.locationService.path];
    if (id) {
      const node: Node = this.dataService.nodeMap[id];
      if (node instanceof Folder) {
        this.locationService.updatePath(node);
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
        this.controlsService.search();
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
        this.up();
      }
      if (event.code === 'F2') {
        event.preventDefault();
        for (const node of this.locationService.folder.nodes) {
          if (node.isSelected) {
            this.dialogService.openRenameDialog(node);
            break;
          }
        }
      }
      if (event.code === 'KeyA' && event.ctrlKey && !this.isFocus) {
        event.preventDefault();
        this.locationService.folder.nodes.forEach(node => node.isSelected = true);
      }
      if (event.code === 'KeyA' && event.altKey) {
        event.preventDefault();
        this.dataService.unselectAll();
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
    this.locationService.path = this.locationService.folder.path;
  }

  sub(sub: Subscription): void {
    this.subs.push(sub);
  }

  ngOnDestroy() {
    this.subs.forEach(sub => sub.unsubscribe());
    this.mouseService.destroy();
    this.fileService.destroy();
    this.controlsService.destroy();
  }
}
