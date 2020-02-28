import {
  Component,
  OnInit,
  OnChanges,
  Output,
  Input,
  SimpleChanges,
  ViewChildren,
  QueryList,
  ElementRef,
  EventEmitter
} from "@angular/core";
import { Renderer2 } from "@angular/core";

import { Dragger } from "../common/dragger";
import { toPercent } from "../common/math-utils";
import { suitFullNameOf, rankFullNameOf, CARD_NUM } from "../common/deck";

import { FreecellGameView } from "./freecell-game";
import { FreecellLayout } from "./freecell-layout";

interface Item {
  ngStyle: { [klass: string]: any };
  ngClass: { [klass: string]: any };
}

export interface LineChangeEvent {
  source: number;
  tableau?: number[];
  destination?: number;
}

const Transitions = ['transition_deal', 'transition_norm', 'transition_fast'] as const;
type Transition = typeof Transitions[number];
type TransitionMap = Partial<{ [key in Transition]: boolean }>;

function setTransition(classNames: TransitionMap, transition?: Transition) {
  for (const t of Transitions) {
    classNames[t] = t === transition;
  }
}

class MyDragger extends Dragger {
  dragged = false;
  constructor(screenX: number, screenY: number, renderer: Renderer2) {
    super(screenX, screenY, renderer);
  }
}

@Component({
  selector: "app-freecell",
  templateUrl: "./freecell.component.html",
  styleUrls: ["./freecell.component.scss"]
})
export class FreecellComponent implements OnInit, OnChanges {
  @Input() game: FreecellGameView;
  @Input() layout: FreecellLayout;

  @Output() lineChange = new EventEmitter<LineChangeEvent>();

  @ViewChildren("elements") elementList: QueryList<ElementRef<HTMLElement>>;

  items: Item[] = [];
  spots: Item[] = [];
  cards: Item[] = [];

  private dragger: MyDragger | null = null;

  constructor(private renderer: Renderer2) {}

  ngOnInit() {}

  ngOnChanges(changes: SimpleChanges) {
    console.log("app-freecell.ngOnChanges", changes);
    if (changes.layout) {
      this.spots = this.createSpots();
      this.cards = this.createCards();
      this.items = this.spots.concat(this.cards);
    }
    if (changes.game) {
      this.onDeal();
    }
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

      this.dragger = new MyDragger(event.screenX, event.screenY, this.renderer);
      this.onDragStart(tableau);
      this.dragger.onDrag = () => this.onDrag(tableau);
      this.dragger.onDragEnd = ev => {
        this.onDragEnd(tableau);

        let path = '';

        if (this.dragger.dragged) {
          const destination = this.findDestination(index, ev.clientX, ev.clientY);
          if (destination >= 0) {
            const srcLine = this.game.getLineIndex(cardIndex);
            const dstLine =
              destination < this.spots.length
                ? destination
                : this.game.getLineIndex(destination - this.spots.length);
            if (srcLine !== dstLine) {
              // path = this.game.getBestPath(tableau, dstLine);
              this.lineChange.emit({ source: srcLine, destination: dstLine, tableau });
            }
          }
        } else {
          const srcLine = this.game.getLineIndex(cardIndex);
          this.lineChange.emit({ source: srcLine });
          // path = this.game.solveFor(srcLine);
        }

        this.dragger = null;
        // if (path) {
        //   console.log('Path:', path.length / 2);
        //   for (let i = 0; i < path.length; i+=2) {
        //     if (!this.moveCard(path.charCodeAt(i), path.charCodeAt(i + 1))) {
        //       break;
        //     }
        //   }
        // }
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
      card.ngStyle.transform = `translate(${this.dragger.deltaX}px, ${this.dragger.deltaY}px)`;
    }
    if (Math.abs(this.dragger.deltaX) > 4 || Math.abs(this.dragger.deltaY) > 4) {
      this.dragger.dragged = true;
    }
  }

  onDragEnd(tableau: Readonly<number[]>) {
    for (const index of tableau) {
      const card = this.cards[index];
      card.ngStyle.zIndex = this.game.getOffset(index);
      delete card.ngStyle.transform;
      delete card.ngClass.dragged;
      setTransition(card.ngClass, 'transition_fast');
    }
  }

  onDeal() {
    for (let i = this.game.DESK_SIZE; i-- > 0; ) {
      this.updateLine(i, 'transition_deal');
    }
  }

  onCardMove(source: number, destination: number, transition: Transition = 'transition_norm') {
    this.updateLine(source, transition);
    this.updateLine(destination, transition);
  }

  // moveCard(source: number, destination: number) {
  //   if (this.game.moveCard(source, destination)) {
  //     this.updateLine(source);
  //     this.updateLine(destination);
  //     return true;
  //   } else {
  //     console.warn('Invalid Move:', source, destination);
  //   }
  //   return false;
  // }

  createSpots(): Item[] {
    const placeholders: Item[] = [];
    const layout = this.layout;
    if (layout) {
      const basis = layout.basis;
      const itemWidth = layout.itemWidth;
      const itemHeight = layout.itemHeight;

      const width = toPercent(itemWidth, layout.width);
      const height = toPercent(itemHeight, layout.height);

      for (let i = 0; i < basis.DESK_SIZE; i++) {
        const pos = layout.getSpotPosition(i);
        const transform = `translate(${toPercent(pos.x, itemWidth)}, ${toPercent(pos.y, itemHeight)})`;

        const item: Item = {
          ngStyle: { transform, width, height },
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
    if (layout) {
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

  getCardTransform(lineIndex: number, cardIndex: number) {
    const pos = this.layout.getCardPosition(lineIndex,
      this.game.getOffset(cardIndex), this.game.getLine(lineIndex).length);
    return `translate(${toPercent(pos.x, this.layout.itemWidth)}, ${toPercent(pos.y, this.layout.itemHeight)})`;
  }

  updateLine(index: number, transition: Transition = 'transition_norm') {
    const line = this.game.getLine(index);
    // const count = line.length;
    // const W = this.layout.width;
    // const H = this.layout.height;
    // for (let i = 0; i < count; i++) {
    for (let i = line.length; i-- > 0;) {
      // const pos = this.layout.getCardPosition(index, i, count);
      const item = this.cards[line[i]];
      // item.ngStyle.left = toPercent(pos.x, W);
      // item.ngStyle.top = toPercent(pos.y, H);
      item.ngStyle.transform = this.getCardTransform(index, line[i]);
      item.ngStyle.zIndex = i;

      setTransition(item.ngClass, transition);
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
            // console.log("Collision at: " + i);
            return i;
          }
        }
      }
    }
    return -1;
  }
}
