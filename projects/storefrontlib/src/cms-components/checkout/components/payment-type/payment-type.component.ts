import { ChangeDetectionStrategy, Component } from '@angular/core';
import { PaymentType, PaymentTypeService } from '@spartacus/core';
import { Observable } from 'rxjs';
import { distinctUntilChanged, scan, tap } from 'rxjs/operators';
import { CheckoutStepType } from '../../model/checkout-step.model';
import { CheckoutStepService } from '../../services/checkout-step.service';

@Component({
  selector: 'cx-payment-type',
  templateUrl: './payment-type.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PaymentTypeComponent {
  readonly ACCOUNT_PAYMENT = this.paymentTypeService.ACCOUNT_PAYMENT;

  paymentTypes$: Observable<
    PaymentType[]
  > = this.paymentTypeService.getPaymentTypes();

  typeSelected: string;
  typeSelected$: Observable<
    string
  > = this.paymentTypeService.getSelectedPaymentType().pipe(
    distinctUntilChanged(),
    tap((selected) => {
      this.typeSelected = selected;
      this.checkoutStepService.resetSteps();
      this.checkoutStepService.disableEnableStep(
        CheckoutStepType.PAYMENT_DETAILS,
        selected === this.ACCOUNT_PAYMENT
      );
    }),
    scan((previous, current) => {
      if (previous !== undefined) {
        this.checkoutStepService.goToStepWithIndex(0);
      }
      return current;
    }, undefined)
  );

  constructor(
    protected paymentTypeService: PaymentTypeService,
    protected checkoutStepService: CheckoutStepService
  ) {}

  changeType(code: string): void {
    this.paymentTypeService.setPaymentType(code);
    this.typeSelected = code;
  }
}
