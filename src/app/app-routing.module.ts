import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PanelComponent } from './components/panel/panel.component';
import { UsersComponent } from './components/users/users.component';

const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: '/panel' },
  { path: 'panel', component: PanelComponent },
  { path: 'users', component: UsersComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
