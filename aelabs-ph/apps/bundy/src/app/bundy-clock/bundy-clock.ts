import { Component, OnInit, OnDestroy, ElementRef, ViewChild, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BehaviorSubject, interval, Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-bundy-clock',
  imports: [CommonModule],
  templateUrl: './bundy-clock.html',
  styleUrl: './bundy-clock.scss',
})
export class BundyClockComponent implements OnInit, OnDestroy, AfterViewInit {

 
  @ViewChild('videoElement') videoElement!: ElementRef<HTMLVideoElement>;
  @ViewChild('canvasElement') canvasElement!: ElementRef<HTMLCanvasElement>;
  @ViewChild('employeeInput') employeeInput!: ElementRef<HTMLInputElement>;

  formattedTime$ = new BehaviorSubject<string>('');
  formattedDate$ = new BehaviorSubject<string>('');
  period$ = new BehaviorSubject<string>('');
  location$ = new BehaviorSubject<string>('Getting location...');
  cameraActive$ = new BehaviorSubject<boolean>(false);
  capturedImage$ = new BehaviorSubject<string | null>(null);
  
  private destroy$ = new Subject<void>();
  private mediaStream: MediaStream | null = null;

  public isKioskMode = true;
  isTimeIn = false;

  ngOnInit(): void {
    this.updateTime();
    interval(1000)
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => this.updateTime());

    this.getLocation();
    this.startCamera();
  }

   ngAfterViewInit(): void {
    debugger
    if (this.employeeInput && this.employeeInput.nativeElement) {
      this.employeeInput.nativeElement.focus();
      this.employeeInput.nativeElement.select();
    }
  }

  updateTime(): void {
    const now = new Date();
    this.formattedTime$.next(this.formatTime(now));
    this.formattedDate$.next(this.formatDate(now));
    this.period$.next(now.getHours() >= 12 ? 'PM' : 'AM');
  }

  formatTime(date: Date): string {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  }

  formatDate(date: Date): string {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  getLocation(): void {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          this.reverseGeocode(latitude, longitude);
        },
        (error) => {
          this.location$.next('Location access denied');
        }
      );
    } else {
      this.location$.next('Geolocation not supported');
    }
  }

  reverseGeocode(lat: number, lon: number): void {
    const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`;
    
    fetch(url)
      .then(response => response.json())
      .then(data => {
        if (data) {
          let address = data.address?.road || data.address?.city || 'Unknown location';
          if(address !== 'Unknown location') {
            address = `${data.address?.road}, 
              ${data.address?.quarter}, 
              ${data.address?.city_district}, 
              ${data.address?.city}, 
              ${data.address?.state_district}, 
              ${data.address?.region}, 
              ${data.address?.postcode}, 
              ${data.address?.country}`;
          }
          this.location$.next(address);
        } else {
          this.location$.next('Could not fetch address');
        }
      })
      .catch(() => {
        this.location$.next('Could not fetch address');
      });
  }

  startCamera(): void {
    navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } })
      .then((stream) => {
        this.mediaStream = stream;
        if (this.videoElement) {
          this.videoElement.nativeElement.srcObject = stream;
          this.cameraActive$.next(true);
        }
      })
      .catch((error) => {
        console.error('Camera access denied:', error);
        this.cameraActive$.next(false);
      });
  }

  captureImage(): void {
    if (!this.videoElement || !this.canvasElement) return;

    const video = this.videoElement.nativeElement;
    const canvas = this.canvasElement.nativeElement;
    const context = canvas.getContext('2d');

    if (context) {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      context.drawImage(video, 0, 0, canvas.width, canvas.height);
      
      const imageData = canvas.toDataURL('image/jpeg');
      this.capturedImage$.next(imageData);
      console.log('Image captured:', imageData);
    }
  }

  downloadImage(): void {
    const imageData = this.capturedImage$.value;
    if (!imageData) return;

    const link = document.createElement('a');
    link.href = imageData;
    link.download = `capture-${new Date().getTime()}.jpg`;
    link.click();
  }

  stopCamera(): void {
    if (this.mediaStream) {
      this.mediaStream.getTracks().forEach(track => track.stop());
      this.cameraActive$.next(false);
    }
  }

  ngOnDestroy(): void {
    this.stopCamera();
    this.destroy$.next();
    this.destroy$.complete();
  }

  timeIn(): void {
    console.log('Time In:', new Date());
    alert('Time In recorded at ' + new Date().toLocaleTimeString());
  }

  timeOut(): void {
    console.log('Time Out:', new Date());
    alert('Time Out recorded at ' + new Date().toLocaleTimeString());
  }

  punch(isTimeIn: boolean): void {
    console.log(`Punch ${isTimeIn ? 'Time In' : 'Time Out'} :`, new Date());
    alert('Punch recorded at ' + new Date().toLocaleTimeString());
  }

  onInputKeydown(event: KeyboardEvent): void {
    if (event.keyCode === 109)
    {
      this.isTimeIn = !this.isTimeIn;
      event.preventDefault();
    }
  }
}
