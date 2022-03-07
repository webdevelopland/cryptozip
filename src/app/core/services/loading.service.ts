import { Injectable } from '@angular/core';

@Injectable()
export class LoadingService {
  loads: number = 0;

  destroy(): void {
    this.loads = 0;
  }
}
