import type { Metadata } from 'next';
import './globals.css';
import './today.css';
import './roadmap.css';
import './calendar.css';
import './tool.css';
import './guide.css';
import './meta.css';
import './editor.css';
import './nutrition.css';
import './navigation.css';
const title='Rick 的四日訓練地圖';
const description='目前健身菜單與改善建議的視覺化四日訓練計畫。';
export const metadata:Metadata={
  title,description,
  openGraph:{title,description,type:'website',images:[{url:'/og.png',width:1200,height:630,alt:title}]},
  twitter:{card:'summary_large_image',title,description,images:['/og.png']},
};
export default function RootLayout({children}:Readonly<{children:React.ReactNode}>){return <html lang="zh-Hant"><body>{children}</body></html>}
