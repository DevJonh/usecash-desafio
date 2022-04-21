import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-panel',
  templateUrl: './panel.component.html',
  styleUrls: ['./panel.component.scss'],
})
export class PanelComponent implements OnInit {
  panel1 = false;
  panel2 = false;
  panel3 = false;

  constructor() {}

  ngOnInit(): void {}

  changePanel(event: any) {
    let panelId = event.panelId.split('-')[1];
    switch (panelId) {
      case '1':
        if (event.nextState) {
          this.panel1 = true;
          this.panel2 = false;
          this.panel3 = false;
        } else {
          this.panel1 = false;
          this.panel2 = false;
          this.panel3 = false;
        }
        break;

      case '2':
        if (event.nextState) {
          this.panel1 = false;
          this.panel2 = true;
          this.panel3 = false;
        } else {
          this.panel1 = false;
          this.panel2 = false;
          this.panel3 = false;
        }
        break;

      case '3':
        if (event.nextState) {
          this.panel1 = false;
          this.panel2 = false;
          this.panel3 = true;
        } else {
          this.panel1 = false;
          this.panel2 = false;
          this.panel3 = false;
        }
        break;

      default:
        this.panel1 = false;
        this.panel2 = false;
        this.panel3 = false;
        break;
    }
  }
}
