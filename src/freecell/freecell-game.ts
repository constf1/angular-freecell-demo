import { deck, isTableau } from '../common/deck';
import { FreecellBasis } from './freecell-basis';

export class FreecellGame extends FreecellBasis {
  desk: number[][] = [];

  constructor(pileNum: number, cellNum: number, baseNum: number) {
    super(pileNum, cellNum, baseNum);
    for (let i = 0; i < this.DESK_SIZE; i++) {
      this.desk.push([]);
    }
  }

  /**
   * Clears the game.
   */
  clear() {
    for (let i = this.desk.length; i-- > 0;) {
      this.desk[i].length = 0;
    }
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
      this.desk[PILE_START + (i % PILE_NUM)].push(cards[i]);
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

  baseToString(): string {
    let buf = '';
    let prefix = '';
    for (let i = this.BASE_START; i < this.BASE_END; i++) {
      buf += prefix + this.desk[i].length;
      prefix = ',';
    }
    return buf;
  }

  pileToString(): string {
    const arr = [];
    for (let i = this.PILE_START; i < this.PILE_END; i++) {
      arr.push(this.desk[i].join(','));
    }
    arr.sort();
    return arr.join(';');
  }

  toKey() {
    return this.baseToString() + ':' + this.pileToString();
  }

}