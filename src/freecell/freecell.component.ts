import { Component, OnInit, OnChanges, Input, SimpleChanges } from '@angular/core';

import { suitFullNameOf, rankFullNameOf, CARD_NUM } from '../common/deck';

import { FreecellGame } from './freecell-game';
import { FreecellLayout } from './freecell-layout';

function toPercent(numerator: number, denominator: number = 100, fractionDigits: number = 3): string {
  return (numerator * 100 / denominator).toFixed(fractionDigits) + '%';
}

interface Item {
  ngStyle: { [klass: string]: any; };
  ngClass: { [klass: string]: any; };
}

@Component({
  selector: 'app-freecell',
  templateUrl: './freecell.component.html',
  styleUrls: ['./freecell.component.scss']
})
export class FreecellComponent implements OnInit, OnChanges {
  @Input()
  game: FreecellGame;
  @Input()
  layout: FreecellLayout;

  items: Item[] = [];
  spots: Item[] = [];
  cards: Item[] = [];
  
  constructor() { }

  ngOnInit() {
  }

  ngOnChanges(changes: SimpleChanges) {
    console.log('app-freecell.ngOnChanges', changes);
    this.spots = this.createSpots();
    this.cards = this.createCards();
    this.items = this.spots.concat(this.cards);
    this.onDeal();
  }

  trackByIndex(index: number): number {
    return index;
  }

  onMouseDown(event: MouseEvent, index: number) {
    console.log('Mousedown:', index);
    if (event.button !== 0) {
      return;
    }
    event.preventDefault();
  }

  onDeal() {
    for (let i = this.game.DESK_SIZE; i-- > 0;) {
      this.updateLine(i);
    }
  }

  createSpots(): Item[] {
    const placeholders: Item[] = [];
    const layout = this.layout;
    if (layout) {
      const basis = layout.basis;
      const W = layout.width;
      const H = layout.height;

      const width = toPercent(layout.itemWidth, W);
      const height = toPercent(layout.itemHeight, H);

      for (let i = 0; i < basis.DESK_SIZE; i++) {
        const pos = layout.getSpotPosition(i);
        const left = toPercent(pos.x, W);
        const top = toPercent(pos.y, H);

        const item: Item = {
          ngStyle: { left, top, width, height },
          ngClass: { placeholder: true }
        };

        if (basis.isBase(i)) {
          item.ngClass.base = true;
          item.ngClass[suitFullNameOf(i - basis.BASE_START)] = true;
        } else if (basis.isCell(i)) {
          item.ngClass.cell = true;
        } else if (basis.isPile(i)) {
          item.ngClass.pile = true;
        }

        placeholders.push(item);
      }

    }
    return placeholders;
  }

  createCards(): Item[] {
    const cards: Item[] = [];
    const layout = this.layout;
    const game = this.game;
    if (layout && game) {
      const basis = layout.basis;
      const W = layout.width;
      const H = layout.height;

      const width = toPercent(layout.itemWidth, W);
      const height = toPercent(layout.itemHeight, H);

      for (let i = 0; i < CARD_NUM; i++) {
        const pos = layout.getCardPosition(basis.PILE_START, i, CARD_NUM);
        const left = toPercent(pos.x, W);
        const top = toPercent(pos.y, H);

        const item: Item = {
          ngStyle: { left, top, width, height },
          ngClass: { card: true, [suitFullNameOf(i)]: true, [rankFullNameOf(i)]: true }
        };
        cards.push(item);
      }
    }
    return cards;
  }

  updateLine(index: number) {
    const line = this.game.getLine(index);
    const count = line.length;
    const W = this.layout.width;
    const H = this.layout.height;
    for (let i = 0; i < count; i++) {
      const pos = this.layout.getCardPosition(index, i, count);
      const item = this.cards[line[i]];
      item.ngStyle.left = toPercent(pos.x, W);
      item.ngStyle.top = toPercent(pos.y, H);
    }
  }
}