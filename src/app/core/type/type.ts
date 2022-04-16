import { getNodeId, getRandomKey, parsePath } from '@/core/functions';

export class Node {
  name: string;
  path: string;
  id: string = getNodeId();
  isSelected: boolean = false;
  isFolder: boolean = false;
  tags: string[] = [];
  size: number;
  sizeString: string;
  createdTimestamp: number;
  updatedTimestamp: number;
  index: number = 0;

  constructor() {
    const now = Date.now();
    this.createdTimestamp = now;
    this.updatedTimestamp = now;
  }
}

export class File extends Node {
  block = new BinaryBlock();
}

export class Folder extends Node {
  nodes: Node[] = [];
  sortBy: string;

  constructor() {
    super();
    this.isFolder = true;
  }

  push(node: Node): Folder {
    this.nodes.push(node);
    return this;
  }
}

export interface Meta {
  id: string;
  createdTimestamp: number;
  updatedTimestamp: number;
  encryptorVersion: string; // E.g. '2.47'
  updateVersion: number; // E.g. 6438
  writeKey: Uint8Array; // 256 bit token for server cloud updates
}

export class Tree {
  meta: Meta;
  root: Folder;
}

export class BinaryBlock {
  binary = new Uint8Array();
  position: number;
  size: number;
  key: Uint8Array;
  isDecrypted: boolean = true;
  isModified: boolean = true;

  constructor(binary?: Uint8Array) {
    if (binary) {
      this.binary = binary;
    }
  }

  copy(): BinaryBlock {
    const bb = new BinaryBlock();
    bb.binary = this.binary;
    bb.key = this.key;
    bb.position = this.position;
    bb.size = this.size;
    bb.isDecrypted = this.isDecrypted;
    bb.isModified = this.isModified;
    return bb;
  }

  updateKey(): void {
    this.key = getRandomKey();
  }
}

export interface NodeMap {
  [id: string]: Node;
}

export interface StringMap {
  [id: string]: string;
}

export interface DialogData {
  message: string;
}

export interface Parse {
  name: string;
  parent: string;
  length: number;
  nodes: string[];
}

export class Grid {
  rows: GridRow[] = [];

  add(row: GridRow): void {
    row.index = this.rows.length;
    this.rows.push(row);
  }
}

export enum ZipError {
  UNDEFINED = 0,
  WRONG_PASS = 1,
  FILE_READER = 2,
}

export enum GridType {
  UNDEFINED = 0,
  TEXTBLOCK = 1,
  INPUT = 2,
  PASSWORD = 3,
  TEXTAREA = 4,
  HIDDENBLOCK = 5,
}

export class GridRow {
  id: string = getNodeId();
  label: string = '';
  value: string = '';
  type: GridType = GridType.INPUT;
  visibility: string = 'password';
  index: number;
  offset: number;
  height: number;
  isDrag: boolean = false;
}

export interface NodeInfo {
  size: number; // Amount of bytes
  files: number; // Total amount of files
  folders: number; // Total amount of folders
  depth: number; // Amount of folder on longest branch
}

export class SearchResult {
  node: Node;
  icon: string;
  rank: number = 0;
  isName: boolean = false;
  isContent: boolean = false;
  path: string;

  constructor(node: Node) {
    this.node = node;
    const parse = parsePath(node.path);
    parse.nodes.push(parse.name);
    this.path = parse.nodes.reverse().join('/');
  }
}

export enum LocationType {
  Search = 1,
  Folder = 2,
  Text = 3,
  Grid = 4,
  Image = 5,
}

export interface Location {
  type: LocationType;
  path: string;
  node?: Node;
}
