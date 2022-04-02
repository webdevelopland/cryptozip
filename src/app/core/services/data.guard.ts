import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';

import { DataService } from './data.service';

@Injectable()
export class DataGuard implements CanActivate {
  constructor(
    private router: Router,
    private dataService: DataService,
  ) { }

  canActivate(): boolean {
    if (!this.dataService.isDecrypted) {
      this.dataService.destroy();
      this.router.navigate(['/']);
    }
    return this.dataService.isDecrypted;
  }
}
