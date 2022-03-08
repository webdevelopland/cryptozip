import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'add-dialog',
  templateUrl: './add-dialog.component.html',
  styleUrls: ['./add-dialog.component.scss'],
})
export class AddDialogComponent {
  constructor(
    private dialogRef: MatDialogRef<AddDialogComponent>,
  ) { }

  addFile(): void {
    this.dialogRef.close({ type: 'add-file' });
  }

  addFolder(): void {
    this.dialogRef.close({ type: 'add-folder' });
  }

  addGrid(): void {
    this.dialogRef.close({ type: 'add-grid' });
  }

  importFile(fileList: FileList): void {
    this.dialogRef.close({
      type: 'import-file',
      list: fileList
    });
  }

  importFolder(fileList: FileList): void {
    this.dialogRef.close({
      type: 'import-folder',
      list: fileList
    });
  }

  close(): void {
    this.dialogRef.close();
  }
}
