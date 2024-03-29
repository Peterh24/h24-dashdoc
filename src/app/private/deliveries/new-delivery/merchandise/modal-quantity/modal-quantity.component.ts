import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormControl, Validators } from '@angular/forms';
import { ModalController } from '@ionic/angular';

@Component({
  selector: 'app-modal-quantity',
  templateUrl: './modal-quantity.component.html',
  styleUrls: ['./modal-quantity.component.scss'],
})
export class ModalQuantityComponent  implements OnInit {
  @Input() id: string;
  @Input() description: string;
  @Input() quantity: number = 0;
  @Input() complementary_information: string;
  form = this.formBuilder.group({
    merchandiseLabel: new FormControl({value: '', disabled: true}, Validators.required),
    complementaryInformation: new FormControl({value: '', disabled: false})
  });
  state:boolean = false;
  constructor(
    private formBuilder: FormBuilder,
    private modalController: ModalController
  ) { }

  ngOnInit() {
    this.form.get('complementaryInformation').setValue(this.complementary_information);
    if (this.id.includes('other')) {
      this.state = true;
      this.form.get('merchandiseLabel')?.enable();
      if(this.id !== 'other'){
        this.form.get('merchandiseLabel').setValue(this.description);
      }
    }
  }

  changeQuantity(type:string){
    if(type === 'remove'){
      if(this.quantity <=0){
        return;
      } else {
        this.quantity--;
        return
      }
    }
    this.quantity++;
    return;
  }

  async closeModal() {
    await this.modalController.dismiss();
  }

  async addMerchandise(){
    if(this.id =='other') {
      this.description = this.form.get('merchandiseLabel').value;
      this.id = this.id + (Math.floor(Math.random() * (10000 - 99999 +1)) + 1000);
    }
    if(this.form.get('merchandiseLabel').value != ''){
      this.description = this.form.get('merchandiseLabel').value;
    }

    this.complementary_information = this.form.get('complementaryInformation').value;

    await this.modalController.dismiss({id: this.id, description: this.description, quantity: this.quantity, complementary_information: this.complementary_information});
  }

}
