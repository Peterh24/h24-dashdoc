import { Component } from '@angular/core';
import { register } from 'swiper/element/bundle';
import { addIcons } from 'ionicons';

register();
@Component({
    selector: 'app-root',
    templateUrl: 'app.component.html',
    styleUrls: ['app.component.scss'],
    standalone: false
})
export class AppComponent {
  constructor(
  ) {
    this.addLucideIcons ();
  }

  addLucideIcons () {
    addIcons ({
      'add': 'assets/lucide/plus.svg',
      'add-outline': 'assets/lucide/plus.svg',
      'arrow-forward': 'assets/lucide/chevron-right.svg',
      'arrow-forward-outline': 'assets/lucide/chevron-right.svg',
      'ban-outline': 'assets/lucide/ban.svg',
      'calendar': 'assets/lucide/calendar.svg',
      'call': 'assets/lucide/headset.svg',
      'cart-outline': 'assets/lucide/shopping-cart.svg',
      'checkbox-outline': 'assets/lucide/square-check-big.svg',
      'checkmark-outline': 'assets/lucide/check.svg',
      'chevron-forward-outline': 'assets/lucide/chevron-right.svg',
      'chevron-down': 'assets/lucide/chevron-down.svg',
      'chevron-left': 'assets/lucide/chevron-left.svg',
      'chevron-right': 'assets/lucide/chevron-right.svg',
      'close': 'assets/lucide/x.svg',
      'close-outline': 'assets/lucide/x.svg',
//      'create-outline': 'assets/lucide/pencil.svg',
      'document-outline': 'assets/lucide/file.svg',
      'download-outline': 'assets/lucide/download.svg',
//      'edit': 'assets/lucide/pencil.svg',
      'enter-outline': 'assets/lucide/log-in.svg',
      'exit-outline': 'assets/lucide/log-out.svg',
      'eye-outline': 'assets/lucide/eye.svg',
      'eye-closed': 'assets/lucide/eye-closed.svg',
      'folder-outline': 'assets/lucide/folder.svg',
      'home': 'assets/lucide/house.svg',
      'information-circle': 'assets/lucide/info.svg',
      'key-outline': 'assets/lucide/key-round.svg',
      'location': 'assets/lucide/map-pin.svg',
      'location-outline': 'assets/lucide/map-pin.svg',
      'log-out': 'assets/lucide/log-out.svg',
      'logo-euro': 'assets/lucide/receipt-text.svg',
      'notifications-outline': 'assets/lucide/bell.svg',
      'person-circle': 'assets/lucide/circle-user-round.svg',
      'person-circle-outline': 'assets/lucide/circle-user-round.svg',
      'people-outline': 'assets/lucide/send.svg',
      'person-outline': 'assets/lucide/user.svg',
      'power': 'assets/lucide/power.svg',
      'radio-button-off-outline': 'assets/lucide/circle.svg',
      'save': 'assets/lucide/save.svg',
      'stop-outline': 'assets/lucide/square.svg',
      'time': 'assets/lucide/clock.svg',
      'trash': 'assets/lucide/trash.svg',
      'trash-outline': 'assets/lucide/trash.svg',
      'truck': 'assets/lucide/truck.svg'
    });
  }
}
