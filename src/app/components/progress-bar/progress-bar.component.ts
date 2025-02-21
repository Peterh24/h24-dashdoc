import { Component, Input, OnInit } from '@angular/core';

@Component({
    selector: 'app-progress-bar',
    templateUrl: './progress-bar.component.html',
    styleUrls: ['./progress-bar.component.scss'],
    standalone: false
})
export class ProgressBarComponent  implements OnInit {
  intervalRef: any;
  @Input() current:number;
  @Input() speed:number = 0.01;
  @Input() next:number;
  constructor() {

   }

  ngOnInit() {
    this.intervalRef = setInterval(() => { // Stockez la référence de l'intervalle
      this.current += this.speed;
      if (this.current > this.next) {
        clearInterval(this.intervalRef); // Arrêtez l'intervalle lorsque la condition est remplie
      }
    }, 30);
  }

}
