'use client';

import { FormEvent, useEffect, useState } from 'react';
import SiteNav from '../site-nav';

type Sex='male'|'female';
type Activity='sedentary'|'light'|'moderate'|'high';
type Goal='cut'|'maintain'|'gain';
type FormState={height:string;weight:string;age:string;sex:Sex;activity:Activity;goal:Goal};
type Result={bmr:number;maintenance:number;low:number;high:number;target:number;protein:number;fat:number;carbs:number;macroCalories:number};
type FoodId='rice'|'noodles'|'egg'|'soy'|'fish'|'meat';
type FoodGroup='carb'|'protein';
type FoodItem={id:FoodId;label:string;short:string;group:FoodGroup;unit:'碗'|'顆'|'g';servingSize:number;kcal:number;protein:number;fat:number;carbs:number;step:number;chartStep:number;color:string;image?:string};
type FoodAmounts=Record<FoodId,number>;
type FoodEnabled=Record<FoodId,boolean>;

const STORAGE_KEY='rick-nutrition-profile';
const FOOD_STORAGE_KEY='rick-nutrition-food-plan';
const initial:FormState={height:'',weight:'',age:'',sex:'male',activity:'moderate',goal:'gain'};
const activities:Record<Activity,{label:string;detail:string;factor:number}>={
  sedentary:{label:'久坐',detail:'主要坐著，幾乎沒有規律運動',factor:1.2},
  light:{label:'輕度',detail:'每週運動 1–3 天，日常走動不多',factor:1.375},
  moderate:{label:'中度',detail:'每週運動 3–5 天，包含規律重訓',factor:1.55},
  high:{label:'高度',detail:'每週高強度運動 6–7 天或勞力工作',factor:1.725},
};
const goals:Record<Goal,{label:string;detail:string;factor:number;protein:number}>={
  cut:{label:'減脂',detail:'維持熱量 −15%',factor:.85,protein:2},
  maintain:{label:'維持',detail:'維持目前體重',factor:1,protein:1.8},
  gain:{label:'精實增肌',detail:'維持熱量 ＋7.5%',factor:1.075,protein:1.8},
};
const foods:FoodItem[]=[
  {id:'rice',label:'白飯',short:'飯',group:'carb',unit:'碗',servingSize:1,kcal:195,protein:4,fat:.5,carbs:42,step:.5,chartStep:.5,color:'lime'},
  {id:'noodles',label:'麵',short:'麵',group:'carb',unit:'碗',servingSize:1,kcal:220,protein:8,fat:1.5,carbs:42,step:.5,chartStep:.5,color:'orange'},
  {id:'egg',label:'蛋',short:'蛋',group:'protein',unit:'顆',servingSize:1,kcal:72,protein:6.3,fat:4.8,carbs:.4,step:1,chartStep:1,color:'yellow'},
  {id:'soy',label:'豆／豆腐',short:'豆',group:'protein',unit:'g',servingSize:100,kcal:85,protein:9,fat:5,carbs:2,step:10,chartStep:50,color:'green'},
  {id:'fish',label:'魚',short:'魚',group:'protein',unit:'g',servingSize:100,kcal:130,protein:26,fat:3,carbs:0,step:10,chartStep:50,color:'blue'},
  {id:'meat',label:'瘦肉',short:'肉',group:'protein',unit:'g',servingSize:100,kcal:190,protein:26,fat:9,carbs:0,step:10,chartStep:50,color:'violet'},
];
const foodById=foods.reduce((map,item)=>{map[item.id]=item;return map},{} as Record<FoodId,FoodItem>);
const defaultFoodEnabled:FoodEnabled={rice:true,noodles:true,egg:true,soy:true,fish:true,meat:true};
const emptyFoodAmounts:FoodAmounts={rice:0,noodles:0,egg:0,soy:0,fish:0,meat:0};
const round10=(n:number)=>Math.round(n/10)*10;
const round5=(n:number)=>Math.round(n/5)*5;
const roundToStep=(n:number,step:number)=>Math.max(0,Math.round(n/step)*step);

function calculate(form:FormState):Result{
  const height=Number(form.height),weight=Number(form.weight),age=Number(form.age);
  const bmr=10*weight+6.25*height-5*age+(form.sex==='male'?5:-161);
  const maintenance=bmr*activities[form.activity].factor;
  const target=round10(maintenance*goals[form.goal].factor);
  const protein=round5(weight*goals[form.goal].protein);
  const fat=round5(Math.min(target*.35/9,Math.max(target*.2/9,weight*.8)));
  const carbs=round5(Math.max(0,(target-protein*4-fat*9)/4));
  return {bmr:round10(bmr),maintenance:round10(maintenance),low:round10(maintenance*.9),high:round10(maintenance*1.1),target,protein,fat,carbs,macroCalories:protein*4+fat*9+carbs*4};
}

function foodSignature(form:FormState){return [form.height,form.weight,form.age,form.sex,form.activity,form.goal].join('|');}
function suggestedFoodAmounts(result:Result,enabled:FoodEnabled=defaultFoodEnabled):FoodAmounts{
  const amounts={...emptyFoodAmounts};
  const carbWeights:Record<FoodId,number>={rice:.7,noodles:.3,egg:0,soy:0,fish:0,meat:0};
  const carbItems=foods.filter(item=>item.group==='carb'&&enabled[item.id]);
  const carbWeightTotal=carbItems.reduce((sum,item)=>sum+carbWeights[item.id],0);
  carbItems.forEach(item=>{
    const share=carbWeightTotal?carbWeights[item.id]/carbWeightTotal:0;
    amounts[item.id]=roundToStep(result.carbs*share/item.carbs*item.servingSize,item.step);
  });
  const proteinItems=foods.filter(item=>item.group==='protein'&&enabled[item.id]);
  const proteinShare=proteinItems.length?result.protein/proteinItems.length:0;
  proteinItems.forEach(item=>{amounts[item.id]=roundToStep(proteinShare/item.protein*item.servingSize,item.step)});
  return amounts;
}
function foodNutrition(item:FoodItem,amount:number){const factor=amount/item.servingSize;return {kcal:item.kcal*factor,protein:item.protein*factor,fat:item.fat*factor,carbs:item.carbs*factor};}
function foodTotals(amounts:FoodAmounts,enabled:FoodEnabled){
  const total=foods.reduce((sum,item)=>{if(!enabled[item.id])return sum;const value=foodNutrition(item,amounts[item.id]);return {kcal:sum.kcal+value.kcal,protein:sum.protein+value.protein,fat:sum.fat+value.fat,carbs:sum.carbs+value.carbs}},{kcal:0,protein:0,fat:0,carbs:0});
  return {kcal:Math.round(total.kcal),protein:Math.round(total.protein),fat:Math.round(total.fat),carbs:Math.round(total.carbs)};
}
function foodAmountLabel(item:FoodItem,amount:number){const value=Number.isInteger(amount)?String(amount):amount.toFixed(1).replace(/\.0$/,'');return `${value} ${item.unit}`;}
function foodDelta(value:number,target:number){const delta=value-target;return `${delta>0?'+':''}${delta} g`;}
function foodDeltaClass(value:number,target:number){const delta=value-target;return Math.abs(delta)<=Math.max(5,target*.05)?'near':delta>0?'over':'under';}
function foodStackSegments(item:FoodItem,amount:number){
  const whole=Math.floor((amount+0.0001)/item.chartStep);
  const remainder=amount-whole*item.chartStep;
  const segments=Array.from({length:whole},(_,index)=>({key:`${item.id}-${index}`,ratio:1}));
  if(remainder>.01)segments.push({key:`${item.id}-partial`,ratio:remainder/item.chartStep});
  return segments;
}
function readSavedFoodPlan(form:FormState){
  try{
    const raw=localStorage.getItem(FOOD_STORAGE_KEY);if(!raw)return null;
    const saved=JSON.parse(raw) as {signature?:string;amounts?:Partial<FoodAmounts>;enabled?:Partial<FoodEnabled>};
    if(saved.signature!==foodSignature(form))return null;
    const amounts={...emptyFoodAmounts};const enabled={...defaultFoodEnabled};
    foods.forEach(item=>{
      const amount=saved.amounts?.[item.id];if(typeof amount==='number'&&Number.isFinite(amount)&&amount>=0)amounts[item.id]=roundToStep(amount,item.step);
      const isEnabled=saved.enabled?.[item.id];if(typeof isEnabled==='boolean')enabled[item.id]=isEnabled;
    });
    return {amounts,enabled};
  }catch{return null}
}

function FoodPlan({result,form,amounts,enabled,onChange,onToggle,onRedistribute,onReset}:{result:Result;form:FormState;amounts:FoodAmounts;enabled:FoodEnabled;onChange:(id:FoodId,delta:number)=>void;onToggle:(id:FoodId,next:boolean)=>void;onRedistribute:()=>void;onReset:()=>void}){
  const totals=foodTotals(amounts,enabled);
  const metrics=[['熱量',totals.kcal,result.target,'kcal'],['蛋白質',totals.protein,result.protein,'g'],['脂肪',totals.fat,result.fat,'g'],['碳水',totals.carbs,result.carbs,'g']] as const;
  return <section className="food-plan" aria-live="polite">
    <div className="food-plan-heading"><div><span>03</span><h2>每日食物份量</h2><p>以熟重估算；直接調整每一項，查看今天的食物總量。</p></div><div className="food-plan-actions"><button type="button" onClick={onRedistribute}>重新分配</button><button type="button" onClick={onReset}>恢復建議</button></div></div>
    <div className="food-total-grid">{metrics.map(([label,value,target,unit])=><div key={label}><span>{label}</span><strong>{value.toLocaleString()} <i>{unit}</i></strong><small className={foodDeltaClass(value,target)}>{label==='熱量'?`${value-target>0?'+':''}${value-target} kcal`:`${foodDelta(value,target)}`}</small></div>)}</div>
    <div className="food-chart">{foods.map(item=>{const amount=enabled[item.id]?amounts[item.id]:0;const segments=foodStackSegments(item,amount);const nutrition=foodNutrition(item,amount);return <article className={`food-column ${item.group} ${enabled[item.id]?'':'disabled'}`} key={item.id}>
      <div className="food-image-slot" aria-hidden="true">{item.image?<img src={item.image} alt=""/>:<span>{item.short}</span>}</div>
      <div className="food-stack" aria-label={`${item.label} ${foodAmountLabel(item,amount)}`}>{segments.length?segments.map(segment=><span key={segment.key} style={{height:`${Math.max(11,Math.round(segment.ratio*28))}px`}}/>):<i>0</i>}</div>
      <strong className="food-column-total">{foodAmountLabel(item,amount)}</strong><b className="food-column-label">{item.label}</b>
      <label className="food-toggle"><input type="checkbox" checked={enabled[item.id]} onChange={event=>onToggle(item.id,event.target.checked)}/><span>計入</span></label>
      <div className="food-stepper"><button type="button" aria-label={`${item.label} 減少`} disabled={!enabled[item.id]||amount<=0} onClick={()=>onChange(item.id,-item.step)}>−</button><span>每次 {item.step} {item.unit}</span><button type="button" aria-label={`${item.label} 增加`} disabled={!enabled[item.id]} onClick={()=>onChange(item.id,item.step)}>＋</button></div>
      <div className="food-nutrients"><span>{Math.round(nutrition.kcal)} kcal</span><span>P {Math.round(nutrition.protein)}g</span><span>F {Math.round(nutrition.fat)}g</span><span>C {Math.round(nutrition.carbs)}g</span></div>
    </article>})}</div>
    <div className="food-plan-note">目前組合：{form.goal==='cut'?'減脂':form.goal==='maintain'?'維持':'精實增肌'}目標 · 份量只存在這台裝置</div>
  </section>;
}

export default function NutritionCalculator(){
  const [form,setForm]=useState<FormState>(initial);
  const [remember,setRemember]=useState(false);
  const [result,setResult]=useState<Result|null>(null);
  const [foodAmounts,setFoodAmounts]=useState<FoodAmounts|null>(null);
  const [foodEnabled,setFoodEnabled]=useState<FoodEnabled>(defaultFoodEnabled);
  const [error,setError]=useState('');
  useEffect(()=>{try{const saved=localStorage.getItem(STORAGE_KEY);if(saved){setForm({...initial,...JSON.parse(saved)});setRemember(true)}}catch{}},[]);
  useEffect(()=>{if(!result||!foodAmounts)return;try{localStorage.setItem(FOOD_STORAGE_KEY,JSON.stringify({signature:foodSignature(form),amounts:foodAmounts,enabled:foodEnabled}))}catch{}},[result,form,foodAmounts,foodEnabled]);
  function update<K extends keyof FormState>(key:K,value:FormState[K]){setForm(current=>({...current,[key]:value}));setResult(null);setFoodAmounts(null);setError('')}
  function toggleRemember(checked:boolean){setRemember(checked);try{if(checked)localStorage.setItem(STORAGE_KEY,JSON.stringify(form));else localStorage.removeItem(STORAGE_KEY)}catch{}}
  function submit(e:FormEvent<HTMLFormElement>){e.preventDefault();const shouldRemember=new FormData(e.currentTarget).has('remember');const height=Number(form.height),weight=Number(form.weight),age=Number(form.age);
    if(!Number.isFinite(height)||!Number.isFinite(weight)||!Number.isFinite(age)||!form.height||!form.weight||!form.age){setError('請完整填寫身高、體重與年齡。');return}
    if(height<120||height>230){setError('身高請輸入 120–230 cm。');return}
    if(weight<35||weight>250){setError('體重請輸入 35–250 kg。');return}
    if(age<18||age>90){setError('此工具僅供 18–90 歲成人估算。');return}
    const nextResult=calculate(form);const savedFoodPlan=readSavedFoodPlan(form);const nextEnabled=savedFoodPlan?.enabled??defaultFoodEnabled;
    setResult(nextResult);setFoodEnabled(nextEnabled);setFoodAmounts(savedFoodPlan?.amounts??suggestedFoodAmounts(nextResult,nextEnabled));setError('');try{if(shouldRemember)localStorage.setItem(STORAGE_KEY,JSON.stringify(form));else localStorage.removeItem(STORAGE_KEY)}catch{}
  }
  function clearSaved(){try{localStorage.removeItem(STORAGE_KEY)}catch{}setRemember(false)}
  function changeFoodAmount(id:FoodId,delta:number){setFoodAmounts(current=>{if(!current)return current;const item=foodById[id];return {...current,[id]:roundToStep(Math.max(0,current[id]+delta),item.step)}})}
  function toggleFood(id:FoodId,next:boolean){if(!result||!foodAmounts)return;const nextEnabled={...foodEnabled,[id]:next};setFoodEnabled(nextEnabled);setFoodAmounts(current=>{if(!current)return current;if(!next)return {...current,[id]:0};if(current[id]>0)return current;return {...current,[id]:suggestedFoodAmounts(result,nextEnabled)[id]}})}
  function redistributeFoods(){if(result)setFoodAmounts(suggestedFoodAmounts(result,foodEnabled))}
  function resetFoods(){if(result){setFoodEnabled(defaultFoodEnabled);setFoodAmounts(suggestedFoodAmounts(result,defaultFoodEnabled))}}
  return <main className="nutrition-page">
    <header className="nutrition-header"><div><h1>每日營養計算</h1></div></header>
    <SiteNav current="nutrition" />
    <div className="nutrition-layout"><form className="nutrition-form" onSubmit={submit} noValidate>
      <div className="form-heading"><span>01</span><div><h2>基本資料</h2></div></div>
      <div className="measure-grid">
        <label><span>身高</span><div><input aria-label="身高" inputMode="decimal" type="number" min="120" max="230" value={form.height} onChange={e=>update('height',e.target.value)} placeholder="181"/><i>cm</i></div></label>
        <label><span>體重</span><div><input aria-label="體重" inputMode="decimal" type="number" min="35" max="250" step="0.1" value={form.weight} onChange={e=>update('weight',e.target.value)} placeholder="76"/><i>kg</i></div></label>
        <label><span>年齡</span><div><input aria-label="年齡" inputMode="numeric" type="number" min="18" max="90" value={form.age} onChange={e=>update('age',e.target.value)} placeholder="30"/><i>歲</i></div></label>
      </div>
      <fieldset><legend>生理性別 <small>僅用於公式係數</small></legend><div className="choice-grid two">{([['male','男性'],['female','女性']] as const).map(([value,label])=><label className={form.sex===value?'active':''} key={value}><input type="radio" name="sex" checked={form.sex===value} onChange={()=>update('sex',value)}/><b>{label}</b></label>)}</div></fieldset>
      <fieldset><legend>活動量</legend><div className="choice-grid">{(Object.keys(activities) as Activity[]).map(value=><label className={form.activity===value?'active':''} key={value}><input type="radio" name="activity" checked={form.activity===value} onChange={()=>update('activity',value)}/><b>{activities[value].label}</b><small>{activities[value].detail}</small></label>)}</div></fieldset>
      <fieldset><legend>目前目標</legend><div className="choice-grid three">{(Object.keys(goals) as Goal[]).map(value=><label className={form.goal===value?'active':''} key={value}><input type="radio" name="goal" checked={form.goal===value} onChange={()=>update('goal',value)}/><b>{goals[value].label}</b><small>{goals[value].detail}</small></label>)}</div></fieldset>
      <div className="save-row"><label><input name="remember" type="checkbox" checked={remember} onChange={e=>toggleRemember(e.target.checked)}/><span>記住我的資料（只存在這台裝置）</span></label><button type="button" onClick={clearSaved}>清除已記住資料</button></div>
      {error&&<p className="form-error" role="alert">{error}</p>}<button className="calculate-button" type="submit">計算每日需求 <span>→</span></button>
    </form>
    <section className={`nutrition-result ${result?'has-result':''}`} aria-live="polite">{result?<>
      <div className="result-hero"><span>{goals[form.goal].label}目標</span><strong>{result.target.toLocaleString()}</strong><b>kcal／天</b><p>估算維持熱量 {result.maintenance.toLocaleString()} kcal</p></div>
      <div className="macro-grid"><article><span>蛋白質</span><strong>{result.protein}<i>g</i></strong><p>{goals[form.goal].protein} g／kg</p></article><article><span>脂肪</span><strong>{result.fat}<i>g</i></strong><p>約 0.8 g／kg，並限制於合理比例</p></article><article><span>碳水</span><strong>{result.carbs}<i>g</i></strong><p>扣除蛋白質與脂肪後的剩餘熱量</p></article></div>
      <dl className="result-facts"><div><dt>維持熱量可能範圍</dt><dd>{result.low.toLocaleString()}–{result.high.toLocaleString()} kcal</dd></div><div><dt>靜息代謝估算</dt><dd>{result.bmr.toLocaleString()} kcal</dd></div><div><dt>三大營養素換算</dt><dd>約 {result.macroCalories.toLocaleString()} kcal</dd></div><div><dt>活動係數</dt><dd>{activities[form.activity].factor} · {activities[form.activity].label}</dd></div></dl>
      <div className="calibration"><b>兩週後這樣調整</b><p>每天在相近條件下量體重，以 7 天平均觀察趨勢。若連續兩週趨勢與目標不符，每次只增加或減少 100–150 kcal；不要因單日體重改動飲食。</p></div>
    </>:<div className="result-empty"><span>02</span><h2>你的估算結果</h2></div>}</section></div>
    {result&&foodAmounts&&<FoodPlan result={result} form={form} amounts={foodAmounts} enabled={foodEnabled} onChange={changeFoodAmount} onToggle={toggleFood} onRedistribute={redistributeFoods} onReset={resetFoods}/>
    }
  </main>;
}
