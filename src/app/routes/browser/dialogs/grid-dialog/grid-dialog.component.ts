import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'grid-dialog',
  templateUrl: './grid-dialog.component.html',
  styleUrls: ['./grid-dialog.component.scss'],
})
export class GridDialogComponent {
  constructor(
    private dialogRef: MatDialogRef<GridDialogComponent>,
  ) { }

  addInput(): void {
    this.dialogRef.close({ type: 'add-input' });
  }

  addTextarea(): void {
    this.dialogRef.close({ type: 'add-textarea' });
  }

  addPassword(): void {
    this.dialogRef.close({ type: 'add-pwd' });
  }

  addTextblock(): void {
    this.dialogRef.close({ type: 'add-textblock' });
  }

  addHiddenblock(): void {
    this.dialogRef.close({ type: 'add-hiddenblock' });
  }

  close(): void {
    this.dialogRef.close();
  }
}
