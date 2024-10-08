import { HttpClient, HttpHeaders, HttpParams, HttpResponse, } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable, catchError, tap, throwError } from "rxjs";
import { AuthData } from "../models/user";
import { environment } from "../../../environments/environment";

@Injectable({
  providedIn: "root",
})
export class CrmService {

  private url = environment.apiUrl;
  private reservationUrl: string = `${environment.apiUrl}reservations/`;
  private estimationUrl: string = `${environment.apiUrl}estimation/`;
  private factureUrl: string = `${environment.apiUrl}factures/`;
  private gveUrl: string = `${environment.apiUrl}gve/`;
  private settingUrl: string = `${environment.apiUrl}setting/`;

  constructor(private http: HttpClient) { }

  //  service connexion

  isUserAuthenticated(): boolean {
    const token = localStorage.getItem("access_token"); // Exemple avec localStorage
    return token !== null;
  }

  // Method to get the user type
  getUserType(): string | null {
    return localStorage.getItem('user_type');
  }

  getUserId(): string | null {
    return localStorage.getItem('user_id');
  }

  getSpecificId(): string | null {
    return localStorage.getItem('specific_id');
  }

  login(authData: AuthData): Observable<any> {
    return this.http.post(this.url + "auth/login/", authData).pipe(
      tap((response: any) => {
        // Stockez le jeton d'authentification dans le local storage
        localStorage.setItem("access_token", response.jwt);
        localStorage.setItem("refresh_token", response.refresh);
        localStorage.setItem("user_type", response.user_type);
        localStorage.setItem("user_id", response.user_id);
        localStorage.setItem("specific_id", response.specific_id);

      })
    );
  }

  getUserInfo() {
    const token = localStorage.getItem("access_token");
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });
    return this.http.get(`${this.url}auth/user/me/`, { headers });
  }

  getClientCounts(): Observable<any> {
    const token = localStorage.getItem('access_token');
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });

    return this.http.get(`${this.url}auth/client-count/`, { headers });
  }



  getClientList(page: number, typeClient: string): Observable<any> {
    const token = localStorage.getItem('access_token');
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });

    // Ajouter le paramètre page et type_client dans les query parameters
    let params = new HttpParams()
      .set('type_client', typeClient)
      .set('page', page.toString());

    return this.http.get<any>(`${this.url}auth/listeClients/`, { headers, params });
  }


  logout(refreshToken: string): Observable<any> {
    const token = localStorage.getItem("access_token");
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });

    const body = { refresh: refreshToken };

    return this.http.post(`${this.url}auth/logout/`, body, { headers });
  }


  private selectedEstimation: any[] = [];
  private reservationIds: number[] = [];

  setReservationIds(ids: number[]): void {
    this.reservationIds = ids;
  }

  getReservationIds(): number[] {
    return this.reservationIds;
  }

  envoyerEmailReservation(
    reservationId: number,
    data: { utilisateur_id?: number; email?: string;  }
  ): Observable<any> {
    const url = `${this.url}envoyer-email/${reservationId}/`;
    return this.http.post(url, data);
  }

  creerCourseRetour(idReservation: number, nouvelleDatePriseEnCharge: string, nouveauCoutTotal: number, lieuRendezVous: string): Observable<any> {
    const url = `${this.url}creer-course-retour/${idReservation}/`;  // Include reservation ID in the URL
    const body = {
      datePriseEnCharge: nouvelleDatePriseEnCharge,  // Correct key names for the API
      coutTotalReservation: nouveauCoutTotal,
      lieu_rendez_vous: lieuRendezVous  // Include 'lieu_rendez_vous' in the request body
    };

    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
    });

    return this.http.post<any>(url, body, { headers });
  }


  getFactureCounts(): Observable<any> {
    const token = localStorage.getItem("access_token");
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });

    return this.http.get<any>(this.factureUrl + "counts/", { headers })

  }


  accepterReservation(
    reservationId: number,
    data: { utilisateur_id?: number; email?: string; coutDeVente?: number; commission?: number; compensation?: number }
  ): Observable<any> {
    const url = `${this.url}accepter-course/${reservationId}/`;
    return this.http.post(url, data);
  }


  getReservationsFiltre(filters: { [key: string]: string }, page: number = 1, pageSize: number = 10): Observable<any> {
    const token = localStorage.getItem("access_token");
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });

    let params = new HttpParams();
    for (const key in filters) {
      if (filters[key]) {
        params = params.set(key, filters[key]);
      }
    }
    // Ajout des paramètres de pagination
    params = params.set('page', page.toString());
    params = params.set('page_size', pageSize.toString());

    return this.http.get<any>(this.estimationUrl + "filtersReservation/", {
      params,
      headers
    });
  }

  /*  getClientsFiltre(filters: { [key: string]: string }): Observable<any> {
     let params = new HttpParams();
     for (const key in filters) {
       if (filters[key]) {
         params = params.set(key, filters[key]);
       }
     }
     return this.http.get<any>(this.estimationUrl + "filterClients/", {
       params,
     });
   } */

  getClientsFiltre(filters: { [key: string]: string }, page: number = 1, pageSize: number = 10): Observable<any> {
    const token = localStorage.getItem("access_token");
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });

    let params = new HttpParams();
    for (const key in filters) {
      if (filters[key]) {
        params = params.set(key, filters[key]);
      }
    }
    // Add pagination parameters
    params = params.set('page', page.toString());
    params = params.set('page_size', pageSize.toString());

    return this.http.get<any>(this.estimationUrl + "filterClients/", {
      params,
      headers
    });
  }


  affecterCourseDirectement(
    reservationId: number,
    data: { utilisateur_id?: number; email?: string; }
  ): Observable<any> {
    const endpoint = `${this.url}affectation-direct/${reservationId}/`;
    return this.http.post(endpoint, data);
  }

  creerReservationRecurrente(data: {
    reservation_id: number;
    regle_repetition: string;
    end_recurring_period?: string;
    exclude_dates?: string[];
  }): Observable<any> {
    const endpoint = `${this.reservationUrl}creer-recurrente/`;
    return this.http.post(endpoint, data);
  }

  manageReservation(
    action: string, reservationId: number, propager?: boolean): Observable<any> {
    const body = { action: action, reservation_id: reservationId, propager: propager, };
    return this.http.post<any>(this.reservationUrl + "gestion/", body);
  }

  stopRepetition(reservationId: number): Observable<any> {
    return this.http.post<any>(this.reservationUrl + "arreter-repetition/", {
      reservation_id: reservationId,
    });
  }

  modifierReservation(reservationId: number, modifications: any, action: string): Observable<any> {
    const url = this.reservationUrl + "modifier/"; // Remplacez par votre URL réelle
    const body = { reservation_id: reservationId, modifications: modifications, action: action, };
    return this.http.post(url, body);
  }

  changerStatut(reservationId: number, nouveauStatut: string): Observable<any> {
    return this.http.post(
      `${this.url}changer-statut-course/${reservationId}/`,
      { nouveau_statut: nouveauStatut }
    );
  }

  archiverReservation(reservationIds: number[]): Observable<any> {
    const url = `${this.url}archiver_reservations/`; // Remplacez par l'endpoint correct de votre API
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });

    const body = { reservation_ids: reservationIds };
    return this.http.post(url, body, { headers: headers });
  }

  gererReservation(reservationId: number, action: string): Observable<any> {
    const url = `${this.url}gerer_reservation/${reservationId}/`;
    const body = { action: action }; // Assurez-vous que le serveur s'attend à cette structure
    const httpOptions = { headers: new HttpHeaders({ "Content-Type": "application/json", }), };
    return this.http.post(url, JSON.stringify(body), httpOptions);
  }

  demarrerCourse(reservationId: number): Observable<any> {
    return this.http.post(`${this.url}demarrer_course/${reservationId}/`, {});
  }

  finirCourse(reservationId: number): Observable<any> {
    return this.http.post(`${this.url}finir_course/${reservationId}/`, {});
  }

  notifierRefus(reservationId: number): Observable<any> {
    return this.http.post<any>(
      `${this.url}notifier-refus/${reservationId}/`,
      {}
    );
  }
  updateFeedback(feedbackId: number, feedbackData: any): Observable<any> {
    return this.http.patch(
      `${this.url}feedback/update/${feedbackId}/`,
      feedbackData
    );
  }
  getFeedbackDetails(feedbackId: number): Observable<any> {
    return this.http.get(`${this.url}feedback/${feedbackId}/`);
  }



  creerFacture(data: any): Observable<any> {
    const token = localStorage.getItem("access_token");
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });
    return this.http.post(`${this.url}factures/creer/`, data, { headers });
  }

  demanderFacture(data: any): Observable<any> {
    const token = localStorage.getItem("access_token");
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });
    return this.http.post(`${this.url}demande-facturation/`, data, { headers });
  }

  demanderAnnulationChauffeur(data: any): Observable<any> {
    const token = localStorage.getItem('access_token');
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'  // Assurez-vous que le type de contenu est JSON
    });

    return this.http.post(`${this.url}annulation-chauffeur/`, data, { headers });
  }

  signalNoShow(reservationId: number): Observable<any> {
    const token = localStorage.getItem("access_token");
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });

    const body = {
      reservation_id: reservationId
    };
    return this.http.post<any>(`${this.reservationUrl}signal-no-show/`, body, { headers });
  }

  demanderReglement(reservationId: number): Observable<any> {
    const token = localStorage.getItem("access_token");
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });

    const body = {
      reservation_id: reservationId
    };

    return this.http.post<any>(`${this.reservationUrl}demande-reglement/`, body, { headers });
  }

  demanderAnnulation(data: any): Observable<any> {
    const token = localStorage.getItem("access_token");
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });
    return this.http.post(`${this.url}annulations/demander/`, data, { headers });
  }

  demanderRestauration(data: any): Observable<any> {
    const token = localStorage.getItem("access_token");
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });
    return this.http.post(`${this.url}restauration/demander/`, data, { headers });
  }

  demanderActivationCompte(data: any): Observable<any> {
    const token = localStorage.getItem("access_token");
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });
    return this.http.post(`${this.url}activation-compte/demander/`, data, { headers });
  }

  demanderActivationComptePartenaire(data: any): Observable<any> {
    const token = localStorage.getItem("access_token");
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });
    return this.http.post(`${this.url}activation-compte-partenaire/demander/`, data, { headers });
  }


  sendRegistrationEmail(clientData: any): Observable<any> {
    const token = localStorage.getItem("access_token");
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });
    return this.http.post<any>(
      `${this.url}auth/send-registration-email/`,
      clientData,
      { headers }
    );
  }

  sendPasswordResetRequest(emailOrPhone: string): Observable<any> {
    const requestData = { email_or_phone: emailOrPhone };
    return this.http.post<any>(
      this.url + "auth/password/reset/request/",
      requestData
    );
  }

  verifyPasswordReset(
    email: string,
    verificationCode: string
  ): Observable<any> {
    const requestData = { email, verification_code: verificationCode };
    return this.http.post<any>(
      this.url + "auth/password/reset/control/",
      requestData
    );
  }

  resetPassword(
    email: string,
    newPassword: string,
    confirmNewPassword: string
  ): Observable<any> {
    const requestData = {
      email,
      new_password: newPassword,
      confirm_new_password: confirmNewPassword,
    };
    return this.http.post<any>(this.url + "auth/password/reset/", requestData);
  }


  // service client
  // Transformer un client partiel en client complet

  transformerClientPartiel(id: number): Observable<any> {
    const token = localStorage.getItem("access_token");
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });
    return this.http.post(`${this.url}auth/transformer-client-partiel/${id}/`, {
      headers,
    });
  }

  // Récupérer tous les clients partiels
  getClientsPartiels(): Observable<any> {
    const token = localStorage.getItem("access_token");
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });
    return this.http.get(this.url + "auth/clients-partiels/", { headers });
  }

  // Créer un nouveau client partiel
  createClientPartiel(clientPartielData: any): Observable<any> {
    const token = localStorage.getItem("access_token");
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });
    return this.http.post(
      this.url + "auth/clients-partiels/",
      clientPartielData,
      { headers }
    );
  }

  // Récupérer un client partiel par ID
  getClientPartiel(id: number): Observable<any> {
    const token = localStorage.getItem("access_token");
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });
    return this.http.get(`${this.url}auth/clients-partiels/${id}/`, {
      headers,
    });
  }

  // Mettre à jour un client partiel
  updateClientPartiel(id: number, clientPartielData: any): Observable<any> {
    const token = localStorage.getItem("access_token");
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });
    return this.http.put(
      `${this.url}auth/clients-partiels/${id}/`,
      clientPartielData,
      { headers }
    );
  }

  commissionCompensationUpdate(reservationId: number, data: any): Observable<any> {
    const token = localStorage.getItem("access_token");
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
    const url = `${this.url}/commission-compensation/${reservationId}/`;

    return this.http.patch(url, data, { headers });
  }

  // Supprimer un client partiel
  deleteClientPartiel(id: number): Observable<any> {
    const token = localStorage.getItem("access_token");
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });
    return this.http.delete(`${this.url}auth/clients-partiels/${id}/`, {
      headers,
    });
  }

  // Fonction pour mettre à jour un client existant
  updateClient(clientId: number, clientData: any): Observable<any> {
    const token = localStorage.getItem("access_token");
    const headers = new HttpHeaders({ Authorization: `Bearer ${token}`, });
    return this.http.put<any>(this.url + "auth/clients/" + clientId + "/", clientData, { headers, })
      .pipe(catchError((error) => { return throwError(error); }));
  }

  // Fonction pour associer un client à une agence ou une société
  associateClient(clientId: number, associationData: any): Observable<any> {
    const token = localStorage.getItem("access_token");
    const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });
    return this.http.post<any>(`${this.url}auth/clients/${clientId}/associate/`, associationData, { headers })
      .pipe(catchError((error) => { return throwError(error); }));
  }

  associerDissocierChauffeur(data: { user_id: string, entreprise_key?: string }): Observable<any> {
    const token = localStorage.getItem("access_token");
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });
    return this.http.post(`${this.url}auth/associerDissocierChauffeurEntreprise/`, data, { headers });
  }

  // Fonction pour obtenir la liste des clients
  getClients(): Observable<any> {
    const token = localStorage.getItem("access_token");
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });
    return this.http.get<any>(this.url + "auth/clients/", {}).pipe(
      catchError((error) => {
        return throwError(error);
      })
    );
  }
  // Fonction pour supprimer un client
  deleteClient(clientId: number): Observable<void> {
    const token = localStorage.getItem('access_token');
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });

    return this.http
      .delete<void>(`${this.url}auth/clients/${clientId}/supprimer/`, { headers })
      .pipe(
        catchError((error) => {
          console.error('Erreur lors de la suppression du client :', error);
          return throwError(() => error);
        })
      );
  }
  getClientsDetails(clientId: any): Observable<any> {
    return this.http.get(this.url + "auth/clients/" + clientId + "/");
  }



  search(searchTerm: string): Observable<any[]> {
    const token = localStorage.getItem("access_token");
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });
    return this.http.get<any[]>(
      `${this.url}searchClient/?search=${searchTerm}`,
      { headers }
    );
  }

  // service de reservation les service avec url son a modifier

  // service de mise a jour de reservation
  updateReservation(id: number, reservation: any): Observable<any> {
    const token = localStorage.getItem("access_token");
    const headers = new HttpHeaders({ Authorization: `Bearer ${token}`, });
    return this.http.put<any>(`${this.reservationUrl}${id}/ `, reservation);
  }
  // service de supression de reservation par id
  deleteReservation(id: number): Observable<any> {
    const token = localStorage.getItem("access_token");
    const headers = new HttpHeaders({ Authorization: `Bearer ${token}`, });
    return this.http.delete<any>(`${this.reservationUrl}${id}/`, { headers, });
  }
  // supprimer toute les reservation

  deleteAllReservations(): Observable<any> {
    const token = localStorage.getItem("access_token");
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });
    const url = this.url + "deleteAll/";
    return this.http.delete(url, { headers });
  }
  // service de chargement de fichier excel
  uploadExcelFile(file: File) {
    const formData: FormData = new FormData();
    formData.append("file", file);
    return this.http.post(this.url + "upload/", formData);
  }
  // service de recherche de reservation

  addReservation(reservation: any): Observable<any> {
    const token = localStorage.getItem("access_token");
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });
    return this.http.post<any>(this.reservationUrl, reservation, {});
  }

  generatePDF(reservationId: number): void {
    const url = `${this.url}reservation/pdf/${reservationId}/`;
    this.downloadFile(url);
}

BonDeDisponibilitePDF(reservationId: number): void {
    const url = `${this.url}demandeDeDisponibilite/pdf/${reservationId}/`;
    this.downloadFile(url);
}

BonAnnulationPDF(reservationId: number): void {
    const url = `${this.url}bonDannulation/pdf/${reservationId}/`;
    this.downloadFile(url);
}

downloadFacturePdf(factureId: number): void {
  const url = `${this.factureUrl}${factureId}/pdf/`;
  this.downloadFile(url);
}

downloadDevisPdf(devisId: number): void {
  const url = `${this.estimationUrl}pdf_devis/${devisId}/`;
  this.downloadFile(url);
}

private downloadFile(url: string): void {
    fetch(url, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/pdf',
        },
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return response.blob(); // Retrieve the PDF as a blob
    })
    .then(blob => {
        // Create a download link
        const link = document.createElement('a');
        link.href = window.URL.createObjectURL(blob);
        link.download = 'document.pdf'; // Set a default file name, can be dynamic
        link.click();
        // Clean up
        window.URL.revokeObjectURL(link.href);
    })
    .catch(error => {
        console.error('There was a problem with the fetch operation:', error);
    });
}


  sendEmail(emailType: string, id: number, recipientEmail: string): Observable<any> {
    const token = localStorage.getItem("access_token");
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });
    const url = `${this.url}send-email/${emailType}/${id}/`;
    const data = { recipient_email: recipientEmail };

    return this.http.post(url, data, { headers });
  }

  // exporter un fichier excel
  exportToExcel(): Observable<HttpResponse<any>> {
    const headers = new HttpHeaders({ "Content-Type": "application/json" });
    return this.http.get(this.url + "exportExcel/", {
      headers: headers,
      observe: "response",
      responseType: "blob" as "json", // Important: responseType should be 'blob'
    });
  }

  sendReservationDetailsEmail(reservationId: number): Observable<any> {
    const token = localStorage.getItem("access_token");
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });
    const requestBody = { reservation_id: reservationId };
    return this.http.post<any>(this.url + "sendEmailClient/", requestBody, {
      headers,
    });
  }

  sendEmailToChauffeur(reservationId: number, chauffeurEmail: string): Observable<any> {
    const token = localStorage.getItem("access_token");
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });
    const requestBody = {
      reservation_id: reservationId,
      email_chauffeur: chauffeurEmail,
    };
    return this.http.post<any>(this.url + "sendEmailChauffeur/", requestBody, {
      headers,
    });
  }

  private createHeaders(): HttpHeaders {
    const token = localStorage.getItem('access_token');
    return new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });
  }

  private getPaginatedUrl(endpoint: string, page: number): string {
    return `${this.reservationUrl}${endpoint}/?page=${page}`;
  }



  getReservations(page: number, type: string): Observable<any> {
    const headers = this.createHeaders();
    let endpoint: string;

    switch (type) {
      case 'cancelled':
        endpoint = 'get_cancelled_reservations';
        break;
      case 'beforeToday':
        endpoint = 'get_reservations_before_today';
        break;
      case 'today':
        endpoint = 'get_reservations_today';
        break;
      case 'afterToday':
        endpoint = 'get_reservations_after_today';
        break;
      case 'archived':
        endpoint = 'get_archived_reservations';
        break;
      case 'reglees':  // Ajouter la gestion des réservations réglées
        endpoint = 'reglees';
        break;
      case 'non_reglees':  // Ajouter la gestion des réservations non réglées
        endpoint = 'non-reglees';
        break;
      default:
        endpoint = 'view';  // Endpoint par défaut
    }

    const url = this.getPaginatedUrl(endpoint, page);  // Méthode pour construire l'URL paginée
    return this.http.get<any>(url, { headers });
  }

  ReserverList(): Observable<any> {
    const token = localStorage.getItem("access_token");
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });
    return this.http.get<any>(this.reservationUrl, { headers });
  }

  getCalculateCounts(): Observable<any> {
    const token = localStorage.getItem("access_token");
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });
    return this.http.get<any>(`${this.reservationUrl}calculate_counts/`, {
      headers,
    });
  }
  updateReservationStatus(reservationId: number, action: string): Observable<any> {
    const url = `${this.reservationUrl}${reservationId}/status/`;
    const headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });
    const body = { action };

    return this.http.post<any>(url, body, { headers });
  }

  // service de recuperation de reservation par id
  getReservation(id: any): Observable<any> {
    // const token = localStorage.getItem('access_token');
    // const headers = new HttpHeaders({
    //   'Authorization': `Bearer ${token}`
    // });
    return this.http.get<any>(`${this.reservationUrl}${id}/`);
  }

  markAsRegler(reservationId: number, type: string): Observable<any> {
    // const token = localStorage.getItem('access_token');
    // const headers = new HttpHeaders({
    //   'Authorization': `Bearer ${token}`
    // });
    const url = `${this.reservationUrl}${reservationId}/mark-as-regler/`;
    return this.http.post<any>(url, { type });  }

  getReservationsByIds(ids: number[]): Observable<any> {
    const idsParam = ids.join(",");
    return this.http.get(`${this.reservationUrl}ids/`, {
      params: { ids: idsParam },
    });
  }

  updateLieuRendezVous(updates: { [key: number]: string }): Observable<any> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.http.post<any>(`${this.url}miseAJour/`, updates, { headers }).pipe(
      catchError(this.handleError)
    );
  }


  private handleError(error: any): Observable<never> {
    console.error('An error occurred:', error);
    return throwError(error);
  }

  getestimationsByIds(ids: number[]): Observable<any> {
    const idsParam = ids.join(",");
    return this.http.get(`${this.estimationUrl}get/ids/`, {
      params: { ids: idsParam },
    });
  }

  getReservationsSansFacture(utilisateurId: number): Observable<any[]> {
    let params = new HttpParams()
      .set("utilisateur_id", utilisateurId.toString());
    return this.http.get<any[]>(`${this.reservationUrl}sans_facture/`, {
      params,
    });
  }


  annulerReservation(
    reservationId: number,
    action: "cancel" | "restore"
  ): Observable<any> {
    const url = `${this.reservationUrl}annuler/${reservationId}/`;
    return this.http.post(url, { action });
  }

  // service des estimation

  private estimationData: any; // Stockage des données à partager

  setEstimationData(data: any) {
    this.estimationData = data;
  }
  getEstimationData() {
    return this.estimationData;
  }

  createMajorationForDatePeriod(data: any): Observable<any> {
    const token = localStorage.getItem("access_token");
    const headers = new HttpHeaders({ Authorization: `Bearer ${token}`, });
    return this.http.post(`${this.estimationUrl}majorationPeriodique/`, data, { headers, });
  }

  createMajorationForWeekdays(data: any): Observable<any> {
    const token = localStorage.getItem("access_token");
    const headers = new HttpHeaders({ Authorization: `Bearer ${token}`, });
    return this.http.post(`${this.estimationUrl}majorationJournaliere/`, data, { headers, });
  }

  getMajorations(): Observable<any> {
    const token = localStorage.getItem("access_token");
    const headers = new HttpHeaders({ Authorization: `Bearer ${token}`, });
    return this.http.get<any>(`${this.estimationUrl}majoration/`, {
      headers,
    });
  }

  cancelMajoration(id: number): Observable<any> {
    const token = localStorage.getItem("access_token");
    const headers = new HttpHeaders({ Authorization: `Bearer ${token}`, });
    return this.http.delete(`${this.estimationUrl}cancel-majoration/${id}/`, {
      headers,
    });
  }

  updateMajoration(id: number, majorationData: any): Observable<any> {
    const url = `${this.estimationUrl}majoration/${id}/`;
    const token = localStorage.getItem("access_token");
    const headers = new HttpHeaders({ Authorization: `Bearer ${token}`, });
    return this.http.put(url, majorationData, { headers });
  }

  getMajorationDetail(id: number): Observable<any> {
    const token = localStorage.getItem("access_token");
    const headers = new HttpHeaders({ Authorization: `Bearer ${token}`, });
    return this.http.get<any>(this.estimationUrl + "majoration/" + id + "/", { headers });
  }


  deleteAllMajorationsPasser(): Observable<void> {
    const token = localStorage.getItem("access_token");
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });
    return this.http.delete<void>(
      `${this.estimationUrl}majorationsPasser/deleteAll/`,
      { headers }
    );
  }
  calculateEstimation(data: any): Observable<any> {
    const token = localStorage.getItem("access_token");
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });
    return this.http.post(`${this.estimationUrl}calculDistance/`, data, {});
  }
  fetchLatestEstimation(): Observable<any> {
    const url = `${this.estimationUrl}latestEstimation/`;
    const token = localStorage.getItem("access_token");
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });
    return this.http.get(url, { headers });
  }

  getEstimation(id: number): Observable<any> {
    const token = localStorage.getItem("access_token");
    const headers = new HttpHeaders({ Authorization: `Bearer ${token}`, });
    return this.http.get<any>(this.estimationUrl + "estimation/" + id + "/", { headers });
  }
  deleteEstimation(id: number): Observable<any> {
    const token = localStorage.getItem("access_token");
    const headers = new HttpHeaders({ Authorization: `Bearer ${token}`, });
    return this.http.delete<any>(this.estimationUrl + "estimation/" + id + "/", { headers });
  }

  getEstimationWithCoutTransport(id: number): Observable<any> {
    const token = localStorage.getItem("access_token");
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });
    return this.http.get<any>(
      `${this.estimationUrl}estimationTransport/${id}/`,
      { headers }
    );
  }
  Reserver(formData: FormData): Observable<any> {
    const token = localStorage.getItem("access_token");
    const headers = new HttpHeaders({ Authorization: `Bearer ${token}`, });
    return this.http.post<any>(this.estimationUrl + "reserver/", formData, { headers });
  }

  generatePdf(estimationId: number): Observable<Blob> {
    const url = `${this.estimationUrl}pdfDevis/${estimationId}/`;
    const token = localStorage.getItem("access_token");
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });
    return this.http.get(url, { responseType: "blob", headers });
  }

  sendEmailEstimation(devis_id: number, recipient_email: string): Observable<any> {
    const requestBody = { devis_id: devis_id, recipient_email: recipient_email, };
    const token = localStorage.getItem("access_token");
    const headers = new HttpHeaders({ Authorization: `Bearer ${token}`, });
    return this.http.post<any>(this.estimationUrl + "sendpdf/" + devis_id + "/", requestBody, { headers });
  }

  getEstimationsFinal(): Observable<any[]> {
    const token = localStorage.getItem("access_token");
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });
    return this.http.get<any[]>(`${this.estimationUrl}estFinal/`, { headers });
  }

  // Méthode pour récupérer la liste des devis
  getDevisList(): Observable<any[]> {
    const token = localStorage.getItem("access_token");
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });
    return this.http.get<any[]>(`${this.estimationUrl}devis/`, { headers });
  }

  // Méthode pour récupérer un devis par son ID
  getDevisById(id: number): Observable<any> {
    const token = localStorage.getItem("access_token");
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });
    return this.http.get<any>(`${this.estimationUrl}devis/${id}/`, {
      headers,
    });
  }

  getEstimationFinalList(): Observable<any> {
    const token = localStorage.getItem("access_token");
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });
    return this.http.get<any>(`${this.estimationUrl}estFinal/`, {
      headers,
    });
  }

  getEstimationFinalById(id: number): Observable<any> {
    const token = localStorage.getItem("access_token");
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });
    return this.http.get<any>(`${this.estimationUrl}estFinal/${id}/`, {
      headers,
    });
  }
  // Méthode pour créer un devis

  createDevis(devis: any): Observable<any> {
    const token = localStorage.getItem("access_token");
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });
    return this.http.post<any>(`${this.estimationUrl}devis/`, devis, {
      headers,
    });
  }

  createEstimationFinal(estFinal: any): Observable<any> {
    const token = localStorage.getItem("access_token");
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });
    return this.http.post<any>(`${this.estimationUrl}estFinal/`, estFinal, {
      headers,
    });
  }

  // Méthode pour mettre à jour un devis
  updateDevis(id: number, devis: any): Observable<any> {
    const token = localStorage.getItem("access_token");
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });
    return this.http.put<any>(`${this.estimationUrl}devis/${id}/`, devis, {
      headers,
    });
  }
  updateEstimationFinal(id: number, estFinal: any): Observable<any> {
    const token = localStorage.getItem("access_token");
    const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });
    return this.http.put<any>(
      `${this.estimationUrl}estFinal/${id}/`,
      estFinal,
      { headers }
    );
  }

  // Méthode pour supprimer un devis
  deleteDevis(id: number): Observable<void> {
    const token = localStorage.getItem("access_token");
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });
    return this.http.delete<void>(`${this.estimationUrl}devis/${id}/`, {
      headers,
    });
  }

  createReservations(devisId: number): Observable<any> {
    const token = localStorage.getItem("access_token");
    const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });
    const body = { devis_id: devisId };
    return this.http.post<any>(this.estimationUrl + "devisEnResa/", body, {
      headers: headers,
    });
  }

  deleteEstimationFinal(id: number): Observable<void> {
    const token = localStorage.getItem("access_token");
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });
    return this.http.delete<void>(`${this.estimationUrl}estFinal/${id}/`, {
      headers,
    });
  }
  DeleteAllEstimationFinal(): Observable<void> {
    const token = localStorage.getItem("access_token");
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });
    return this.http.delete<void>(`${this.estimationUrl}deleteAllEstFinal/`, {
      headers,
    });
  }
  searchReservations(searchTerm: string): Observable<any[]> {
    const token = localStorage.getItem("access_token");
    const headers = new HttpHeaders({ Authorization: `Bearer ${token}`, });
    return this.http.get<any[]>(`${this.estimationUrl}search/?search=${searchTerm}`,
      { headers }
    );
  }

  // service de gestion de reservation selectionnez
  setSelectedEstimation(estFinal: any[]): void {
    this.selectedEstimation = estFinal;
  }
  // service de gestion de reservation selectionnez
  getSelectedEstimation(): any[] {
    return this.selectedEstimation;
  }
  // service de generation de reservation

  fetchLatestDevis(): Observable<any> {
    const url = `${this.estimationUrl}latestDevis/`;
    const token = localStorage.getItem("access_token");
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });
    return this.http.get(url, { headers });
  }

  // service de facture
  importReservations(file: File): Observable<any> {
    const formData: FormData = new FormData();
    formData.append("file", file, file.name);

    const headers = new HttpHeaders({
      Accept: "application/json",
    });

    return this.http.post(this.url + "import-reservations/", formData, {
      headers: headers,
    });
  }

  // service de recuperation de  la liste des factures
  getFactures(type_facture: any, total_factures: boolean = false, page: number = 1, pageSize: number = 10): Observable<any> {
    const token = localStorage.getItem("access_token");
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });

    let params = new HttpParams()
      .set('page', page.toString())
      .set('page_size', pageSize.toString());

    if (total_factures) {
      params = params.set('type_facture', 'total_factures');
    } else if (type_facture) {
      params = params.set('type_facture', type_facture);
    }

    return this.http.get<any>(this.factureUrl, { headers, params });
  }

  // service de recuperation de facture par id
  getFacture(id: number): Observable<any> {
    const token = localStorage.getItem("access_token");
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });
    return this.http.get<any>(`${this.factureUrl}${id}/`, { headers });
  }



  changerTypeFacture(id: number, nouveauType: string, sommePayee: number | null = null): Observable<any> {
    const token = localStorage.getItem('access_token');
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });

    const body: any = { type_facture: nouveauType };
    if (sommePayee !== null) {
      body.sommePayee = sommePayee;
    }

    return this.http.post<any>(`${this.factureUrl}${id}/changer-type/`, body, { headers });
  }

  //   downloadFacturePdf(factureId: number): Observable<Blob> {
  //     return this.http.get(`${this.factureUrl}${factureId}/pdf/`, { responseType: 'blob' });
  // }



  deleteFacture(id: number): Observable<any> {
    const token = localStorage.getItem("access_token");
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });
    return this.http.delete<any>(`${this.factureUrl}supprimer/${id}/`, {
      headers,
    });
  }

  sendFactureEmail(factureId: number, typePersonne: string, email?: string): Observable<any> {
    const url = `${this.factureUrl}mail/${factureId}/${typePersonne}/`;
    const body = email ? { email } : {};
    console.log('Sending email to:', body);  // Ajoutez cette ligne pour vérifier le contenu du corps
    return this.http.post(url, body);
  }

  sendDevisEmail(
    id: number,
    typePersonne: string,
    email?: string
  ): Observable<any> {
    const url = `${this.estimationUrl}devis/mail/${id}/${typePersonne}/`;
    const body = email ? { email } : {};
    return this.http.post(url, body);
  }
  // service de mise a jour de facture

  updateFacturePartial(id: number, facture: any): Observable<any> {
    const token = localStorage.getItem("access_token");
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    });

    return this.http.patch<any>(`${this.factureUrl}modifier/${id}/ `, facture, { headers });
  }
  // service de supression de facture

  fetchLatestFacture(): Observable<any> {
    const url = `${this.factureUrl}latestFacture/`;
    const token = localStorage.getItem("access_token");
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });
    return this.http.get(url, { headers });
  }
  deleteAllFactures(): Observable<any> {
    const url = this.factureUrl + "deleteAll/";
    const token = localStorage.getItem("access_token");
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });
    return this.http.delete(url, { headers });
  }
  // service de generation de reservation

  sendEmailFacture(devis_id: number, recipient_email: string): Observable<any> {
    const requestBody = {
      devis_id: devis_id,
      recipient_email: recipient_email,
    };
    const token = localStorage.getItem("access_token");
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });
    return this.http.post<any>(
      this.factureUrl + "send_facture/" + devis_id + "/",
      requestBody,
      { headers }
    );
  }

  // gve service

  // Entreprises
  getEntreprises(): Observable<any[]> {
    const token = localStorage.getItem("access_token");
    const headers = new HttpHeaders({ Authorization: `Bearer ${token}`, });
    return this.http.get<any[]>(this.gveUrl + "entreprises/", {
      headers,
    });
  }

  getMonEntreprises(): Observable<any> {
    const token = localStorage.getItem("access_token");
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });
    return this.http.get<any>(this.gveUrl + "monEntreprise/", {
      headers,
    });
  }

  getValideEntreprisesPartenaires(): Observable<any> {
    const token = localStorage.getItem("access_token");
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    });

    return this.http.get<any>(this.gveUrl + "entreprises/partenaires/valides/", { headers });
  }

  getEntreprisesPartenaire(): Observable<any[]> {
    const token = localStorage.getItem("access_token");
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });
    return this.http.get<any[]>(this.gveUrl + "infos/", { headers });
  }

  getEntrepriseDetail(id: number): Observable<any> {
    const token = localStorage.getItem("access_token");
    const headers = new HttpHeaders({ Authorization: `Bearer ${token}`, });
    return this.http.get<any>(this.gveUrl + "entreprises/" + id + "/", {
      headers,
    });
  }

  getChauffeurDetails(userId: any): Observable<any> {
    return this.http.get(`${this.url}auth/chauffeur/${userId}/`);
  }

  PersonnalUpdateChauffeur(user_id: number, chauffeurData: any): Observable<any> {
    const url = `${this.url}auth/chauffeur/update/${user_id}/`;
    return this.http.put(url, chauffeurData);
  }

  createMonEntreprise(formData: FormData): Observable<any> {
    const token = localStorage.getItem("access_token");
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });
    return this.http.post(this.gveUrl + "addMonEntreprise/", formData, {
      headers,
    });
  }

  updateEntreprise(id: number, entreprise: FormData): Observable<any> {
    const token = localStorage.getItem("access_token");
    const headers = new HttpHeaders({ Authorization: `Bearer ${token}`, });
    return this.http.put<any>(this.gveUrl + "entreprises/" + id + "/", entreprise, { headers });
  }

  deleteEntreprise(id: number): Observable<void> {
    const token = localStorage.getItem("access_token");
    const headers = new HttpHeaders({ Authorization: `Bearer ${token}`, });
    return this.http.delete<void>(this.gveUrl + "entreprises/" + id + "/", {
      headers,
    });
  }

  // Véhicules
  getVehicules(): Observable<any[]> {
    const token = localStorage.getItem("access_token");
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });
    return this.http.get<any[]>(this.gveUrl + "vehicules/", {});
  }

  getVehiculeDetail(id: any): Observable<any> {
    // const token = localStorage.getItem('access_token');
    // const headers = new HttpHeaders({
    //   'Authorization': `Bearer ${token}`
    // });
    return this.http.get<any>(this.gveUrl + "vehicules/" + id + "/");
  }

  getVehiculesForEntreprise(entrepriseId: number): Observable<any> {
    const token = localStorage.getItem("access_token");
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });
    const params = new HttpParams().set('id', entrepriseId);
    const url = `${this.gveUrl}vehiculesEntreprise/`;
    return this.http.get(url, { headers, params });
  }

  getChauffeursByEntreprise(entrepriseId: any): Observable<any[]> {
    const token = localStorage.getItem('access_token');
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    });

    const params = new HttpParams().set('id', entrepriseId);
    return this.http.get<any[]>(`${this.gveUrl}chauffeursEntreprise/`, { headers, params });
  }

  getChauffeurProfile(page: number): Observable<any> {
    const token = localStorage.getItem('access_token');
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    });

    const params = new HttpParams().set('page', page.toString());
    return this.http.get<any>(`${environment.apiUrl}auth/chauffeur/profil/`, { headers, params });
  }

  getPartenaireProfile(page: number): Observable<any> {
    const token = localStorage.getItem('access_token');
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    });

    const params = new HttpParams().set('page', page.toString());
    return this.http.get<any>(`${environment.apiUrl}auth/partenaire/profil/`, { headers, params });
  }

  getClientProfile(): Observable<any> {
    const token = localStorage.getItem('access_token');
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    });

    return this.http.get<any>(`${environment.apiUrl}auth/client/profil/`, { headers });
  }

  getClientsLies(page: number = 1, rows: number = 10): Observable<any> {
    const token = localStorage.getItem('access_token');
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    });

    const params = new HttpParams().set('page', page.toString()).set('size', rows.toString());

    return this.http.get<any>(`${environment.apiUrl}auth/client/clients-lies/`, { headers, params });
  }

  toggleClientAccountStatus(userId: number): Observable<any> {
    const token = localStorage.getItem('access_token');
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
    const url = `${environment.apiUrl}auth/client/account-action/${userId}/`;
    return this.http.post<any>(url, {}, { headers });
  }


  toggleChauffeurAccountStatus(userId: number): Observable<any> {
    const token = localStorage.getItem('access_token');
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
    const url = `${environment.apiUrl}auth/chauffeur/account-action/${userId}/`;
    return this.http.post<any>(url, {}, { headers });
  }


  gererAssociationClient(clientId: number, action: 'associer' | 'dissocier', cle?: string): Observable<any> {
    const token = localStorage.getItem('access_token');
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
    const body = {
      action: action,
      ...(action === 'associer' && cle ? { cle: cle } : {})
    };
    return this.http.post<any>(`${environment.apiUrl}auth/client/associer-dissocier/${clientId}/`, body, { headers });
  }

  getChauffeursByEntrepriseIds(entrepriseIds: any[]): Observable<any[]> {
    const token = localStorage.getItem('access_token');
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    });

    let params = new HttpParams();
    entrepriseIds.forEach(id => {
      params = params.append('ids', id);  // Encapsuler plusieurs valeurs pour 'ids'
    });

    return this.http.get<any[]>(`${this.gveUrl}chauffeursEntreprise/`, { headers, params });
  }

  getChauffeursByExpression(expression: string): Observable<any[]> {
    const token = localStorage.getItem('access_token');
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    });

    const params = new HttpParams().set('expression', expression);

    return this.http.get<any[]>(`${this.gveUrl}chauffeursEntreprise/`, { headers, params });
  }


  createVehicule(formData: FormData): Observable<any> {
    const token = localStorage.getItem("access_token");
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });
    return this.http.post<any>(this.gveUrl + "vehicules/", formData, {
      headers,
    });
  }

  registerUser(userData: any): Observable<any> {
    if (userData instanceof FormData) {
      return this.http.post<any>(this.url + "auth/register/", userData);
    } else {
      const headers = new HttpHeaders({ "Content-Type": "application/json", });
      return this.http.post<any>(this.url + "auth/register/", JSON.stringify(userData), { headers });
    }
  }

  updateVehicule(id: number, vehicule: FormData): Observable<any> {
    const token = localStorage.getItem("access_token");
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });
    return this.http.put<any>(this.gveUrl + "vehiculesUpdate/" + id + "/", vehicule, { headers }
    );
  }

  deleteVehicule(id: number): Observable<void> {
    const token = localStorage.getItem("access_token");
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });
    return this.http.delete<void>(this.gveUrl + "vehicules/" + id + "/", {
      headers,
    });
  }

  // Prix
  getPrix(): Observable<any> {
    const token = localStorage.getItem("access_token");
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });
    return this.http.get<any>(this.gveUrl + "prix/", { headers });
  }

  getPrixDetail(id: number): Observable<any> {
    const token = localStorage.getItem("access_token");
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });
    return this.http.get<any>(this.gveUrl + "prix/" + id + "/", { headers });
  }

  createPrix(prix: any): Observable<any> {
    const token = localStorage.getItem("access_token");
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });
    return this.http.post<any>(this.gveUrl + "prix/", prix, { headers });
  }

  updatePrix(id: number, prix: any): Observable<any> {
    const token = localStorage.getItem("access_token");
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });
    return this.http.put<any>(this.gveUrl + "updatePrix/" + id + "/", prix, {
      headers,
    });
  }

  deletePrix(id: number): Observable<void> {
    const token = localStorage.getItem("access_token");
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });
    return this.http.delete<void>(this.gveUrl + "prix/" + id + "/", {
      headers,
    });
  }

  // Chauffeurs
  getChauffeurs(): Observable<any[]> {
    const token = localStorage.getItem("access_token");
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });
    return this.http.get<any[]>(this.gveUrl + "chauffeurs/", { headers });
  }



  deleteChauffeur(id: number): Observable<void> {
    const token = localStorage.getItem("access_token");
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });
    return this.http.delete<void>(this.gveUrl + "chauffeurs/" + id + "/", {
      headers,
    });
  }

  sendAvertissement(entityId: string, message: string, warningType: string): Observable<any> {
    const token = localStorage.getItem('access_token');
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    });

    const body = {
      entity_id: entityId,
      message: message,
      warning_type: warningType,
    };

    return this.http.post<any>(`${this.gveUrl}avertissements/`, body, { headers });
  }

  toggleValidation(entityId: string, entityType: string, action: string): Observable<any> {
    const token = localStorage.getItem('access_token');
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    });

    const body = {
      entity_id: entityId,
      entity_type: entityType,
      action: action
    };

    return this.http.post<any>(`${this.gveUrl}toggle-validation/`, body, { headers });
  }

  // setting services

  addParametres(Parametres: any): Observable<any> {
    const token = localStorage.getItem("access_token");
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });
    return this.http.post<any>(this.settingUrl + "parametres/", Parametres, { headers });
  }
  addAttribut(attribut: any): Observable<any> {
    const token = localStorage.getItem("access_token");
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });
    return this.http.post<any>(this.settingUrl + "attributs/create/", attribut, { headers });
  }
  addTypeVehicule(type: any): Observable<any> {
    const token = localStorage.getItem("access_token");
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });
    return this.http.post<any>(this.settingUrl + "typeVehicules/", type, { headers });
  }

  addApi(api: any): Observable<any> {
    const token = localStorage.getItem("access_token");
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });
    return this.http.post<any>(this.settingUrl + "clesApi/", api, {
      headers,
    });
  }

  addVirement(virementData: any): Observable<any> {
    const token = localStorage.getItem("access_token");
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });
    return this.http.post<any>(this.settingUrl + "virementBancaire/", virementData, { headers });
  }

  addPaypal(paypal: any): Observable<any> {
    const token = localStorage.getItem("access_token");
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });
    return this.http.post<any>(this.settingUrl + "paypal/", paypal, {
      headers,
    });
  }
  /*   addStripe(stripe: any): Observable<any> {
      const token = localStorage.getItem("access_token");
      const headers = new HttpHeaders({
        Authorization: `Bearer ${token}`,
      });
      return this.http.post<any>(this.settingUrl + "stripe/create/", stripe, {
        headers,
      });
    } */

  addConfigFacture(configFacture: any): Observable<any> {
    const token = localStorage.getItem("access_token");
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });
    return this.http.post<any>(this.settingUrl + "configFacture/", configFacture, { headers });
  }

  addConfigDevis(configDevis: any): Observable<any> {
    const token = localStorage.getItem("access_token");
    const headers = new HttpHeaders({ Authorization: `Bearer ${token}`, });
    return this.http.post<any>(this.settingUrl + "configDevis/", configDevis, { headers });
  }


  addInfoUser(infoUser: any): Observable<any> {
    const token = localStorage.getItem("access_token");
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });
    return this.http.post<any>(this.settingUrl + "infoUser/", infoUser, {
      headers,
    });
  }
  // service de recuperation de la liste de Parametres
  getAllParametres(): Observable<any> {
    const token = localStorage.getItem("access_token");
    const headers = new HttpHeaders({ Authorization: `Bearer ${token}`, });
    return this.http.get<any>(this.settingUrl + "parametres/", { headers, });
  }
  getAllAttribut(): Observable<any> {

    return this.http.get<any>(this.settingUrl + "attributs/", {});
  }
  getAllTypeVehicule(): Observable<any> {
    const token = localStorage.getItem("access_token");
    const headers = new HttpHeaders({ Authorization: `Bearer ${token}`, });
    return this.http.get<any>(this.settingUrl + "typeVehicules/", { headers, });
  }
  getAllMethodePayement(): Observable<any> {
    /*  const token = localStorage.getItem("access_token");
     const headers = new HttpHeaders({
       Authorization: `Bearer ${token}`,
     }); */
    return this.http.get<any>(this.settingUrl + "methodes/", {});
  }

  getAllApi(): Observable<any> {
    const token = localStorage.getItem("access_token");
    const headers = new HttpHeaders({ Authorization: `Bearer ${token}`, });
    return this.http.get<any>(this.settingUrl + "clesApi/", { headers });
  }

  getAllVirement(): Observable<any> {
    const token = localStorage.getItem("access_token");
    const headers = new HttpHeaders({ Authorization: `Bearer ${token}`, });
    return this.http.get<any>(this.settingUrl + "virementBancaire/", { headers });
  }

  getAllPaypal(): Observable<any> {
    const token = localStorage.getItem("access_token");
    const headers = new HttpHeaders({ Authorization: `Bearer ${token}`, });
    return this.http.get<any>(this.settingUrl + "paypal/", { headers });
  }
  getAllStripe(): Observable<any> {
    const token = localStorage.getItem("access_token");
    const headers = new HttpHeaders({ Authorization: `Bearer ${token}`, });
    return this.http.get<any>(this.settingUrl + "stripe/", { headers });
  }

  getAllConfigFacture(): Observable<any> {
    const token = localStorage.getItem("access_token");
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });
    return this.http.get<any>(this.settingUrl + "configFacture/", {
      headers,
    });
  }

  getAllConfigDevis(): Observable<any> {
    const token = localStorage.getItem("access_token");
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });
    return this.http.get<any>(this.settingUrl + "configDevis/", {
      headers,
    });
  }

  // service de recuperation de Parametres par id
  getParametre(id: number): Observable<any> {
    const token = localStorage.getItem("access_token");
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });
    return this.http.get<any>(
      this.settingUrl + "ParametresDetail/" + id + "/",
      { headers }
    );
  }
  getAttribut(id: number): Observable<any> {
    const token = localStorage.getItem("access_token");
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });
    return this.http.get<any>(this.settingUrl + "attributs/" + id + "/", {
      headers,
    });
  }
  getTypeVehicule(id: number): Observable<any> {
    const token = localStorage.getItem("access_token");
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });
    return this.http.get<any>(
      this.settingUrl + "typeVehicules/" + id + "/",
      { headers }
    );
  }
  getMethodePayement(id: number): Observable<any> {
    const token = localStorage.getItem("access_token");
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });
    return this.http.get<any>(
      this.settingUrl + "methodesPaiement/" + id + "/",
      { headers }
    );
  }
  getVirement(id: number): Observable<any> {
    const token = localStorage.getItem("access_token");
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });
    return this.http.get<any>(
      this.settingUrl + "virementBancaire/" + id + "/",
      { headers }
    );
  }
  getPaypal(id: number): Observable<any> {
    const token = localStorage.getItem("access_token");
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });
    return this.http.get<any>(this.settingUrl + "paypal/" + id + "/", {
      headers,
    });
  }
  getStripe(id: number): Observable<any> {
    const token = localStorage.getItem("access_token");
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });
    return this.http.get<any>(this.settingUrl + "stripe/" + id + "/", {
      headers,
    });
  }

  getCleApi(id: number): Observable<any> {
    const token = localStorage.getItem("access_token");
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });
    return this.http.get<any>(this.settingUrl + "clesApi/" + id + "/", {
      headers,
    });
  }


  getConfigFacture(id: number): Observable<any> {
    const token = localStorage.getItem("access_token");
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });
    return this.http.get<any>(
      this.settingUrl + "configFacture/" + id + "/",
      { headers }
    );
  }

  getConfigDevis(id: number): Observable<any> {
    const token = localStorage.getItem("access_token");
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });
    return this.http.get<any>(
      this.settingUrl + "configDevis/" + id + "/",
      { headers }
    );
  }

  // service de mise a jour de Parametres
  updateParametres(id: number, Parametres: any): Observable<any> {
    const token = localStorage.getItem("access_token");
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });
    return this.http.put<any>(
      this.settingUrl + "ParametresDetail/" + id + "/",
      Parametres,
      { headers }
    );
  }
  updateAttribut(id: number, attribut: any): Observable<any> {
    const token = localStorage.getItem("access_token");
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });
    return this.http.put<any>(
      this.settingUrl + "attributs/" + id + "/",
      attribut,
      { headers }
    );
  }
  updateTypeVehicule(id: number, type: any): Observable<any> {
    const token = localStorage.getItem("access_token");
    const headers = new HttpHeaders({ Authorization: `Bearer ${token}`, });
    return this.http.put<any>(this.settingUrl + "typeVehicules/" + id + "/", type, { headers });
  }

  updateMethodePayement(id: number, changes: Partial<any>): Observable<any> {
    const token = localStorage.getItem("access_token");
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });
    return this.http.patch<any>(this.settingUrl + "methodesPaiement/" + id + "/", changes, { headers });
  }


  updateVirement(id: number, data: FormData): Observable<any> {
    const token = localStorage.getItem("access_token");
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });
    return this.http.put<any>(
      this.settingUrl + "virementBancaire/" + id + "/",
      data,
      { headers }
    );
  }
  updatePayPal(id: number, data: FormData): Observable<any> {
    const token = localStorage.getItem("access_token");
    const headers = new HttpHeaders({ Authorization: `Bearer ${token}`, });
    return this.http.put<any>(this.settingUrl + "paypal/" + id + "/", data, {
      headers,
    });
  }
  updateStripe(id: number, data: FormData): Observable<any> {
    const token = localStorage.getItem("access_token");
    const headers = new HttpHeaders({ Authorization: `Bearer ${token}`, });
    return this.http.put<any>(this.settingUrl + "stripe/" + id + "/", data, {
      headers,
    });
  }

  updateApi(id: number, api: any): Observable<any> {
    const token = localStorage.getItem("access_token");
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });
    return this.http.put<any>(this.settingUrl + "clesApi/" + id + "/", api, {
      headers,
    });
  }

  updateConfigFacture(id: number, configFacture: any): Observable<any> {
    const token = localStorage.getItem("access_token");
    const headers = new HttpHeaders({ Authorization: `Bearer ${token}`, });
    return this.http.put<any>(this.settingUrl + "configFacture/" + id + "/", configFacture, { headers }
    );
  }

  updateConfigDevis(id: number, configDevis: any): Observable<any> {
    const token = localStorage.getItem("access_token");
    const headers = new HttpHeaders({ Authorization: `Bearer ${token}`, });
    return this.http.put<any>(this.settingUrl + "configDevis/" + id + "/", configDevis, { headers }
    );
  }

  updateInfoUser(infoUser: any): Observable<any> {
    const token = localStorage.getItem("access_token");
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });
    return this.http.put<any>(this.settingUrl + "infoUser/update/", infoUser, {
      headers,
    });
  }

  addCodeVerification(data: any): Observable<any> {
    const token = localStorage.getItem("access_token");
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });
    return this.http.post<any>(this.settingUrl + "codes/", data, { headers });
  }

  // Méthode pour lister et créer des entrées du service client
  getServiceClients(): Observable<any[]> {
    const token = localStorage.getItem("access_token");
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });
    return this.http.get<any[]>(this.settingUrl + 'service-client/', { headers });
  }

  addServiceClient(serviceClient: any): Observable<any> {
    const token = localStorage.getItem("access_token");
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });
    return this.http.post<any>(this.settingUrl + 'service-client/', serviceClient, { headers });
  }

  // Méthode pour récupérer, mettre à jour et supprimer une entrée du service client par ID
  getServiceClientById(id: number): Observable<any> {
    const token = localStorage.getItem("access_token");
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });
    return this.http.get<any>(this.settingUrl + 'service-client/' + id + '/', { headers });
  }

  updateServiceClient(id: number, serviceClient: any): Observable<any> {
    const token = localStorage.getItem("access_token");
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });
    return this.http.put<any>(this.settingUrl + 'service-client/' + id + '/', serviceClient, { headers });
  }

  deleteServiceClient(id: number): Observable<any> {
    const token = localStorage.getItem("access_token");
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });
    return this.http.delete<any>(this.settingUrl + 'service-client/' + id + '/', { headers });
  }

  addUrl(data: any): Observable<any> {
    const token = localStorage.getItem("access_token");
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });
    return this.http.post<any>(this.settingUrl + "urls/", data, { headers });
  }

  addMethode(data: any): Observable<any> {
    const token = localStorage.getItem("access_token");
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });
    return this.http.post<any>(this.settingUrl + "methodes/", data, { headers });
  }

  getAllCodeVerification(): Observable<any> {
    const token = localStorage.getItem("access_token");
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });
    return this.http.get<any>(`${this.settingUrl}codes/`, { headers });
  }

  getAllUrls(): Observable<any> {
    const token = localStorage.getItem("access_token");
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });
    return this.http.get<any>(`${this.settingUrl}urls/`, { headers });
  }

  getCodeVerification(id: number): Observable<any> {
    const token = localStorage.getItem("access_token");
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });
    return this.http.get<any>(this.settingUrl + "codes/" + id + "/", {
      headers,
    });
  }

  getUrl(id: number): Observable<any> {
    const token = localStorage.getItem("access_token");
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });
    return this.http.get<any>(this.settingUrl + "urls/" + id + "/", {
      headers,
    });
  }

  getMethode(id: number): Observable<any> {
    const token = localStorage.getItem("access_token");
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });
    return this.http.get<any>(this.settingUrl + "methodes/" + id + "/", {
      headers,
    });
  }



  updateCodeVerification(id: number, data: any): Observable<any> {
    const token = localStorage.getItem("access_token");
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });
    return this.http.put<any>(this.settingUrl + "codes/" + id + "/", data, {
      headers,
    });
  }

  updateUrl(id: number, data: any): Observable<any> {
    const token = localStorage.getItem("access_token");
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });
    return this.http.put<any>(this.settingUrl + "urls/" + id + "/", data, {
      headers,
    });
  }

  updateMethode(id: number, data: any): Observable<any> {
    const token = localStorage.getItem("access_token");
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });
    return this.http.put<any>(this.settingUrl + "methodes/" + id + "/", data, {
      headers,
    });
  }
  updateMethodeActive(id: number, data: any): Observable<any> {
    const token = localStorage.getItem("access_token");
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });
    return this.http.patch<any>(this.settingUrl + "methodesActive/" + id + "/", data, { headers });
  }
  // service de supression de Parametres par id
  deleteParametres(id: number): Observable<any> {
    const token = localStorage.getItem("access_token");
    const headers = new HttpHeaders({ Authorization: `Bearer ${token}`, });
    return this.http.delete<any>(this.settingUrl + "ParametresDetail/" + id + "/", { headers });
  }
  // service de supression de Parametres par id
  deleteAttribut(id: number): Observable<any> {
    const token = localStorage.getItem("access_token");
    const headers = new HttpHeaders({ Authorization: `Bearer ${token}`, });
    return this.http.delete<any>(this.settingUrl + "attributs/" + id + "/", { headers }
    );
  }

  deleteTypeVehicule(id: number): Observable<any> {
    const token = localStorage.getItem("access_token");
    const headers = new HttpHeaders({ Authorization: `Bearer ${token}`, });
    return this.http.delete<any>(this.settingUrl + "typeVehicules/" + id + "/",
      { headers }
    );
  }

  deleteApi(id: number): Observable<any> {
    const token = localStorage.getItem("access_token");
    const headers = new HttpHeaders({ Authorization: `Bearer ${token}`, });
    return this.http.delete<any>(this.settingUrl + "clesApi/" + id + "/", {
      headers,
    });
  }

  deleteAllParametres(): Observable<any> {
    const token = localStorage.getItem("access_token");
    const headers = new HttpHeaders({ Authorization: `Bearer ${token}`, });
    return this.http.delete(this.settingUrl + "parametres/delete/", {
      headers,
    });
  }

}
