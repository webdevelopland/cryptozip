import { Component, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';

import { LocationType } from '@/core/type';
import { DataService, MediaService, NotificationService, LocationService } from '@/core/services';
import { ControlsService } from 'browser/services';

@Component({
  selector: 'page-image',
  templateUrl: './image.component.html',
  styleUrls: ['./image.component.scss'],
})
export class ImageComponent implements OnDestroy {
  base64: string;
  reloadSub = new Subscription();

  constructor(
    public router: Router,
    public dataService: DataService,
    public mediaService: MediaService,
    private notificationService: NotificationService,
    public locationService: LocationService,
    public controlsService: ControlsService,
  ) {
    this.start();
    this.reloadSub = this.locationService.fileChanges.subscribe(type => {
      if (type === LocationType.Image) {
        this.update();
      }
    });
  }

  start(): void {
    if (this.locationService.file) {
      this.update();
    } else {
      this.notificationService.error('Invalid image');
      this.locationService.cancel();
      this.close();
    }
  }

  update(): void {
    this.dataService.decryptFile(this.locationService.file);
    this.locationService.updateParent(this.locationService.file);
    this.updateBase64();
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

  ngOnDestroy() {
    this.reloadSub.unsubscribe();
  }
}
