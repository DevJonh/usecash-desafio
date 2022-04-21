import { Component, OnInit } from '@angular/core';
import {
  faArrowAltCircleDown,
  faArrowAltCircleUp,
} from '@fortawesome/free-regular-svg-icons';

@Component({
  selector: 'app-panel',
  templateUrl: './panel.component.html',
  styleUrls: ['./panel.component.scss'],
})
export class PanelComponent implements OnInit {
  panel1 = false;
  panel2 = false;
  panel3 = false;

  down = faArrowAltCircleDown;
  up = faArrowAltCircleUp;

  constructor() {}

  ngOnInit(): void {}

  changePanel(event: any) {
    console.log(event);
    let panelId = event.panelId.split('-')[1];
    switch (panelId) {
      case '1':
        this.panel1 = true;
        this.panel2 = false;
        this.panel3 = false;
        break;

      case '2':
        this.panel1 = false;
        this.panel2 = true;
        this.panel3 = false;
        break;

      case '3':
        this.panel1 = false;
        this.panel2 = false;
        this.panel3 = true;
        break;

      default:
        this.panel1 = false;
        this.panel2 = false;
        this.panel3 = false;
        break;
    }

    console.log(typeof panelId);
    console.log(this.panel1);
    console.log(this.panel2);
    console.log(this.panel3);
  }
}
