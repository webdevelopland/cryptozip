import { Component, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { Subscription, interval } from 'rxjs';
import { generatePassword, numerals, alphabet, Alphabet, special, dict64 } from 'rndmjs';

import * as Proto from 'src/proto';
import { Grid, GridType, GridRow } from '@/core/type';
import { DataService, NotificationService, EventService, LocationService } from '@/core/services';
import { ConfirmDialogComponent } from '@/shared/dialogs';
import { GridDialogComponent } from '../../dialogs';
import { UNICODE, EMOJI, SIMPLE_SMALL, SIMPLE_BIG, SIMPLE_INT, SHIFT_SPECIAL } from './dict';

@Component({
  selector: 'page-grid-edit',
  templateUrl: './grid-edit.component.html',
  styleUrls: ['./grid-edit.component.scss'],
})
export class GridEditComponent implements OnDestroy {
  grid = new Grid();
  keySub = new Subscription();
  timerSub = new Subscription();
  gridType = GridType;

  constructor(
    public router: Router,
    private matDialog: MatDialog,
    public dataService: DataService,
    private notificationService: NotificationService,
    private eventService: EventService,
    public locationService: LocationService,
  ) {
    this.eventService.isEditing = true;
    this.start();
  }

  start(): void {
    if (this.locationService.file) {
      this.dataService.decryptFile(this.locationService.file);
      this.locationService.updateParent(this.locationService.file);
      try {
        if (this.locationService.file.isBinary && this.locationService.file.block.binary) {
          this.loadProto(this.locationService.file.block.binary);
        } else {
          throw new Error();
        }
      } catch (e) {
        this.notificationService.error('Grid invalid');
        this.close();
      }
      this.keyboardEvents();
      this.checkModified();
    } else {
      this.notificationService.error('Grid not found');
      this.locationService.cancel();
      this.close();
    }
  }

  add(): void {
    this.matDialog.open(GridDialogComponent, { panelClass: 'context-dialog' })
      .afterClosed().subscribe(res => {
        switch (res) {
          case 'add-input': this.addInput(); break;
          case 'add-textarea': this.addTextarea(); break;
          case 'add-pwd': this.addPassword(); break;
          case 'add-textblock': this.addTextblock(); break;
          case 'add-hiddenblock': this.addHiddenblock(); break;
        }
      });
  }

  addInput(): void {
    const row = new GridRow();
    row.type = GridType.INPUT;
    this.grid.rows.push(row);
  }

  addTextarea(): void {
    const row = new GridRow();
    row.type = GridType.TEXTAREA;
    this.grid.rows.push(row);
  }

  addPassword(): void {
    const row = new GridRow();
    row.label = 'password';
    row.type = GridType.PASSWORD;
    this.grid.rows.push(row);
  }

  addTextblock(): void {
    const row = new GridRow();
    row.type = GridType.TEXTBLOCK;
    this.grid.rows.push(row);
  }

  addHiddenblock(): void {
    const row = new GridRow();
    row.type = GridType.HIDDENBLOCK;
    this.grid.rows.push(row);
  }

  delete(row: GridRow): void {
    const index: number = this.grid.rows.indexOf(row);
    if (index !== -1) {
      this.grid.rows.splice(index, 1);
    }
  }

  up(row: GridRow): void {
    const index: number = this.grid.rows.indexOf(row);
    if (index !== -1 && index !== 0) {
      const prev: number = index - 1;
      [this.grid.rows[prev], this.grid.rows[index]] = [this.grid.rows[index], this.grid.rows[prev]];
    }
  }

  down(row: GridRow): void {
    const index: number = this.grid.rows.indexOf(row);
    if (index !== -1 && index !== this.grid.rows.length - 1) {
      const next: number = index + 1;
      [this.grid.rows[next], this.grid.rows[index]] = [this.grid.rows[index], this.grid.rows[next]];
    }
  }

  generateKey(row: GridRow, lengthInput: string, dictLabel: string): void {
    const length: number = parseInt(lengthInput);
    let dicts: string[][];
    switch (dictLabel) {
      case 'number': dicts = [numerals]; break;
      case 'text': dicts = [alphabet]; break;
      case 'text_number': dicts = [numerals, alphabet]; break;
      case 'simple': dicts = [SIMPLE_INT, SIMPLE_SMALL, SIMPLE_BIG]; break;
      case 'mixed_text_number': dicts = [numerals, alphabet, Alphabet]; break;
      case 'string64': dicts = [numerals, alphabet, Alphabet, ['-', '_']]; break;
      case 'hard': dicts = [numerals, alphabet, Alphabet, SHIFT_SPECIAL]; break;
      case 'special': dicts = [numerals, alphabet, Alphabet, special]; break;
      case 'unicode': dicts = [numerals, alphabet, Alphabet, special, UNICODE]; break;
      case 'emoji': dicts = [numerals, alphabet, Alphabet, special, UNICODE, EMOJI]; break;

      default: dicts = [dict64];
    }
    row.value = generatePassword(length, ...dicts);
  }

  togglePass(row: GridRow): void {
    if (row.visibility === 'text') {
      row.visibility = 'password';
    } else {
      row.visibility = 'text';
    }
  }

  loadProto(binary: Uint8Array): void {
    const grid: Proto.Grid = Proto.Grid.deserializeBinary(binary);
    grid.getRowList().forEach(protoRow => {
      const row = new GridRow();
      row.type = protoRow.getType() as GridType;
      row.label = protoRow.getLabel();
      row.value = protoRow.getValue();
      this.grid.rows.push(row);
    });
  }

  getProto(): Uint8Array {
    const grid = new Proto.Grid();
    this.grid.rows.forEach(row => {
      const gridRow = new Proto.GridRow();
      gridRow.setType(row.type);
      gridRow.setValue(row.value);
      gridRow.setLabel(row.label);
      grid.addRow(gridRow);
    });
    return grid.serializeBinary();
  }

  save(): void {
    this.locationService.file.isBinary = true;
    this.locationService.file.block.binary = this.getProto();
    this.locationService.updateNode(this.locationService.file);
    this.dataService.modify();
    this.notificationService.success('Grid saved');
  }

  keyboardEvents(): void {
    this.keySub = this.eventService.keydown.subscribe(event => {
      if (event.code === 'KeyS' && event.ctrlKey) {
        event.preventDefault();
        this.save();
      }
    });
  }

  tryBack(): void {
    this.checkSave(() => this.locationService.back());
  }

  tryClose(): void {
    this.checkSave(() => this.close());
  }

  tryPreview(): void {
    this.checkSave(() => this.preview());
  }

  compare(gridA: Uint8Array, gridB: Uint8Array): boolean {
    if (!gridA && !gridB) {
      return true;
    }
    if (
      ((!gridA || !gridA.length) && (gridB && gridB.length)) ||
      ((gridA && gridA.length) && (!gridB || !gridB.length))
    ) {
      return false;
    }
    if (gridA && gridA.length > 0) {
      if (gridA.length !== gridB.length) {
        return false;
      }
      let isSame: boolean = true;
      gridA.forEach((byteA, index) => {
        const byteB = gridB[index];
        if (byteA !== byteB) {
          isSame = false;
        }
      });
      return isSame;
    }
    return true;
  }

  checkSave(callback: Function): void {
    if (this.compare(this.locationService.file.block.binary, this.getProto())) {
      callback();
    } else {
      this.matDialog.open(ConfirmDialogComponent, {
        data: { message: 'You have unsaved progress. Close?' },
        autoFocus: false,
      }).afterClosed().subscribe(confirm => {
        if (confirm) {
          callback();
        }
      });
    }
  }

  checkModified(): void {
    this.timerSub = interval(1000).subscribe(() => {
      const isFileModified: boolean = !this.compare(
        this.locationService.file.block.binary,
        this.getProto(),
      );
      this.dataService.isFileModified = isFileModified;
    });
  }

  preview(): void {
    this.router.navigate(['/browser/grid']);
  }

  close(): void {
    this.locationService.updatePath(this.locationService.folder);
    this.router.navigate(['/browser']);
  }

  ngOnDestroy() {
    this.eventService.isEditing = false;
    this.dataService.isFileModified = false;
    this.keySub.unsubscribe();
    this.timerSub.unsubscribe();
  }
}
