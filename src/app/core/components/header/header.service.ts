import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';

import { Tree, Overlay } from '@/core/type';
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
  isMenu: boolean = false;
  isSortSelected: boolean = false;
  isSortPopup: boolean = false;
  isSortGlobal: boolean;
  menuOverlay: Overlay;
  sortOverlay: Overlay;
  sortTop: number = SORT_TOP;
  sortClick = new Subject<void>();

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
    this.firebaseService.download(this.dataService.id).subscribe(binary => {
      try {
        const password: string = this.dataService.password;
        this.zipService.decrypt(binary, password);
        const tree: Tree = this.dataService.tree;
        const blocks: Uint8Array = this.dataService.blocks;
        this.router.navigate(['/browser']);
        this.destroy();
        this.dataService.setTree(tree);
        this.dataService.blocks = blocks;
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
    this.close();
    setTimeout(() => {
      this.zipService.export(this.dataService.tree.root, this.dataService.id);
    }, 0);
  }

  resetSortTop(): void {
    this.sortTop = SORT_TOP;
  }

  close(): void {
    this.isMenu = false;
    this.isSortSelected = false;
  }

  destroy(): void {
    this.isMenu = false;
    this.isSortSelected = false;
    this.isSortPopup = false;
    this.isSortGlobal = undefined;
    this.menuOverlay = undefined;
    this.sortOverlay = undefined;
    this.dataService.destroy();
    this.clipboardService.destroy();
    this.eventService.destroy();
    this.searchService.destroy();
    this.loadingService.destroy();
    this.notificationService.destroy();
    this.locationService.destroy();
    this.resetSortTop();
  }

  exit(): void {
    this.destroy();
    this.router.navigate(['/']);
  }
}
