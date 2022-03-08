import { Injectable } from '@angular/core';

import { DataService, ZipService, FirebaseService, LoadingService } from '@/core/services';

@Injectable()
export class HeaderService {
  isMenu: boolean = false;

  constructor(
    private dataService: DataService,
    private zipService: ZipService,
    private firebaseService: FirebaseService,
    private loadingService: LoadingService,
  ) { }

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

  export(): void {
    this.isMenu = false;
    setTimeout(() => {
      this.zipService.export(this.dataService.data.root, this.dataService.id);
    }, 0);
  }
}
