import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ClubDatesComponent } from './club-dates.component';

describe('ClubDatesComponent', () => {
  let component: ClubDatesComponent;
  let fixture: ComponentFixture<ClubDatesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ClubDatesComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ClubDatesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
