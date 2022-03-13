import { Injectable } from '@angular/core';

import { Node, File, Folder, SearchResult } from '@/core/type';
import { MediaService } from './media.service';

@Injectable()
export class SearchService {
  where: string;
  what: string = '';
  tagString: string = '';
  tags: string[] = [];
  searchResults: SearchResult[] = [];
  folder: Folder;

  constructor(
    private mediaService: MediaService,
  ) { }

  search(nodes: Node[]): void {
    let searchResults: SearchResult[] = [];
    if (this.what || this.tagString) {
      for (const node of nodes) {
        if (node.path === '/') {
          continue;
        }
        const searchResult = new SearchResult(node);
        searchResult.icon = this.mediaService.getIcon(node);
        if (
          node.path.startsWith(this.where) &&
          (this.tagString || this.what)
        ) {
          if (this.what) {
            this.setTextRank(this.what, searchResult);
          }
          searchResults.push(searchResult);
        }
      }
    }
    // Search results must have both: tags and text
    if (this.what) {
      searchResults = searchResults.filter(
        searchResult => searchResult.isName || searchResult.isContent
      );
    }
    if (this.tagString) {
      searchResults = searchResults.filter(searchResult => this.isTag(searchResult));
    }
    this.sort(searchResults);
    this.searchResults = searchResults;
  }

  setTextRank(searchTerm: string, searchResult: SearchResult): void {
    searchResult.isName = this.compareText(searchTerm, searchResult.node.name);
    if (searchResult.node instanceof File) {
      switch (this.mediaService.getMediaType(searchResult.node.name)) {
        case 'text':
          searchResult.rank = 2;
          searchResult.isContent = this.compareText(searchTerm, searchResult.node.text);
          break;
        case 'grid':
          searchResult.rank = 3;
          searchResult.isContent = this.compareGrid(searchTerm, searchResult.node.text);
          break;
        default: searchResult.rank = 0;
      }
    } else {
      searchResult.rank = 1;
    }
    if (searchResult.isName) {
      searchResult.rank += 10;
    }
    if (searchResult.isContent) {
      searchResult.rank += 100;
    }
  }

  private isTag(searchResult: SearchResult): boolean {
    // Every tag from tags input must be inside the search results
    let isTag: boolean = true;
    for (const tag of this.tags) {
      if (!searchResult.node.tags.includes(tag.toLowerCase())) {
        isTag = false;
      }
    }
    return isTag;
  }

  private compareText(searchTerm: string, target: string): boolean {
    if (searchTerm) {
      searchTerm = this.simplify(searchTerm);
      target = this.simplify(target);
      return target.includes(searchTerm);
    } else return false;
  }

  private compareGrid(searchTerm: string, target: string): boolean {
    let hit: boolean = false;
    try {
      const jsonGrid: any = JSON.parse(target);
      if (jsonGrid && jsonGrid.rows && jsonGrid.rows.length > 0) {
        for (const jsonRow of jsonGrid.rows) {
          const hitLabel: boolean = this.compareText(searchTerm, jsonRow.label);
          const hitValue: boolean = this.compareText(searchTerm, jsonRow.value);
          if (hitLabel || hitValue) {
            hit = true;
            break;
          }
        }
      }
    } catch (e) {
      // Invalid grid
    }
    return hit;
  }

  private simplify(str: string): string {
    return str
      .trim()
      .toLowerCase()
      .replace(/\s/g, '');
  }

  sort(searchResults: SearchResult[]): void {
    searchResults.sort((a, b) => {
      return b.rank - a.rank;
    });
  }

  destroy(): void {
    this.folder = undefined;
    this.where = undefined;
    this.what = '';
    this.tagString = '';
    this.tags = [];
    this.searchResults = [];
  }
}
