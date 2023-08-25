import { Component, Input, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';

@Component({
  selector: 'app-modal-course',
  templateUrl: './modal-course.component.html',
  styleUrls: ['./modal-course.component.scss'],
})
export class ModalCourseComponent  implements OnInit {
  @Input() type: string;
  constructor(
    private modalController: ModalController
  ) { }

  ngOnInit() {}

  async onChoice(choice: string){
    console.log(choice);
    await this.modalController.dismiss({choice: choice});
  }
}
