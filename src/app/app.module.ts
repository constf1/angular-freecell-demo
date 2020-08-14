import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';

import { AppComponent } from './app.component';

import { FreecellComponent } from '../freecell/freecell.component';
import { RatioKeeperComponent } from '../ratio-keeper/ratio-keeper.component';

@NgModule({
  imports:      [ BrowserModule, FormsModule ],
  declarations: [ AppComponent, FreecellComponent, RatioKeeperComponent ],
  bootstrap:    [ AppComponent ]
})
export class AppModule { }
