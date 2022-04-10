import { Component, ViewChild, ElementRef } from '@angular/core';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { debounceTime, Subject } from 'rxjs';

import { NodeInfo, BinaryBlock } from '@/core/type';
import {
  DataService,
  EventService,
  LoadingService,
  NotificationService,
  ClipboardService,
  NodeService,
  SearchService,
  LocationService,
  ProtoService,
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
  menuClick = new Subject<void>();
  @ViewChild('menu') menuRef: ElementRef<HTMLDivElement>;

  constructor(
    private router: Router,
    private matDialog: MatDialog,
    public dataService: DataService,
    public headerService: HeaderService,
    public loadingService: LoadingService,
    private eventService: EventService,
    private nodeService: NodeService,
    public notificationService: NotificationService,
    private clipboardService: ClipboardService,
    private searchService: SearchService,
    private locationService: LocationService,
    private protoService: ProtoService,
  ) {
    this.events();
  }

  events(): void {
    this.eventService.keydown.subscribe(event => {
      if (event.code === 'KeyS' && event.ctrlKey && !this.eventService.isEditing) {
        event.preventDefault();
        this.headerService.save();
      }
      if (event.code === 'KeyQ' && event.altKey) {
        event.preventDefault();
        this.clear();
      }
      this.headerService.close();
      this.headerService.isSortPopup = false;
    });
    this.eventService.click
      .pipe(debounceTime(1))
      .subscribe(point => {
        if (this.headerService.menuOverlay) {
          if (this.eventService.boxTest(point, this.headerService.menuOverlay)) {
            this.headerService.close();
          }
        }
        if (this.headerService.sortOverlay) {
          if (this.eventService.boxTest(point, this.headerService.sortOverlay)) {
            this.headerService.isSortPopup = false;
          }
        }
      });
    this.menuClick
      .pipe(debounceTime(10))
      .subscribe(() => {
        this.headerService.isMenu = true;
        setTimeout(() => {
          this.setMenuOverlay();
        }, 0);
      });
    this.headerService.sortClick
      .pipe(debounceTime(10))
      .subscribe(() => {
        this.headerService.isSortPopup = true;
      });
  }

  toggleMenu(): void {
    if (!this.headerService.isMenu) {
      this.menuClick.next();
    }
  }

  print(): void {
    console.log(this.dataService.tree);
    this.headerService.close();
  }

  decrypt(): void {
    this.headerService.close();
    this.loadingService.loads++;
    setTimeout(() => {
      this.dataService.decryptAllFiles(true);
      this.loadingService.loads--;
      this.notificationService.success('Decrypted');
    }, 0);
  }

  sort(): void {
    this.headerService.isSortGlobal = true;
    this.headerService.isSortSelected = !this.headerService.isSortPopup;
    if (!this.headerService.isSortPopup) {
      this.headerService.sortClick.next();
    }
  }

  clear(): void {
    this.headerService.close();
    this.clipboardService.clear();
    this.notificationService.success('Clipboard cleared');
  }

  setMenuOverlay(): void {
    if (this.menuRef && this.menuRef.nativeElement) {
      this.headerService.menuOverlay = {
        point: {
          x: this.menuRef.nativeElement.offsetLeft,
          y: this.menuRef.nativeElement.offsetTop,
        },
        width: this.menuRef.nativeElement.offsetWidth,
        height: this.menuRef.nativeElement.offsetHeight,
      };
    }
  }

  exportZip(): void {
    this.headerService.close();
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
    this.headerService.close();
    const nodeInfo: NodeInfo = this.nodeService.getNodeInfo(this.dataService.tree.root);
    const blocks: BinaryBlock[] = this.protoService.getProto();
    const headerSize: number = 28; // [8, "CZIP2.46", tree_size, rv]
    const treeSize: number = blocks[0].binary.length;
    nodeInfo.size += headerSize + treeSize;
    this.dataService.fileChanges.next();
    this.nodeService.showProperties(
      nodeInfo,
      this.dataService.tree.meta.createdTimestamp,
      this.dataService.tree.meta.updatedTimestamp,
      'Modified: ' + (this.dataService.isModified || this.dataService.isFileModified).toString(),
    );
  }

  delete(): void {
    this.headerService.close();
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
    this.headerService.close();
    this.matDialog.open(PasswordDialogComponent).afterClosed().subscribe(newPass => {
      if (newPass) {
        this.dataService.password = newPass;
        this.dataService.modify();
        this.notificationService.success('Password updated');
      }
    });
  }

  openIdDialog(): void {
    this.headerService.close();
    this.matDialog.open(IdDialogComponent).afterClosed().subscribe(newId => {
      if (newId) {
        const oldId: string = this.dataService.id;
        this.dataService.id = newId;
        this.dataService.tree.root.id = newId;
        this.dataService.tree.root.name = newId;
        this.dataService.tree.meta.id = newId;
        this.dataService.modify();
        this.headerService.update(oldId);
      }
    });
  }

  askToRoot(): void {
    this.headerService.close();
    this.dataService.fileChanges.next();
    if (this.eventService.isEditing && this.dataService.isFileModified) {
      this.matDialog.open(ConfirmDialogComponent, {
        data: { message: 'You have unsaved file. Open root?' },
        autoFocus: false,
      }).afterClosed().subscribe(confirm => {
        if (confirm) {
          this.headerService.root();
        }
      });
    } else {
      this.headerService.root();
    }
  }

  askToExit(): void {
    this.headerService.close();
    this.dataService.fileChanges.next();
    if (this.dataService.isModified || this.dataService.isFileModified) {
      this.matDialog.open(ConfirmDialogComponent, {
        data: { message: 'You have unsaved progress. Close czip?' },
        autoFocus: false,
      }).afterClosed().subscribe(confirm => {
        if (confirm) {
          this.headerService.exit();
        }
      });
    } else {
      this.headerService.exit();
    }
  }

  askToSave(): void {
    this.headerService.close();
    this.dataService.fileChanges.next();
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

  askToReload(): void {
    this.headerService.close();
    this.dataService.fileChanges.next();
    if (this.dataService.isModified || this.dataService.isFileModified) {
      this.matDialog.open(ConfirmDialogComponent, {
        data: { message: 'You have unsaved progress. Reload czip?' },
        autoFocus: false,
      }).afterClosed().subscribe(confirm => {
        if (confirm) {
          this.headerService.reload();
        }
      });
    } else {
      this.headerService.reload();
    }
  }
}
