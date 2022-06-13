import { Component } from '@angular/core';
import { Router } from '@angular/router';

import { DataService, MediaService, NotificationService, LocationService } from '@/core/services';

@Component({
  selector: 'page-video',
  templateUrl: './video.component.html',
  styleUrls: ['./video.component.scss'],
})
export class VideoComponent {
  base64: string;
  mime: string;

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
    if (this.locationService.file) {
      this.dataService.decryptFile(this.locationService.file);
      this.locationService.updateParent(this.locationService.file);
      this.updateBase64();
    } else {
      this.notificationService.error('Invalid image');
      this.locationService.cancel();
      this.close();
    }
  }

  updateBase64(): void {
    this.mime = this.mediaService.getMimeType(this.locationService.file.name);
    const base64: string = this.uint8ArrayToBase64(this.locationService.file.block.binary);
    this.base64 = `data:${this.mime};base64,` + base64;
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
