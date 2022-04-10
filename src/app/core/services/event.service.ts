import { Injectable } from '@angular/core';
import { Subject, Subscription } from 'rxjs';

import { Point, Overlay } from '@/core/type';
import { isApple } from '@/core/functions';

@Injectable()
export class EventService {
  isApple: boolean;
  isDialog: boolean = false;
  isEditing: boolean = false;
  keydown = new Subject<KeyboardEvent>();
  click = new Subject<Point>();
  mouseWheelChanges = new Subject<WheelEvent>();
  mouseMoveChanges = new Subject<Point>();
  mouseMoveSubs: Subscription[] = [];
  resizeChanges = new Subject<void>();
  width: number;
  height: number;

  constructor() {
    this.isApple = isApple();
    document.addEventListener('keydown', event => {
      this.keydown.next(event);
    }, false);
    document.addEventListener('mouseup', event => {
      if (event.button === 0) { // Left mouse button
        this.click.next({ x: event.pageX, y: event.pageY });
        this.mouseMoveSubs.forEach(sub => sub.unsubscribe());
      }
    });
    window.addEventListener('resize', () => {
      this.resize();
      this.resizeChanges.next();
    });
    document.addEventListener('mousemove', event => {
      this.mouseMoveChanges.next({
        x: event.clientX,
        y: event.clientY,
      });
    });
    document.addEventListener('wheel', event => {
      this.mouseWheelChanges.next(event);
    });
    this.resize();
  }

  boxTest(point: Point, overlay: Overlay): boolean {
    return true &&
      point.x < overlay.point.x || point.x > overlay.point.x + overlay.width ||
      point.y < overlay.point.y || point.y > overlay.point.y + overlay.height;
  }

  resize() {
    if (window.innerWidth) {
      this.width = window.innerWidth;
      this.height = window.innerHeight;
    } else if (document.documentElement && document.documentElement.clientWidth) {
      this.width = document.documentElement.clientWidth;
      this.height = document.documentElement.clientHeight;
    } else {
      this.width = document.body.clientWidth;
      this.height = document.body.clientHeight;
    }
  }

  mouseSub(sub: Subscription): void {
    this.mouseMoveSubs.push(sub);
  }

  destroy(): void {
    this.isDialog = false;
    this.isEditing = false;
    this.mouseMoveSubs.forEach(sub => sub.unsubscribe());
  }
}
