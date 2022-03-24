import { Component, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { Subscription, interval } from 'rxjs';
import { generatePassword, numerals, alphabet, Alphabet, special, dict64 } from 'rndmjs';

import { Grid, GridType, GridRow } from '@/core/type';
import { DataService, NotificationService, EventService } from '@/core/services';
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

  constructor(
    public router: Router,
    public dataService: DataService,
    private notificationService: NotificationService,
    private eventService: EventService,
    private matDialog: MatDialog,
  ) {
    this.eventService.isEditing = true;
    if (this.dataService.file) {
      try {
        if (this.dataService.file.text) {
          this.loadJSON(JSON.parse(this.dataService.file.text));
        }
      } catch (e) {
        this.notificationService.error('Grid invalid');
        this.close();
      }
    } else {
      this.close();
    }
    this.keyboardEvents();
    this.checkModified();
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
    row.type = GridType.Input;
    this.grid.rows.push(row);
  }

  addTextarea(): void {
    const row = new GridRow();
    row.type = GridType.Textarea;
    this.grid.rows.push(row);
  }

  addPassword(): void {
    const row = new GridRow();
    row.label = 'password';
    row.type = GridType.Password;
    this.grid.rows.push(row);
  }

  addTextblock(): void {
    const row = new GridRow();
    row.type = GridType.Textblock;
    this.grid.rows.push(row);
  }

  addHiddenblock(): void {
    const row = new GridRow();
    row.type = GridType.Hiddenblock;
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

  loadJSON(jsonGrid: any): void {
    if (jsonGrid && jsonGrid.rows && jsonGrid.rows.length > 0) {
      jsonGrid.rows.forEach(jsonRow => {
        const row = new GridRow();
        row.type = jsonRow.type;
        row.label = jsonRow.label;
        row.value = jsonRow.value;
        this.grid.rows.push(row);
      });
    }
  }

  getJSON(): string {
    const jsonGrid = { rows: [] };
    jsonGrid.rows = this.grid.rows.map(row => {
      return {
        type: row.type,
        label: row.label,
        value: row.value,
      };
    });
    return JSON.stringify(jsonGrid);
  }

  save(): void {
    this.dataService.file.text = this.getJSON();
    this.dataService.updateNode(this.dataService.file);
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

  tryClose(): void {
    this.checkSave(() => this.close());
  }

  tryPreview(): void {
    this.checkSave(() => this.preview());
  }

  checkSave(callback: Function): void {
    if (this.dataService.file.text === this.getJSON()) {
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
      let isFileModified: boolean;
      if (!this.dataService.file.text && this.grid.rows.length === 0) {
        isFileModified = false;
      } else {
        isFileModified = this.getJSON() !== this.dataService.file.text;
      }
      this.dataService.isFileModified = isFileModified;
    });
  }

  preview(): void {
    this.router.navigate(['/browser/grid']);
  }

  close(): void {
    this.router.navigate(['/browser']);
  }

  ngOnDestroy() {
    this.eventService.isEditing = false;
    this.dataService.isFileModified = false;
    this.keySub.unsubscribe();
    this.timerSub.unsubscribe();
  }
}
