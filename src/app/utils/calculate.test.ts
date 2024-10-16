import { calculateCompoundInterest, CompoundInterestInput, CompoundInterestResult } from './calculate';
import { describe, it, expect } from 'vitest';

describe('calculateCompoundInterest', () => {
  it('should correctly calculate the loan repayment schedule', () => {
    const info: CompoundInterestInput = { principal: 500000, monthlyAddition: 27100 * 0.6, annualAddition: 50000, annualInterestRate: 5, years: 20 };

    const result: CompoundInterestResult[] = calculateCompoundInterest(info);

    expect(result[0].totalAmount / 10000).toBeCloseTo(77.5, 0);
    expect(result[1].totalAmount / 10000).toBeCloseTo(106.3, 0);
    expect(result[2].totalAmount / 10000).toBeCloseTo(136.6, 0);
    expect(result[3].totalAmount / 10000).toBeCloseTo(168.3, 0);

    expect(result[14].totalAmount / 10000).toBeCloseTo(644.4, 0);
  });
});