'use client';

import { FormEvent, useEffect, useState } from 'react';
import SiteNav from '../site-nav';

type Sex='male'|'female';
type Activity='sedentary'|'light'|'moderate'|'high';
type Goal='cut'|'maintain'|'gain';
type FormState={height:string;weight:string;age:string;sex:Sex;activity:Activity;goal:Goal};
type Result={bmr:number;maintenance:number;low:number;high:number;target:number;protein:number;fat:number;carbs:number;macroCalories:number};

const STORAGE_KEY='rick-nutrition-profile';
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
const round10=(n:number)=>Math.round(n/10)*10;
const round5=(n:number)=>Math.round(n/5)*5;

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

export default function NutritionCalculator(){
  const [form,setForm]=useState<FormState>(initial);
  const [remember,setRemember]=useState(false);
  const [eligible,setEligible]=useState(false);
  const [result,setResult]=useState<Result|null>(null);
  const [error,setError]=useState('');
  useEffect(()=>{try{const saved=localStorage.getItem(STORAGE_KEY);if(saved){setForm({...initial,...JSON.parse(saved)});setRemember(true)}}catch{}},[]);
  function update<K extends keyof FormState>(key:K,value:FormState[K]){setForm(current=>({...current,[key]:value}));setResult(null);setError('')}
  function toggleRemember(checked:boolean){setRemember(checked);try{if(checked)localStorage.setItem(STORAGE_KEY,JSON.stringify(form));else localStorage.removeItem(STORAGE_KEY)}catch{}}
  function submit(e:FormEvent<HTMLFormElement>){e.preventDefault();const shouldRemember=new FormData(e.currentTarget).has('remember');const height=Number(form.height),weight=Number(form.weight),age=Number(form.age);
    if(!Number.isFinite(height)||!Number.isFinite(weight)||!Number.isFinite(age)||!form.height||!form.weight||!form.age){setError('請完整填寫身高、體重與年齡。');return}
    if(height<120||height>230){setError('身高請輸入 120–230 cm。');return}
    if(weight<35||weight>250){setError('體重請輸入 35–250 kg。');return}
    if(age<18||age>90){setError('此工具僅供 18–90 歲成人估算。');return}
    if(!eligible){setError('請先確認你符合一般成人估算的適用條件。');return}
    setResult(calculate(form));setError('');try{if(shouldRemember)localStorage.setItem(STORAGE_KEY,JSON.stringify(form));else localStorage.removeItem(STORAGE_KEY)}catch{}
  }
  function clearSaved(){try{localStorage.removeItem(STORAGE_KEY)}catch{}setRemember(false)}
  return <main className="nutrition-page">
    <header className="nutrition-header"><div><span>NUTRITION ESTIMATE</span><h1>每日營養計算</h1><p>先取得合理的起始值，再用 2–3 週的體重趨勢校正。</p></div></header>
    <SiteNav current="nutrition" />
    <div className="nutrition-layout"><form className="nutrition-form" onSubmit={submit} noValidate>
      <div className="form-heading"><span>01</span><div><h2>基本資料</h2><p>所有計算都在你的裝置上完成。</p></div></div>
      <div className="measure-grid">
        <label><span>身高</span><div><input aria-label="身高" inputMode="decimal" type="number" min="120" max="230" value={form.height} onChange={e=>update('height',e.target.value)} placeholder="181"/><i>cm</i></div></label>
        <label><span>體重</span><div><input aria-label="體重" inputMode="decimal" type="number" min="35" max="250" step="0.1" value={form.weight} onChange={e=>update('weight',e.target.value)} placeholder="76"/><i>kg</i></div></label>
        <label><span>年齡</span><div><input aria-label="年齡" inputMode="numeric" type="number" min="18" max="90" value={form.age} onChange={e=>update('age',e.target.value)} placeholder="30"/><i>歲</i></div></label>
      </div>
      <fieldset><legend>生理性別 <small>僅用於公式係數</small></legend><div className="choice-grid two">{([['male','男性'],['female','女性']] as const).map(([value,label])=><label className={form.sex===value?'active':''} key={value}><input type="radio" name="sex" checked={form.sex===value} onChange={()=>update('sex',value)}/><b>{label}</b></label>)}</div></fieldset>
      <fieldset><legend>活動量</legend><div className="choice-grid">{(Object.keys(activities) as Activity[]).map(value=><label className={form.activity===value?'active':''} key={value}><input type="radio" name="activity" checked={form.activity===value} onChange={()=>update('activity',value)}/><b>{activities[value].label}</b><small>{activities[value].detail}</small></label>)}</div></fieldset>
      <fieldset><legend>目前目標</legend><div className="choice-grid three">{(Object.keys(goals) as Goal[]).map(value=><label className={form.goal===value?'active':''} key={value}><input type="radio" name="goal" checked={form.goal===value} onChange={()=>update('goal',value)}/><b>{goals[value].label}</b><small>{goals[value].detail}</small></label>)}</div></fieldset>
      <div className="safety-box"><b>適用條件</b><p>不適用於未成年人、孕期／哺乳期，或有腎臟疾病、飲食失調及其他需要醫療營養照護者。</p><label><input type="checkbox" checked={eligible} onChange={e=>setEligible(e.target.checked)}/><span>我已滿 18 歲，且沒有上述情況</span></label></div>
      <div className="save-row"><label><input name="remember" type="checkbox" checked={remember} onChange={e=>toggleRemember(e.target.checked)}/><span>記住我的資料（只存在這台裝置）</span></label><button type="button" onClick={clearSaved}>清除已記住資料</button></div>
      {error&&<p className="form-error" role="alert">{error}</p>}<button className="calculate-button" type="submit">計算每日需求 <span>→</span></button>
    </form>
    <section className={`nutrition-result ${result?'has-result':''}`} aria-live="polite">{result?<>
      <div className="result-hero"><span>{goals[form.goal].label}目標</span><strong>{result.target.toLocaleString()}</strong><b>kcal／天</b><p>估算維持熱量 {result.maintenance.toLocaleString()} kcal</p></div>
      <div className="macro-grid"><article><span>蛋白質</span><strong>{result.protein}<i>g</i></strong><p>{goals[form.goal].protein} g／kg</p></article><article><span>脂肪</span><strong>{result.fat}<i>g</i></strong><p>約 0.8 g／kg，並限制於合理比例</p></article><article><span>碳水</span><strong>{result.carbs}<i>g</i></strong><p>扣除蛋白質與脂肪後的剩餘熱量</p></article></div>
      <dl className="result-facts"><div><dt>維持熱量可能範圍</dt><dd>{result.low.toLocaleString()}–{result.high.toLocaleString()} kcal</dd></div><div><dt>靜息代謝估算</dt><dd>{result.bmr.toLocaleString()} kcal</dd></div><div><dt>三大營養素換算</dt><dd>約 {result.macroCalories.toLocaleString()} kcal</dd></div><div><dt>活動係數</dt><dd>{activities[form.activity].factor} · {activities[form.activity].label}</dd></div></dl>
      <div className="calibration"><b>兩週後這樣調整</b><p>每天在相近條件下量體重，以 7 天平均觀察趨勢。若連續兩週趨勢與目標不符，每次只增加或減少 100–150 kcal；不要因單日體重改動飲食。</p></div>
    </>:<div className="result-empty"><span>02</span><h2>你的估算結果</h2><p>填完左側資料後，這裡會顯示目標熱量與三大營養素。活動量通常是最大誤差來源，結果應視為起始值。</p></div>}</section></div>
    <section className="nutrition-method"><div><b>計算依據</b><p>熱量採 Mifflin–St Jeor 靜息代謝公式與活動係數；蛋白質參考運動族群建議；脂肪與碳水依總熱量分配。公式無法取代實際飲食紀錄與體重趨勢。</p></div><div className="source-links"><a href="https://pubmed.ncbi.nlm.nih.gov/2305711/" target="_blank" rel="noreferrer">Mifflin–St Jeor</a><a href="https://pmc.ncbi.nlm.nih.gov/articles/PMC5477153/" target="_blank" rel="noreferrer">ISSN Protein</a><a href="https://www.nationalacademies.org/read/10490" target="_blank" rel="noreferrer">National Academies DRI</a><a href="https://www.niddk.nih.gov/health-information/weight-management/body-weight-planner" target="_blank" rel="noreferrer">NIDDK</a></div></section>
    <footer className="nutrition-footer">此工具僅提供一般估算，不構成醫療、診斷或個人化營養處方。</footer>
  </main>;
}
