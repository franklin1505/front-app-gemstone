/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { TarificationComponent } from './tarification.component';

describe('TarificationComponent', () => {
  let component: TarificationComponent;
  let fixture: ComponentFixture<TarificationComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TarificationComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TarificationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
