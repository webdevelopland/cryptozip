import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { debounceTime, Subscription } from 'rxjs';

import { Node, Folder, NodeInfo, Point, Popup, Context } from '@/core/type';
import {
  NodeService, SearchService, DataService, LocationService, EventService,
} from '@/core/services';
import { FileService } from './file.service';

@Injectable()
export class ControlsService {
  controls = new Popup();
  add = new Popup();
  index = new Popup();
  context = new Context();
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
        this.controls.boxTest(point);
        this.add.boxTest(point);
        this.index.boxTest(point);
        this.context.boxTest(point);
      });
    this.keySub = this.eventService.keydown.subscribe(() => {
      this.controls.hide();
      this.add.hide();
      this.index.hide();
      this.context.hide();
    });
    this.controls.subscribe();
    this.add.subscribe();
    this.index.subscribe();
    this.context.subscribe();
  }

  openContextMenu(node: Node, point: Point): void {
    this.context.hide();
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
    this.context.click();
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

  destroy() {
    this.controls.destroy();
    this.add.destroy();
    this.index.destroy();
    this.context.destroy();
    this.eventSub.unsubscribe();
    this.keySub.unsubscribe();
  }
}
