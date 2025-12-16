import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ArtistBiographyComponent } from './artist-biography.component';

describe('ArtistBiographyComponent', () => {
  let component: ArtistBiographyComponent;
  let fixture: ComponentFixture<ArtistBiographyComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ArtistBiographyComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ArtistBiographyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
