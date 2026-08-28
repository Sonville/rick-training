import type { Metadata } from 'next';
import { Noto_Sans_TC, Oswald } from 'next/font/google';
import './globals.css';
const noto=Noto_Sans_TC({variable:'--font-noto',subsets:['latin'],weight:['400','500','600','700','900']});
const oswald=Oswald({variable:'--font-oswald',subsets:['latin'],weight:['500','600','700']});
const title='Rick 的四日訓練地圖';
const description='目前健身菜單與改善建議的視覺化四日訓練計畫。';
export const metadata:Metadata={
  title,description,
  openGraph:{title,description,type:'website',images:[{url:'/og.png',width:1200,height:630,alt:title}]},
  twitter:{card:'summary_large_image',title,description,images:['/og.png']},
};
export default function RootLayout({children}:Readonly<{children:React.ReactNode}>){return <html lang="zh-Hant"><body className={`${noto.variable} ${oswald.variable}`}>{children}</body></html>}
