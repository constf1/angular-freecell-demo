import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-letter-box',
  templateUrl: './letter-box.component.html',
  styleUrls: ['./letter-box.component.scss']
})
export class LetterBoxComponent implements OnInit {
  @Input() letter = '';
  @Input() correction = '';

  constructor() { }

  ngOnInit() {
  }

}