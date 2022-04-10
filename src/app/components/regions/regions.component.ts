import { StoreService } from './../stores/stores.service';
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

import { Region } from 'src/app/models/region';
import { MyErrorStateMatcher } from 'src/app/utils/input-error-state';
import { ShowMessageService } from 'src/services/show-message.service';
import { RegionService } from './regions.service';
import { Subscription } from 'rxjs';
import { Store } from 'src/app/models/store';
import { MatDialog } from '@angular/material/dialog';
import { ModalComponent } from '../modal/modal.component';
import { map } from 'rxjs/operators';

@Component({
  selector: 'app-regions',
  templateUrl: './regions.component.html',
  styleUrls: ['./regions.component.css'],
  encapsulation: ViewEncapsulation.None,
})
export class RegionsComponent implements OnInit {
  displayedColumns: string[] = ['id', 'region', 'number_loja', 'action'];
  region: Region = <Region>{};
  stores: Store[] = [];
  formData!: FormGroup;
  searchData!: FormGroup;
  selectedIndex = 1;
  isEdit = false;

  matcher = new MyErrorStateMatcher();

  dataSource = new MatTableDataSource<Region>();
  regions!: Region[];
  @ViewChild(MatPaginator, { static: true }) paginator!: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort!: MatSort;

  // Subscriptions

  createSubscription!: Subscription;
  getRegionsSubscription!: Subscription;
  updateRegionSubscription!: Subscription;
  deleteRegionSubscription!: Subscription;
  updateStatusRegionSubscription!: Subscription;

  constructor(
    private fb: FormBuilder,
    private regionService: RegionService,
    private message: ShowMessageService,
    private storeService: StoreService,
    private dialog: MatDialog
  ) {}

  private fillFormData() {
    this.formData = this.fb.group({
      region: [
        this.region.region,
        [Validators.required, Validators.maxLength(2), Validators.minLength(2)],
        [this.validateRegionDuplication.bind(this)],
      ],
    });
  }

  private getAllRegions() {
    this.getRegionsSubscription = this.regionService
      .getRegions()
      .subscribe((data) => {
        let regions: Region[] = [];

        data.forEach((region) => {
          let store = this.stores.filter(
            (d) => d.regionId === region.id && d.status === 'ativo'
          );
          regions.push({ ...region, number_store: store.length });
        });

        this.regions = regions;
        this.dataSource.data = this.regions;
        this.selectedIndex = 1;
      });
  }

  ngOnInit(): void {
    this.fillFormData();
    this.searchData = this.fb.group({
      search: [null],
    });

    this.storeService.getStores().subscribe((data) => {
      this.stores = data;
    });
    this.getAllRegions();
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  ngOnDestroy(): void {
    this.createSubscription.unsubscribe();
    this.getRegionsSubscription.unsubscribe();
    this.updateRegionSubscription.unsubscribe();
    this.deleteRegionSubscription.unsubscribe();
    this.updateStatusRegionSubscription.unsubscribe();
  }

  save(data: Region) {
    let region: Region = {
      ...data,
      status: 'ativo',
      region: data.region.toUpperCase(),
    };

    this.createSubscription = this.regionService
      .create(region)
      .subscribe(() => {
        this.message.showMessage('Usuário Cadastrado com Sucesso');
        this.getAllRegions();
        this.selectedIndex = 1;
      });
  }

  search(param: { search: string }) {
    let newRegion = this.regions.filter((region) =>
      region.region.includes(param.search.toUpperCase())
    );

    if (newRegion.length > 0) {
      this.dataSource.data = newRegion;
    } else {
      this.message.showMessage(
        'Nenhum usuário encontrado para a busca realizada',
        true
      );
      this.searchData.reset();
    }
  }

  edit(data: Region) {
    let user = {
      ...data,
      id: this.region.id,
      status: this.region.status,
    };

    this.updateRegionSubscription = this.regionService
      .updateRegion(user.id, user)
      .subscribe(() => {
        this.message.showMessage('Região editada com Sucesso!');
        this.getAllRegions();
        this.formData.reset();
        this.isEdit = false;
      });
  }

  callEdit(data: Region) {
    this.region = {
      ...data,
    };
    this.fillFormData();
    this.selectedIndex = 0;
    this.isEdit = true;
  }

  openModal(id: number, region: string): void {
    this.dialog.open(ModalComponent, {
      width: '900px',
      data: { id, region },
    });
  }

  toggleStatus(data: Region) {
    if (data) {
      this.updateStatusRegionSubscription = this.regionService
        .updateStatusRegion(data.id, data)
        .subscribe((res) => {
          this.message.showMessage(
            `Usuário ${res.status === 'ativo' ? 'Ativado' : 'Desativado'}`,
            res.status === 'ativo' ? false : true
          );
          this.getAllRegions();
        });
    }
  }

  gerarPlanilha() {
    alasql('SELECT * INTO XLSX("regions.xlsx", {headers: true}) FROM ?', [
      this.dataSource.data,
    ]);
  }

  private validateRegionDuplication(form: FormControl) {
    return this.regionService
      .verifyDuplicateRegions(form.value)
      .pipe(
        map((duplicateRegion) =>
          duplicateRegion ? { duplicateRegion: true } : null
        )
      );
  }
}
