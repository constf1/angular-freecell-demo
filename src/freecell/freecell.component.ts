import {
  Component,
  OnInit,
  OnChanges,
  Input,
  SimpleChanges,
  ViewChildren,
  QueryList,
  ElementRef
} from "@angular/core";
import { Renderer2 } from "@angular/core";

import { Dragger } from "../common/dragger";
import { suitFullNameOf, rankFullNameOf, CARD_NUM } from "../common/deck";

import { FreecellGame } from "./freecell-game";
import { FreecellLayout } from "./freecell-layout";

function toPercent(
  numerator: number,
  denominator: number = 100,
  fractionDigits: number = 3
): string {
  return ((numerator * 100) / denominator).toFixed(fractionDigits) + "%";
}

interface Item {
  ngStyle: { [klass: string]: any };
  ngClass: { [klass: string]: any };
}

@Component({
  selector: "app-freecell",
  templateUrl: "./freecell.component.html",
  styleUrls: ["./freecell.component.scss"]
})
export class FreecellComponent implements OnInit, OnChanges {
  @Input() game: FreecellGame;
  @Input() layout: FreecellLayout;

  @ViewChildren("elements") elementList: QueryList<ElementRef<HTMLElement>>;

  items: Item[] = [];
  spots: Item[] = [];
  cards: Item[] = [];

  private dragger: Dragger | null = null;

  constructor(private renderer: Renderer2) {}

  ngOnInit() {}

  ngOnChanges(changes: SimpleChanges) {
    console.log("app-freecell.ngOnChanges", changes);
    this.spots = this.createSpots();
    this.cards = this.createCards();
    this.items = this.spots.concat(this.cards);
    this.onDeal();
  }

  trackByIndex(index: number): number {
    return index;
  }

  onMouseDown(event: MouseEvent, index: number) {
    // console.log('Mousedown:', index);
    if (event.button !== 0) {
      return;
    }
    event.preventDefault();
    if (!this.dragger && index >= this.spots.length) {
      const cardIndex = index - this.spots.length;
      const tableau = this.game.asTablaeu(cardIndex);

      this.dragger = new Dragger(event.screenX, event.screenY, this.renderer);
      this.onDragStart(tableau);
      this.dragger.onDrag = () => this.onDrag(tableau);
      this.dragger.onDragEnd = ev => {
        this.onDragEnd(tableau);

        const destination = this.findDestination(index, ev.clientX, ev.clientY);
        if (destination >= 0) {
          const srcLine = this.game.getLineIndex(cardIndex);
          const dstLine =
            destination < this.spots.length
              ? destination
              : this.game.getLineIndex(destination - this.spots.length);
          // console.log('Source:', srcLine);
          if (srcLine !== dstLine) {
            //     this.playPath(this.game.getBestPath(tableau, dstLine));
            console.log('Move cards:', tableau);
            console.log('Destination:', dstLine);
            const path = this.game.getBestPath(tableau, dstLine);
            if (path) {
              console.log('Path:', path.length / 2);
              for (let i = 0; i < path.length; i+=2) {
                if (!this.moveCard(path.charCodeAt(i), path.charCodeAt(i + 1))) {
                  break;
                }
              }
            }
          }
        }

        this.dragger = null;
      };
    }
  }

  onDragStart(tableau: Readonly<number[]>) {
    for (let i = 0; i < tableau.length; i++) {
      const card = this.cards[tableau[i]];
      card.ngStyle.zIndex = CARD_NUM + i;
      card.ngClass.dragged = true;
    }
  }

  onDrag(tableau: Readonly<number[]>) {
    for (const index of tableau) {
      const card = this.cards[index];
      card.ngStyle.transform = `translate(${this.dragger.deltaX}px, ${
        this.dragger.deltaY
      }px)`;
    }
  }

  onDragEnd(tableau: Readonly<number[]>) {
    for (const index of tableau) {
      const card = this.cards[index];
      card.ngStyle.zIndex = this.game.getOffset(index);
      delete card.ngStyle.transform;
      delete card.ngClass.dragged;
    }
  }

  onDeal() {
    for (let i = this.game.DESK_SIZE; i-- > 0; ) {
      this.updateLine(i);
    }
  }

  moveCard(source: number, destination: number) {
    if (this.game.moveCard(source, destination)) {
      this.updateLine(source);
      this.updateLine(destination);
      return true;
    } else {
      console.warn('Invalid Move:', source, destination);
    }
    return false;
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
          ngClass: {
            card: true,
            [suitFullNameOf(i)]: true,
            [rankFullNameOf(i)]: true
          }
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
      item.ngStyle.zIndex = i;
    }
  }

  findDestination(source: number, clientX: number, clientY: number): number {
    if (this.elementList) {
      const children = this.elementList.toArray();
      for (let i = children.length; i-- > 0; ) {
        if (i !== source) {
          const rc = children[i].nativeElement.getBoundingClientRect();
          if (
            rc.left <= clientX &&
            clientX <= rc.right &&
            rc.top <= clientY &&
            clientY <= rc.bottom
          ) {
            console.log("Collision at: " + i);
            return i;
          }
        }
      }
    }
    return -1;
  }
}
