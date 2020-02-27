import { Component, HostListener, ViewChild, ElementRef, OnInit, AfterViewInit } from '@angular/core';

import { randomIneger } from '../common/math-utils'
import { Autoplay } from '../common/autoplay'

import { FreecellComponent, LineChangeEvent } from '../freecell/freecell.component';
import { FreecellGame } from '../freecell/freecell-game';
import { FreecellLayout } from '../freecell/freecell-layout';
import { FreecellHistory } from '../freecell/freecell-history';

@Component({
  selector: 'my-app',
  templateUrl: './app.component.html',
  styleUrls: [ './app.component.css' ]
})
export class AppComponent implements OnInit, AfterViewInit  {
  @ViewChild('mainRef', {static: true}) mainRef: ElementRef<HTMLElement>;
  @ViewChild(FreecellComponent, {static: false}) freecellComponent: FreecellComponent;

  name = 'History: ';
  width: number;
  height: number;

  game = new FreecellGame(8, 4, 4);
  layout = new FreecellLayout(this.game);
  history = new FreecellHistory();

  autoplay = new Autoplay(200);

  @HostListener('window:resize', ['$event'])
  onResize(event) {
    if (this.mainRef && this.mainRef.nativeElement) {
      this.width = this.mainRef.nativeElement.clientWidth;
      this.height = this.mainRef.nativeElement.clientHeight;
    }
  }

  ngOnInit() {
    console.log('OnInit:', this);
    if (this.mainRef && this.mainRef.nativeElement) {
      this.width = this.mainRef.nativeElement.clientWidth;
      this.height = this.mainRef.nativeElement.clientHeight;
    }
    this.game.deal();
  }

  ngAfterViewInit() {
    // console.log('AfterViewInit:', this);
    // if (this.mainRef) {
      // this.width = this.mainRef.nativeElement.clientWidth;
      // this.height = this.mainRef.nativeElement.clientHeight;
    // }
  }

  onDeal() {
    const deal = randomIneger(0, 10, this.history.deal);
    this.game.deal(deal);
    this.history.onDeal(deal);
    this.freecellComponent.onDeal();
  }

  onLineChange(event: LineChangeEvent) {
    // console.log('Line Change Event:', event);
    this.autoplay.stop();

    let path = ''
    if (event.destination === undefined) {
      path = this.game.solveFor(event.source);
    } else {
      path = this.game.getBestPath(event.tableau, event.destination);
    }
    if (path) {
      // console.log('Path:', path.length / 2);
      this.moveCard(path.charCodeAt(0), path.charCodeAt(1), path.length > 2);
      path = path.substring(2);

      if (path) {
        this.autoplay.play(() => this.moveCard(path.charCodeAt(0), path.charCodeAt(1), path.length > 2) && (path = path.substring(2)).length > 0);
      }
    }
  }

  moveCard(source: number, destination: number, fast: boolean = false) {
    if (this.game.moveCard(source, destination)) {
      this.history.onMove(source, destination);
      this.freecellComponent.onCardMove(source, destination, fast ? 'transition_fast' : 'transition_norm');
      return true;
    } else {
      console.warn('Invalid Move:', source, destination);
      return false;
    }
  }
}
