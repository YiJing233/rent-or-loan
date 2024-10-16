'use client'

import { Button, Form } from '@douyinfe/semi-ui';
import { FormApi } from '@douyinfe/semi-ui/lib/es/form';
import React from 'react';
import { VChart } from '@visactor/react-vchart';
import { IAreaChartSpec } from '@visactor/vchart';
import { calculateCompoundInterest } from '@/app/utils/calculate';
import { calculateEqualPrincipalAndInterest } from '@/app/utils/loan';

const defaultValue: IncomeExpenseFormValues = {
  currentYear: 2024,

  currentMount: 500000,
  monthlySalary: 20000,
  yearEndBonus: 50000,
  annualInterestRate: 5,

  fundCurrentMount: 100000,
  monthlyFund: 7500,
  fundRate: 1.5,
  defaultFundWithdrawal: 2000,
  fullWithdrawal: true,

  propertyMount: 2000000,
  propertyRate: 0.1,
  propertyAddonExpense: 1500,
  loanRate: 3.4,
  downPaymentRate: 15,
  loanYears: 30,

  monthlyRent: 5000,
  monthlyLivingExpense: 8000,
};

interface IncomeExpenseFormValues {
  currentYear: number;

  currentMount?: number;
  monthlySalary?: number;
  yearEndBonus?: number;
  annualInterestRate?: number;

  fundCurrentMount?: number;
  monthlyFund?: number;
  fundRate?: number;
  defaultFundWithdrawal?: number;
  fullWithdrawal?: boolean;

  propertyMount?: number;
  propertyRate?: number;
  propertyAddonExpense?: number;
  loanRate?: number;
  downPaymentRate?: number;
  loanYears?: number;

  monthlyRent?: number;
  monthlyLivingExpense?: number;
}

enum ChartDataType {
  NetAssetsInRentWithFullFund,
  NetAssetsInRent,
  NetAssetsInLoan,

  Property,
  Fund,
  FlowAccount,
}

const ChartDataTypeNameMap = {
  [ChartDataType.NetAssetsInRentWithFullFund]: '租房且公积金全提',
  [ChartDataType.NetAssetsInRent]: '一直租房且公积金提不全',
  [ChartDataType.NetAssetsInLoan]: '买房情况总资产',

  [ChartDataType.Fund]: '公积金',
  [ChartDataType.Property]: '房产',
}

interface ChartData {
  type: string,
  year: number;
  value: number;
}

const genRentData = (data: IncomeExpenseFormValues): Record<ChartDataType, ChartData[]> => {
  const fullFlowAccountResult = calculateCompoundInterest({
    principal: data.currentMount || 0,
    monthlyAddition: (data.monthlySalary || 0) + (data.monthlyFund || 0) - (data.monthlyLivingExpense || 0) - (data.monthlyRent || 0),
    annualAddition: data.yearEndBonus || 0,
    annualInterestRate: data.annualInterestRate || 0,
    years: 15
  });

  const flowAccountWithLimitedFundResult = calculateCompoundInterest({
    principal: data.currentMount || 0,
    monthlyAddition: (data.monthlySalary || 0) + (data.defaultFundWithdrawal || 0) - (data.monthlyLivingExpense || 0) - (data.monthlyRent || 0),
    annualAddition: data.yearEndBonus || 0,
    annualInterestRate: data.annualInterestRate || 0,
    years: 15
  });

  const fundAccountResult = calculateCompoundInterest({
    principal: data.fundCurrentMount || 0,
    monthlyAddition: data.fullWithdrawal ? 0 : (data.monthlyFund || 0) - (data.defaultFundWithdrawal || 0),
    annualAddition: 0,
    annualInterestRate: data.fundRate || 0,
    years: 15
  });

  const propertyResult = calculateCompoundInterest({
    principal: data.propertyMount || 0,
    monthlyAddition: 0,
    annualAddition: 0,
    annualInterestRate: data.propertyRate || 0,
    years: 15
  });

  const loanResult = calculateEqualPrincipalAndInterest({
    loanAmount: ((data.propertyMount || 0) * (1 - (data.downPaymentRate || 0) / 100)),
    annualInterestRate: data.loanRate || 0,
    totalYears: data.loanYears || 0,
  });

  // console.log('loanResult', loanResult);

  const loanFlowAccountResult = calculateCompoundInterest({
    principal: (data.currentMount || 0) - ((data.propertyMount || 0) * (data.downPaymentRate || 0) / 100) || 0,
    monthlyAddition: (data.monthlySalary || 0) - (data.propertyAddonExpense || 0) - (data.monthlyLivingExpense || 0),
    annualAddition: data.yearEndBonus || 0,
    annualInterestRate: data.annualInterestRate || 0,
    years: 15
  });

  return {
    [ChartDataType.FlowAccount]: [],
    [ChartDataType.NetAssetsInLoan]: loanFlowAccountResult.map((item, index) => ({
      type: ChartDataTypeNameMap[ChartDataType.NetAssetsInLoan],
      year: data.currentYear + index + 1,
      value: Number(item.totalAmount.toFixed()) + propertyResult[index].totalAmount - (loanResult?.[index]?.remainingPrincipal || 0),
    })),

    [ChartDataType.NetAssetsInRentWithFullFund]: fullFlowAccountResult.map((item, index) => ({
      type: ChartDataTypeNameMap[ChartDataType.NetAssetsInRentWithFullFund],
      year: data.currentYear + index + 1,
      value: Number(item.totalAmount.toFixed()),
    })),

    [ChartDataType.NetAssetsInRent]: data.fullWithdrawal ? [] : flowAccountWithLimitedFundResult.map((item, index) => ({
      type: ChartDataTypeNameMap[ChartDataType.NetAssetsInRent],
      year: data.currentYear + index + 1,
      value: Number(item.totalAmount.toFixed()) + fundAccountResult[index].totalAmount,
    })),

    [ChartDataType.Fund]: fundAccountResult.map((item, index) => ({
      type: ChartDataTypeNameMap[ChartDataType.Fund],
      year: data.currentYear + index + 1,
      value: Number(item.totalAmount.toFixed()),
    })),

    [ChartDataType.Property]: propertyResult.map((item, index) => ({
      type: ChartDataTypeNameMap[ChartDataType.Property],
      year: data.currentYear + index + 1,
      value: Number(item.totalAmount.toFixed()),
    })),
  }
};

export const ConfigForm: React.FC = () => {
  const [initValue, setInitValue] = React.useState(defaultValue);

  const [formApi, setFormApi] = React.useState<FormApi>();
  const chartRef = React.useRef(null);

  React.useEffect(() => {
    window["vchart"] = chartRef;
  }, []);

  const spec: IAreaChartSpec = React.useMemo(() => {
    const rentData = genRentData(initValue);

    const res: ChartData[] = [];

    Object.values(rentData)?.map(data => {
      res.push(...data)
    })

    return {
      type: 'area',
      data: {
        values: res,
      },
      stack: false,
      title: {
        visible: true,
        text: 'Rent or Loan'
      },
      xField: 'year',
      yField: 'value',
      seriesField: 'type',
      style: {
        curveType: 'monotone'
      },
      legends: [{ visible: true, position: 'middle', orient: 'bottom', padding: { top: 30 } }]
    }
  }, [initValue]);

  return (
    <>
      <Form layout="horizontal" getFormApi={(v) => setFormApi(v)} initValues={initValue}>
        <div style={{ display: 'flex' }}>

          <Form.Section text="通用配置部分">
            <Form.InputNumber
              label="当前年份"
              field="currentYear"
              style={{ marginBottom: '16px' }}
            />
          </Form.Section>

          <Form.Section text="银行卡账户收入部分">
            <Form.InputNumber
              label="现有余额"
              field="currentMount"
              style={{ marginBottom: '16px' }}
            />
            <Form.InputNumber
              label="到手月工资"
              field="monthlySalary"
              style={{ marginBottom: '16px' }}
            />
            <Form.InputNumber
              label="年终奖到手部分"
              field="yearEndBonus"
              style={{ marginBottom: '16px' }}
            />
            <Form.InputNumber
              label="年投资增长率"
              field="annualInterestRate"
              style={{ marginBottom: '16px' }}
            />
          </Form.Section>

          <Form.Section text="公积金账户收入部分">
            <Form.InputNumber
              label="现有余额"
              field="fundCurrentMount"
              style={{ marginBottom: '16px' }}
            />
            <Form.InputNumber
              label="每月缴纳公积金金额"
              field="monthlyFund"
              style={{ marginBottom: '16px' }}
            />
            <Form.InputNumber
              label="公积金利率"
              field="fundRate"
              formatter={value => `${value}%`}
              parser={value => value.replace('%', '')}
              style={{ marginBottom: '16px' }}
            />
            <Form.InputNumber
              label="默认每个月公积金提取金额"
              field="defaultFundWithdrawal"
              disabled
              style={{ marginBottom: '16px' }}
            />
            <Form.Checkbox
              field="fullWithdrawal"
              style={{ marginBottom: '16px' }}
              noLabel
            >
              公积金是否能全额提取
            </Form.Checkbox>
          </Form.Section>

          <Form.Section text="房产部分">
            <Form.InputNumber
              label="房产价格"
              field="propertyMount"
              style={{ marginBottom: '16px' }}
            />
            <Form.InputNumber
              label="房产增值速率"
              field="propertyRate"
              formatter={value => `${value}%`}
              parser={value => value.replace('%', '')}
              style={{ marginBottom: '16px' }}
            />
            <Form.InputNumber
              label="房产月度额外支出"
              field="propertyAddonExpense"
              style={{ marginBottom: '16px' }}
            />
            <Form.InputNumber
              label="贷款利率"
              field="loanRate"
              style={{ marginBottom: '16px' }}
            />
            <Form.InputNumber
              label="首付比例"
              field="downPaymentRate"
              style={{ marginBottom: '16px' }}
            />
            <Form.InputNumber
              label="贷款年限"
              field="loanYears"
              style={{ marginBottom: '16px' }}
            />
          </Form.Section>

          <Form.Section text="支出部分">
            <Form.InputNumber
              label="月租房支出"
              field="monthlyRent"
              style={{ marginBottom: '16px' }}
            />
            <Form.InputNumber
              label="月生活支出"
              field="monthlyLivingExpense"
              style={{ marginBottom: '16px' }}
            />
          </Form.Section>
          <Button onClick={() => {
            if (formApi) {
              const values = formApi?.getValues();
              setInitValue(values);
            }
          }}>
            Calculate
          </Button>
        </div>
      </Form >
      <VChart ref={chartRef} spec={spec} />
    </>
  )
};