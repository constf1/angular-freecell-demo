import { Component, HostListener, ViewChild, ElementRef, OnInit, AfterViewInit } from '@angular/core';

import { randomIneger } from '../common/math-utils'
import { Autoplay } from '../common/autoplay'


@Component({
  selector: 'my-app',
  templateUrl: './app.component.html',
  styleUrls: [ './app.component.scss' ]
})
export class AppComponent implements OnInit, AfterViewInit  {
  // @ViewChild('mainRef', {static: true}) mainRef: ElementRef<HTMLElement>;
  // @ViewChild(FreecellComponent, {static: false}) freecellComponent: FreecellComponent;

  // @HostListener('window:resize', ['$event'])
  // onResize(event) {
  //   if (this.mainRef && this.mainRef.nativeElement) {
  //     this.width = this.mainRef.nativeElement.clientWidth;
  //     this.height = this.mainRef.nativeElement.clientHeight;
  //   }
  // }

  ngOnInit() {
  }

  ngAfterViewInit() {
  }
}
