import SiteNav from '../site-nav';

type Move={name:string;target:string;setup:string;do:string;feel:string;avoid:string};
const groups:{id:string;label:string;color:string;moves:Move[]}[]=[
{id:'legs',label:'腿',color:'lime',moves:[
{name:'腿推機／哈克深蹲',target:'股四頭、臀肌',setup:'腳掌約肩寬，膝蓋與腳尖同向；座椅調到下放時骨盆不會捲起。',do:'吸氣下放2–3秒，踩穩全腳掌推起；膝蓋接近伸直但不鎖死。',feel:'大腿前側與臀部出力，腳掌三點持續貼穩。',avoid:'膝蓋內夾、腳跟浮起、下放過深導致腰椎離墊。'},
{name:'掛片式臀推機',target:'臀大肌',setup:'機器軸線對準髖部，墊子放在髖骨下方；雙腳約肩寬。',do:'肋骨下壓、下巴微收，腳跟發力把髖推到身體成一直線，頂端停1秒。',feel:'頂端明顯夾臀，而不是腰部緊繃。',avoid:'過度拱腰、腳離臀太遠、用速度反彈。'},
{name:'羅馬尼亞硬舉',target:'腿後肌、臀肌',setup:'雙腳髖寬，膝微彎；重量貼近大腿，肩胛自然穩定。',do:'臀部向後推，軀幹前傾；腿後側拉緊後以臀部向前完成。',feel:'腿後側有伸展感，背部維持中立。',avoid:'蹲得太多、重量離腿、腰背圓起或頂端後仰。'},
{name:'俯臥後勾腿',target:'腿後肌',setup:'膝蓋略超出墊子邊緣，機器轉軸對準膝關節，滾墊位於腳踝上方。',do:'髖部壓住墊子，腳跟往臀部靠近；回程控制2–3秒。',feel:'大腿後側縮短收緊。',avoid:'抬臀、腰部拱起、回程讓配重直接掉落。'},
{name:'坐姿腿伸展',target:'股四頭肌',setup:'膝關節對準轉軸，滾墊放在腳踝上方。一般保持直立；偶爾微後傾可增加股直肌伸展。',do:'伸膝到接近打直，頂端停1秒，再控制下放2–3秒。',feel:'大腿前側收縮，不是膝關節刺痛。',avoid:'甩動配重、鎖死膝蓋、座椅過前或過後。'},
{name:'髖外展機',target:'臀中肌、臀小肌',setup:'骨盆置中貼穩，膝蓋與墊片接觸；軀幹保持不動。',do:'膝蓋向外打開，停一下後慢慢回到起點。',feel:'臀部外上側發力。',avoid:'身體前後搖晃、回程碰撞配重、用過大重量縮短幅度。'},
{name:'小腿提踵',target:'腓腸肌、比目魚肌',setup:'前腳掌踩穩踏板，腳跟可自由上下；膝蓋保持穩定。',do:'腳跟完整下放，再用大拇趾球方向踮高，頂端停1秒。',feel:'小腿完整拉長與收縮。',avoid:'快速彈動、幅度太短、腳踝向內或向外翻。'}]},
{id:'push',label:'推',color:'orange',moves:[
{name:'上斜胸推機',target:'上胸、前三角、三頭',setup:'把手起點約在鎖骨下方；肩胛後收下沉，雙腳踩穩。',do:'手肘約45–60度向前上方推，回程讓胸肌有伸展但肩膀不前移。',feel:'上胸主導，手腕保持在手肘上方。',avoid:'聳肩、手肘張成90度、座椅太低讓動作變肩推。'},
{name:'器械臥推',target:'胸大肌、三頭',setup:'把手與胸中線同高，背部與臀部貼穩，肩胛後收。',do:'平穩推到手肘接近伸直，控制回到胸肌有拉感的位置。',feel:'胸部向內收縮，肩前側沒有夾擠。',avoid:'肩膀前移、手腕折彎、回程過深。'},
{name:'蝴蝶機夾胸',target:'胸大肌',setup:'座椅調到手肘略低於肩膀，前臂或手掌貼穩墊片。',do:'維持手肘角度，把兩側手臂往身體中線合攏，停1秒後慢放。',feel:'胸部夾緊，而不是手臂用力推。',avoid:'聳肩、縮短回程、用身體前傾借力。'},
{name:'坐姿二頭彎舉機',target:'肱二頭肌',setup:'上臂完整貼墊，肘關節對準轉軸，手腕保持中立。',do:'以前臂向上彎舉，頂端收緊；回程伸展但不鎖死手肘。',feel:'二頭肌腹部收縮，上臂位置不變。',avoid:'肩膀向前、臀部離座、手腕過度彎曲。'},
{name:'背向低位繩索過頭伸展',target:'三頭肌長頭',setup:'背對滑輪跨步站穩，繩索在頭後；肋骨下壓、手肘朝前。',do:'固定上臂，只伸直手肘；回程讓三頭肌完整拉長。',feel:'上臂後側靠近腋下的位置被拉伸。',avoid:'手肘外張、腰部後仰、重量拉著身體後退。'},
{name:'直桿／V桿滑輪下壓',target:'三頭肌',setup:'站近滑輪，手肘貼近身體，肩膀保持下沉。',do:'只動前臂向下伸直，底端停一下，再回到約90度。',feel:'上臂後側收緊。',avoid:'身體前後擺動、手肘跑到前方、肩膀下壓代償。'},
{name:'BOSU 舉腿',target:'腹直肌、髖屈肌',setup:'骨盆穩定貼住BOSU，雙手固定；先讓腰部貼近支撐面。',do:'先做骨盆後傾，再把腿抬起；下放到腰部仍能控制的位置。',feel:'下腹縮短，腰部不離開支撐。',avoid:'只甩腿、腰部拱起、下降過低。'},
{name:'滑輪跪姿捲腹',target:'腹直肌',setup:'跪在滑輪前，繩索放在頭部兩側；臀部位置固定。',do:'肋骨往骨盆靠近，讓脊椎逐節彎曲，再控制回正。',feel:'腹部縮短，不是髖部往後坐。',avoid:'用手拉繩、手肘向大腿移動但軀幹不彎。'}]},
{id:'cardio',label:'跑',color:'blue',moves:[
{name:'輕鬆跑',target:'心肺、恢復',setup:'跑步機先從步行熱身5分鐘；鞋帶固定，步幅自然。',do:'維持能說短句的強度20–35分鐘，落腳點接近身體正下方。',feel:'呼吸加快但可控制，腿部沒有沉重灼熱感。',avoid:'腿日後做衝刺、為追配速拉大步幅、帶痛硬跑。'},
{name:'上坡走／飛輪',target:'低衝擊心肺',setup:'上坡走可從坡度5–8%、舒服速度開始；飛輪座高讓膝蓋底端微彎。',do:'維持穩定節奏20–35分鐘，以鼻吸口呼或可對話為基準。',feel:'心率穩定升高，但不影響隔天重量訓練。',avoid:'抓緊扶手支撐全身、阻力太大造成膝痛、追求力竭。'}]},
{id:'pull',label:'拉',color:'violet',moves:[
{name:'引體向上',target:'背闊肌、二頭、肩胛穩定肌',setup:'中立或正握略寬於肩，身體自然垂直；先穩定核心。',do:'先讓肩胛下沉，再把手肘往肋骨方向拉；控制下降到手臂伸長。',feel:'腋下到背側收縮，胸口接近槓。',avoid:'擺盪、聳肩起拉、只把下巴硬伸過槓。'},
{name:'坐姿划船',target:'中背、背闊肌、後三角',setup:'雙腳踩穩，胸口自然抬起，肩膀遠離耳朵。',do:'先穩定肩胛，手肘往後拉到身體兩側；回程讓手臂伸長但不圓背。',feel:'肩胛骨向中間靠近，手臂只是連接點。',avoid:'軀幹大幅後仰、聳肩、只用二頭拉。'},
{name:'單臂高位下拉',target:'背闊肌',setup:'身體固定在滑輪下方，工作側手臂向上伸展，骨盆保持正面。',do:'手肘朝同側髖部畫弧線下拉，底端停一下再控制伸長。',feel:'腋下至腰側的背闊肌縮短。',avoid:'扭轉身體、手腕彎曲、手肘只往後不往下。'},
{name:'肩推機',target:'前三角、側三角、三頭',setup:'座椅調到把手約耳朵高度，臀背貼穩，手腕疊在手肘上。',do:'向上推到接近伸直，控制回到手肘略低於肩膀的位置。',feel:'肩膀與三頭發力，軀幹穩定。',avoid:'聳肩、腰部過度拱起、回程過深造成夾擠。'},
{name:'上斜靠椅側平舉',target:'側三角',setup:'胸口貼住上斜椅，手臂自然垂下，啞鈴從身體兩側開始。',do:'以手肘帶動向外抬到肩高附近，停一下後慢慢下放。',feel:'肩膀外側灼熱，斜方肌不主導。',avoid:'甩動啞鈴、聳肩、拇指明顯向下。'},
{name:'滑輪後三角飛鳥',target:'後三角',setup:'滑輪約肩高，手臂微彎交叉握把，胸口與骨盆保持正面。',do:'手臂向外展開，想像手肘往兩側牆壁移動。',feel:'肩膀後側收縮，肩胛只小幅移動。',avoid:'變成划船、聳肩、用過大重量縮短幅度。'},
{name:'面拉',target:'後三角、旋轉肌群、肩胛穩定',setup:'繩索設在眼睛高度，站穩並保持肋骨下壓。',do:'拉向眉眼後強調外旋：拳頭朝後且高於手肘，頂端停1秒。',feel:'肩胛後側、棘下肌與小圓肌收縮，肩膀保持下沉。',avoid:'重量過大後仰、只拉到胸口、做成手肘貼身的划船。'}]},
];

export default function Guide(){return <main className="guide-page">
  <header className="guide-header"><div><span>EXERCISE GUIDE</span><h1>動作指南</h1></div></header>
  <SiteNav current="guide" />
  <nav className="guide-tabs">{groups.map(g=><a className={g.color} href={`#${g.id}`} key={g.id}>{g.label}<small>{g.moves.length} 個動作</small></a>)}</nav>
  {groups.map(g=><section className={`guide-group ${g.color}`} id={g.id} key={g.id}><div className="group-title"><span>{g.label}</span><p>{g.moves.length} 個動作</p></div><div className="move-grid">{g.moves.map((m,i)=><details className="move-card" key={m.name} open={i===0}><summary><i>{String(i+1).padStart(2,'0')}</i><div><b>{m.name}</b><span>{m.target}</span></div><em>＋</em></summary><div className="move-detail"><dl><div><dt>器材設定</dt><dd>{m.setup}</dd></div><div><dt>怎麼做</dt><dd>{m.do}</dd></div><div><dt>應該感覺</dt><dd>{m.feel}</dd></div><div><dt>避免</dt><dd>{m.avoid}</dd></div></dl></div></details>)}</div></section>)}
  <footer className="guide-footer">疼痛不是正常訓練感；出現銳痛、麻木或關節不穩時停止動作。</footer>
  </main>}
