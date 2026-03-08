import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BundyClock } from './bundy-clock';

describe('BundyClock', () => {
  let component: BundyClock;
  let fixture: ComponentFixture<BundyClock>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BundyClock],
    }).compileComponents();

    fixture = TestBed.createComponent(BundyClock);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
