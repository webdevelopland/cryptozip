import { Component, Inject, ViewChild, ElementRef, AfterViewInit, OnDestroy } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Subscription } from 'rxjs';

import { EventService, NotificationService, DataService, LocationService } from '@/core/services';
import { Node } from '@/core/type';
import { getName } from '@/core/functions';
import { GetService } from 'browser/services/get.service';

@Component({
  selector: 'rename-dialog',
  templateUrl: './rename-dialog.component.html',
  styleUrls: ['./rename-dialog.component.scss'],
})
export class RenameDialogComponent implements AfterViewInit, OnDestroy {
  newName: string;
  keySub = new Subscription();
  @ViewChild('input') input: ElementRef<HTMLInputElement>;

  constructor(
    private dialogRef: MatDialogRef<RenameDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public node: Node,
    private eventService: EventService,
    private notificationService: NotificationService,
    private getService: GetService,
    private dataService: DataService,
    private locationService: LocationService,
  ) {
    this.eventService.isDialog = true;
    this.newName = node.name;
    this.subscribeOnKeydown();
  }

  ngAfterViewInit() {
    // Select node name
    const name: string = getName(this.node.name, this.node.isFolder);
    this.input.nativeElement.value = this.newName;
    this.input.nativeElement.setSelectionRange(0, name.length);
  }

  private subscribeOnKeydown(): void {
    this.keySub = this.eventService.keydown.subscribe((event: KeyboardEvent) => {
      switch (event.key) {
        case 'Enter': this.check();
      }
    });
  }

  private rename(): void {
    this.dialogRef.close(this.newName);
  }

  check(): void {
    if (!this.newName || !this.newName.trim()) {
      this.close();
    } else {
      this.checkSlash();
    }
  }

  private checkSlash(): void {
    if (this.hasForbiddenChars(this.newName)) {
      this.notificationService.warning('Forbidden chars: /, \\, <, >, :, ", |, ?, *');
    } else {
      this.checkNoChange();
    }
  }

  hasForbiddenChars(name: string): boolean {
    for (const char of ['/', '\\', '<', '>', ':', '"', '|', '?', '*']) {
      if (name.includes(char)) {
        return true;
      }
    }
    return false;
  }

  private checkNoChange(): void {
    if (this.newName === this.node.name) {
      this.close();
    } else {
      this.checkAlreadyExists();
    }
  }

  private checkAlreadyExists(): void {
    const nodes: Node[] = this.locationService.folder.nodes
      .filter(node => node.id !== this.node.id);
    if (this.getService.checkNodeAlreadyExists(this.newName, nodes)) {
      this.notificationService.warning('"' + this.newName + '" already exists');
    } else {
      this.rename();
    }
  }

  close(): void {
    this.dialogRef.close();
  }

  ngOnDestroy() {
    this.keySub.unsubscribe();
    this.eventService.isDialog = false;
  }
}
