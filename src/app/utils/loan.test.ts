import { calculateEqualPrincipalAndInterest, LoanInfo, PaymentInfo } from './loan';
import { describe, it, expect } from 'vitest';

describe('calculateEqualPrincipalAndInterest', () => {
  it('should correctly calculate the loan repayment schedule', () => {
    const loanInfo: LoanInfo = {
      loanAmount: 1600000,
      annualInterestRate: 3.4,
      totalYears: 30
    };

    const result: PaymentInfo[] = calculateEqualPrincipalAndInterest(loanInfo);

    // 这里我们只测试了第一年和最后一年的数据，你可以根据需要添加更多的测试
    expect(result[0].monthlyPayment).toBeCloseTo(7095.69, 0);
    expect(result[0].remainingPrincipal).toBeCloseTo(1568767.88, 0);

    expect(result[0].monthlyPayment).toBeCloseTo(7095.69, 0);
    expect(result[29].remainingPrincipal).toBeCloseTo(0, 2);
  });
});