import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable()
export class HeaderService {
  isMenu: boolean = false;
  editChanges = new Subject<void>();
  downloadChanges = new Subject<void>();
  deleteChanges = new Subject<void>();
  saveChanges = new Subject<void>();
  exportChanges = new Subject<void>();

  edit(): void {
    this.editChanges.next();
    this.isMenu = false;
  }

  download(): void {
    this.downloadChanges.next();
    this.isMenu = false;
  }

  delete(): void {
    this.deleteChanges.next();
    this.isMenu = false;
  }

  save(): void {
    this.saveChanges.next();
    this.isMenu = false;
  }

  export(): void {
    this.exportChanges.next();
    this.isMenu = false;
  }
}
