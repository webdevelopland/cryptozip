import { Component, ViewChild, ElementRef } from '@angular/core';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';

import { NodeInfo } from '@/core/type';
import {
  DataService,
  EventService,
  LoadingService,
  NotificationService,
  ClipboardService,
  NodeService,
  SearchService,
} from '@/core/services';
import {
  PasswordDialogComponent, IdDialogComponent, ConfirmDialogComponent
} from '@/shared/dialogs';
import { HeaderService } from './header.service';
import { META } from '@/environments/meta';

interface Overlay {
  width: number;
  height: number;
  x: number;
  y: number;
}

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
})
export class HeaderComponent {
  version: string = META.version;
  overlay: Overlay;
  @ViewChild('menu') menuRef: ElementRef<HTMLDivElement>;

  constructor(
    private router: Router,
    public dataService: DataService,
    public headerService: HeaderService,
    public loadingService: LoadingService,
    private eventService: EventService,
    private nodeService: NodeService,
    public notificationService: NotificationService,
    private clipboardService: ClipboardService,
    private searchService: SearchService,
    private matDialog: MatDialog,
  ) {
    this.events();
  }

  events(): void {
    this.eventService.keydown.subscribe(event => {
      if (event.code === 'KeyS' && event.ctrlKey && !this.eventService.isEditing) {
        event.preventDefault();
        this.headerService.save();
      }
    });
    this.eventService.mouseup.subscribe(event => {
      if (this.overlay) {
        if (
          event.pageX < this.overlay.x || event.pageX > this.overlay.x + this.overlay.width ||
          event.pageY < this.overlay.y || event.pageY > this.overlay.y + this.overlay.height
        ) {
          this.headerService.isMenu = false;
        }
      } else {
        this.headerService.isMenu = false;
      }
    });
  }

  print(): void {
    console.log(this.dataService.data);
    this.headerService.isMenu = false;
  }

  search(): void {
    this.headerService.isMenu = false;
    this.headerService.search();
    this.router.navigate(['/browser/search']);
  }

  clearClipboard(): void {
    this.clipboardService.clear();
    this.headerService.isMenu = false;
    this.notificationService.success('Clipboard cleared');
  }

  toggleMenu(): void {
    this.headerService.isMenu = !this.headerService.isMenu;
    if (this.headerService.isMenu) {
      setTimeout(() => {
        this.setMenuOverlay();
      }, 0);
    }
  }

  setMenuOverlay(): void {
    if (this.menuRef.nativeElement) {
      this.overlay = {
        x: this.menuRef.nativeElement.offsetLeft,
        y: this.menuRef.nativeElement.offsetTop,
        width: this.menuRef.nativeElement.offsetWidth,
        height: this.menuRef.nativeElement.offsetHeight,
      };
    }
  }

  exportZip(): void {
    this.headerService.isMenu = false;
    this.matDialog.open(ConfirmDialogComponent, {
      data: { message: 'Export as zip?' },
      autoFocus: false,
    }).afterClosed().subscribe(confirm => {
      if (confirm) {
        this.headerService.export();
      }
    });
  }

  showProperties(): void {
    this.headerService.isMenu = false;
    const nodeInfo: NodeInfo = this.nodeService.getNodeInfo(this.dataService.data.root);
    this.nodeService.showProperties(
      nodeInfo,
      this.dataService.data.meta.createdTimestamp,
      this.dataService.data.meta.updatedTimestamp,
      'Modified: ' + (this.dataService.isModified || this.dataService.isFileModified).toString(),
    );
  }

  delete(): void {
    this.headerService.isMenu = false;
    this.matDialog.open(ConfirmDialogComponent, {
      data: { message: 'Delete from server cloud?' },
      autoFocus: false,
    }).afterClosed().subscribe(confirm => {
      if (confirm) {
        this.headerService.delete();
      }
    });
  }

  openPasswordDialog(): void {
    this.headerService.isMenu = false;
    this.matDialog.open(PasswordDialogComponent).afterClosed().subscribe(newPass => {
      if (newPass) {
        this.dataService.password = newPass;
        this.dataService.modify();
        this.notificationService.success('Password updated');
      }
    });
  }

  openIdDialog(): void {
    this.headerService.isMenu = false;
    this.matDialog.open(IdDialogComponent).afterClosed().subscribe(newId => {
      if (newId) {
        const oldId: string = this.dataService.id;
        this.dataService.id = newId;
        this.dataService.data.root.id = newId;
        this.dataService.data.root.name = newId;
        this.dataService.data.meta.id = newId;
        this.dataService.modify();
        this.headerService.update(oldId);
      }
    });
  }

  askToExit(): void {
    this.headerService.isMenu = false;
    if (this.dataService.isModified || this.dataService.isFileModified) {
      this.matDialog.open(ConfirmDialogComponent, {
        data: { message: 'You have unsaved progress. Close czip?' },
        autoFocus: false,
      }).afterClosed().subscribe(confirm => {
        if (confirm) {
          this.exit();
        }
      });
    } else {
      this.exit();
    }
  }

  askToSave(): void {
    this.headerService.isMenu = false;
    if (this.dataService.isFileModified) {
      this.matDialog.open(ConfirmDialogComponent, {
        data: { message: 'You have unsaved file. Save czip?' },
        autoFocus: false,
      }).afterClosed().subscribe(confirm => {
        if (confirm) {
          this.headerService.save();
        }
      });
    } else {
      this.headerService.save();
    }
  }

  exit(): void {
    this.headerService.isMenu = false;
    this.dataService.destroy();
    this.clipboardService.destroy();
    this.eventService.destroy();
    this.searchService.destroy();
    this.loadingService.destroy();
    this.notificationService.destroy();
    this.router.navigate(['/']);
  }
}
