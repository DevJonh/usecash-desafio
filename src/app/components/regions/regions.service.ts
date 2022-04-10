import { Region } from '../../models/region';
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { retry, catchError, map } from 'rxjs/operators';
import { ShowMessageService } from 'src/services/show-message.service';

@Injectable({
  providedIn: 'root',
})
export class RegionService {
  private baseUrl = 'http://localhost:3000';
  private httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json',
    }),
  };

  public loading = false;

  constructor(private http: HttpClient, private message: ShowMessageService) {}

  create(data: Region): Observable<Region> {
    return this.http
      .post<Region>(`${this.baseUrl}/regions`, data, this.httpOptions)
      .pipe(
        retry(1),
        catchError((e) => this.handleError(e, 'criation'))
      );
  }

  getRegions(): Observable<Region[]> {
    return this.http
      .get<Region[]>(`${this.baseUrl}/regions`, this.httpOptions)
      .pipe(
        retry(1),
        catchError((e) => this.handleError(e, ''))
      );
  }

  updateRegion(id: number | undefined, region: Region): Observable<Region> {
    if (!id) {
      this.message.showMessage('Erro durante a edição', true);
    }

    return this.http
      .put<Region>(`${this.baseUrl}/regions/${id}`, region, this.httpOptions)
      .pipe(
        retry(1),
        catchError((e) => this.handleError(e, 'update'))
      );
  }

  updateStatusRegion(
    id: number | undefined,
    region: Region
  ): Observable<Region> {
    if (!id) {
      this.message.showMessage('Erro durante a edição', true);
    }
    return this.http
      .put<Region>(
        `${this.baseUrl}/regions/${id}`,
        { ...region, status: region.status === 'ativo' ? 'inativo' : 'ativo' },
        this.httpOptions
      )
      .pipe(
        retry(1),
        catchError((e) => this.handleError(e, 'update'))
      );
  }

  verifyDuplicateRegions(region: string) {
    return this.http
      .get<Region[]>(`${this.baseUrl}/regions`, this.httpOptions)
      .pipe(
        map((dados: { region: any }[]) =>
          dados.filter((d) => d.region === region.toUpperCase())
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
