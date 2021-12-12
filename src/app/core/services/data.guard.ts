import { Injectable } from '@angular/core';
import { CanActivate } from '@angular/router';

import { DataService } from './data.service';

@Injectable()
export class DataGuard implements CanActivate {
  constructor(
    private dataService: DataService,
  ) { }

  canActivate(): boolean {
    if (!this.dataService.isDecrypted) {
      this.dataService.destroy();
    }
    return this.dataService.isDecrypted;
  }
}
