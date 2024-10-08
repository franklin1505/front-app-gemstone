/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { LeMarchéComponent } from './le-marché.component';

describe('LeMarchéComponent', () => {
  let component: LeMarchéComponent;
  let fixture: ComponentFixture<LeMarchéComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ LeMarchéComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LeMarchéComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
