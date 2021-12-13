import { randstr64 } from 'rndmjs';

class Node {
  name: string;
  path: string;
  id: string = randstr64(20);

  isFolder(): boolean {
    return this instanceof Folder;
  }
}

export class File extends Node {
  isBinary: boolean = false;
  text: string = '';
  binary: Uint8Array;
}

export class Folder extends Node {
  nodes: (File | Folder)[] = [];

  push(node: File | Folder): Folder {
    this.nodes.push(node);
    return this;
  }
}

export interface Meta {
  createdTimestamp: number;
  updatedTimestamp: number;
  id: string;
  encryptorVersion: string; // E.g. '2.47'
  updateVersion: number; // E.g. 6438
}

export class Data {
  root: Folder;
  meta: Meta;
}

export class Password extends File {
  createdTimestamp: number;
}

export interface NodeMap {
  [id: string]: File | Folder;
}

export interface DialogData {
  message: string;
}

export interface Parse {
  name: string;
  parent: string;
  length: number;
}
