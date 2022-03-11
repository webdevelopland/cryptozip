import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'context-dialog',
  templateUrl: './context-dialog.component.html',
  styleUrls: ['./context-dialog.component.scss'],
})
export class ContextDialogComponent {
  constructor(
    private dialogRef: MatDialogRef<ContextDialogComponent>,
  ) { }

  copy(): void {
    this.dialogRef.close('copy');
  }

  cut(): void {
    this.dialogRef.close('cut');
  }

  delete(): void {
    this.dialogRef.close('delete');
  }

  rename(): void {
    this.dialogRef.close('rename');
  }

  export(): void {
    this.dialogRef.close('export');
  }

  tags(): void {
    this.dialogRef.close('tags');
  }

  properties(): void {
    this.dialogRef.close('properties');
  }

  close(): void {
    this.dialogRef.close();
  }
}
