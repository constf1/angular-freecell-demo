import { FreecellBasis } from './freecell-basis';
import { CARD_NUM, suitOf, rankOf, isTableau, SUIT_NUM } from '../common/deck';

export type Filter = { [card: number]: boolean; } | boolean[];
export type Desk = Readonly<Readonly<number[]>[]>;

export class FreecellSolution {
  constructor(public success: boolean) {}
}

export class FreecellSolver extends FreecellBasis {
  cardFilter?: Filter;
  destinationFilter?: Filter;

  private readonly done = new Set<string>();
  private readonly buffers: string[][] = [[], []];
  private iteration = 0;
  private path = '';

  // Default implementation just throws a solution object.
  onMove: (card: number, source: number, destination: number) => void =
   (card: number, source: number, destination: number) => this.stop(true);

  constructor(pileNum: number, cellNum: number, baseNum: number, public desk: number[][]) {
    super(pileNum, cellNum, baseNum);
  }

  stop(success: boolean) {
    throw new FreecellSolution(success);
  }

  getAllPaths(): string[] {
    return this.buffers[this.iteration % 2];
  }

  getPath(): string {
    const output = this.buffers[this.iteration % 2];
    return output[output.length - 1];
  }

  clear() {
    this.done.clear();
    this.buffers[0].length = 0;
    this.buffers[1].length = 0;
    this.iteration = 0;
    this.path = '';
  }

  solve(): boolean {
    this.clear();
    this.done.add(this.toKey());
    this.buffers[0][0] = '';

    try {
      for (let input: string[]; (input = this.buffers[this.iteration % 2]).length > 0;) {
        this.iteration++;
        // const output = this.buffers[this.iteration % 2];

        for (const path of input) {
          this.skipForward(path);
          this.findMoves();
          this.skipBackward();
        }

        // clear input
        input.length = 0;
      }
    } catch (e) {
      if (e instanceof FreecellSolution) {
        return e.success;
      } else {
        throw e;  // re-throw the error unchanged
      }
    } finally {
      console.log('Searched:', this.done.size);
    }
    return false;
  }

  skipForward(path: string) {
    for (let i = 0; i < path.length; i += 2) {
      // move source => destination
      this.desk[path.charCodeAt(i + 1)].push(this.desk[path.charCodeAt(i)].pop());
    }
    this.path = path;
  }

  skipBackward() {
    const path = this.path;
    for (let i = path.length; i > 0; i -= 2) {
      // move destination => source
      this.desk[path.charCodeAt(i - 2)].push(this.desk[path.charCodeAt(i - 1)].pop());
    }
    // this.path = '';
  }

  move(card: number, source: number, destination: number) {
    // move source => destination
    this.desk[destination].push(this.desk[source].pop());
    const key = this.toKey();
    if (!this.done.has(key)) {
      this.done.add(key);
      this.buffers[this.iteration % 2].push(this.path + String.fromCharCode(source, destination));

      if ((!this.cardFilter || this.cardFilter[card]) &&
        (!this.destinationFilter || this.destinationFilter[destination])) {
        this.onMove(card, source, destination);
      }
    }
    // move destination => source
    this.desk[source].push(this.desk[destination].pop());
  }

  findMoves() {
    const cardFilter = this.cardFilter;
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

  baseToString(): string {
    let buf = '';
    for (let i = this.BASE_START; i < this.BASE_END; i++) {
      buf += String.fromCharCode(this.desk[i].length);
    }
    return buf;
  }

  pileToString(): string {
    const arr = [];
    for (let i = this.PILE_START; i < this.PILE_END; i++) {
      arr.push(String.fromCharCode(...this.desk[i]));
    }
    arr.sort();
    return arr.join(String.fromCharCode(CARD_NUM));
  }

  toKey() {
    return this.baseToString() + this.pileToString();
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
