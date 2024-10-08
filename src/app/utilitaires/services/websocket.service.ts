import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class WebsocketService {
  private socket!: WebSocket;
  private messageSubject: Subject<any>;

  constructor() {
    this.messageSubject = new Subject<any>();
  }

  connect(url: string): void {
    this.socket = new WebSocket(url);

    this.socket.onopen = () => {
      console.log('WebSocket connection established');
    };

    this.socket.onmessage = (event) => {
      this.messageSubject.next(JSON.parse(event.data));
    };

    this.socket.onerror = (event) => {
      console.error('WebSocket error: ', event);
    };

    this.socket.onclose = () => {
      console.log('WebSocket connection closed');
    };
  }

  sendMessage(message: any): void {
    this.socket.send(JSON.stringify(message));
  }

  onMessage(): Observable<any> {
    return this.messageSubject.asObservable();
  }

  close(): void {
    if (this.socket) {
      this.socket.close();
    }
  }
}
