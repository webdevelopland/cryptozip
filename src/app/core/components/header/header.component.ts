import { Component, ViewChild, ElementRef } from '@angular/core';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { debounceTime } from 'rxjs';

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
  PasswordDialogComponent, IdDialogComponent, ConfirmDialogComponent, PowDialogComponent
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
      if (event.code === 'KeyS' && event.altKey) {
        event.preventDefault();
        this.askToSave();
      }
      if (event.code === 'KeyQ' && event.altKey) {
        event.preventDefault();
        this.clear();
      }
      this.headerService.close();
      this.headerService.sort.hide();
    });
    this.eventService.click
      .pipe(debounceTime(1))
      .subscribe(point => {
        this.headerService.menu.boxTest(point);
        this.headerService.sort.boxTest(point);
      });
    this.headerService.menu.subscribe();
    this.headerService.sort.subscribe();
  }

  print(): void {
    console.log(this.dataService.tree);
    this.headerService.close();
  }

  decrypt(): void {
    this.headerService.close();
    this.loadingService.add();
    setTimeout(() => {
      this.dataService.decryptAllFiles(true);
      this.loadingService.pop();
      this.notificationService.success('Decrypted');
    }, 0);
  }

  clear(): void {
    this.headerService.close();
    this.clipboardService.clear();
    this.notificationService.success('Clipboard cleared');
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
    const headerSize: number = 30; // [8, "CZIP2.46", pow, tree_size, rv]
    const treeSize: number = blocks[0].binary.length;
    nodeInfo.size += headerSize + treeSize;
    let extra: string = '';
    extra += 'Update version: ' + this.dataService.tree.meta.updateVersion + '\n';
    extra += 'Encryptor version: ' + this.dataService.tree.meta.encryptorVersion + '\n';
    extra += 'Modified: ';
    extra += (this.dataService.isModified || this.dataService.isFileModified).toString();
    this.dataService.fileChanges.next();
    this.nodeService.showProperties(
      nodeInfo,
      this.dataService.tree.meta.createdTimestamp,
      this.dataService.tree.meta.updatedTimestamp,
      extra,
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
      if (newPass !== undefined) {
        this.dataService.password = newPass;
        this.dataService.modify();
        this.notificationService.success('Updated: password');
      }
    });
  }

  openPowDialog(): void {
    this.headerService.close();
    this.matDialog.open(PowDialogComponent);
  }

  askToChangeId(): void {
    this.headerService.close();
    this.dataService.fileChanges.next();
    if (this.dataService.isFileModified) {
      this.matDialog.open(ConfirmDialogComponent, {
        data: { message: 'You have unsaved file. Do you want change id now?' },
        autoFocus: false,
      }).afterClosed().subscribe(confirm => {
        if (confirm) {
          this.openIdDialog();
        }
      });
    } else {
      this.openIdDialog();
    }
  }

  openIdDialog(): void {
    this.matDialog.open(IdDialogComponent).afterClosed().subscribe(newId => {
      if (newId) {
        const oldId: string = this.dataService.tree.meta.id;
        this.dataService.tree.meta.id = newId;
        this.dataService.tree.root.id = newId;
        this.dataService.tree.root.name = newId;
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

  askToUpdateKey(): void {
    this.headerService.close();
    this.matDialog.open(ConfirmDialogComponent, {
      data: { message: 'Update Write Key?' },
      autoFocus: false,
    }).afterClosed().subscribe(confirm => {
      if (confirm) {
        this.headerService.updateKey();
      }
    });
  }

  open(func: string): void {
    switch (func) {
      case 'clear': this.clear(); break;
      case 'askToRoot': this.askToRoot(); break;
      case 'changeId': this.askToChangeId(); break;
      case 'openPasswordDialog': this.openPasswordDialog(); break;
      case 'updateKey': this.askToUpdateKey(); break;
      case 'openPowDialog': this.openPowDialog(); break;
      case 'decrypt': this.decrypt(); break;
      case 'print': this.print(); break;
      case 'showProperties': this.showProperties(); break;
      case 'exportZip': this.exportZip(); break;
      case 'askToSave': this.askToSave(); break;
      case 'delete': this.delete(); break;
      case 'askToReload': this.askToReload(); break;
      case 'askToExit': this.askToExit(); break;
    }
  }
}
