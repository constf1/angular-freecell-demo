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
  styleUrls: [ './app.component.scss' ]
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
  nextMove: { source: number, destination: number } = null;

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

    const left = this.layout.baseStartX;
    const width = this.layout.baseEndX - this.layout.baseStartX;
    const top = this.layout.baseEndY + 0.25 * this.layout.deltaHeight;
    const height = this.layout.deltaHeight * 0.5;

    this.game.deal();
  }

  ngAfterViewInit() {
    // console.log('AfterViewInit:', this);
    // if (this.mainRef) {
      // this.width = this.mainRef.nativeElement.clientWidth;
      // this.height = this.mainRef.nativeElement.clientHeight;
    // }
  }

  onUndo() {
    if (this.history.canUndo) {
      this.moveCard(this.history.lastDestination, this.history.lastSource);
    }
  }

  onRedo() {
    if (this.history.canRedo) {
      this.moveCard(this.history.nextSource, this.history.nextDestination);
    }
  }

  onDeal() {
    const deal = randomIneger(0, 10, this.history.deal);
    this.game.deal(deal);
    this.history.onDeal(deal);
    this.freecellComponent.onDeal();
    this.onUpdate();
  }

  onAuto() {
    this.autoplay.play(() => {
      this.moveCard(this.nextMove.source, this.nextMove.destination);
      return !!this.nextMove;
    });
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
      this.moveCard(path.charCodeAt(0), path.charCodeAt(1),
        path.length > 2 || event.destination !== undefined);
      path = path.substring(2);

      if (path) {
        this.autoplay.play(() => {
          this.moveCard(path.charCodeAt(0), path.charCodeAt(1), path.length > 2);
          path = path.substring(2);
          return path.length > 0;
        });
      }
    }
  }

  onUpdate() {
    this.nextMove = null;
    this.game.findMoves((source, destination) => {
      if (this.game.isBase(destination)) {
        this.nextMove = { source, destination }
        return true;
      }
      return false;
    })
  }

  moveCard(source: number, destination: number, fast: boolean = false) {
    this.game.moveCard(source, destination);
    this.history.onMove(source, destination);
    this.freecellComponent.onCardMove(source, destination, fast ? 'transition_fast' : 'transition_norm');
    this.onUpdate();
  }
}
