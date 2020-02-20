import { deck, isTableau, suitOf, rankOf } from "../common/deck";
import { FreecellBasis } from "./freecell-basis";

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

  baseToString(): string {
    let buf = "";
    let prefix = "";
    for (let i = this.BASE_START; i < this.BASE_END; i++) {
      buf += prefix + this.desk[i].length;
      prefix = ",";
    }
    return buf;
  }

  pileToString(): string {
    const arr = [];
    for (let i = this.PILE_START; i < this.PILE_END; i++) {
      arr.push(this.desk[i].join(","));
    }
    arr.sort();
    return arr.join(";");
  }

  toKey() {
    return this.baseToString() + ":" + this.pileToString();
  }
}
