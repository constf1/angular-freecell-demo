import { NgModule } from '@angular/core';

import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatSidenavModule } from '@angular/material/sidenav';

@NgModule({
  imports: [
    MatFormFieldModule,
    MatSelectModule,
    MatSidenavModule
  ],
  exports: [
    MatFormFieldModule,
    MatSelectModule,
    MatSidenavModule
  ]
})
export class MaterialModule { }