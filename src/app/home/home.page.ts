import { Component, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { IonHeader, IonToolbar, IonTitle, IonContent, IonButton, IonList, IonItem, IonInput, IonLabel, IonButtons } from '@ionic/angular/standalone';
import { CommonModule } from '@angular/common';
import confetti from 'canvas-confetti';

@Component({
  selector: 'app-home',
  standalone: true,
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  imports: [
    IonHeader, IonToolbar, IonTitle, IonContent, IonButton, IonList,
    IonItem, IonInput, IonLabel, IonButtons, FormsModule, CommonModule
  ]
})
export class HomePage implements AfterViewInit {

  @ViewChild('wheelCanvas') canvas!: ElementRef<HTMLCanvasElement>;

  names: string[] = [];
  newName = '';
  selectedName = '';
  history: string[] = [];

  ctx!: CanvasRenderingContext2D;
  angle = 0;
  showSidebar = false;
  lastTickIndex = -1;
  pointerShake = 0;
  pointerMove = 0;

  version: string = '1.0.0';

  constructor() {}

  ngAfterViewInit() {
    this.setupCanvas();
    this.loadData();
    this.checkSystemTheme(); // Dark mode otomatis
    this.drawWheel();
  }

  // ========== DARK MODE OTOMATIS ==========
  checkSystemTheme() {
    const darkModeMediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    const applyTheme = (isDark: boolean) => {
      if (isDark) {
        document.body.classList.add('dark-theme');
      } else {
        document.body.classList.remove('dark-theme');
      }
    };
    
    applyTheme(darkModeMediaQuery.matches);
    
    // Listen untuk perubahan tema sistem
    darkModeMediaQuery.addEventListener('change', (e) => {
      applyTheme(e.matches);
    });
  }

  // ========== LOCALSTORAGE ==========
  saveData() {
    localStorage.setItem('spingo_items', JSON.stringify(this.names));
    localStorage.setItem('spingo_history', JSON.stringify(this.history));
  }

  loadData() {
    const savedItems = localStorage.getItem('spingo_items');
    const savedHistory = localStorage.getItem('spingo_history');
    
    if (savedItems) {
      this.names = JSON.parse(savedItems);
    } else {
      this.names = ['test', 'ssbd', 'dbdn', '1 unit', 'hem 2', 'fer'];
    }
    
    if (savedHistory) {
      this.history = JSON.parse(savedHistory);
    } else {
      this.history = [];
    }
  }

  toggleSidebar() { this.showSidebar = !this.showSidebar; }

  setupCanvas() {
    const canvas = this.canvas.nativeElement;
    canvas.width = 300;
    canvas.height = 300;
    this.ctx = canvas.getContext('2d')!;
  }

  playTick() {
    const sound = new Audio('assets/sounds/tick.mp3');
    sound.volume = 1;
    sound.play().then(() => setTimeout(() => { sound.pause(); sound.currentTime = 0; }, 100)).catch(() => {});
  }

  playWin() {
    const sound = new Audio('assets/sounds/win.mp3');
    sound.volume = 1;
    sound.play().catch(() => {});
  }

  addName() {
    if (this.newName.trim()) {
      this.names.push(this.newName.trim());
      this.newName = '';
      this.drawWheel();
      this.saveData();
    }
  }

  // ========== KONFIRMASI HAPUS ITEM ==========
  confirmRemoveName(index: number) {
    const confirmed = window.confirm(
      `⚠️ HAPUS ITEM ⚠️\n\n` +
      `Yakin ingin menghapus "${this.names[index]}"?\n\n` +
      `Item akan dihapus secara permanen.`
    );
    if (confirmed) {
      const deletedItem = this.names[index];
      this.names.splice(index, 1);
      if (this.names.indexOf(this.selectedName) === -1) this.selectedName = '';
      this.drawWheel();
      this.saveData();
      window.alert(`✅ "${deletedItem}" berhasil dihapus!`);
    }
  }

  // ========== KONFIRMASI HAPUS SEMUA ITEM ==========
  confirmResetAll() {
    const confirmed = window.confirm(
      '⚠️ RESET SEMUA ITEM ⚠️\n\n' +
      'Yakin ingin menghapus SEMUA item?\n\n' +
      '⚠️ TINDAKAN INI TIDAK DAPAT DIBATALKAN!'
    );
    if (confirmed) {
      this.names = [];
      this.selectedName = '';
      this.history = [];
      this.drawWheel();
      this.saveData();
      window.alert('✅ Semua item berhasil dihapus!');
    }
  }

  // ========== KONFIRMASI HAPUS HASIL SPIN ==========
  confirmRemoveSelected() {
    if (!this.selectedName) return;
    const confirmed = window.confirm(
      `⚠️ HAPUS PEMENANG ⚠️\n\n` +
      `Yakin ingin menghapus "${this.selectedName}" dari daftar?\n\n` +
      `Item akan dihapus secara permanen.`
    );
    if (confirmed) {
      const deletedItem = this.selectedName;
      const index = this.names.indexOf(this.selectedName);
      if (index > -1) {
        this.names.splice(index, 1);
        this.selectedName = '';
        this.drawWheel();
        this.saveData();
        window.alert(`✅ "${deletedItem}" berhasil dihapus!`);
      }
    }
  }

  // ========== KONFIRMASI HAPUS RIWAYAT ==========
  confirmClearHistory() {
    const confirmed = window.confirm(
      '⚠️ HAPUS RIWAYAT ⚠️\n\n' +
      'Yakin ingin menghapus semua riwayat spin?\n\n' +
      'Riwayat akan dihapus secara permanen.'
    );
    if (confirmed) {
      this.history = [];
      this.saveData();
      window.alert('✅ Riwayat spin berhasil dihapus!');
    }
  }

  // ========== RATING PLAY STORE ==========
  rateApp() {
    const confirmed = window.confirm(
      '⭐ BANTU KAMI ⭐\n\n' +
      'Apakah Anda menyukai aplikasi SpinGo?\n\n' +
      'Berikan rating 5 bintang di Play Store!'
    );
    if (confirmed) {
      // Ganti dengan URL aplikasi kamu setelah rilis
      window.open('https://play.google.com/store/apps/details?id=com.spingo.app', '_blank');
    }
  }

  // ========== ABOUT ==========
  showAbout() {
    window.alert(
      '🎡 SPINGO - Netral, Cepat, dan Tepat. 🎡\n\n' +
      'SPINGO Adalah Spin Selector untuk memilih item secara acak.\n\n' +
      `📌 Versi ${this.version}\n\n` +
      '✨ FITUR:\n' +
      '• Tambah & hapus item\n' +
      '• Riwayat spin\n' +
      '• Reset semua item\n' +
      '• Data tersimpan otomatis\n' +
      '• Dark mode otomatis\n' +
      '• Konfirmasi sebelum hapus\n\n' +
      '🎯 CARA PAKAI:\n' +
      '1. Tambah item ke daftar\n' +
      '2. Tekan tombol SPIN\n' +
      '3. Lihat hasilnya!\n\n' +
      '━━━━━━━━━━━━━━━━━━━━━\n' +
      'Terima kasih telah menggunakan SpinGo!\n' +
      'Semoga beruntung selalu 🍀'
    );
  }

  getColor(i: number) {
    const hue = (i * 137.508) % 360;
    return `hsl(${hue}, 70%, 60%)`;
  }

  drawWheel() {
    const ctx = this.ctx;
    const size = 300;
    const radius = size / 2;

    if (this.names.length === 0) {
      ctx.clearRect(0, 0, size, size);
      ctx.font = 'bold 14px Arial';
      ctx.fillStyle = '#999';
      ctx.textAlign = 'center';
      ctx.fillText('✨ Tambah item dulu ✨', radius, radius);
      return;
    }

    ctx.clearRect(0, 0, size, size);
    const arc = (2 * Math.PI) / this.names.length;

    for (let i = 0; i < this.names.length; i++) {
      const angle = i * arc;
      ctx.beginPath();
      ctx.moveTo(radius, radius);
      ctx.arc(radius, radius, radius, angle, angle + arc);
      ctx.fillStyle = this.getColor(i);
      ctx.fill();
      ctx.closePath();

      ctx.save();
      ctx.translate(radius, radius);
      ctx.rotate(angle + arc / 2);
      ctx.font = `bold ${this.names.length > 10 ? 10 : 14}px Arial`;
      ctx.fillStyle = "#fff";
      ctx.textAlign = "center";
      ctx.fillText(this.names[i], radius * 0.65, 5);
      ctx.restore();
    }
  }

  spin() {
    if (this.names.length === 0) return;

    this.showSidebar = false;
    this.lastTickIndex = -1;

    let speed = Math.random() * 0.2 + 0.25;
    const spinInterval = setInterval(() => {
      this.angle += speed;
      speed *= 0.985;

      const slice = (2 * Math.PI) / this.names.length;
      const pointerAngle = (3 * Math.PI) / 2;
      const adjusted = (pointerAngle - this.angle % (2 * Math.PI) + 2 * Math.PI) % (2 * Math.PI);
      const currentIndex = Math.floor(adjusted / slice);

      if (currentIndex !== this.lastTickIndex) {
        this.lastTickIndex = currentIndex;
        this.playTick();
        const shakePower = Math.min(speed * 30, 10);
        this.pointerShake = (Math.random() * shakePower) - (shakePower / 2);
        this.pointerMove = (Math.random() * shakePower) - (shakePower / 2);
      }

      const canvas = this.canvas.nativeElement;
      this.ctx.save();
      this.ctx.clearRect(0, 0, canvas.width, canvas.height);
      this.ctx.translate(150, 150);
      this.ctx.rotate(this.angle);
      this.ctx.translate(-150, -150);
      this.drawWheel();
      this.ctx.restore();

      if (speed < 0.002) {
        clearInterval(spinInterval);
        const index = Math.floor(adjusted / slice);
        this.selectedName = this.names[index];
        this.history.unshift(this.selectedName);
        confetti({ particleCount: 150, spread: 80, origin: { y: 0.6 } });
        this.playWin();
        this.pointerShake = 0;
        this.pointerMove = 0;
        this.saveData();
      }
    }, 20);
  }
}