import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { randvalue, randstr } from 'rndmjs';
import { Subject, Subscription } from 'rxjs';

import { Data } from '@/core/type';

@Injectable()
export class DataService {
  isDecrypted: boolean = false;
  id: string;
  password: string;
  data: Data;
  exitChanges = new Subject<void>();

  constructor(private router: Router) { }

  destroy(): void {
    this.isDecrypted = false;
    this.id = undefined;
    this.password = undefined;
    this.data = undefined;
    this.router.navigate(['/']);
    this.exitChanges.next();
  }

  update(): void {
    this.data.meta.updateVersion++;
    this.data.meta.updatedTimestamp = Date.now();
  }
}
