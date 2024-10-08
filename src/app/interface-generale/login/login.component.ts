import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { FormGroup, FormControl, FormBuilder, Validators, AbstractControl } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthData } from '../../utilitaires/models/user';
import { CrmService } from '../../utilitaires/services/crm.service';
import { Message } from 'primeng/api';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  msgs: Message[] = [];
  value: any;

  password!: string;
  sessionExpired: boolean = false;
  loginForm!: FormGroup;
  errorMessage: string | null = null;
  sessionExpiredMessage: string = '';
  passNotMatch: string = '';
  isRegisterFormVisible: boolean = false;
  isResetPasswordVisible: boolean = false;
  isVerificationPasswordVisible: boolean = false;
  isVerifierPasswordVisible: boolean = false;
  emailForm: FormGroup;
  loading: boolean = false;
  passwordResetControlForm: FormGroup;
  enteredDigits: string[] = Array(6).fill('');
  passwordResetForm: FormGroup;
  successMessage!: string

  @ViewChild('successModal') successModal!: TemplateRef<any>;
  showPassword = false;
  repassword = new FormControl('');

  constructor(
    private fb: FormBuilder,
    private authService: CrmService,
    private router: Router,
    private route: ActivatedRoute) {

    this.emailForm = this.fb.group({
      emailOrPhone: ['', [Validators.required, Validators.email]],
    });

    this.passwordResetControlForm = this.fb.group({
      email: [this.emailForm.value.emailOrPhone, Validators.required], // Pré-remplir avec la valeur de emailForm
      verificationCode: ['', Validators.required],
    });

    this.passwordResetForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      newPassword: ['', [Validators.required]],
      confirmNewPassword: ['', [Validators.required, this.matchPasswordValidator('newPassword')]],
    });

    this.loginForm = this.fb.group({
      email_ou_telephone: ['', Validators.required],
      passCode: ['', [Validators.required]],
    });

  }

  ngOnInit() {
    this.session()
  }


/*   passwordValidator(control: { value: any; }) {
    const value = control.value;
    if (!value) {
      return null; // Valeur facultative, la validation ne s'applique pas
    }
    const hasLowerCase = /[a-z]/.test(value);
    const hasDigit = /\d/.test(value);
    const hasSpecialCharacter = /[!@#$%^&*()_+{}\[\]:;<>,.?~\\/-]/.test(value);
    const isLengthValid = value.length >= 8;
    const isValid =
      hasLowerCase && hasDigit && hasSpecialCharacter && isLengthValid;

    return isValid ? null : { invalidPassword: true };
  } */

  matchPasswordValidator(matchTo: string) {
    return (control: AbstractControl) => {
      const matchToControl = control.root.get(matchTo);
      if (matchToControl && control.value !== matchToControl.value) {
        return { passwordsNotMatch: true };
      }
      return null;
    };
  }

  toggleResetForm() {
    this.isResetPasswordVisible = !this.isResetPasswordVisible;
  }


  onDigitInput(event: Event, index: number) {
    const inputElement = event.target as HTMLInputElement;
    this.enteredDigits[index] = inputElement.value;
  }

  toggleVerificationForm() {

    if (this.emailForm.valid) {
      const emailOrPhone = this.emailForm.value.emailOrPhone;
      // Utilise setTimeout pour simuler une attente d'une seconde
      this.loading = true;
      setTimeout(() => {
        this.authService.sendPasswordResetRequest(emailOrPhone).subscribe(
          (response) => {
            console.log(response);
            // Pré-remplir le champ 'email' dans passwordResetControlForm
            this.passwordResetControlForm.patchValue({
              email: emailOrPhone,
              // Vous pouvez également pré-remplir d'autres champs si nécessaire
            });
            this.loading = false;// Gérer la réponse du serveur
            this.isVerificationPasswordVisible = true
          },
          (error) => {
            console.error(error); // Gérer les erreurs
            this.errorMessage = error.error.error;
            this.loading = false;
            this.isVerificationPasswordVisible = false

          }
        );
      }, 1000); // 1000 millisecondes (1 seconde)
    }
  }

  toggleVerifiernForm() {

    if (this.passwordResetControlForm.valid) {

      this.loading = true;

      setTimeout(() => {
        const { email, verificationCode } = this.passwordResetControlForm.value;
        this.authService.verifyPasswordReset(email, verificationCode).subscribe(
          (response) => {
            console.log(response); // Gérer la réponse du serveur
            this.loading = false;// Gérer la réponse du serveur
            // Récupérer l'e-mail de la réponse et le pré-remplir dans le formulaire
            const verifiedEmail = response.email;
            this.passwordResetForm.patchValue({
              email: verifiedEmail,
            });
            this.isVerifierPasswordVisible = true
            this.errorMessage = ''
          },
          (error) => {
            console.error(error); // Gérer les erreurs
            this.loading = false;// Gérer la réponse du serveur
            this.isVerifierPasswordVisible = false
            this.errorMessage = error.error.error; // Utilisez la propriété 'error' pour obtenir le message d'erreur
          }
        );
      }, 1000); // 1000 millisecondes (1 seconde)
    }
  }

  renvoyerCode() {
    if (this.emailForm.valid) {
      const emailOrPhone = this.emailForm.value.emailOrPhone;
      // Utilise setTimeout pour simuler une attente d'une seconde
      this.loading = true;
      setTimeout(() => {
        this.authService.sendPasswordResetRequest(emailOrPhone).subscribe(
          (response) => {
            console.log(response);
            // Pré-remplir le champ 'email' dans passwordResetControlForm
            this.passwordResetControlForm.patchValue({
              email: emailOrPhone,
              // Vous pouvez également pré-remplir d'autres champs si nécessaire
            });
            this.loading = false;// Gérer la réponse du serveur
          },
          (error) => {
            console.error(error); // Gérer les erreurs
            this.errorMessage = error.error.error;
            this.loading = false;
          }
        );
      }, 1000); // 1000 millisecondes (1 seconde)
    }
  }

  resetPassword() {

    if (this.passwordResetForm.valid) {
      this.loading = true;

      setTimeout(() => {
        const { email, newPassword, confirmNewPassword } = this.passwordResetForm.value;
        this.authService.resetPassword(email, newPassword, confirmNewPassword).subscribe(
          (response) => {
            console.log(response); // Gérer la réponse du serveur
            this.loading = false;
            this.successMessage = 'Le Mot De Passe a ete modifier avec succès';

            this.showSuccessViaMessages(this.successMessage, 1500);
          },
          (error) => {
            console.error(error); // Gérer les erreurs
            this.errorMessage = error.error.error; // Utilisez la propriété 'error' pour obtenir le message d'erreur
            this.loading = false;
          }
        );
      }, 1000);
    }
  }

  passwordMatchValidator(form: FormGroup) {
    const password = form.get('password')?.value;
    const repassword = form.get('repassword')?.value;

    return password === repassword ? null : { mismatch: true };
  }

  session() {
    this.route.queryParams.subscribe((params) => {
      if (params['message'] === "Votre session a expiré. Veuillez vous reconnecter.") {
        this.sessionExpired = true;
        this.sessionExpiredMessage = params['message'];
        setTimeout(() => {
          this.sessionExpired = false;
        }, 10000); // Cela effacera le message après 10 secondes
      }
    });
  }

  onConnexionClick(): void {
    location.reload()
  }


  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  onSubmit() {
    if (this.loginForm.valid) {
      const authData: AuthData = this.loginForm.value;
      this.loading = true;
      setTimeout(() => {
        this.authService.login(authData).subscribe(
          (response) => {
            // Gérer la réponse de l'API, par exemple, stocker le jeton dans le local storage.
            this.redirectUser()
            this.loading = false;
          },
          (error) => {
            this.errorMessage = 'Erreur d\'authentification';
            this.loading = false;
            this.showErrorViaMessages(this.errorMessage, 1000)
            console.error('Erreur d\'authentification', error);
          }
        );
      }, 500);
    }
  }

  redirectUser() {
    this.router.navigate(['app/reservations']);
  }

  showErrorViaMessages(detail:any, life:any) {
    this.msgs = [];
    this.msgs.push({ severity: 'error', detail,life });
}

showSuccessViaMessages(detail:any, life:any) {
    this.msgs = [{ severity: 'success', detail, life }];

}
}
