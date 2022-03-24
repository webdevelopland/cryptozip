import { Injectable } from '@angular/core';
import { Router } from '@angular/router';

import {
  DataService,
  ZipService,
  FirebaseService,
  LoadingService,
  SearchService,
  NotificationService,
  ClipboardService,
  EventService,
} from '@/core/services';

@Injectable()
export class HeaderService {
  isMenu: boolean = false;

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
  ) { }

  search(): void {
    this.searchService.folder = this.dataService.folder;
    this.searchService.where = this.dataService.folder.path;
    this.searchService.what = '';
    this.searchService.tagString = '';
    this.searchService.tags = [];
  }

  download(): void {
    this.isMenu = false;
    this.loadingService.loads++;
    this.dataService.update();
    setTimeout(() => {
      this.zipService.zip();
      this.loadingService.loads--;
    }, 0);
  }

  delete(): void {
    this.isMenu = false;
    this.firebaseService.remove(this.dataService.data.meta.id);
  }

  save(): void {
    this.loadingService.loads++;
    this.dataService.update();
    setTimeout(() => {
      this.firebaseService.upload(this.dataService.data.meta.id);
    }, 0);
  }

  update(oldId: string): void {
    this.loadingService.loads++;
    this.firebaseService.replace(this.dataService.data.meta.id, oldId);
  }

  reload(): void {
    this.loadingService.loads++;
    this.firebaseService.download(this.dataService.id).subscribe(binary => {
      try {
        const password: string = this.dataService.password;
        this.zipService.unpack(binary, password);
        const data = this.dataService.data;
        this.router.navigate(['/browser']);
        this.destroy();
        this.dataService.setData(data);
        this.dataService.password = password;
        this.loadingService.loads--;
        this.notificationService.success('Reloaded');
      } catch (e) {
        this.notificationService.warning('Wrong password');
        this.loadingService.loads--;
      }
    }, () => {
      this.notificationService.warning('Not found');
      this.loadingService.loads--;
    });
  }

  export(): void {
    this.isMenu = false;
    setTimeout(() => {
      this.zipService.export(this.dataService.data.root, this.dataService.id);
    }, 0);
  }

  destroy(): void {
    this.isMenu = false;
    this.dataService.destroy();
    this.clipboardService.destroy();
    this.eventService.destroy();
    this.searchService.destroy();
    this.loadingService.destroy();
    this.notificationService.destroy();
  }

  exit(): void {
    this.destroy();
    this.router.navigate(['/']);
  }
}
