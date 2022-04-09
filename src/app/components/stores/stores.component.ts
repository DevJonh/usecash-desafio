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

import { Store } from 'src/app/models/store';
import { MyErrorStateMatcher } from 'src/app/utils/input-error-state';
import { ShowMessageService } from 'src/services/show-message.service';
import { StoreService } from './stores.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-stores',
  templateUrl: './stores.component.html',
  styleUrls: ['./stores.component.css'],
  encapsulation: ViewEncapsulation.None,
})
export class StoresComponent implements OnInit {
  displayedColumns: string[] = ['id', 'number', 'store', 'action'];
  store: Store = <Store>{};
  formData!: FormGroup;
  searchData!: FormGroup;
  selectedIndex = 0;

  matcher = new MyErrorStateMatcher();

  dataSource = new MatTableDataSource<Store>();
  stores!: Store[];
  @ViewChild(MatPaginator, { static: true }) paginator!: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort!: MatSort;

  // Subscriptions

  createSubscription!: Subscription;
  getStoresSubscription!: Subscription;
  updateStoreSubscription!: Subscription;
  deleteStoreSubscription!: Subscription;
  updateStatusStoreSubscription!: Subscription;

  constructor(
    private fb: FormBuilder,
    private storeService: StoreService,
    private message: ShowMessageService
  ) {}

  private fillFormData() {
    this.formData = this.fb.group({
      number: [
        this.store.number,
        Validators.required,
        [this.validateStoreDuplication.bind(this)],
      ],
      name: [this.store.name, Validators.required],
    });
  }

  private getAllStores() {
    this.getStoresSubscription = this.storeService
      .getStores()
      .subscribe((data) => {
        this.stores = data;
        this.dataSource.data = this.stores;
        this.selectedIndex = 1;
      });
  }

  ngOnInit(): void {
    this.fillFormData();

    this.searchData = this.fb.group({
      search: [null],
    });

    this.getAllStores();
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  ngOnDestroy(): void {
    this.createSubscription.unsubscribe();
    this.getStoresSubscription.unsubscribe();
    this.updateStoreSubscription.unsubscribe();
    this.deleteStoreSubscription.unsubscribe();
    this.updateStatusStoreSubscription.unsubscribe();
  }

  save(data: Store) {
    let store: Store = {
      ...data,
      status: 'ativo',
    };

    this.createSubscription = this.storeService.create(store).subscribe(() => {
      this.message.showMessage('Usuário Cadastrado com Sucesso');
      this.getAllStores();
      this.selectedIndex = 1;
      this.formData.reset();
    });
  }

  search(param: any) {
    let newStore = this.stores.filter(
      (store) => store.number === Number(param.search)
    );

    if (newStore.length > 0) {
      this.dataSource.data = newStore;
    } else {
      this.message.showMessage(
        'Nenhum usuário encontrado para a busca realizada',
        true
      );
      this.searchData.reset();
    }
  }

  toggleStatus(data: Store) {
    if (data.id) {
      this.updateStatusStoreSubscription = this.storeService
        .updateStatusStore(data.id, data)
        .subscribe((data) => {
          this.message.showMessage(
            `Usuário ${data.status === 'ativo' ? 'Ativado' : 'Desativado'}`,
            data.status === 'ativo' ? false : true
          );
          this.getAllStores();
        });
    }
  }

  gerarPlanilha() {
    alasql('SELECT * INTO XLSX("stores.xlsx", {headers: true}) FROM ?', [
      this.dataSource.data,
    ]);
  }

  private validateStoreDuplication(form: FormControl) {
    return this.storeService
      .verifyDuplicateNumber(Number(form.value))
      .pipe(
        map((duplicateNumberStore) =>
          duplicateNumberStore ? { duplicateNumberStore: true } : null
        )
      );
  }
}
