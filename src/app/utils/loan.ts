export interface LoanInfo {
  loanAmount: number;
  annualInterestRate: number;
  totalYears: number;
}

export interface PaymentInfo {
  monthlyPayment: number;
  yearlyInterest: number;
  yearlyPrincipal: number;
  remainingPrincipal: number;
}

export const calculateEqualPrincipalAndInterest = (data: LoanInfo): PaymentInfo[] => {
  const { loanAmount, annualInterestRate, totalYears } = data;
  const monthlyInterestRate = annualInterestRate / 12 / 100;
  const totalMonths = totalYears * 12;
  const monthlyPayment = loanAmount * monthlyInterestRate * Math.pow(1 + monthlyInterestRate, totalMonths) / (Math.pow(1 + monthlyInterestRate, totalMonths) - 1);
  let remainingLoanAmount = loanAmount;
  const result = [];

  for (let i = 0; i < totalYears; i++) {
    let yearlyInterest = 0;
    let yearlyPrincipal = 0;

    for (let j = 0; j < 12; j++) {
      const monthlyInterest = remainingLoanAmount * monthlyInterestRate;
      const monthlyPrincipal = monthlyPayment - monthlyInterest;
      remainingLoanAmount -= monthlyPrincipal;

      yearlyInterest += monthlyInterest;
      yearlyPrincipal += monthlyPrincipal;
    }

    const remainingPrincipal = remainingLoanAmount;

    result.push({
      monthlyPayment: monthlyPayment,
      yearlyInterest: yearlyInterest,
      yearlyPrincipal: yearlyPrincipal,
      remainingPrincipal: remainingPrincipal,
    });
  }

  return result;
}