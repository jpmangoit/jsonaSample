import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ClubNewsComponent } from './club-news.component';

describe('ClubNewsComponent', () => {
  let component: ClubNewsComponent;
  let fixture: ComponentFixture<ClubNewsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ClubNewsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ClubNewsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
