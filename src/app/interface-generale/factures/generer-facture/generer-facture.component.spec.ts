/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { GenererFactureComponent } from './generer-facture.component';

describe('GenererFactureComponent', () => {
  let component: GenererFactureComponent;
  let fixture: ComponentFixture<GenererFactureComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ GenererFactureComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GenererFactureComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
