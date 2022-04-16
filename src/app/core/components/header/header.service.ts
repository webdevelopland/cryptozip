import { Injectable } from '@angular/core';
import { Router } from '@angular/router';

import { Popup } from '@/core/type';
import {
  DataService,
  ZipService,
  FirebaseService,
  LoadingService,
  SearchService,
  NotificationService,
  ClipboardService,
  EventService,
  LocationService,
} from '@/core/services';

const SORT_TOP = 138;

@Injectable()
export class HeaderService {
  isSortGlobal: boolean;
  sortTop: number = SORT_TOP;
  menu = new Popup();
  sort = new Popup();

  constructor(
    private router: Router,
    private dataService: DataService,
    private zipService: ZipService,
    private firebaseService: FirebaseService,
    private loadingService: LoadingService,
    private searchService: SearchService,
    private notificationService: NotificationService,
    private clipboardService: ClipboardService,
    private eventService: EventService,
    private locationService: LocationService,
  ) { }

  download(): void {
    this.close();
    this.loadingService.loads++;
    this.dataService.update();
    setTimeout(() => {
      this.zipService.zip();
      this.loadingService.loads--;
    }, 0);
  }

  delete(): void {
    this.close();
    this.firebaseService.remove(this.dataService.tree.meta.id);
  }

  save(): void {
    this.loadingService.loads++;
    this.dataService.update();
    setTimeout(() => {
      this.firebaseService.upload(this.dataService.tree.meta.id);
    }, 0);
  }

  update(oldId: string): void {
    this.loadingService.loads++;
    this.firebaseService.replace(this.dataService.tree.meta.id, oldId);
  }

  root(): void {
    this.close();
    this.locationService.updatePath(this.dataService.tree.root);
    this.dataService.unselectAll();
    this.router.navigate(['/browser']);
  }

  reload(): void {
    this.loadingService.loads++;
    this.firebaseService.download(this.dataService.tree.meta.id).subscribe(binary => {
      try {
        this.zipService.decrypt(binary, this.dataService.password);
        this.router.navigate(['/browser']);
        this.reloadServices();
        this.dataService.setTree(this.dataService.tree);
        this.loadingService.loads--;
        this.notificationService.success('Reloaded');
      } catch (e) {
        if (e.message === 'Invalid password') {
          this.notificationService.warning('Wrong password');
        } else {
          this.notificationService.error('Error');
        }
        this.loadingService.loads--;
      }
    }, () => {
      this.notificationService.warning('Not found');
      this.loadingService.loads--;
    });
  }

  export(): void {
    this.close();
    setTimeout(() => {
      this.zipService.export(this.dataService.tree.root, this.dataService.tree.meta.id);
    }, 0);
  }

  resetSortTop(): void {
    this.sortTop = SORT_TOP;
  }

  resetPopup(): void {
    this.menu.destroy();
    this.sort.destroy();
    this.menu.subscribe();
    this.sort.subscribe();
  }

  sortAll(): void {
    this.isSortGlobal = true;
    this.sort.click();
  }

  close(): void {
    this.menu.hide();
  }

  reloadServices(): void {
    this.resetPopup();
    this.resetSortTop();
    this.isSortGlobal = undefined;
    this.dataService.reload();
    this.clipboardService.destroy();
    this.eventService.destroy();
    this.searchService.destroy();
    this.locationService.destroy();
  }

  destroy(): void {
    this.reloadServices();
    this.dataService.destroy();
    this.loadingService.destroy();
    this.notificationService.destroy();
  }

  exit(): void {
    this.destroy();
    this.router.navigate(['/']);
  }
}
