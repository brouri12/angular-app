import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { catchError, throwError } from 'rxjs';

export const httpErrorInterceptor: HttpInterceptorFn = (req, next) => {
  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      let errorMessage = '';

      if (error.error instanceof ErrorEvent) {
        // Erreur côté client
        errorMessage = `Erreur: ${error.error.message}`;
      } else {
        // Erreur côté serveur
        switch (error.status) {
          case 0:
            errorMessage = 'Impossible de se connecter au serveur. Vérifiez votre connexion.';
            break;
          case 400:
            errorMessage = error.error?.message || 'Requête invalide';
            break;
          case 401:
            errorMessage = 'Non autorisé. Veuillez vous connecter.';
            break;
          case 403:
            errorMessage = 'Accès refusé';
            break;
          case 404:
            errorMessage = 'Ressource non trouvée';
            break;
          case 409:
            errorMessage = error.error?.message || 'Conflit de données';
            break;
          case 500:
            errorMessage = 'Erreur serveur. Veuillez réessayer plus tard.';
            break;
          default:
            errorMessage = `Erreur ${error.status}: ${error.message}`;
        }
      }

      console.error('Erreur HTTP:', errorMessage, error);
      
      // Retourner l'erreur avec un message personnalisé
      return throwError(() => ({
        ...error,
        customMessage: errorMessage
      }));
    })
  );
};
