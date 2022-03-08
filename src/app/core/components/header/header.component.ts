import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';

import {
  DataService, EventService, LoadingService, NotificationService, ClipboardService
} from '@/core/services';
import { PasswordDialogComponent } from '@/shared/dialogs';
import { HeaderService } from './header.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
})
export class HeaderComponent {
  constructor(
    private router: Router,
    public dataService: DataService,
    public headerService: HeaderService,
    public loadingService: LoadingService,
    private eventService: EventService,
    public notificationService: NotificationService,
    private clipboardService: ClipboardService,
    private matDialog: MatDialog,
  ) { }

  exit(): void {
    this.headerService.isMenu = false;
    this.dataService.destroy();
    this.router.navigate(['/']);
  }

  print(): void {
    console.log(this.dataService.data);
    this.headerService.isMenu = false;
  }

  clearClipboard(): void {
    this.clipboardService.clear();
    this.headerService.isMenu = false;
  }

  toggleMenu(): void {
    this.headerService.isMenu = !this.headerService.isMenu;
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
}
