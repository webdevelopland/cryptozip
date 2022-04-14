import { debounceTime, Subject, Subscription } from 'rxjs';

import { Node } from './type';

export interface Point {
  x: number;
  y: number;
}

export interface Overlay {
  point?: Point;
  width?: number;
  height?: number;
}

export class Popup {
  isClicked: boolean;
  isActivated: boolean;
  overlay: Overlay = {};
  sub = new Subscription();
  event = new Subject<void>();

  constructor() {
    this.hide();
  }

  click(): void {
    if (!this.isClicked) {
      this.isClicked = true;
      this.event.next();
    }
  }

  hide(): void {
    this.isClicked = false;
    this.isActivated = false;
  }

  subscribe(): void {
    this.sub = this.event
      .pipe(debounceTime(10))
      .subscribe(() => {
        this.isClicked = true;
        this.isActivated = true;
      });
  }

  private getBoxTest(point: Point): boolean {
    return true &&
      point.x < this.overlay.point.x || point.x > this.overlay.point.x + this.overlay.width ||
      point.y < this.overlay.point.y || point.y > this.overlay.point.y + this.overlay.height;
  }

  boxTest(point: Point): void {
    if (this.isActivated) {
      if (this.getBoxTest(point)) {
        this.hide();
      }
    }
  }

  unsubscribe(): void {
    this.sub.unsubscribe();
  }

  destroy(): void {
    this.hide();
    this.unsubscribe();
    this.overlay = {};
  }
}

export class Context extends Popup {
  isVisible: boolean;
  node: Node;

  hide(): void {
    super.hide();
    this.isVisible = false;
  }
}
