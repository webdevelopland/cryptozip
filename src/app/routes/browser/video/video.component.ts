import { Component, AfterViewInit, ViewChild, ElementRef, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';

import { LocationType } from '@/core/type';
import { DataService, MediaService, NotificationService, LocationService } from '@/core/services';
import { ControlsService } from 'browser/services';

@Component({
  selector: 'page-video',
  templateUrl: './video.component.html',
  styleUrls: ['./video.component.scss'],
})
export class VideoComponent implements AfterViewInit, OnDestroy {
  reloadSub = new Subscription();
  @ViewChild('video') video: ElementRef<HTMLVideoElement>;

  constructor(
    public router: Router,
    public dataService: DataService,
    public mediaService: MediaService,
    private notificationService: NotificationService,
    public locationService: LocationService,
    public controlsService: ControlsService,
  ) {
    this.reloadSub = this.locationService.fileChanges.subscribe(type => {
      if (type === LocationType.Video) {
        this.update();
      }
    });
  }

  ngAfterViewInit() {
    this.start();
  }

  start(): void {
    if (this.locationService.file) {
      this.update();
    } else {
      this.notificationService.error('Invalid video');
      this.locationService.cancel();
      this.close();
    }
  }

  update(): void {
    this.dataService.decryptFile(this.locationService.file);
    this.locationService.updateParent(this.locationService.file);
    this.updateSource();
  }

  updateSource(): void {
    const mime: string = this.mediaService.getMimeType(this.locationService.file.name);
    const base64: string = this.uint8ArrayToBase64(this.locationService.file.block.binary);
    this.video.nativeElement.src = `data:${mime};base64,` + base64;
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
