import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MenuItem } from 'primeng/api';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit {


  constructor(private router: Router,) {

  }
  ngOnInit() {

}

  // Fonction pour demander la permission de notification
  requestPermission() {
    Notification.requestPermission().then(permission => {
      if (permission === 'granted') {
        console.log('Permission de notification accordée.');
      } else {
        console.log('Permission de notification refusée.');
      }
    });
  }

  // Fonction pour afficher une notification
  showNotification() {
    this.requestPermission(); // Demande la permission si elle n'a pas encore été accordée

    // Vérifie si la permission est accordée
    if (Notification.permission === 'granted') {
      // Affiche la notification
      new Notification('Titre de la notification', {
        body: '🔥Ceci est le corps de la notification.',
      });
    } else {
      console.log('Les notifications ne sont pas autorisées.');
    }
  }
}
