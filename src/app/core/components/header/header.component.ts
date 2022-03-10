import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';

import { NodeInfo } from '@/core/type';
import {
  DataService, EventService, LoadingService, NotificationService, ClipboardService, NodeService
} from '@/core/services';
import {
  PasswordDialogComponent, IdDialogComponent, ConfirmDialogComponent
} from '@/shared/dialogs';
import { HeaderService } from './header.service';
import { META } from '@/environments/meta';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
})
export class HeaderComponent {
  version: string = META.version;

  constructor(
    private router: Router,
    public dataService: DataService,
    public headerService: HeaderService,
    public loadingService: LoadingService,
    private eventService: EventService,
    private nodeService: NodeService,
    public notificationService: NotificationService,
    private clipboardService: ClipboardService,
    private matDialog: MatDialog,
  ) {
    this.keyboardEvents();
  }

  keyboardEvents(): void {
    this.eventService.keydown.subscribe(event => {
      if (event.code === 'KeyS' && event.ctrlKey) {
        event.preventDefault();
        this.headerService.save();
      }
    });
  }

  print(): void {
    console.log(this.dataService.data);
    this.headerService.isMenu = false;
  }

  clearClipboard(): void {
    this.clipboardService.clear();
    this.headerService.isMenu = false;
    this.notificationService.success('Clipboard cleared');
  }

  toggleMenu(): void {
    this.headerService.isMenu = !this.headerService.isMenu;
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
        this.notificationService.success('Saved');
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
    if (this.dataService.isModified) {
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

  exit(): void {
    this.dataService.destroy();
    this.router.navigate(['/']);
  }
}
