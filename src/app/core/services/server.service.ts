import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

import * as Proto from 'src/proto';
import { ServerResponse } from '@/core/type';
import { ZipService } from './zip.service';
import { NotificationService } from './notification.service';
import { LoadingService } from './loading.service';
import { DataService } from './data.service';

const SERVER_URL = 'https://czip-server.herokuapp.com/';

@Injectable()
export class ServerService {
  constructor(
    private http: HttpClient,
    private zipService: ZipService,
    private notificationService: NotificationService,
    private loadingService: LoadingService,
    private dataService: DataService,
  ) { }

  private post(url: string, post: Proto.Post, msg: string): void {
    const blob = new Blob([post.serializeBinary()]);
    const headers = new HttpHeaders({ 'Content-Type': 'application/czip' });
    this.http.post(url, blob, { headers: headers }).subscribe((res: ServerResponse) => {
      switch (res.status) {
        case 'ok': this.notificationService.success(msg); break;
        case 'error': this.notificationService.warning(res.msg); break;
      }
      this.loadingService.loads--;
    }, error => {
      this.loadingService.loads--;
      this.notificationService.error(error.statusText);
    });
  }

  upload(): void {
    const post = new Proto.Post();
    post.setType(Proto.Post.Type.SAVE);
    post.setWriteKey(this.dataService.tree.meta.writeKey);
    post.setData(this.zipService.pack());
    post.setId(this.dataService.tree.meta.id);
    this.post(SERVER_URL + 'save', post, 'Saved');
  }

  delete(): void {
    const post = new Proto.Post();
    post.setType(Proto.Post.Type.DELETE);
    post.setWriteKey(this.dataService.tree.meta.writeKey);
    post.setId(this.dataService.tree.meta.id);
    this.post(SERVER_URL + 'delete', post, 'Deleted');
  }

  rename(oldId: string, newId: string): void {
    const post = new Proto.Post();
    post.setType(Proto.Post.Type.RENAME);
    post.setWriteKey(this.dataService.tree.meta.writeKey);
    post.setData(this.zipService.pack());
    post.setId(oldId);
    post.setNewId(newId);
    this.post(SERVER_URL + 'rename', post, 'id updated');
  }

  load(id: string): Observable<Uint8Array> {
    const body = new Proto.Post();
    body.setType(Proto.Post.Type.LOAD);
    body.setId(id);
    const blob = new Blob([body.serializeBinary()]);
    return new Observable(observer => {
      fetch(SERVER_URL + 'load', {
        method: 'post',
        body: blob,
        headers: { 'Content-Type': 'application/czip' },
      })
        .then(async res => {
          const reader = res.body.getReader();
          const data = await reader.read();
          if (data.value) {
            observer.next(data.value);
          } else {
            observer.error();
          }
        })
        .catch(err => {
          this.notificationService.error('Load error');
          console.error(err);
        });
    });
  }
}
