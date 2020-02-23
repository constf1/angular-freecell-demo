import { CARD_NUM, suitOf, indexOf, rankOf, isTableau, SUIT_NUM } from '../common/deck';
import { clear, copy } from '../common/array-utils';

import { FreecellBasis } from './freecell-basis';

export type Filter = { [card: number]: boolean; } | boolean[];
export type Desk = Readonly<Readonly<number[]>[]>;

export class FreecellSolution {
}

export class FreecellSolver extends FreecellBasis {
  private readonly done = new Map<string, string>();
  private readonly buffers: string[][] = [[], []];
  private iteration = 0;

  // Default implementation just throws a solution object.
  onMove: (card: number, source: number, destination: number) => void = (card: number, source: number, destination: number) => {
    throw new FreecellSolution();
  }

  constructor(pileNum: number, cellNum: number, baseNum: number, public desk: number[][]) {
    super(pileNum, cellNum, baseNum);
  }

  getPath(): string {
    const desk = copy(this.desk);
    let path = '';
    // tslint:disable-next-line: no-conditional-assignment
    for (let move: string; !!(move = this.done.get(this.toKey(desk)));) {
      path = move + path;

      const source = move.charCodeAt(0);
      const destination = move.charCodeAt(1);
      // move destination => source
      desk[source].push(desk[destination].pop());
    }
    return path;
  }

  clear() {
    this.done.clear();
    this.buffers[0].length = 0;
    this.buffers[1].length = 0;
    this.iteration = 0;
  }

  solve(cardFilter?: Filter): FreecellSolution | undefined {
    this.clear();
    this.done.set(this.buffers[0][0] = this.toKey(this.desk), '');

    try {
      for (let input: string[]; (input = this.buffers[this.iteration % 2]).length > 0;) {
        this.iteration++;
        // const output = this.buffers[this.iteration % 2];

        for (const key of input) {
          this.fromKey(key, this.desk);
          this.findMoves(cardFilter);
        }

        // clear input
        input.length = 0;
      }
    } catch (e) {
      if (e instanceof FreecellSolution) {
        return e;
      } else {
        throw e;  // re-throw the error unchanged
      }
    }
  }

  move(card: number, source: number, destination: number) {
    this.desk[destination].push(this.desk[source].pop());
    const key = this.toKey(this.desk);
    if (!this.done.has(key)) {
      this.done.set(key, String.fromCharCode(source, destination));
      this.buffers[this.iteration % 2].push(key);

      this.onMove(card, source, destination);
    }
    this.desk[source].push(this.desk[destination].pop());
  }

  findMoves(cardFilter?: Filter) {
    const emptyCell = this.getEmptyCell();
    const emptyPile = this.getEmptyPile();

    for (let line = 0; line < this.DESK_SIZE; line++) {
      const src = this.desk[line];
      if (src.length > 0) {
        const card = src[src.length - 1];
        if (!cardFilter || cardFilter[card]) {
          // To a tableau.
          for (let pile = this.PILE_START; pile < this.PILE_END; pile++) {
            if (pile !== line) {
              const dst = this.desk[pile];
              if (dst.length > 0 && isTableau(dst[dst.length - 1], card)) {
                this.move(card, line, pile);
              }
            }
          }

          // To an empty pile.
          if (emptyPile >= 0) {
            if (!this.isPile(line) || src.length > 1) {
              this.move(card, line, emptyPile);
            }
          }

          // To an empty cell.
          if (emptyCell >= 0) {
            if (!this.isCell(line)) {
              this.move(card, line, emptyCell);
            }
          }

          // To the base.
          if (!this.isBase(line)) {
            const base = this.getBase(card);
            if (base >= 0) {
              this.move(card, line, base);
            }
          }
        }
      }
    }
  }

  baseToString(desk: Desk): string {
    let buf = '';
    for (let i = this.BASE_START; i < this.BASE_END; i++) {
      buf += String.fromCharCode(desk[i].length);
    }
    return buf;
  }

  pileToString(desk: Desk): string {
    const arr = [];
    for (let i = this.PILE_START; i < this.PILE_END; i++) {
      arr.push(String.fromCharCode(...desk[i]));
    }
    arr.sort();
    return arr.join(String.fromCharCode(CARD_NUM));
  }

  toKey(desk: Desk) {
    return this.baseToString(desk) + this.pileToString(desk);
  }

  fromKey(key: string, desk: number[][]) {
    clear(desk);
    const cards: number[] = [];

    // Fill bases.
    for (let i = 0; i < this.BASE_NUM; i++) {
      const length = key.charCodeAt(i);
      const s = suitOf(i);
      const line = desk[this.BASE_START + i];
      for (let j = 0; j < length; j++) {
        const card = indexOf(s, j);
        line.push(card);
        cards[card] = 1;
      }
    }

    // Fill piles.
    for (let i = this.BASE_NUM, pile = this.PILE_START; i < key.length; i++) {
      const card = key.charCodeAt(i);
      if (card < CARD_NUM) {
        desk[pile].push(card);
        cards[card] = 1;
      } else {
        pile++;
      }
    }

    // Fill cells.
    for (let i = 0, cell = this.CELL_START; i < CARD_NUM; i++) {
      if (!cards[i]) {
        desk[cell].push(i);
        cell++;
      }
    }
  }

  getEmptyCell(): number {
    for (let i = this.CELL_START; i < this.CELL_END; i++) {
      if (this.desk[i].length === 0) {
        return i;
      }
    }
    return -1;
  }

  getEmptyPile(): number {
    for (let i = this.PILE_START; i < this.PILE_END; i++) {
      if (this.desk[i].length === 0) {
        return i;
      }
    }
    return -1;
  }

  getBase(card: number): number {
    const suit = suitOf(card);
    const rank = rankOf(card);

    for (let i = this.BASE_START + suit; i < this.BASE_END; i += SUIT_NUM) {
      if (this.desk[i].length === rank) {
        return i;
      }
    }
    return -1;
  }
}
