import { Injectable } from '@angular/core';
import { Observable, timer } from 'rxjs';

import * as Proto from 'src/proto';
import { Node, Folder } from '@/core/type';
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

  copyNode(nodes: Node[]): Observable<boolean> {
    this.loadingService.loads++;
    return new Observable(observer => {
      timer(1).subscribe(() => {
        const transfer: Proto.Transfer = this.protoService.getTransfer(nodes);
        const binary: Uint8Array = transfer.serializeBinary();
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

  pasteNode(base64: string): Observable<Node[]> {
    this.loadingService.loads++;
    return new Observable(observer => {
      timer(1).subscribe(() => {
        try {
          const binary: Uint8Array = this.encodingService.base64ToUint8Array(base64);
          const transfer: Proto.Transfer = Proto.Transfer.deserializeBinary(binary);
          this.loadingService.loads--;
          observer.next(this.protoService.readTransfer(transfer));
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
