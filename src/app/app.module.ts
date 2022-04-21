import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AngularMaterialModule } from './modules/material.module';

import { HeaderComponent } from './components/template/header/header.component';
import { PanelComponent } from './components/panel/panel.component';
import { UsersComponent } from './components/users/users.component';
import { PositionsComponent } from './components/positions/positions.component';
import { StoresComponent } from './components/stores/stores.component';
import { RegionsComponent } from './components/regions/regions.component';
import { ModalComponent } from './components/modal/modal.component';
import { ArchwizardModule } from 'angular-archwizard';

import { BlockUIModule } from 'ng-block-ui';
import { BlockUIHttpModule } from 'ng-block-ui/http';

import { GuidedTourModule, GuidedTourService } from 'ngx-guided-tour';

@NgModule({
  declarations: [
    AppComponent,
    HeaderComponent,
    PanelComponent,
    UsersComponent,
    PositionsComponent,
    StoresComponent,
    RegionsComponent,
    ModalComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    HttpClientModule,
    ReactiveFormsModule,
    FormsModule,
    AngularMaterialModule,
    ArchwizardModule,
    BlockUIModule.forRoot({
      delayStop: 300,
    }),
    BlockUIHttpModule.forRoot({
      blockAllRequestsInProgress: true,
    }),
    GuidedTourModule,
  ],
  providers: [GuidedTourService],
  bootstrap: [AppComponent],
})
export class AppModule {}
