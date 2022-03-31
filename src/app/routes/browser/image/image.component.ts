import { Component } from '@angular/core';
import { Router } from '@angular/router';

import { DataService, MediaService, NotificationService } from '@/core/services';

@Component({
  selector: 'page-image',
  templateUrl: './image.component.html',
  styleUrls: ['./image.component.scss'],
})
export class ImageComponent {
  base64: string;

  constructor(
    public router: Router,
    public dataService: DataService,
    public mediaService: MediaService,
    private notificationService: NotificationService,
  ) {
    this.start();
  }

  start(): void {
    if (!this.dataService.file || !this.dataService.file.isBinary) {
      this.notificationService.error('Invalid image');
      this.close();
    } else {
      this.dataService.decryptThisFile();
      this.updateBase64();
    }
  }

  updateBase64(): void {
    const mime: string = this.mediaService.getMime(this.dataService.file.name);
    const base64: string = this.uint8ArrayToBase64(this.dataService.file.block.binary);
    this.base64 = `data:${mime};base64,` + base64;
  }

  // Converts uint8array binary to base64 string
  uint8ArrayToBase64(binary: Uint8Array): string {
    return btoa(new Uint8Array(binary).reduce((data, byte) => {
      return data + String.fromCharCode(byte);
    }, ''));
  }

  close(): void {
    this.router.navigate(['/browser']);
  }
}
