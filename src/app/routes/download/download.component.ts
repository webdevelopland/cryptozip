import { Component } from '@angular/core';
import { Router, Params } from '@angular/router';

import { DataService, UrlService } from '@/core/services';

@Component({
  selector: 'page-download',
  templateUrl: './download.component.html',
  styleUrls: ['./download.component.scss'],
})
export class DownloadComponent {
  id: string = '';

  constructor(
    private router: Router,
    private dataService: DataService,
    private urlService: UrlService,
  ) {
    const params: Params = this.urlService.getParam();
    if (params.id) {
      this.id = params.id;
      this.download();
    }
  }

  download(): void {
    console.log('download: ' + this.id);
  }
}
