import { Component } from '@angular/core';
import { Router } from '@angular/router';

import { DataService, MediaService, NotificationService, LocationService } from '@/core/services';

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
    public locationService: LocationService,
  ) {
    this.start();
  }

  start(): void {
    if (!this.locationService.file || !this.locationService.file.isBinary) {
      this.notificationService.error('Invalid image');
      this.locationService.cancel();
      this.close();
    } else {
      this.dataService.decryptFile(this.locationService.file);
      this.locationService.updateParent(this.locationService.file);
      this.updateBase64();
    }
  }

  updateBase64(): void {
    const mime: string = this.mediaService.getMimeType(this.locationService.file.name);
    const base64: string = this.uint8ArrayToBase64(this.locationService.file.block.binary);
    this.base64 = `data:${mime};base64,` + base64;
  }

  // Converts uint8array binary to base64 string
  uint8ArrayToBase64(binary: Uint8Array): string {
    return btoa(new Uint8Array(binary).reduce((data, byte) => {
      return data + String.fromCharCode(byte);
    }, ''));
  }

  close(): void {
    this.locationService.updatePath(this.locationService.folder);
    this.router.navigate(['/browser']);
  }
}
