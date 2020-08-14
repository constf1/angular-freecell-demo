import { Component, HostListener, ViewChild, ElementRef, OnInit, AfterViewInit } from '@angular/core';

import { randomIneger } from '../common/math-utils'
import { Autoplay } from '../common/autoplay'

interface Letter {
  value: string;
  isHidden?: boolean;
}

@Component({
  selector: 'my-app',
  templateUrl: './app.component.html',
  styleUrls: [ './app.component.scss' ]
})
export class AppComponent implements OnInit, AfterViewInit  {
  selection = 0;
  letters: Letter[] = [
    { value: 'а', isHidden: true },
    { value: 'л' },
    { value: 'ф' },
    { value: 'а', isHidden: true },
    { value: 'в' },
    { value: 'и' },
    { value: 'т' },
  ];

  onAnswer(value: string) {
    const l = this.letters[this.selection];
    if (l) {
      l.value = value;
      l.isHidden = false;
      this.selection = this.letters.findIndex(i => i.isHidden);
    }
  }
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
