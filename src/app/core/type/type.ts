import { randstr64 } from 'rndmjs';

export class Node {
  name: string;
  path: string;
  id: string = randstr64(20);
  isSelected: boolean = false;
  isFolder: boolean = false;
  createdTimestamp: number;
  updatedTimestamp: number;
  tags: string[] = [];

  constructor() {
    const now = Date.now();
    this.createdTimestamp = now;
    this.updatedTimestamp = now;
  }

  update(): void {
    this.updatedTimestamp = Date.now();
  }
}

export class File extends Node {
  isBinary: boolean = false;
  text: string = '';
  binary: Uint8Array;
}

export class Folder extends Node {
  nodes: Node[] = [];

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
}

export class Data {
  meta: Meta;
  root: Folder;
}

export class Password extends File {
  createdTimestamp: number;
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
}

export enum GridType {
  Input = 'input',
  Textarea = 'textarea',
  Password = 'password',
  Textblock = 'textblock',
  Hiddenblock = 'hiddenblock',
}

export class GridRow {
  label: string = '';
  value: string = '';
  type: GridType = GridType.Input;
  visibility: string = 'password';
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

  constructor(node: Node) {
    this.node = node;
  }
}
