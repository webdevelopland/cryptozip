import { Component, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';

import { SearchResult } from '@/core/type';
import {
  DataService, SearchService, MediaService, EventService, LocationService
} from '@/core/services';
import { HeaderService } from '@/core/components/header';

@Component({
  selector: 'page-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.scss'],
})
export class SearchComponent implements OnDestroy {
  keySub = new Subscription();

  constructor(
    private router: Router,
    public dataService: DataService,
    public searchService: SearchService,
    private mediaService: MediaService,
    private eventService: EventService,
    public locationService: LocationService,
    private headerService: HeaderService,
  ) {
    this.locationService.updatePath(this.searchService.folder, false);
    this.dataService.unselectAll();
    this.headerService.sortTop = 202;
    this.keyboardEvents();
  }

  keyboardEvents(): void {
    this.keySub = this.eventService.keydown.subscribe(event => {
      if (event.key === 'Enter') {
        event.preventDefault();
        this.search();
      }
    });
  }

  search(): void {
    this.dataService.decryptAllFiles();
    this.searchService.isAll = false;
    this.searchService.tags = this.searchService.tagString.split(' ');
    this.searchService.search(Object.values(this.dataService.nodeMap));
  }

  all(): void {
    this.clear();
    this.searchService.isAll = true;
    this.searchService.search(Object.values(this.dataService.nodeMap));
  }

  open(searchResult: SearchResult): void {
    searchResult.node.isSelected = true;
    this.locationService.openNode(searchResult.node);
  }

  clear(): void {
    this.searchService.what = '';
    this.searchService.tagString = '';
    this.searchService.tags = [];
    this.searchService.searchResults = [];
    this.searchService.isAll = false;
    this.searchService.isParam = false;
  }

  close(): void {
    this.locationService.updatePath(this.searchService.folder);
    this.router.navigate(['/browser']);
  }

  ngOnDestroy() {
    this.headerService.resetSortTop();
    this.keySub.unsubscribe();
  }
}
