import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { MaterialModule } from '../common/modules/material.module';

import { AppComponent } from './app.component';
import { HelloComponent } from './hello.component';

import { FreecellComponent } from '../freecell/freecell.component';
import { RatioKeeperComponent } from '../ratio-keeper/ratio-keeper.component';

@NgModule({
  imports:      [ BrowserModule, FormsModule, BrowserAnimationsModule, MaterialModule ],
  declarations: [ AppComponent, HelloComponent, FreecellComponent, RatioKeeperComponent ],
  bootstrap:    [ AppComponent ]
})
export class AppModule { }
