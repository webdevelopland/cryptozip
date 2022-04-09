import { Injectable } from '@angular/core';
import * as AES from 'src/third-party/aes';

import * as Proto from 'src/proto';
import { Node, File, Folder, SearchResult } from '@/core/type';
import { parsePath } from '@/core/functions';
import { MediaService } from './media.service';

@Injectable()
export class SearchService {
  where: string;
  what: string = '';
  isAll: boolean = false;
  tagString: string = '';
  sortBy: string;
  tags: string[] = [];
  searchResults: SearchResult[] = [];
  folder: Folder;

  constructor(
    private mediaService: MediaService,
  ) { }

  search(nodes: Node[]): void {
    this.sortBy = 'rank';
    let searchResults: SearchResult[] = [];
    if (this.what || this.tagString || this.isAll) {
      for (const node of nodes) {
        if (node.path === '/') {
          continue;
        }
        const searchResult = new SearchResult(node);
        searchResult.icon = this.mediaService.getIcon(node);
        if (
          node.path.startsWith(this.where) &&
          (this.tagString || this.what || this.isAll)
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
          const text: string = AES.utils.utf8.fromBytes(searchResult.node.block.binary);
          searchResult.isContent = this.compareText(searchTerm, text);
          break;
        case 'grid':
          searchResult.rank = 3;
          searchResult.isContent = this.compareGrid(searchTerm, searchResult.node.block.binary);
          break;
        case 'link':
          searchResult.rank = 1;
          const path: string = AES.utils.utf8.fromBytes(searchResult.node.block.binary);
          const name: string = parsePath(path).name;
          searchResult.isName = searchResult.isName || this.compareText(searchTerm, name);
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

  private compareGrid(searchTerm: string, target: Uint8Array): boolean {
    let hit: boolean = false;
    try {
      const grid: Proto.Grid = Proto.Grid.deserializeBinary(target);
      for (const protoRow of grid.getRowList()) {
        const hitLabel: boolean = this.compareText(searchTerm, protoRow.getLabel());
        const hitValue: boolean = this.compareText(searchTerm, protoRow.getValue());
        if (hitLabel || hitValue) {
          hit = true;
          break;
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
      switch (this.sortBy) {
        case 'az': return a.node.name.localeCompare(b.node.name);
        case 'modified': return b.node.updatedTimestamp - a.node.updatedTimestamp;
        case 'size': return b.node.size - a.node.size;
        default: return b.rank - a.rank;
      }
    });
  }

  sortAll(sortBy: string): void {
    if (this.searchResults && this.searchResults.length > 0) {
      this.sortBy = sortBy;
      this.sort(this.searchResults);
    }
  }

  destroy(): void {
    this.folder = undefined;
    this.where = undefined;
    this.sortBy = undefined;
    this.isAll = false;
    this.what = '';
    this.tagString = '';
    this.tags = [];
    this.searchResults = [];
  }
}
