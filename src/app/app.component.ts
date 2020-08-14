import { Component, HostListener, ViewChild, ElementRef, OnInit, AfterViewInit } from '@angular/core';

import { randomIneger } from '../common/math-utils'
import { Autoplay } from '../common/autoplay'

interface Letter {
  value: string;
  isHidden?: boolean;
  result?: string;
  alternatives?: string[];
}

@Component({
  selector: 'my-app',
  templateUrl: './app.component.html',
  styleUrls: [ './app.component.scss' ]
})
export class AppComponent implements OnInit, AfterViewInit  {
  alternatives = [ 'а', 'о', 'э', 'и', 'у', 'ы', 'е', 'ю', 'я'];
  selection = 1;
  // а, о, э, и, у, ы, е, ю, я
  // з…мл…ника => земляника
  letters: Letter[] = [
    { value: 'з' },
    { value: 'е', isHidden: true, alternatives: [ 'и', 'е', 'я', 'э', 'ы' ] },
    { value: 'м' },
    { value: 'л' },
    { value: 'я', isHidden: true, alternatives: ['и', 'е', 'я'] },
    { value: 'н' },
    { value: 'и' },
    { value: 'к' },
    { value: 'а' },
  ];

  onAnswer(value: string) {
    const l = this.letters[this.selection];
    if (l) {
      l.result = value;
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
