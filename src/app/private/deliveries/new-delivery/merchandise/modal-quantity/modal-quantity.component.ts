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
  @Input() name: string;
  @Input() quantity: number = 0;
  form = this.formBuilder.group({
    merchandiseLabel: new FormControl({value: '', disabled: true}, Validators.required),
  });
  state:boolean = false;
  constructor(
    private formBuilder: FormBuilder,
    private modalController: ModalController
  ) { }

  ngOnInit() {
    if (this.id.includes('other')) {
      this.state = true;
      this.form.get('merchandiseLabel')?.enable();
      if(this.id !== 'other'){
        this.form.get('merchandiseLabel').setValue(this.name);
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
      this.name = this.form.get('merchandiseLabel').value;
      this.id = this.id + (Math.floor(Math.random() * (10000 - 99999 +1)) + 1000);
    }
    if(this.form.get('merchandiseLabel').value != ''){
      this.name = this.form.get('merchandiseLabel').value;
    }
    await this.modalController.dismiss({id: this.id, name: this.name, quantity: this.quantity});
  }

}
