import { Component, AfterViewInit, ViewChild, ElementRef } from '@angular/core';

import { SearchService, DataService, LocationService } from '@/core/services';
import { HeaderService } from '@/core/components/header';

@Component({
  selector: 'sort-popup',
  templateUrl: './sort-popup.component.html',
  styleUrls: ['./sort-popup.component.scss'],
})
export class SortPopupComponent implements AfterViewInit {
  sortBy: string;
  @ViewChild('popup') popupRef: ElementRef<HTMLDivElement>;

  constructor(
    private dataService: DataService,
    private searchService: SearchService,
    private locationService: LocationService,
    public headerService: HeaderService,
  ) {
    if (!this.headerService.isSortGlobal) {
      this.sortBy = this.locationService.folder.sortBy;
      this.sortBy = this.sortBy || 'default';
    }
  }

  ngAfterViewInit() {
    this.popupRef.nativeElement.style.top = this.headerService.sort.overlay.point.y + 'px';
    this.popupRef.nativeElement.style.left = this.headerService.sort.overlay.point.x + 'px';
    this.headerService.sort.overlay = {
      point: this.headerService.sort.overlay.point,
      width: this.popupRef.nativeElement.offsetWidth,
      height: this.popupRef.nativeElement.offsetHeight,
    };
  }

  select(sortBy: string): void {
    if (this.headerService.isSortGlobal) {
      this.dataService.sortAll(sortBy);
      this.searchService.sortAll(sortBy);
    } else {
      this.locationService.folder.sortBy = sortBy;
      this.dataService.sort(this.locationService.folder);
    }
    this.headerService.sort.hide();
    this.headerService.isSortGlobal = undefined;
  }
}
