import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ClubWallComponent } from './club-wall.component';

describe('ClubWallComponent', () => {
  let component: ClubWallComponent;
  let fixture: ComponentFixture<ClubWallComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ClubWallComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ClubWallComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
