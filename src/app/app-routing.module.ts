import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PanelComponent } from './components/panel/panel.component';
import { PositionsComponent } from './components/positions/positions.component';
import { RegionsComponent } from './components/regions/regions.component';
import { StoresComponent } from './components/stores/stores.component';
import { UsersComponent } from './components/users/users.component';

const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: '/panel' },
  { path: 'panel', component: PanelComponent },
  { path: 'users', component: UsersComponent },
  { path: 'positions', component: PositionsComponent },
  { path: 'stores', component: StoresComponent },
  { path: 'regions', component: RegionsComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
