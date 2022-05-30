import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';

import { Popup } from '@/core/type';
import {
  DataService,
  ZipService,
  ServerService,
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
  loadSub = new Subscription();

  constructor(
    private router: Router,
    private dataService: DataService,
    private zipService: ZipService,
    private serverService: ServerService,
    private loadingService: LoadingService,
    private searchService: SearchService,
    private notificationService: NotificationService,
    private clipboardService: ClipboardService,
    private eventService: EventService,
    private locationService: LocationService,
  ) { }

  download(): void {
    this.close();
    this.loadingService.add();
    this.dataService.update();
    this.zipService.zip();
    this.loadingService.pop();
  }

  delete(): void {
    this.close();
    this.serverService.delete();
  }

  save(): void {
    this.loadingService.add();
    this.dataService.update();
    this.serverService.upload();
  }

  update(oldId: string): void {
    this.loadingService.add();
    this.dataService.update();
    this.serverService.rename(oldId, this.dataService.tree.meta.id);
  }

  updateKey(): void {
    this.close();
    this.dataService.updateWriteKey();
    this.dataService.modify();
    this.notificationService.success('Updated: Write Key');
  }

  root(): void {
    this.close();
    this.locationService.updatePath(this.dataService.tree.root);
    this.dataService.unselectAll();
    this.router.navigate(['/browser']);
  }

  reload(): void {
    this.loadingService.add();
    this.loadSub = this.serverService.load(this.dataService.tree.meta.id).subscribe(binary => {
      try {
        this.zipService.decrypt(binary, this.dataService.password);
        this.router.navigate(['/browser']);
        this.reloadServices();
        this.dataService.setTree(this.dataService.tree);
        this.loadingService.pop();
        this.notificationService.success('Reloaded');
      } catch (e) {
        if (e.message === 'Invalid password') {
          this.notificationService.warning('Wrong password');
        } else {
          this.notificationService.error('Error');
        }
        this.loadingService.pop();
      }
    }, () => {
      this.notificationService.warning('Not found');
      this.loadingService.pop();
    });
  }

  export(): void {
    this.close();
    this.zipService.export(this.dataService.tree.root, this.dataService.tree.meta.id);
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
    this.serverService.destroy();
    this.notificationService.destroy();
    this.loadSub.unsubscribe();
  }

  exit(): void {
    this.destroy();
    this.router.navigate(['/']);
  }
}
