import { map } from 'rxjs/operators';
import { Component, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';

import alasql from 'alasql';

import { User } from 'src/app/models/user';
import { ShowMessageService } from 'src/services/show-message.service';
import { UserService } from './users.service';
import { Subscription } from 'rxjs';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';

@Component({
  selector: 'app-users',
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class UsersComponent implements OnInit {
  displayedColumns: string[] = [
    'id',
    'name',
    'status',
    'login',
    'email',
    'acesso',
    'action',
  ];
  user: User = <User>{};
  formData!: FormGroup;
  searchData!: FormGroup;
  selectedIndex = 2;
  isEdit = false;
  dataSource = new MatTableDataSource<User>();
  users!: User[];

  page = 1;
  pageSize = 6;
  collectionSize!: number;

  @ViewChild(MatPaginator, { static: true }) paginator!: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort!: MatSort;

  // Subscriptions

  createSubscription!: Subscription;
  getUsersSubscription!: Subscription;
  updateUserSubscription!: Subscription;
  deleteUserSubscription!: Subscription;
  updateStatusUserSubscription!: Subscription;

  constructor(
    private fb: FormBuilder,
    private userService: UserService,
    private message: ShowMessageService
  ) {}

  private fillFormData() {
    this.formData = this.fb.group({
      name: [this.user.name, Validators.required],
      email: [
        this.user.email,
        [Validators.required, Validators.email],
        [this.validateEmailDuplication.bind(this)],
      ],
      login: [this.user.login, Validators.required],
      senha: [
        this.user.senha,
        [Validators.required, Validators.minLength(6), Validators.maxLength(8)],
      ],
      acesso: [this.user.acesso, Validators.required],
    });
  }

  private getAllUsers() {
    this.getUsersSubscription = this.userService
      .getUsers()
      .subscribe((data) => {
        this.users = data;
        this.collectionSize = this.users.length;
        this.dataSource.data = this.users;
        this.refreshCountries();
        this.toggleAba(2);
      });
  }

  refreshCountries() {
    this.dataSource.data = this.users
      .map((user) => ({
        ...user,
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

    this.getAllUsers();
  }

  ngOnDestroy(): void {
    this.createSubscription.unsubscribe();
    this.getUsersSubscription.unsubscribe();
    this.updateUserSubscription.unsubscribe();
    this.deleteUserSubscription.unsubscribe();
    this.updateStatusUserSubscription.unsubscribe();
  }

  save(data: User) {
    let user: User = {
      ...data,
      senha: this.userService.encryptPassword(data.senha),
      status: 'ativo',
    };

    this.createSubscription = this.userService.create(user).subscribe(() => {
      this.message.showMessage('Usuário Cadastrado com Sucesso');
      this.getAllUsers();
      this.toggleAba(2);
      this.formData.reset();
    });
  }

  edit(data: User) {
    let user = {
      ...data,
      senha: this.userService.encryptPassword(data.senha),
      id: this.user.id,
      status: this.user.status,
    };

    this.updateUserSubscription = this.userService
      .updateUser(user.id, user)
      .subscribe(() => {
        this.message.showMessage('Usuário editado com Sucesso!');
        this.getAllUsers();
        this.formData.reset();
        this.isEdit = false;
      });
  }

  search(param: any) {
    let newUser = this.users.filter(
      (user) =>
        user.email.includes(param.search) ||
        user.name.includes(param.search) ||
        user.login.includes(param.search)
    );

    if (newUser.length > this.pageSize) {
      this.refreshCountries();
    } else if (newUser.length > 0) {
      this.dataSource.data = newUser;
    } else {
      this.message.showMessage(
        'Nenhum usuário encontrado para a busca realizada',
        true
      );
      this.searchData.reset();
      this.refreshCountries();
    }
  }

  callEdit(data: User) {
    this.user = {
      ...data,
      senha: this.userService.decryptPassword(data.senha),
    };
    this.fillFormData();
    this.toggleAba(1);
    this.isEdit = true;
  }

  deleteUser(id: number | undefined) {
    if (!id) {
      return;
    }
    this.deleteUserSubscription = this.userService
      .deleteUser(id)
      .subscribe(() => {
        this.message.showMessage('Usuário removido com sucesso!');
        this.getAllUsers();
      });
  }

  toggleStatus(data: User) {
    if (data.id) {
      this.updateStatusUserSubscription = this.userService
        .updateStatusUser(data.id, data)
        .subscribe((data) => {
          this.message.showMessage(
            `Usuário ${data.status === 'ativo' ? 'Ativado' : 'Desativado'}`,
            data.status === 'ativo' ? false : true
          );
          this.getAllUsers();
        });
    }
  }

  gerarPlanilha() {
    alasql('SELECT * INTO XLSX("users.xlsx", {headers: true}) FROM ?', [
      this.users,
    ]);
  }

  private validateEmailDuplication(form: FormControl) {
    return this.userService
      .verifyDuplicateEmail(form.value)
      .pipe(
        map((duplicateEmail) =>
          duplicateEmail ? { duplicateEmail: true } : null
        )
      );
  }
}
