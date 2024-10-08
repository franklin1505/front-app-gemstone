/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { GererEntreprisePartenaireComponent } from './gerer-entreprise-partenaire.component';

describe('GererEntreprisePartenaireComponent', () => {
  let component: GererEntreprisePartenaireComponent;
  let fixture: ComponentFixture<GererEntreprisePartenaireComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ GererEntreprisePartenaireComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GererEntreprisePartenaireComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
