import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

import { DialogData } from '@/core/type';

@Component({
  selector: 'sort-dialog',
  templateUrl: './sort-dialog.component.html',
  styleUrls: ['./sort-dialog.component.scss'],
})
export class SortDialogComponent {
  sortBy: string;

  constructor(
    private dialogRef: MatDialogRef<SortDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public dialogData: DialogData,
  ) {
    switch (dialogData.message) {
      case 'az': this.sortBy = 'az'; break;
      case 'modified': this.sortBy = 'modified'; break;
      default: this.sortBy = 'default';
    }
  }

  az(): void {
    this.dialogRef.close('az');
  }

  modified(): void {
    this.dialogRef.close('modified');
  }

  default(): void {
    this.dialogRef.close('default');
  }

  close(): void {
    this.dialogRef.close();
  }
}
