import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AngularFireStorage } from '@angular/fire/compat/storage';
import { Observable } from 'rxjs';

import { ZipService } from './zip.service';
import { NotificationService } from './notification.service';
import { LoadingService } from './loading.service';

@Injectable()
export class FirebaseService {
  constructor(
    private storage: AngularFireStorage,
    private http: HttpClient,
    private zipService: ZipService,
    private notificationService: NotificationService,
    private loadingService: LoadingService,
  ) { }

  upload(id: string): void {
    this.storage.upload(id, this.zipService.pack()).snapshotChanges().subscribe(res => {
      if (res.state === 'success') {
        this.notificationService.success('Saved');
        this.loadingService.loads--;
      }
    });
  }

  download(id: string): Observable<Uint8Array> {
    // Get link for downloading by snapshot name
    return new Observable(observer => {
      this.storage
        .ref(id)
        .getDownloadURL()
        .subscribe(url => {
          this.http.get(url, {
            responseType: 'blob',
          }).subscribe(blob => {
            // ArrayBuffer -> Uint8Array
            const fileReader = new FileReader();
            fileReader.onload = () => {
              const arrayBuffer = fileReader.result as ArrayBuffer;
              const binary = new Uint8Array(arrayBuffer);
              observer.next(binary);
            };
            fileReader.readAsArrayBuffer(blob);
          });
        }, () => {
          observer.error();
        });
    });
  }

  remove(id: string): void {
    this.loadingService.loads++;
    this.storage.ref(id).delete().subscribe(() => {
      this.notificationService.success('Deleted');
      this.loadingService.loads--;
    }, () => {
      this.notificationService.warning('Not found');
      this.loadingService.loads--;
    });
  }

  replace(newId: string, oldId: string): void {
    this.storage.upload(newId, this.zipService.pack()).snapshotChanges().subscribe(res => {
      if (res.state === 'success') {
        this.storage.ref(oldId).delete().subscribe(() => {
          this.notificationService.success('Saved');
          this.loadingService.loads--;
        }, () => {
          this.notificationService.warning('Unable to remove old version');
          this.loadingService.loads--;
        });
      }
    });
  }
}
