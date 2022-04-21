import { map } from 'rxjs/operators';
import { Component, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import alasql from 'alasql';

import { Position } from 'src/app/models/position';
import { MyErrorStateMatcher } from 'src/app/utils/input-error-state';
import { ShowMessageService } from 'src/services/show-message.service';
import { PositionService } from './positions.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-positions',
  templateUrl: './positions.component.html',
  styleUrls: ['./positions.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class PositionsComponent implements OnInit {
  displayedColumns: string[] = ['id', 'name', 'action'];
  position: Position = <Position>{};
  formData!: FormGroup;
  searchData!: FormGroup;
  selectedIndex = 2;

  page = 1;
  pageSize = 6;
  collectionSize!: number;

  matcher = new MyErrorStateMatcher();

  dataSource = new MatTableDataSource<Position>();
  positions!: Position[];
  @ViewChild(MatPaginator, { static: true }) paginator!: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort!: MatSort;

  // Subscriptions

  createSubscription!: Subscription;
  getPositionsSubscription!: Subscription;
  updatePositionSubscription!: Subscription;
  deletePositionSubscription!: Subscription;
  updateStatusPositionSubscription!: Subscription;

  constructor(
    private fb: FormBuilder,
    private positionService: PositionService,
    private message: ShowMessageService
  ) {}

  private fillFormData() {
    this.formData = this.fb.group({
      name: [
        this.position.name,
        Validators.required,
        [this.validatePositionDuplication.bind(this)],
      ],
    });
  }

  private getAllPositions() {
    this.getPositionsSubscription = this.positionService
      .getPositions()
      .subscribe((data) => {
        this.positions = data;
        this.collectionSize = this.positions.length;
        this.dataSource.data = this.positions;
        this.refreshCountries();
        this.toggleAba(2);
      });
  }

  refreshCountries() {
    this.dataSource.data = this.positions
      .map((position) => ({
        ...position,
      }))
      .slice(
        (this.page - 1) * this.pageSize,
        (this.page - 1) * this.pageSize + this.pageSize
      );
  }

  toggleAba(index: number) {
    this.selectedIndex = index;
  }

  ngOnInit(): void {
    this.fillFormData();

    this.searchData = this.fb.group({
      search: [''],
    });

    this.getAllPositions();
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  ngOnDestroy(): void {
    this.createSubscription.unsubscribe();
    this.getPositionsSubscription.unsubscribe();
    this.updatePositionSubscription.unsubscribe();
    this.deletePositionSubscription.unsubscribe();
    this.updateStatusPositionSubscription.unsubscribe();
  }

  save(data: Position) {
    this.createSubscription = this.positionService
      .create(data)
      .subscribe(() => {
        this.message.showMessage('Usuário Cadastrado com Sucesso');
        this.getAllPositions();
        this.toggleAba(2);
        this.formData.reset();
      });
  }

  search(param: any) {
    let newPosition = this.positions.filter((position) =>
      position.name.includes(param.search)
    );

    if (newPosition.length > this.pageSize) {
      this.refreshCountries();
    } else if (newPosition.length > 0) {
      this.dataSource.data = newPosition;
    } else {
      this.message.showMessage(
        'Nenhum usuário encontrado para a busca realizada',
        true
      );
      this.searchData.reset();
      this.refreshCountries();
    }
  }

  deletePosition(id: number | undefined) {
    if (!id) {
      return;
    }
    this.deletePositionSubscription = this.positionService
      .deletePosition(id)
      .subscribe(() => {
        this.message.showMessage('Usuário removido com sucesso!');
        this.getAllPositions();
      });
  }

  gerarPlanilha() {
    alasql('SELECT * INTO XLSX("positions.xlsx", {headers: true}) FROM ?', [
      this.dataSource.data,
    ]);
  }

  private validatePositionDuplication(form: FormControl) {
    return this.positionService
      .verifyDuplicateEmail(form.value)
      .pipe(
        map((duplicatePosition) =>
          duplicatePosition ? { duplicatePosition: true } : null
        )
      );
  }
}
