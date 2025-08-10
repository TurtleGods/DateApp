import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { ToastService } from '../services/toast-service';
import { NavigationExtras, Router } from '@angular/router';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  const toast = inject(ToastService);

  return next(req).pipe(
    catchError((error) => {
      if (error) {
        switch (error.status) {
          case 400:
            if (error.error.errors) {
              const modalStatusErrors: any[] = [];
              for (const key in error.error.errors) {
                if (error.error.errors[key]) {
                  modalStatusErrors.push(error.error.errors[key]);
                }
              }
            throw modalStatusErrors.flat();
            } else {
              toast.error(error.error);
            }
            break;
          case 401:
            toast.error('Unauthorised');
            break;
          case 404:
            router.navigateByUrl('/not-found');
            break;
          case 500:
            const navigationExtras :NavigationExtras = {state: {error: error.error}};
            router.navigateByUrl('/server-error', navigationExtras);
            break;
          default:
            toast.error('Something unexpected went wrong');
            break;
        }
      }
      return throwError(() => error);
    })
  );};
