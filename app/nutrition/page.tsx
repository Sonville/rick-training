import type { Metadata } from 'next';
import NutritionCalculator from './nutrition-calculator';

export const metadata:Metadata={title:'營養計算｜Rick 的四日訓練地圖',description:'估算每日維持熱量、目標熱量與蛋白質、脂肪、碳水。'};
export default function NutritionPage(){return <NutritionCalculator/>}
