import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { LoginRegisterComponent } from './login-register.component';
import {
  FeaturesConfig,
  FeaturesConfigModule,
  I18nTestingModule,
} from '@spartacus/core';
import { DebugElement, Pipe, PipeTransform } from '@angular/core';
import { By } from '@angular/platform-browser';
import { CheckoutConfigService } from '@spartacus/storefront';
import { ActivatedRoute } from '@angular/router';

describe('LoginRegisterComponent', () => {
  let component: LoginRegisterComponent;
  let fixture: ComponentFixture<LoginRegisterComponent>;

  let checkoutConfigService;

  @Pipe({
    name: 'cxUrl',
  })
  class MockUrlPipe implements PipeTransform {
    transform() {}
  }

  class MockCheckoutConfigService {
    isGuestCheckout() {
      return false;
    }
  }

  class MockActivatedRoute {
    snapshot = {
      queryParams: {
        forced: false,
      },
    };
  }

  const testBedBase = {
    imports: [I18nTestingModule, FeaturesConfigModule],
    declarations: [LoginRegisterComponent, MockUrlPipe],
    providers: [
      { provide: CheckoutConfigService, useClass: MockCheckoutConfigService },
      { provide: ActivatedRoute, useClass: MockActivatedRoute },
      {
        provide: FeaturesConfig,
        useValue: {
          features: { level: '2.1' },
        },
      },
    ],
  };

  beforeEach(async(() => {
    TestBed.configureTestingModule(testBedBase).compileComponents();
  }));

  beforeEach(() => {
    createComponent();
    callNgInit();
  });

  it('should create component', () => {
    expect(component).toBeTruthy();
  });

  describe('Register/Guest checkout', () => {
    it('should show Register button when forced flag is false', () => {
      const registerLinkElement: HTMLElement = fixture.debugElement.query(
        By.css('.btn-register')
      ).nativeElement;
      const guestLink: DebugElement = fixture.debugElement.query(
        By.css('.btn-guest')
      );

      expect(guestLink).toBeFalsy();
      expect(registerLinkElement).toBeTruthy();
    });

    it('should show "Guest checkout" when forced flag is true', () => {
      class MockActivatedRouteGuestCheckout {
        snapshot = {
          queryParams: {
            forced: true,
          },
        };
      }

      TestBed.resetTestingModule();
      TestBed.configureTestingModule(testBedBase);
      TestBed.overrideProvider(ActivatedRoute, {
        useValue: new MockActivatedRouteGuestCheckout(),
      });
      TestBed.compileComponents();

      createComponent();
      checkoutConfigService = TestBed.inject(CheckoutConfigService);

      spyOn(checkoutConfigService, 'isGuestCheckout').and.returnValue(true);

      callNgInit();

      const guestLinkElement: HTMLElement = fixture.debugElement.query(
        By.css('.btn-guest')
      ).nativeElement;
      const registerLink = fixture.debugElement.query(By.css('.btn-register'));

      expect(registerLink).toBeFalsy();
      expect(guestLinkElement).toBeTruthy();
    });
  });

  describe('2.0 Feature level', () => {
    it('Should not render component with feature level 2.0', () => {
      TestBed.resetTestingModule();
      TestBed.configureTestingModule(testBedBase);
      TestBed.overrideProvider(FeaturesConfig, {
        useValue: {
          features: { level: '2.0' },
        },
      });
      TestBed.compileComponents();

      createComponent();
      callNgInit();

      const registerElement = fixture.debugElement.query(By.css('.register'));

      expect(registerElement).toBeFalsy();
    });
  });

  function createComponent() {
    fixture = TestBed.createComponent(LoginRegisterComponent);
    component = fixture.componentInstance;
  }

  function callNgInit() {
    component.ngOnInit();
    fixture.detectChanges();
  }
});
