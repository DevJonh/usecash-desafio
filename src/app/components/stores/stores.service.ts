import { Store } from '../../models/store';
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { retry, catchError, map } from 'rxjs/operators';
import { ShowMessageService } from 'src/services/show-message.service';

@Injectable({
  providedIn: 'root',
})
export class StoreService {
  private baseUrl = 'http://localhost:3000';
  private httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json',
    }),
  };

  public loading = false;

  constructor(private http: HttpClient, private message: ShowMessageService) {}

  create(data: Store): Observable<Store> {
    return this.http
      .post<Store>(`${this.baseUrl}/stores`, data, this.httpOptions)
      .pipe(
        retry(1),
        catchError((e) => this.handleError(e, 'criation'))
      );
  }

  getStores(): Observable<Store[]> {
    return this.http
      .get<Store[]>(`${this.baseUrl}/stores`, this.httpOptions)
      .pipe(
        retry(1),
        catchError((e) => this.handleError(e, ''))
      );
  }

  updateStore(id: number | undefined, store: Store): Observable<Store> {
    if (!id) {
      this.message.showMessage('Erro durante a edição', true);
    }

    return this.http
      .put<Store>(`${this.baseUrl}/stores/${id}`, store, this.httpOptions)
      .pipe(
        retry(1),
        catchError((e) => this.handleError(e, 'update'))
      );
  }

  updateStatusStore(id: number, store: Store): Observable<Store> {
    return this.http
      .put<Store>(
        `${this.baseUrl}/stores/${id}`,
        { ...store, status: store.status === 'ativo' ? 'inativo' : 'ativo' },
        this.httpOptions
      )
      .pipe(
        retry(1),
        catchError((e) => this.handleError(e, 'update'))
      );
  }

  verifyDuplicateNumber(number: number) {
    return this.http
      .get<Store[]>(`${this.baseUrl}/stores`, this.httpOptions)
      .pipe(
        map((dados: { number: any }[]) =>
          dados.filter((d) => d.number === number)
        ),
        map((dados: any[]) => dados.length > 0),
        retry(1),
        catchError((e) => this.handleError(e, ''))
      );
  }

  handleError(e: any, type: string) {
    if (e.statusText === 'Unknown Error')
      this.message.showMessage('Ocorreu um erro inesperado!', true);

    if (type === 'criation')
      this.message.showMessage(
        'Falha ao criar a tarefa! Tente mais tarde.',
        true
      );
    if (type === 'delete')
      this.message.showMessage(
        'Falha na exclusão a tarefa! Tente mais tarde.',
        true
      );
    if (type === 'update')
      this.message.showMessage(
        'Falha ao atualizar a tarefa! Tente mais tarde.',
        true
      );

    return throwError(e.message);
  }
}
