import { Subscription } from 'rxjs';
import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import alasql from 'alasql';
import { Store } from 'src/app/models/store';
import { MyErrorStateMatcher } from 'src/app/utils/input-error-state';
import { ShowMessageService } from 'src/services/show-message.service';
import { StoreService } from '../stores/stores.service';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

interface modalData {
  id: number;
  region: string;
}

@Component({
  selector: 'app-modal',
  templateUrl: './modal.component.html',
  styleUrls: ['./modal.component.scss'],
})
export class ModalComponent implements OnInit {
  @Input() id!: number;
  @Input() region!: string;
  displayedColumns: string[] = ['id', 'store', 'action'];
  stores!: Store[];
  searchData!: FormGroup;
  option: string = 'select';

  page = 1;
  pageSize = 5;
  collectionSize!: number;

  storeSelects: Store[] = [];

  matcher = new MyErrorStateMatcher();
  dataSource = new MatTableDataSource<Store>();
  @ViewChild(MatPaginator, { static: true }) paginator!: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort!: MatSort;

  // Subscription
  getStoreSubscription!: Subscription;

  private getAllStores() {
    this.getStoreSubscription = this.storeService
      .getStores()
      .subscribe((stores) => {
        this.stores = stores.filter(
          (store) => store.regionId === this.id && store.status === 'ativo'
        );
        this.collectionSize = this.stores.length;
        this.dataSource.data = this.stores;
        this.collectionSize = this.stores.length;
        this.updateSelecteds(stores);
        this.refreshCountries();
      });
  }

  private updateSelecteds(stores: Store[]) {
    let storeFiltered = stores.filter((store) => store.selected);
    this.storeSelects.push(...storeFiltered);
  }

  refreshCountries() {
    this.dataSource.data = this.stores
      .map((store) => ({
        ...store,
      }))
      .slice(
        (this.page - 1) * this.pageSize,
        (this.page - 1) * this.pageSize + this.pageSize
      );
  }

  constructor(
    public activeModal: NgbActiveModal,
    private message: ShowMessageService,
    private storeService: StoreService,
    private fb: FormBuilder
  ) {}

  ngOnInit(): void {
    this.searchData = this.fb.group({
      search: [null],
    });

    this.getAllStores();
  }

  search(param: any) {
    let newStore = this.stores.filter((store) =>
      store.number.includes(param.search)
    );

    if (newStore.length > this.pageSize) {
      this.refreshCountries();
    } else if (newStore.length > 0) {
      this.dataSource.data = newStore;
    } else {
      this.message.showMessage(
        'Nenhum usuário encontrado para a busca realizada',
        true
      );
      this.dataSource.data = this.stores;
      this.searchData.reset();
      this.refreshCountries();
    }
  }

  toggleStatus(data: Store) {
    this.storeService.updateSelectedStore(data.id, data).subscribe((res) => {
      this.message.showMessage(
        `Loja ${res.selected ? 'Selecionada' : 'Desmarcada'}`,
        res.selected ? false : true
      );

      if (res.selected) {
        this.storeSelects = this.stores.filter(
          (store) => store.selected === res.selected
        );
      }

      this.getAllStores();
    });
  }

  gerarPlanilha() {
    alasql(
      'SELECT * INTO XLSX("store_by_region.xlsx", {headers: true}) FROM ?',
      [this.dataSource.data]
    );
  }
}
