import { Injectable } from '@angular/core';

import { GridRow, Point } from '@/core/type';
import { EventService } from '@/core/services';
import { GridService } from './grid.service';

@Injectable()
export class DragService {
  flexDiv: HTMLDivElement;
  gridDiv: HTMLDivElement;
  dragRow: GridRow;
  totalTabsHeight: number;
  scrollTop: number;
  point: Point;

  constructor(
    private eventService: EventService,
    private gridService: GridService,
  ) { }

  init(gridDiv: HTMLDivElement, flexDiv: HTMLDivElement): void {
    this.gridDiv = gridDiv;
    this.flexDiv = flexDiv;
    this.update();
  }

  update(): void {
    setTimeout(() => {
      this.calculateHeight();
    }, 0);
  }

  calculateHeight(): void {
    this.totalTabsHeight = 0;
    Array.from(this.gridDiv.children).forEach((child: HTMLDivElement, index) => {
      const row: GridRow = this.gridService.grid.rows[index];
      const height = child.clientHeight + 2 + 10; // 2px border, 10px margin
      row.height = height;
      this.totalTabsHeight += height;
    });
  }

  calculateOffset(): void {
    let offset: number = 0;
    this.gridService.grid.rows.forEach(row => {
      row.offset = offset;
      offset += row.height;
    });
  }

  absolute(turnedOn: boolean): void {
    Array.from(this.gridDiv.children).forEach((child: HTMLDivElement, index) => {
      child.style.position = turnedOn ? 'absolute' : 'relative';
      if (!turnedOn) {
        this.gridService.grid.rows[index].offset = undefined;
        child.style.top = 'auto';
      }
    });
  }

  dragStart(clickEvent: MouseEvent, row: GridRow): void {
    if (clickEvent.button === 0) {
      this.absolute(true);
      this.calculateOffset();
      this.dragRow = row;
      this.dragRow.isDrag = true;
      this.scrollTop = this.flexDiv.scrollTop;
      const offset: number = row.offset;
      this.eventService.mouseSub(this.eventService.mouseMoveChanges.subscribe(point => {
        this.point = point;
        this.moveRow(clickEvent, offset, row);
      }));
      this.eventService.mouseSub(this.eventService.mouseWheelChanges.subscribe(() => {
        this.moveRow(clickEvent, offset, row);
      }));
    }
  }

  private moveRow(clickEvent: MouseEvent, offset: number, row: GridRow): void {
    // Min
    const scrollChange: number = this.scrollTop - this.flexDiv.scrollTop;
    let mouse = 0;
    if (this.point) {
      mouse = this.point.y;
    }
    let y: number = offset + mouse - clickEvent.clientY - scrollChange;
    if (y < 0) {
      y = 0;
    }
    // Max
    if (y > this.totalTabsHeight - row.height) {
      y = this.totalTabsHeight - row.height;
    }
    row.offset = y;
    this.reorderRows(row);
  }

  private reorderRows(dragRow: GridRow): void {
    const dragStart: number = dragRow.offset;
    let offset: number = 0;
    let isPlaceholder: boolean = false;
    let index: number = 0;
    this.gridService.grid.rows.forEach(row => {
      if (row.id !== dragRow.id) {
        const tabCenter: number = offset + Math.round(row.height / 2);
        if (tabCenter > dragStart && !isPlaceholder) {
          // Create empty space for dragged tab
          offset += dragRow.height;
          dragRow.index = index++;
          isPlaceholder = true;
        }
        row.offset = offset;
        row.index = index++;
        offset += row.height;
      }
    });
    if (!isPlaceholder) {
      dragRow.index = index;
    }
  }

  dragEnd(): void {
    if (this.dragRow) {
      this.absolute(false);
      this.dragRow.isDrag = false;
      this.dragRow = undefined;
      this.gridService.grid.rows.sort((a, b) => a.index - b.index);
    }
  }

  textareaResize(): void {
    if (this.gridDiv) {
      this.update();
    }
  }

  up(row: GridRow): void {
    const rows = this.gridService.grid.rows;
    const index: number = rows.indexOf(row);
    if (index !== -1 && index !== 0) {
      const prev: number = index - 1;
      [rows[prev], rows[index]] = [rows[index], rows[prev]];
    }
  }

  down(row: GridRow): void {
    const rows = this.gridService.grid.rows;
    const index: number = rows.indexOf(row);
    if (index !== -1 && index !== rows.length - 1) {
      const next: number = index + 1;
      [rows[next], rows[index]] = [rows[index], rows[next]];
    }
  }

  delete(row: GridRow): void {
    const rows = this.gridService.grid.rows;
    const index: number = rows.indexOf(row);
    if (index !== -1) {
      rows.splice(index, 1);
      for (let i = index; i < rows.length; i++) {
        rows[i].index = i;
      }
    }
    this.update();
  }

  destroy(): void {
    this.gridDiv = undefined;
    this.flexDiv = undefined;
    this.dragRow = undefined;
    this.totalTabsHeight = undefined;
    this.scrollTop = undefined;
  }
}
