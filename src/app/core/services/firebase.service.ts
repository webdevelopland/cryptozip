import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AngularFireStorage } from '@angular/fire/compat/storage';
import { Observable } from 'rxjs';

import { Data } from '@/core/type';
import { ZipService } from './zip.service';
import { NotificationService } from './notification.service';

@Injectable()
export class FirebaseService {
  constructor(
    private storage: AngularFireStorage,
    private http: HttpClient,
    private zipService: ZipService,
    private notificationService: NotificationService,
  ) { }

  upload(data: Data, password: string) {
    this.zipService.dataToBinary(data, password).subscribe(blob => {
      this.storage.upload(data.meta.id, blob).snapshotChanges().subscribe(res => {
        if (res.state === 'success') {
          this.notificationService.success('Saved');
        }
      });
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
    this.storage.ref(id).delete().subscribe(() => {
      this.notificationService.success('Deleted');
    }, () => {
      this.notificationService.warning('Not found');
    });
  }
}
