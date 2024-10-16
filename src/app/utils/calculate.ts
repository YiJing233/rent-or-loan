export interface FinancialStatus {
  liquidAssets: number; // 流动资金
  providentFund: number; // 公积金
  propertyValue: number; // 房产价值
  remainingPrincipal: number; // 剩余未偿还本金
  }
  
  // 计算当年资产
  export const calculateAssets = (status: FinancialStatus): number => {
  return status.liquidAssets + status.providentFund + status.propertyValue;
  };
  
  // 计算当年负债
  export const calculateLiabilities = (status: FinancialStatus): number => {
  return status.remainingPrincipal;
  };
  
  // 计算年净资产
  export const calculateNetAssets = (status: FinancialStatus): number => {
  return calculateAssets(status) - calculateLiabilities(status);
  };
  
  export interface CompoundInterestInput {
  principal: number;
  monthlyAddition: number;
  annualAddition: number;
  annualInterestRate: number; // x%, not 0.x
  years: number;
  }
  
  export interface CompoundInterestResult {
  totalAmount: number;
  increasedAmount: number;
  increasedTotalPrincipal: number;
  totalAdditionalInvestment: number;
  }
  
  export function calculateCompoundInterest({
  principal,
  monthlyAddition,
  annualAddition,
  annualInterestRate,
  years
  }: CompoundInterestInput): CompoundInterestResult[] {
  console.log('calculateCompoundInterest props', {
  principal,
  monthlyAddition,
  annualAddition,
  annualInterestRate,
  years
  });
  const totalAmountArray: CompoundInterestResult[] = [];
  
  let totalFromLastYear = principal;
  let totalInterestFromLastYear = 0;
  const monthlyInterestRate = annualInterestRate / 12 / 100;
  
  for (let year = 0; year < years; year++) {
  const increasedTotalPrincipal = totalFromLastYear * (1 + annualInterestRate / 100);
  const principalInterestOfTheYear = increasedTotalPrincipal - totalFromLastYear;
  
    let monthlyInvestmentForYear = 0;
    for (let month = 0; month < 12; month++) {
        monthlyInvestmentForYear += monthlyAddition;
        monthlyInvestmentForYear *= (1 + monthlyInterestRate);
    }
    const monthlyInvestmentInterestForYear = monthlyInvestmentForYear - (monthlyAddition * 12);
    const totalInterestOfTheYear = monthlyInvestmentInterestForYear + principalInterestOfTheYear;
  
    totalInterestFromLastYear += totalInterestOfTheYear;
    totalFromLastYear = increasedTotalPrincipal + annualAddition + monthlyInvestmentForYear;
  
    totalAmountArray.push({
        'totalAmount': totalFromLastYear,
        'increasedAmount': totalInterestFromLastYear,
        'increasedTotalPrincipal': increasedTotalPrincipal,
        'totalAdditionalInvestment': (annualAddition + monthlyAddition * 12) * (year + 1)
    });
  }
  
  return totalAmountArray;
  }
  
  