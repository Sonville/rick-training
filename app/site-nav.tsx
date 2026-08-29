type Page='schedule'|'guide'|'nutrition';

const items:[Page,string][]=[
  ['schedule','訓練日程'],
  ['guide','動作指南'],
  ['nutrition','營養計算'],
];

export default function SiteNav({current}:{current:Page}){
  const root=current==='schedule'?'./':'../';
  const hrefs:Record<Page,string>={schedule:root,guide:`${root}guide/`,nutrition:`${root}nutrition/`};
  return <nav className="site-nav" aria-label="主要分頁">
    {items.map(([id,label])=><a href={hrefs[id]} className={current===id?'active':''} aria-current={current===id?'page':undefined} key={id}>{label}</a>)}
  </nav>;
}
