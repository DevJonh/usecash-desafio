import { Subscription } from 'rxjs';
import { Component, Inject, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import alasql from 'alasql';
import { Store } from 'src/app/models/store';
import { MyErrorStateMatcher } from 'src/app/utils/input-error-state';
import { ShowMessageService } from 'src/services/show-message.service';
import { StoreService } from '../stores/stores.service';

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
  displayedColumns: string[] = ['id', 'store', 'action'];
  stores!: Store[];
  searchData!: FormGroup;
  region = '';
  option: string = 'select';

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
          (store) => store.regionId === this.data.id && store.status === 'ativo'
        );
        this.dataSource.data = this.stores;
        this.updateSelecteds(stores);
      });
  }

  private updateSelecteds(stores: Store[]) {
    let storeFiltered = stores.filter((store) => store.selected);
    this.storeSelects.push(...storeFiltered);
  }

  constructor(
    @Inject(MAT_DIALOG_DATA) private data: modalData,
    private message: ShowMessageService,
    private storeService: StoreService,
    private fb: FormBuilder
  ) {}

  ngOnInit(): void {
    this.searchData = this.fb.group({
      search: [null],
    });

    this.getAllStores();
    this.region = this.data.region;
  }

  close(stores: Store[]) {
    return {
      data: stores,
    };
  }

  search(param: { search: string }) {
    let newStore = this.stores.filter(
      (store) => Number(store.number) === Number(param.search)
    );

    if (newStore.length > 0) {
      this.dataSource.data = newStore;
    } else {
      this.message.showMessage(
        'Nenhum usuário encontrado para a busca realizada',
        true
      );
      this.dataSource.data = this.stores;
      this.searchData.reset();
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
