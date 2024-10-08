import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-errors',
  templateUrl: './errors.component.html',
  styleUrls: ['./errors.component.css']
})
export class ErrorsComponent implements OnInit {
  errorMessage: string = '';

  constructor(private router: Router,private route: ActivatedRoute) { }

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      const errorType = params['type'];
      if (errorType === '404') {
        this.errorMessage = 'Erreur 404 not found. Nous sommes désolés, cette page n\'existe pas.';
      } else if (errorType === 'unknown') {
        this.errorMessage = 'Une erreur inconnue est survenue. Veuillez réessayer plus tard.';
      }else{
        this.errorMessage = 'Une erreur inconnue est survenue ou page indisponible. Mille excuses.';
      }
    });
  }

  fermerPage(): void {
    this.router.navigate(['/']);
  }

}
