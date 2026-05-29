import { Component } from '@angular/core';
import {
  IonApp,
  IonRouterOutlet,
  Platform,
  ToastController
} from '@ionic/angular/standalone';

import { App } from '@capacitor/app';
import { Router } from '@angular/router';
import { Location } from '@angular/common';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  imports: [IonApp, IonRouterOutlet],
})
export class AppComponent {

  private lastBack = 0;

  constructor(
    private platform: Platform,
    private toastController: ToastController,
    private router: Router,
    private location: Location
  ) {
    this.initializeBackButton();
  }

  initializeBackButton() {

    this.platform.backButton.subscribeWithPriority(-1, async () => {

      // kalau bukan home → back normal
      if (this.router.url !== '/home') {
        this.location.back();
        return;
      }

      const currentTime = new Date().getTime();

      // tekan 2x dalam 2 detik
      if (currentTime - this.lastBack < 2000) {

        App.exitApp();

      } else {

        this.lastBack = currentTime;

        const toast = await this.toastController.create({
          message: 'Tekan sekali lagi untuk keluar',
          duration: 2000,
          position: 'bottom'
        });

        await toast.present();

      }

    });

  }

}