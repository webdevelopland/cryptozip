import { Injectable } from '@angular/core';

import * as Proto from 'src/proto';
import { Node, File, Folder } from '@/core/type';
import { ProtoService } from './proto.service';
import { EncodingService } from './encoding.service';

@Injectable()
export class ClipboardService {
  // Copied nodes
  clipboard: Node[] = [];
  isCut: boolean;
  location: Folder;

  constructor(
    private protoService: ProtoService,
    private encodingService: EncodingService,
  ) { }

  copy(nodeList: Node[]): void {
    this.clipboard = nodeList;
    this.isCut = false;
  }

  cut(nodeList: Node[]): void {
    this.clipboard = nodeList;
    this.isCut = true;
  }

  // Was the node cutted?
  isNodeCut(node: Node): boolean {
    return this.isCut && this.clipboard.includes(node);
  }

  clearNodeCopyPaste(): void {
    this.clipboard = [];
    this.isCut = undefined;
    this.location = undefined;
  }

  clear(): void {
    this.clearNodeCopyPaste();
    navigator.clipboard.writeText('');
  }

  copyFile(file: File): void {
    const protoFile: Proto.File = this.protoService.getProtoFile(file);
    const binary: Uint8Array = protoFile.serializeBinary();
    const base64: string = this.encodingService.uint8ArrayToBase64(binary);
    navigator.clipboard.writeText(base64);
  }

  pasteFile(base64: string): File {
    try {
      const binary: Uint8Array = this.encodingService.base64ToUint8Array(base64);
      const protoFile: Proto.File = Proto.File.deserializeBinary(binary);
      return this.protoService.getFile(protoFile);
    } catch (e) {
      return;
    }
  }

  destroy() {
    this.clearNodeCopyPaste();
  }
}
