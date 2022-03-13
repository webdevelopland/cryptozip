import { Injectable } from '@angular/core';

import {
  DataService, ZipService, FirebaseService, LoadingService, SearchService
} from '@/core/services';

@Injectable()
export class HeaderService {
  isMenu: boolean = false;

  constructor(
    private dataService: DataService,
    private zipService: ZipService,
    private firebaseService: FirebaseService,
    private loadingService: LoadingService,
    private searchService: SearchService,
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
    this.isMenu = false;
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

  export(): void {
    this.isMenu = false;
    setTimeout(() => {
      this.zipService.export(this.dataService.data.root, this.dataService.id);
    }, 0);
  }
}
