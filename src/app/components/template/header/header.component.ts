import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
})
export class HeaderComponent implements OnInit {
  constructor(private router: Router) {}

  ngOnInit(): void {}

  navbarOpen = false;
  regions = ['User', 'Região'];
  toggleNavbar() {
    this.navbarOpen = !this.navbarOpen;
  }

  home() {
    this.go('');
  }

  go(path: string) {
    if (this.navbarOpen) {
      this.navbarOpen = false;
    }
    this.router.navigate([path]);
  }
}
