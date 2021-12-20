import { Component, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';

import { DataService, MediaService } from '@/core/services';

@Component({
  selector: 'page-image',
  templateUrl: './image.component.html',
  styleUrls: ['./image.component.scss'],
})
export class ImageComponent implements OnDestroy {
  base64: string;

  constructor(
    public router: Router,
    public dataService: DataService,
    public mediaService: MediaService,
  ) {
    if (!this.dataService.file || !this.dataService.file.isBinary) {
      this.close();
    } else {
      this.updateBase64();
    }
  }

  updateBase64(): void {
    const mime: string = this.mediaService.getMime(this.dataService.file.name);
    this.base64 = `data:${mime};base64,` + this.uint8ArrayToBase64(this.dataService.file.binary);
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

  ngOnDestroy() {
    this.dataService.file = undefined;
  }
}
