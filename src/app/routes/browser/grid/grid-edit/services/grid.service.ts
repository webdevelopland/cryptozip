import { Injectable } from '@angular/core';
import { generatePassword, numerals, alphabet, Alphabet, special, dict64 } from 'rndmjs';

import * as Proto from 'src/proto';
import { Grid, GridType, GridRow } from '@/core/type';
import { UNICODE, EMOJI, SIMPLE_SMALL, SIMPLE_BIG, SIMPLE_INT, SHIFT_SPECIAL } from '@/core/type';
import { EncodingService } from '@/core/services';
import { getRandomBlock } from '@/core/functions';

@Injectable()
export class GridService {
  grid: Grid;

  constructor(
    private encodingService: EncodingService,
  ) { }

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

  generateKey(row: GridRow, lengthInput: string, dictLabel: string): void {
    const length: number = parseInt(lengthInput);
    if (dictLabel === 'base64') {
      row.value = this.encodingService.uint8ArrayToBase64(getRandomBlock(length));
      return;
    }
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
    this.grid = new Grid();
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
}
