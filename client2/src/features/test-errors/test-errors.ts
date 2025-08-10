import { HttpClient } from '@angular/common/http';
import { Component, inject, signal } from '@angular/core';
import { environment } from '../../environments/environment';

@Component({
  selector: 'app-test-errors',
  imports: [],
  templateUrl: './test-errors.html',
  styleUrl: './test-errors.css'
})
export class TestErrors {
  baseUrl = environment.apiUrl;
  private http = inject(HttpClient);
  validationErrors=signal<string[]>([]);
  get400Error() {
    this.http.get(this.baseUrl + 'buggy/bad-request').subscribe({
      next: (response) => console.log(response),
      error: (error) => console.error(error),
    });
  }

  get401Error() {
    this.http.get(this.baseUrl + 'buggy/auth').subscribe({
      next: (response) => console.log(response),
      error: (error) => console.error(error),
    });
  }

  get404Error() {
    this.http.get(this.baseUrl + 'buggy/not-fount').subscribe({
      next: (response) => console.log(response),
      error: (error) => console.error(error),
    });
  }

  get500Error() {
    this.http.get(this.baseUrl + 'buggy/server-error').subscribe({
      next: (response) => console.log(response),
      error: (error) => console.error(error),
    });
  }

  get400ValidationError() {
    this.http.post(this.baseUrl + 'account/register',{}).subscribe({
      next: (response) => console.log(response),
      error: (error) => {
        console.error(error);
        this.validationErrors.set(error);
      },
    });
  }
}
