import { Injectable } from '@angular/core';
import { Observable, timer } from 'rxjs';

import * as Proto from 'src/proto';
import { Node, File, Folder } from '@/core/type';
import { ProtoService } from './proto.service';
import { EncodingService } from './encoding.service';
import { LoadingService } from './loading.service';

@Injectable()
export class ClipboardService {
  // Copied nodes
  clipboard: Node[] = [];
  isCut: boolean;
  location: Folder;

  constructor(
    private protoService: ProtoService,
    private encodingService: EncodingService,
    private loadingService: LoadingService,
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

  copyFile(file: File): Observable<boolean> {
    this.loadingService.loads++;
    return new Observable(observer => {
      timer(1).subscribe(() => {
        const protoFile: Proto.File = this.protoService.getProtoFile(file);
        const binary: Uint8Array = protoFile.serializeBinary();
        const base64: string = this.encodingService.uint8ArrayToBase64(binary);
        navigator.clipboard.writeText(base64)
          .then(() => {
            this.loadingService.loads--;
            observer.next(true);
          })
          .catch(() => {
            this.loadingService.loads--;
            observer.next(false);
          });
      });
    });
  }

  pasteFile(base64: string): Observable<File> {
    this.loadingService.loads++;
    return new Observable(observer => {
      timer(1).subscribe(() => {
        try {
          const binary: Uint8Array = this.encodingService.base64ToUint8Array(base64);
          const protoFile: Proto.File = Proto.File.deserializeBinary(binary);
          this.loadingService.loads--;
          observer.next(this.protoService.getFile(protoFile));
        } catch (e) {
          this.loadingService.loads--;
          observer.error();
        }
      });
    });
  }

  destroy() {
    this.clearNodeCopyPaste();
  }
}
