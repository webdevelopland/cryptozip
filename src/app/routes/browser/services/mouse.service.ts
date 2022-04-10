import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription, timer } from 'rxjs';

import { Node } from '@/core/type';
import {
  DataService,
  EventService,
  MediaService,
  NotificationService,
  LocationService,
} from '@/core/services';
import { FileService } from './file.service';
import { GetService } from './get.service';
import { BranchService } from './branch.service';
import { ControlsService } from './controls.service';

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
    private branchService: BranchService,
    private locationService: LocationService,
    private controlsService: ControlsService,
  ) { }

  click(node: Node): void {
    node.isSelected = !node.isSelected;
  }

  dblclick(node: Node): void {
    this.dataService.unselectAll();
    this.locationService.openNode(node);
  }

  contextmenu(event: MouseEvent, node: Node): void {
    event.preventDefault();
    this.controlsService.context.node = node;
    this.eventService.click.next({ x: event.pageX, y: event.pageY });
    this.controlsService.openContextMenu(node, { x: event.pageX, y: event.pageY });
  }

  touchstart(event: TouchEvent, node: Node): void {
    if (this.eventService.isApple) {
      this.touchSub.unsubscribe();
      this.touchSub = timer(400).subscribe(() => {
        event.preventDefault();
        this.controlsService.context.node = node;
        const touch: Touch = event.touches[0];
        this.eventService.click.next({ x: touch.pageX, y: touch.pageY });
        this.controlsService.openContextMenu(node, { x: touch.pageX, y: touch.pageY });
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
