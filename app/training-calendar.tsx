'use client';

import { useEffect, useMemo, useState } from 'react';

type Exercise = { name:string; sets:string; base:number; step:number; every:number; unit?:string; note?:string };
type DayKey = 'day1'|'day2'|'day3'|'day4'|'rest';
type Anchor={dateIndex:number;exposure:number;value:number};
type Overrides=Record<string,Anchor[]>;

const plans:Record<DayKey,{label:string;short:string;color:string;exercises:Exercise[]}> = {
  day1:{label:'DAY 1 · 腿部',short:'腿',color:'lime',exercises:[
    {name:'腿推機／哈克深蹲',sets:'4 × 6–12',base:80,step:5,every:2},
    {name:'掛片式臀推機',sets:'3 × 8–12',base:60,step:5,every:2},
    {name:'羅馬尼亞硬舉',sets:'3 × 8–12',base:40,step:2.5,every:2},
    {name:'俯臥後勾腿',sets:'3 × 10–15',base:25,step:2.5,every:3},
    {name:'坐姿腿伸展',sets:'3 × 10–15',base:30,step:2.5,every:3},
    {name:'髖外展',sets:'2 × 15–20',base:35,step:5,every:3},
    {name:'小腿提踵',sets:'4 × 8–15',base:50,step:5,every:2},
  ]},
  day2:{label:'DAY 2 · 胸＋手臂＋腹',short:'推',color:'orange',exercises:[
    {name:'上斜胸推機',sets:'4 × 6–12',base:35,step:2.5,every:2},
    {name:'器械臥推',sets:'3 × 8–12',base:40,step:2.5,every:2},
    {name:'蝴蝶機夾胸',sets:'3 × 10–15',base:25,step:2.5,every:3},
    {name:'坐姿二頭彎舉機',sets:'3 × 8–15',base:15,step:2.5,every:3},
    {name:'過頭三頭伸展',sets:'3 × 10–15',base:15,step:2.5,every:3},
    {name:'滑輪下壓',sets:'2 × 10–15',base:25,step:2.5,every:3},
    {name:'BOSU 舉腿',sets:'3 × 8–15',base:0,step:0,every:9,unit:'自體重量'},
    {name:'滑輪跪姿捲腹',sets:'3 × 10–15',base:20,step:2.5,every:2},
  ]},
  day3:{label:'DAY 3 · 有氧／恢復',short:'跑',color:'blue',exercises:[
    {name:'輕鬆跑／上坡走／飛輪',sets:'能簡短說話的強度',base:25,step:5,every:2,unit:'分鐘',note:'最多增加到 40 分鐘；腿仍痠痛就維持或改走路。'},
    {name:'活動度與伸展',sets:'輕鬆完成',base:8,step:0,every:9,unit:'分鐘'},
  ]},
  day4:{label:'DAY 4 · 背＋肩',short:'拉',color:'violet',exercises:[
    {name:'引體向上',sets:'4 × 5–10',base:0,step:2.5,every:4,unit:'體重',note:'先把體重引體做到 4×10；之後才掛重。'},
    {name:'坐姿划船',sets:'3 × 8–12',base:55,step:2.5,every:2},
    {name:'單臂高位下拉',sets:'3 × 10–15',base:12.5,step:2.5,every:3,unit:'kg／側'},
    {name:'肩推機',sets:'3 × 6–12',base:25,step:2.5,every:2},
    {name:'上斜靠椅側平舉',sets:'4 × 12–20',base:7,step:1,every:3,unit:'kg／手'},
    {name:'滑輪後三角飛鳥',sets:'3 × 12–20',base:5,step:2.5,every:3,unit:'kg／側'},
    {name:'面拉',sets:'2 × 15–20',base:15,step:2.5,every:3},
  ]},
  rest:{label:'休息／主動恢復',short:'休',color:'rest',exercises:[]},
};

const cues:Record<string,string> = {
  '腿推機／哈克深蹲':'腳掌踩穩，膝蓋跟腳尖同向；下放到骨盆不捲起的深度。',
  '掛片式臀推機':'下巴微收、肋骨下壓；頂端夾臀，不用腰椎過度後仰。',
  '羅馬尼亞硬舉':'膝微彎、臀部往後；重量貼腿，背部保持中立。',
  '俯臥後勾腿':'髖部貼墊，不要抬臀；彎到腿後側完整收縮。',
  '坐姿腿伸展':'膝軸對準轉軸，頂端控制。一般維持直立；偶爾微後傾可增加股直肌伸展。',
  '髖外展':'骨盆固定，膝蓋向外打開；回程放慢，不讓配重碰撞。',
  '小腿提踵':'腳踝完整下放再踮高；頂端停1秒，不用膝蓋彈動。',
  '上斜胸推機':'肩胛後收下沉，手肘約45–60度；不要聳肩。',
  '器械臥推':'胸口抬起、背部貼穩；推到接近伸直但不鎖肘。',
  '蝴蝶機夾胸':'手肘角度固定，以胸帶動手臂；合攏時停1秒。',
  '坐姿二頭彎舉機':'上臂貼墊、手腕中立；避免肩膀前移借力。',
  '過頭三頭伸展':'手肘朝前且固定；肋骨下壓，避免腰部代償。',
  '滑輪下壓':'手肘貼近身體；只動前臂，底端完整伸直。',
  'BOSU 舉腿':'先讓骨盆後傾再抬腿；腰部不要拱起。',
  '滑輪跪姿捲腹':'肋骨朝骨盆靠近；不是只把臀部往後坐。',
  '輕鬆跑／上坡走／飛輪':'維持能說短句的強度；腿部痠痛就改低衝擊形式。',
  '活動度與伸展':'只做到輕微拉感，保持正常呼吸，不要彈震。',
  '引體向上':'先下沉肩胛再拉；胸口朝槓，避免擺盪借力。',
  '坐姿划船':'胸口穩定、肩膀遠離耳朵；手肘向後拉，不用身體後仰。',
  '單臂高位下拉':'手肘朝同側髖部拉；軀幹保持穩定，不要旋轉。',
  '肩推機':'臀背貼穩、肋骨下壓；手肘在手腕下方，不要聳肩。',
  '上斜靠椅側平舉':'以手肘帶動，抬到肩高附近；避免甩動與斜方肌代償。',
  '滑輪後三角飛鳥':'肩胛保持穩定，手臂向外展開；不要變成划船。',
  '面拉':'拉向眉眼後外旋；拳頭高於手肘並朝後，停1秒感受肩後側，勿做成划船。',
};

const compound=new Set(['腿推機／哈克深蹲','掛片式臀推機','羅馬尼亞硬舉','上斜胸推機','器械臥推','引體向上','坐姿划船','單臂高位下拉','肩推機']);
function effort(ex:Exercise){
  if(ex.unit==='分鐘') return 'Zone 2';
  if(ex.unit==='自體重量') return 'RIR 1–2';
  if(ex.name==='面拉') return 'RIR 1–2';
  return compound.has(ex.name)?'RIR 1–3':'RIR 0–2';
}
function warmup(ex:Exercise){return compound.has(ex.name)?'正式組前1–2組漸進熱身。':'';}
function tempo(ex:Exercise){return ex.unit==='分鐘'?'':'下放控制2–3秒。';}

function dayType(index:number):DayKey {
  if(index===0) return 'day4';
  return (['day1','day2','day3','day4'] as DayKey[])[(index-1)%4];
}

function dateAt(index:number){const d=new Date(2026,7,28,12);d.setDate(d.getDate()+index);return d;}
function dateText(d:Date){return `${d.getFullYear()}/${String(d.getMonth()+1).padStart(2,'0')}/${String(d.getDate()).padStart(2,'0')}`;}
function exposureAt(index:number,type:DayKey){let count=0;for(let i=0;i<index;i++)if(dayType(i)===type)count++;return count;}
function numericProjected(ex:Exercise,exposure:number,dateIndex:number,overrides:Overrides){
  const latest=(overrides[ex.name]||[]).filter(a=>a.dateIndex<=dateIndex).sort((a,b)=>b.dateIndex-a.dateIndex)[0];
  const start=latest?.value??ex.base; const startExposure=latest?.exposure??0;
  let value=start+Math.floor(Math.max(0,exposure-startExposure)/ex.every)*ex.step;
  if(ex.unit==='分鐘'&&ex.name.includes('輕鬆跑')) value=Math.min(value,40);
  return value;
}
function projected(ex:Exercise,exposure:number,dateIndex:number,overrides:Overrides){
  if(ex.unit==='自體重量') return ex.unit;
  if(ex.unit==='體重') {const added=Math.floor(exposure/ex.every)*ex.step;return added>0?`體重＋${added} kg`:'體重 76 kg';}
  const value=numericProjected(ex,exposure,dateIndex,overrides);
  return `${value} ${ex.unit||'kg'}`;
}

export default function TrainingCalendar(){
  const [selected,setSelected]=useState(0);
  const [overrides,setOverrides]=useState<Overrides>({});
  const [editing,setEditing]=useState(false);
  const [draft,setDraft]=useState<Record<string,string>>({});
  const dates=useMemo(()=>Array.from({length:84},(_,i)=>({index:i,date:dateAt(i),type:dayType(i)})),[]);
  const item=dates[selected]; const plan=plans[item.type]; const exposure=exposureAt(selected,item.type);
  useEffect(()=>{try{const saved=localStorage.getItem('rick-training-overrides');if(saved)setOverrides(JSON.parse(saved));}catch{}},[]);
  function choose(index:number){setSelected(index);setEditing(false);setDraft({});}
  function beginEdit(){const next:Record<string,string>={};for(const ex of plan.exercises)if(!['自體重量','體重'].includes(ex.unit||''))next[ex.name]=String(numericProjected(ex,exposure,selected,overrides));setDraft(next);setEditing(true);}
  function saveEdit(){
    const next:Overrides={...overrides};
    for(const ex of plan.exercises){const value=Number(draft[ex.name]);if(!Number.isFinite(value)||value<0)continue;const existing=(next[ex.name]||[]).filter(a=>a.dateIndex!==selected);next[ex.name]=[...existing,{dateIndex:selected,exposure,value}].sort((a,b)=>a.dateIndex-b.dateIndex);}
    setOverrides(next);localStorage.setItem('rick-training-overrides',JSON.stringify(next));setEditing(false);
  }
  function clearEdits(){setOverrides({});localStorage.removeItem('rick-training-overrides');setEditing(false);setDraft({});}
  return <section className="section calendar-section" id="calendar">
    <div className="section-heading"><span>2026/08/28 — 2026/11/19</span><h2>12週日程</h2><p>點選日期查看動作、組數、重量與動作提醒。未達加重條件時，維持原重量。</p></div>
    <div className="mobile-calendar-head"><div><span>訓練日程</span><strong>{item.date.getFullYear()} 年 {item.date.getMonth()+1} 月</strong></div><p>181 cm　·　76 kg　·　4 日循環</p><button onClick={()=>choose(0)} disabled={selected===0}>今天</button></div>
    <div className="calendar-shell">
      <div className="calendar-scroll"><div className="weekday-row">{['五','六','日','一','二','三','四'].map(x=><span key={x}>週{x}</span>)}</div><div className="date-grid">{dates.map(({index,date,type})=><button key={index} onClick={()=>choose(index)} className={`${plans[type].color} ${selected===index?'selected':''} ${index===0?'is-today':''}`} aria-pressed={selected===index}><small>{date.getMonth()+1}/{date.getDate()}</small><b>{plans[type].short}</b><i>{index===0?'今天':`W${Math.floor(index/7)+1}`}</i></button>)}</div></div>
      <article className={`daily-detail ${plan.color} ${selected===0?'is-today':''}`}>
        <div className="detail-top"><div><span>{dateText(item.date)} · 星期{['日','一','二','三','四','五','六'][item.date.getDay()]}</span><h3>{plan.label}</h3><p>{item.type==='rest'?'今天不安排重量訓練，散步 20–30 分鐘或完全休息。':`這是本循環第 ${exposure+1} 次 ${plan.short} 日。`}</p></div><div className="day-controls"><button disabled={selected===0} onClick={()=>choose(Math.max(0,selected-1))}>←</button><button disabled={selected===83} onClick={()=>choose(Math.min(83,selected+1))}>→</button></div></div>
        {item.type!=='rest'&&<div className="editor-bar">{editing?<><button className="save" onClick={saveEdit}>儲存並套用未來</button><button onClick={()=>setEditing(false)}>取消</button></>:<button onClick={beginEdit}>編輯當日重量</button>}{Object.keys(overrides).length>0&&<button className="clear" onClick={clearEdits}>清除全部自訂</button>}<span>修改只影響這一天及之後；更早日期不變。</span></div>}
        {item.type!=='rest'&&<div className="daily-exercises"><div className="daily-head"><span>動作</span><span>組數 × 次數</span><span>重量</span><span>強度</span></div>{plan.exercises.map((ex,i)=><div className="daily-row" key={ex.name}><b><i>{String(i+1).padStart(2,'0')}</i>{ex.name}</b><span>{ex.sets}</span>{editing&&draft[ex.name]!==undefined?<label className="weight-input"><input type="number" min="0" step="0.5" value={draft[ex.name]} onChange={e=>setDraft({...draft,[ex.name]:e.target.value})}/><i>{ex.unit||'kg'}</i></label>:<strong>{projected(ex,exposure,selected,overrides)}</strong>}<em>{effort(ex)}</em><small>{cues[ex.name]} {tempo(ex)}{warmup(ex)}{ex.note?` ${ex.note}`:''}</small></div>)}</div>}
        <div className="load-gate"><b>紀錄與調整</b><p>每次記錄重量／組數／次數。連續兩次達到上限再加重；若2–3週沒有任何進步，先檢查睡眠、熱量盈餘與累積疲勞。</p></div>
      </article>
    </div>
  </section>;
}
