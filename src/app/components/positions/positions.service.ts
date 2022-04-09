import { Position } from '../../models/position';
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { retry, catchError, map } from 'rxjs/operators';
import { ShowMessageService } from 'src/services/show-message.service';

@Injectable({
  providedIn: 'root',
})
export class PositionService {
  private baseUrl = 'http://localhost:3000';
  private httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json',
    }),
  };

  public loading = false;

  constructor(private http: HttpClient, private message: ShowMessageService) {}

  create(data: Position): Observable<Position> {
    return this.http
      .post<Position>(`${this.baseUrl}/positions`, data, this.httpOptions)
      .pipe(
        retry(1),
        catchError((e) => this.handleError(e, 'criation'))
      );
  }

  getPositions(): Observable<Position[]> {
    return this.http
      .get<Position[]>(`${this.baseUrl}/positions`, this.httpOptions)
      .pipe(
        retry(1),
        catchError((e) => this.handleError(e, ''))
      );
  }

  updatePosition(
    id: number | undefined,
    position: Position
  ): Observable<Position> {
    if (!id) {
      this.message.showMessage('Erro durante a edição', true);
    }

    return this.http
      .put<Position>(
        `${this.baseUrl}/positions/${id}`,
        position,
        this.httpOptions
      )
      .pipe(
        retry(1),
        catchError((e) => this.handleError(e, 'update'))
      );
  }

  deletePosition(id: number): Observable<Position> {
    return this.http
      .delete<Position>(`${this.baseUrl}/positions/${id}`, this.httpOptions)
      .pipe(
        retry(1),
        catchError((e) => this.handleError(e, 'delete'))
      );
  }

  verifyDuplicateEmail(name: string) {
    return this.http
      .get<Position[]>(`${this.baseUrl}/positions`, this.httpOptions)
      .pipe(
        map((dados: { name: any }[]) => dados.filter((d) => d.name === name)),
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
