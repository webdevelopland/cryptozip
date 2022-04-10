import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { debounceTime, Subject, Subscription } from 'rxjs';

import { Node, Folder, NodeInfo, Overlay, Point } from '@/core/type';
import {
  NodeService, SearchService, DataService, LocationService, EventService,
} from '@/core/services';
import { FileService } from './file.service';

export class Context {
  isExist: boolean;
  isVisible: boolean;
  overlay: Overlay = { point: { x: 0, y: 0 } };
  node: Node;
  changes = new Subject<void>();
  sub = new Subscription();
}

@Injectable()
export class ControlsService {
  isControlsMenu: boolean = false;
  isAddMenu: boolean = false;
  context = new Context();
  overlayMenu: Overlay;
  overlayAdd: Overlay;
  menuClick = new Subject<void>();
  addClick = new Subject<void>();
  menuSub = new Subscription();
  addSub = new Subscription();
  eventSub = new Subscription();
  keySub = new Subscription();

  constructor(
    private router: Router,
    private nodeService: NodeService,
    private searchService: SearchService,
    private fileService: FileService,
    private dataService: DataService,
    private locationService: LocationService,
    private eventService: EventService,
  ) { }

  events(): void {
    this.eventSub = this.eventService.click
      .pipe(debounceTime(1))
      .subscribe(point => {
        if (this.overlayMenu) {
          if (this.eventService.boxTest(point, this.overlayMenu)) {
            this.isControlsMenu = false;
          }
        }
        if (this.overlayAdd) {
          if (this.eventService.boxTest(point, this.overlayAdd)) {
            this.isAddMenu = false;
          }
        }
        if (this.context.overlay) {
          if (this.eventService.boxTest(point, this.context.overlay)) {
            this.closeContextMenu();
          }
        }
      });
    this.keySub = this.eventService.keydown.subscribe(() => {
      this.isControlsMenu = false;
      this.isAddMenu = false;
      this.closeContextMenu();
    });
    this.menuSub = this.menuClick
      .pipe(debounceTime(10))
      .subscribe(() => {
        this.isControlsMenu = true;
      });
    this.addSub = this.addClick
      .pipe(debounceTime(10))
      .subscribe(() => {
        this.isAddMenu = true;
      });
    this.context.sub = this.context.changes
      .pipe(debounceTime(10))
      .subscribe(() => {
        this.context.isExist = true;
      });
  }

  openContextMenu(node: Node, point: Point): void {
    this.closeContextMenu();
    if (!node.isSelected) {
      this.dataService.unselectAll();
      node.isSelected = true;
    }
    this.context.node = node;
    this.context.overlay = {
      point: {
        x: point.x + 10,
        y: point.y + 10,
      }
    };
    this.context.changes.next();
  }

  calculateContextPosition(): void {
    if (
      this.context &&
      this.context.overlay &&
      this.context.overlay.point &&
      this.context.overlay.width &&
      this.context.overlay.height
    ) {
      const o = this.context.overlay;
      const p = this.context.overlay.point;
      const right: number = p.x + o.width;
      const bot: number = p.y + o.height;
      if (right > this.eventService.width) {
        const beyond: number = right - this.eventService.width;
        p.x -= beyond + 10;
      }
      if (bot > this.eventService.height) {
        const beyond: number = bot - this.eventService.height;
        p.y -= beyond + 10;
      }
      this.context.isVisible = true;
    }
  }

  closeContextMenu(): void {
    this.context.isExist = false;
    this.context.isVisible = false;
  }

  showProperties(node: Node): void {
    const selectFolder = new Folder();
    selectFolder.nodes = this.fileService.getSelectedList();
    if (selectFolder.nodes.length > 1) {
      this.showListProperties(selectFolder);
    } else {
      this.showNodeProperties(node);
    }
  }

  private showNodeProperties(node: Node): void {
    const nodeInfo: NodeInfo = this.nodeService.getNodeInfo(node);
    const createdTimestamp: number = node.createdTimestamp;
    const updatedTimestamp: number = node.updatedTimestamp;
    this.nodeService.showProperties(nodeInfo, createdTimestamp, updatedTimestamp);
  }

  private showListProperties(folder: Folder): void {
    const nodeInfo: NodeInfo = this.nodeService.getNodeInfo(folder);
    this.nodeService.showListProperties(nodeInfo);
  }

  search(): void {
    this.searchService.folder = this.locationService.folder;
    this.searchService.where = this.locationService.folder.path;
    this.searchService.what = '';
    this.searchService.tagString = '';
    this.searchService.tags = [];
    this.locationService.openSearch(this.locationService.folder.path);
    this.router.navigate(['/browser/search']);
  }

  openControls(): void {
    if (!this.isControlsMenu) {
      this.menuClick.next();
    }
  }

  openAdd(): void {
    if (!this.isAddMenu) {
      this.addClick.next();
    }
  }

  destroy() {
    this.isControlsMenu = false;
    this.isAddMenu = false;
    this.context.sub.unsubscribe();
    this.context = new Context();
    this.overlayMenu = undefined;
    this.overlayAdd = undefined;
    this.menuSub.unsubscribe();
    this.addSub.unsubscribe();
    this.eventSub.unsubscribe();
    this.keySub.unsubscribe();
  }
}
