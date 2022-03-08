import { Component, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { Subscription } from 'rxjs';
import { randCustomString, numerals, alphabet, Alphabet, dict64 } from 'rndmjs';

import { Grid, GridType, GridRow } from '@/core/type';
import { DataService, NotificationService, EventService } from '@/core/services';
import { GridDialogComponent } from '../../dialogs';

@Component({
  selector: 'page-grid-edit',
  templateUrl: './grid-edit.component.html',
  styleUrls: ['./grid-edit.component.scss'],
})
export class GridEditComponent implements OnDestroy {
  grid = new Grid();
  keySub = new Subscription();

  constructor(
    public router: Router,
    public dataService: DataService,
    private notificationService: NotificationService,
    private eventService: EventService,
    private matDialog: MatDialog,
  ) {
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
  }

  add(): void {
    this.matDialog.open(GridDialogComponent, { panelClass: 'context-dialog' })
      .afterClosed().subscribe(res => {
        switch (res.type) {
          case 'add-input': this.addInput(); break;
          case 'add-textarea': this.addTextarea(); break;
          case 'add-pwd': this.addPassword(); break;
          case 'add-textblock': this.addTextblock(); break;
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
    row.type = GridType.Password;
    this.grid.rows.push(row);
  }

  addTextblock(): void {
    const row = new GridRow();
    row.type = GridType.Textblock;
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

  generateKey(row: GridRow, length: string, dictLabel: string): void {
    const special: string[] = ['!', '@', '#', '$', '%', '^', '&', '*', '(', ')', '=', '+'];
    const extra: string[] = ['/', '\\', '[', ']', '.', ';', ':', '`', '"', "'", ',', '<', '>', '?'];
    const unicode: string[] = ['©', '®', '™', '∞', '€', '♂', '♀', '⌘', '±'];
    const emoji: string[] = ['😎', '🤓', '🧐', '😛', '🙂', '💩', ' 😭'];
    let dict: string[];
    switch (dictLabel) {
      case 'number': dict = numerals; break;
      case 'small_text': dict = alphabet; break;
      case 'small_text_number': dict = alphabet.concat(numerals); break;
      case 'mixed_text_number': dict = Alphabet.concat(alphabet, numerals); break;
      case 'mixed_text_number_64': dict = dict64; break;
      case 'mixed_text_number_special': dict = dict64.concat(special); break;
      case 'extra': dict = dict64.concat(special, extra); break;
      case 'unicode': dict = dict64.concat(unicode); break;
      case 'emoji': dict = dict64.concat(emoji); break;
      case 'max': dict = dict64.concat(special, extra, unicode, emoji); break;

      default: dict = dict64;
    }
    row.value = randCustomString(dict, parseInt(length));
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

  saveJSON(): void {
    const jsonGrid = { rows: [] };
    jsonGrid.rows = this.grid.rows.map(row => {
      return {
        type: row.type,
        label: row.label,
        value: row.value,
      };
    });
    this.dataService.file.text = JSON.stringify(jsonGrid);
  }

  save(): void {
    this.saveJSON();
    this.notificationService.success('Saved');
  }

  keyboardEvents(): void {
    this.keySub = this.eventService.keydown.subscribe(event => {
      if (event.code === 'KeyS' && event.ctrlKey) {
        event.preventDefault();
        this.save();
      }
    });
  }
  close(): void {
    this.dataService.file = undefined;
    this.router.navigate(['/browser']);
  }

  ngOnDestroy() {
    this.keySub.unsubscribe();
  }
}
