import { Component, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';

import { File, Folder, SearchResult } from '@/core/type';
import { DataService, SearchService, MediaService, EventService } from '@/core/services';
import { parsePath } from '@/core/functions';

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
  ) {
    if (!this.searchService.isStarted) {
      this.searchService.folder = this.dataService.folder;
      this.searchService.where = this.dataService.folder.path;
      this.searchService.isStarted = true;
    }
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
    this.searchService.tags = this.searchService.tagString.split(' ');
    this.searchService.search(Object.values(this.dataService.nodeMap));
  }

  open(searchResult: SearchResult): void {
    if (searchResult.node instanceof Folder) {
      this.dataService.folder = this.searchService.folder;
      this.router.navigate(['/browser']);
    } else {
      this.openFile(searchResult.node as File);
    }
  }

  openFile(file: File): void {
    this.dataService.file = file;
    this.back(file);
    switch (this.mediaService.getMediaType(file.name)) {
      case 'text': this.router.navigate(['/browser/text']); break;
      case 'image': this.router.navigate(['/browser/image']); break;
      case 'grid': this.router.navigate(['/browser/grid']); break;
    }
  }

  private back(file: File): void {
    const parentPath: string = parsePath(file.path).parent;
    const parentId: string = this.dataService.pathMap[parentPath];
    const parent = this.dataService.nodeMap[parentId] as Folder;
    this.dataService.folder = parent;
  }

  close(): void {
    this.dataService.folder = this.searchService.folder;
    this.router.navigate(['/browser']);
  }

  ngOnDestroy() {
    this.keySub.unsubscribe();
  }
}
