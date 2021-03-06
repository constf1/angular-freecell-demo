import {
  Component,
  HostListener,
  ViewChild,
  ElementRef,
  OnInit,
  AfterViewInit
} from "@angular/core";

// import { randomIneger } from "../common/math-utils";
// import { Autoplay } from "../common/autoplay";

interface Letter {
  value: string;
  isHidden?: boolean;
  result?: string;
  alternatives?: string[];
}

interface Quiz {
  value: string;
  answer: string;
  questions?: string[];
  isError?: boolean;
}

/*
1 класс:
альбом, арбуз,
барабан, билет,
воробей, ворона,
газета, город,
девочка, дежурный, деревня,
завод, заяц,
канава, капуста, карандаш, карман, картофель, класс, концерт, коридор, корова,
ладонь,
машина, мебель, медведь, молоко, морковь, мороз,
овраг, огурец,
петух, платок, погода, помидор,
ребята, родина,
сапоги, сахар, собака, сорока,
тетрадь,
ученик, учитель,
хорошо,
яблоко, ягода, язык

Карточки 1 класс:

_льбом, _рбу_,
б_р_бан, б_лет,
в_р_бей, в_рона,
г_зета, гор__,
дев_чка, д_журный, д_ревня,
з_вод, за_ц,
к_нава, к_пуста, к_р_нда_, к_рман, к_ртоф_ль, кла__, к_нц_рт, к_р_дор, к_рова,
л_донь,
м_ш_на, меб_ль, м_две_ь, м_л_ко, м_рко_ь, м_ро_,
_вра_, _гурец,
п_тух, пл_ток, п_года, п_м_дор,
р_бята, _од_на,
с_п_ги, сах_р, с_бака, с_рока,
т_тра_ь,
уч_ник, учит_ль,
х_р_шо,
ябл_ко, яг_да, _зык.
*/

const grade1: string[] = [
  "(а|о)льбом",
  "(а|о)рбу(з|с)",
  "б(а|о|э)р(а|о|э)бан",
  "б(и|е|ы)лет",
  "в(о|а)р(о|а|э)бей",
  "в(о|а)рона",
  "г(а|о)зета",
  "гор(о|а|э)(д|т)",
  "дев(о|а|)чка",
  "д(е|и|э)журный",
  "д(е|э|и)ревня",
  "з(а|о)вод",
  "за(я|й|е|э)ц",
  "к(а|о)нава",
  "к(а|о)пуста",
  "к(а|о)р(а|о)нда(ш|ж)",
  "к(а|о)рман",
  "к(а|о)ртоф(е|и)ль",
  "кла(сс|с|з|зз)",
  "к(о|а)нц(е|э)рт",
  "к(о|а)р(и|е)дор",
  "к(о|а)рова",
  'л(а|о)донь',
  'м(а|о)ш(и|ы)на',
  'меб(е|и|э|)ль',
  'м(е|и)две(д|т)ь',
  'м(о|а)л(о|а)ко',
  'м(о|а)рко(в|ф)ь',
  'м(о|а)ро(з|с)',

  // 
  // 
  // овраг, огурец,
  // петух, платок, погода, помидор,
  // ребята, родина,
  // сапоги, сахар, собака, сорока,
  // тетрадь,
  // ученик, учитель,
  // хорошо,
  // яблоко, ягода, язык'`,
];

// д…журный
// д…ревня
// за…ц
// к…р…нда…
// кла…
// к…рова
// л…сица
// мал…ч…к
// м…ш…на
// м…две…
// м…л…ко
// …зык

/* Randomize array in-place using Durstenfeld shuffle algorithm */
function shuffle<T>(arr: Array<T>): Array<T> {
  for (var i = arr.length; --i > 0; ) {
    var j = Math.floor((i + 1) * Math.random());
    var temp = arr[i];
    arr[i] = arr[j];
    arr[j] = temp;
  }
  return arr;
}

function randomItem<T>(arr: Readonly<T[]>): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

@Component({
  selector: "my-app",
  templateUrl: "./app.component.html",
  styleUrls: ["./app.component.scss"]
})
export class AppComponent implements OnInit, AfterViewInit {
  selection = 1;
  letters: Quiz[];
  words: Quiz[][] = [];

  setQuiz(word: string) {
    const regexp = /\([^)]+\)|./g;
    this.letters = [];
    let count = 0;
    for (let match; (match = regexp.exec(word)) !== null; ) {
      const s = match[0];
      if (s.length > 1) {
        const arr = s.substring(1, s.length - 1).split("|");
        this.letters.push({ value: arr[0], answer: '_', questions: shuffle(arr) });
        count++;
      } else if (s.length === 1) {
        this.letters.push({ value: s, answer: s });
      }
    }
    // Enable only one random letter. Otherwise it is very difficult to guess the word.
    if (count > 1) {
      const i = Math.floor(Math.random() * count);
      for (const l of this.letters) {
        if (l.questions && --count !== i) {
          l.questions = null;
          l.answer = l.value;
        }
      }
    }
    this.words.push(this.letters);
    this.selectNext();
  }

  selectNext() {
    this.selection = this.letters.findIndex(i => i.answer === '_');
  }

  onAnswer(value: string) {
    const l = this.letters[this.selection];
    if (l) {
      l.answer = value;
      l.isError = value !== l.value;
      this.selectNext();

      if (this.selection < 0) {
        this.setQuiz(randomItem(grade1));
      }
    }
  }

  // isLetterValid(index: number) {
  //   const l = this.letters[index];
  //   if (l) {
  //     return !l.result || l.value === l.result;
  //   }
  //   return false;
  // }

  // @ViewChild('mainRef', {static: true}) mainRef: ElementRef<HTMLElement>;
  // @ViewChild(FreecellComponent, {static: false}) freecellComponent: FreecellComponent;

  // @HostListener('window:resize', ['$event'])
  // onResize(event) {
  //   if (this.mainRef && this.mainRef.nativeElement) {
  //     this.width = this.mainRef.nativeElement.clientWidth;
  //     this.height = this.mainRef.nativeElement.clientHeight;
  //   }
  // }

  ngOnInit() {
    this.setQuiz("з(е|и|я|э|ы)м(|ъ|ь)л(я|и|е|э|ы)ника");
  }

  ngAfterViewInit() {}

  trackByIndex(index: number) {
    return index;
  }
}
