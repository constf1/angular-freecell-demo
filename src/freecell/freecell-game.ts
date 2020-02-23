import { deck, isTableau, suitOf, rankOf } from "../common/deck";
import { copy, endsWith } from '../common/array-utils';

import { FreecellBasis } from "./freecell-basis";
import { Filter, FreecellSolver, FreecellSolution } from './freecell-solver';

// Swaps source and destination in the path
function swap(path: string, source: number, destination: number) {
  const buf: number[] = [];
  for (let i = 0; i < path.length; i++) {
    let x = path.charCodeAt(i);
    if (x === destination) {
      x = source;
    } else if (x === source) {
      x = destination;
    }
    buf.push(x);
  }
  return String.fromCharCode(...buf);
}

export class FreecellGame extends FreecellBasis {
  private readonly desk: number[][] = [];
  private readonly lineMap: number[] = [];
  private readonly offsetMap: number[] = [];

  constructor(pileNum: number, cellNum: number, baseNum: number) {
    super(pileNum, cellNum, baseNum);
    for (let i = 0; i < this.DESK_SIZE; i++) {
      this.desk.push([]);
    }
  }

  getLineIndex(cardIndex: number) {
    return this.lineMap[cardIndex];
  }

  getOffset(cardIndex: number) {
    return this.offsetMap[cardIndex];
  }

  /**
   * Clears the game.
   */
  clear() {
    for (let i = this.desk.length; i-- > 0; ) {
      this.desk[i].length = 0;
    }
    this.lineMap.length = 0;
    this.offsetMap.length = 0;
  }

  addCard(destination: number, card: number) {
    this.lineMap[card] = destination;
    this.offsetMap[card] = this.desk[destination].length;
    this.desk[destination].push(card);
  }

  isMoveValid(source: number, destination: number): boolean {
    if (source === destination) {
      return false;
    }

    const srcLength = this.desk[source].length;
    if (srcLength <= 0) {
      return false;
    }

    const dstLength = this.desk[destination].length;
    if (this.isCell(destination)) {
      return dstLength === 0;
    }

    const card = this.desk[source][srcLength - 1];
    if (this.isPile(destination)) {
      return (
        dstLength === 0 ||
        isTableau(this.desk[destination][dstLength - 1], card)
      );
    }

    if (this.isBase(destination)) {
      const suit = suitOf(card);
      const rank = rankOf(card);
      return (
        suitOf(destination - this.BASE_START) === suit && dstLength === rank
      );
    }

    return false;
  }

  /**
   * Pops the last card from the `source` line and add it to the `destination`
   * @param source source line
   * @param destination destination line
   */
  moveCard(source: number, destination: number) {
    if (this.isMoveValid(source, destination)) {
      this.addCard(destination, this.desk[source].pop());
      return true;
    }
    return false;
  }

  /**
   * Makes a new deal.
   * @param seed seed number
   */
  deal(seed?: number) {
    this.clear();
    const cards = deck(seed);

    const PILE_START = this.PILE_START;
    const PILE_NUM = this.PILE_NUM;

    for (let i = 0; i < cards.length; i++) {
      this.addCard(PILE_START + (i % PILE_NUM), cards[i]);
    }
    return cards;
  }

  getLine(index: number): Readonly<number[]> {
    return this.desk[index];
  }

  getTableauAt(index: number): number[] {
    const tableau = [];
    const line = this.desk[index];

    let j = line.length;
    if (j > 0) {
      tableau.push(line[j - 1]);
      while (--j > 0 && isTableau(line[j - 1], line[j])) {
        tableau.push(line[j - 1]);
      }
    }
    tableau.reverse();
    return tableau;
  }

  asTablaeu(card: number): number[] {
    let tableau = this.getTableauAt(this.lineMap[card]);
    const i = tableau.indexOf(card);
    if (i < 0) {
      tableau = [card];
    } else if (i > 0) {
      tableau.splice(0, i);
    }
    return tableau;
  }

  /**
   * Gets a card at [index, offset]
   * @param index a line index
   * @param offset an offset in the line. A negative value can be used,
   *  indicating an offset from the end of the sequence.
   */
  getCard(index: number, offset: number) {
    const line = this.desk[index];
    if (offset < 0) {
      offset = line.length + offset;
    }
    return offset >= 0 && offset < line.length ? line[offset] : -1;
  }

  getBestPath(tableau: number[], destination: number): string {
    // Validity checks:
    if (tableau.length <= 0) {
      return '';
    }

    const lastCard = tableau[tableau.length - 1];
    const source = this.lineMap[lastCard];
    if (this.getCard(source, -1) !== lastCard) {
      return '';
    }

    // Handle one card tableau.
    if (tableau.length === 1) {
      return this.isMoveValid(source, destination) ? String.fromCharCode(source, destination) : '';
    }

    const destinationFilter: Filter = { [destination]: true };
    if (this.isPile(destination) && this.getLine(destination).length === 0) {
      // any empty pile is good as destination.
      for (let i = this.PILE_START; i < this.PILE_END; i++) {
        if (this.getLine(i).length === 0) {
          destinationFilter[i] = true;
        }
      }
    }

    const startTime = Date.now();

    const cardFilter: Filter = tableau.reduce((obj, key) => { obj[key] = true; return obj; }, {});
    const solver = new FreecellSolver(this.PILE_NUM, this.CELL_NUM, this.BASE_NUM, copy(this.desk));
    solver.onMove = (card: number, src: number, dst: number) => {
      if (card === lastCard && destinationFilter[dst] && endsWith(solver.desk[dst], tableau)) {
        solver.stop(true);
      } else {
        if (Date.now() - startTime > 500) {
          // It's time to stop the search.
          console.log('Oops! Search timeout!');
          solver.stop(false);
        }
      }
    };

    if (solver.solve(cardFilter)) {
      console.log('Search time: ' + (Date.now() - startTime));
      let path = solver.getPath();
      const d = path.charCodeAt(path.length - 1);
      if (d !== destination) {
        console.log('Swapping destinations:', destination, d);
        path = swap(path, destination, d);
      }

      return path;
    }

    console.log('Full search time: ' + (Date.now() - startTime));
    return '';
  }
}
