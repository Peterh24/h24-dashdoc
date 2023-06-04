import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { DASHDOC_API_URL } from '../../../../app/services/constants';
import { take } from 'rxjs';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-details',
  templateUrl: './details.page.html',
  styleUrls: ['./details.page.scss'],
})
export class DetailsPage implements OnInit {

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) { }

  ngOnInit() {
    this.http.get(`${DASHDOC_API_URL}/adr-un-codes/`).pipe(take(1)).subscribe((res) => {
      console.log('res: ', res);
    })
  }

  signOut() {
    this.authService.signOut();
  }

}
