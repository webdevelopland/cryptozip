import { Injectable } from '@angular/core';

import { round } from '@/core/functions';

@Injectable()
export class TimerService {
  checkpoints: Array<number>;
  isStarted: boolean;
  last: number;

  constructor() {
    this.restart();
  }

  restart(): void {
    this.checkpoints = [];
    this.isStarted = false;
  }

  start(): void {
    if (this.isStarted) return;
    this.isStarted = true;
    this.checkpoints.push(Date.now());
  }

  stop(): void {
    if (!this.isStarted) return;
    this.isStarted = false;
    this.checkpoints.push(Date.now());
  }

  ms(): number {
    const now: number = Date.now();
    let pauseTime = false;
    let ms = 0;
    for (const key in this.checkpoints) {
      const i: number = parseInt(key);
      if (pauseTime) {
        ms += this.checkpoints[i] - this.checkpoints[i - 1];
      }
      pauseTime = !pauseTime;
    }
    if (pauseTime) {
      ms += now - this.checkpoints[this.checkpoints.length - 1];
    }
    return ms;
  }

  s(): number {
    return round(this.ms() / 1000, 3);
  }

  delay(sec: number): number {
    if (!this.last) return 0;
    return round(sec - this.last, 3);
  }

  i(): string {
    const sec: number = this.s();
    const delay: number = this.delay(sec);

    let info: string = sec + '';
    if (this.last) info += ' (+' + delay + ') sec';
    this.last = sec;

    console.log(info);
    return info;
  }
}
