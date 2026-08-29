import TrainingCalendar from './training-calendar';
import SiteNav from './site-nav';

export default function Home(){
  return <main className="tool-page">
    <header className="tool-header">
      <div><span>RICK · TRAINING LOG</span><h1>訓練計畫</h1></div>
    </header>
    <SiteNav current="schedule" />
    <TrainingCalendar />
    <section className="section compact-rules">
      <div><b>加重</b><p>連續兩次完成全部組數上限，姿勢穩定並約保留2下，才使用下一級重量。</p></div>
      <div><b>維持</b><p>落在目標次數範圍內，但尚未完成全部上限，就維持原重量並先增加次數。</p></div>
      <div><b>降重</b><p>做不到次數下限或姿勢失控，當天降低5–10%；疼痛時停止該動作。</p></div>
    </section>
    <footer className="tool-footer">本地訓練工具 · 重量會因器械品牌、睡眠與當天狀態而調整</footer>
  </main>;
}
