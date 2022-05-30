import { Injectable } from '@angular/core';

@Injectable()
export class LoadingService {
  loads: number = 0;

  add(): void {
    this.loads++;
  }

  pop(): void {
    this.loads--;
    if (this.loads < 0) {
      this.loads = 0;
      console.error('Loads < 0');
    }
  }

  destroy(): void {
    this.loads = 0;
  }
}
