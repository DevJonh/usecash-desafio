import { User } from '../../models/user';
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { retry, catchError, delay, map } from 'rxjs/operators';
import * as CryptoJS from 'crypto-js';
import { ShowMessageService } from 'src/services/show-message.service';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private baseUrl = 'http://localhost:3000';
  private httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json',
    }),
  };

  public loading = false;

  constructor(private http: HttpClient, private message: ShowMessageService) {}

  create(data: User): Observable<User> {
    return this.http
      .post<User>(`${this.baseUrl}/users`, data, this.httpOptions)
      .pipe(
        retry(1),
        catchError((e) => this.handleError(e, 'criation'))
      );
  }

  getUsers(): Observable<User[]> {
    return this.http
      .get<User[]>(`${this.baseUrl}/users`, this.httpOptions)
      .pipe(
        retry(1),
        catchError((e) => this.handleError(e, ''))
      );
  }

  updateUser(id: number | undefined, user: User): Observable<User> {
    if (!id) {
      this.message.showMessage('Erro durante a edição', true);
    }

    return this.http
      .put<User>(`${this.baseUrl}/users/${id}`, user, this.httpOptions)
      .pipe(
        retry(1),
        catchError((e) => this.handleError(e, 'update'))
      );
  }

  updateStatusUser(id: number, user: User): Observable<User> {
    return this.http
      .put<User>(
        `${this.baseUrl}/users/${id}`,
        { ...user, status: user.status === 'ativo' ? 'inativo' : 'ativo' },
        this.httpOptions
      )
      .pipe(
        retry(1),
        catchError((e) => this.handleError(e, 'update'))
      );
  }

  deleteUser(id: number): Observable<User> {
    return this.http
      .delete<User>(`${this.baseUrl}/users/${id}`, this.httpOptions)
      .pipe(
        retry(1),
        catchError((e) => this.handleError(e, 'delete'))
      );
  }

  encryptPassword(senha: string): string {
    return CryptoJS.AES.encrypt(senha, 'secret key 123').toString();
  }

  decryptPassword(senha: string): string {
    return CryptoJS.AES.decrypt(senha, 'secret key 123').toString(
      CryptoJS.enc.Utf8
    );
  }

  verifyDuplicateEmail(email: string) {
    return this.http
      .get<User[]>(`${this.baseUrl}/users`, this.httpOptions)
      .pipe(
        delay(3500),
        map((dados: { email: any }[]) =>
          dados.filter((d) => d.email === email)
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
