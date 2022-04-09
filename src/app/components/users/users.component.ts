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

import { User } from 'src/app/models/user';
import { MyErrorStateMatcher } from 'src/app/utils/input-error-state';
import { ShowMessageService } from 'src/services/show-message.service';
import { UserService } from './users.service';
import { Observable, Subscription } from 'rxjs';

@Component({
  selector: 'app-users',
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.css'],
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
  selectedIndex = 0;
  isEdit = false;
  matcher = new MyErrorStateMatcher();

  dataSource = new MatTableDataSource<User>();
  users!: User[];
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
        this.dataSource.data = this.users;
        this.selectedIndex = 1;
      });
  }

  ngOnInit(): void {
    this.fillFormData();

    this.searchData = this.fb.group({
      search: [''],
    });

    this.getAllUsers();
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
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
      this.selectedIndex = 1;
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
      });
  }

  search(param: any) {
    let newUser = this.users.filter(
      (user) =>
        user.email.includes(param.search) ||
        user.name.includes(param.search) ||
        user.login.includes(param.search)
    );

    if (newUser.length > 0) {
      this.dataSource.data = newUser;
    } else {
      this.message.showMessage(
        'Nenhum usuário encontrado para a busca realizada',
        true
      );
      this.searchData.reset();
    }
  }

  callEdit(data: User) {
    this.user = {
      ...data,
      senha: this.userService.decryptPassword(data.senha),
    };
    this.fillFormData();
    this.selectedIndex = 0;
    this.isEdit = true;
  }

  deleteUser(id: number) {
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
      this.dataSource.data,
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
