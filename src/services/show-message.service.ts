import { Injectable } from '@angular/core';
import { throwError } from 'rxjs';

import { MatSnackBar } from '@angular/material/snack-bar';

@Injectable({
  providedIn: 'root',
})
export class ShowMessageService {
  constructor(private snackBar: MatSnackBar) {}

  showMessage(msg: string, isError: boolean = false): void {
    this.snackBar.open(msg, 'X', {
      duration: 3000,
      horizontalPosition: 'right',
      verticalPosition: 'top',
      panelClass: isError ? ['snack-error'] : ['snack-success'],
    });
  }

  handleError(e: any) {
    if (e.statusText === 'Unknown Error') {
      this.showMessage('Ocorreu um erro inesperado!', true);
    }
    return throwError(e.message);
  }
}
