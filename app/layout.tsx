import type { Metadata } from 'next';
import './globals.css';
export const metadata: Metadata = {title:'TheBate | Where ideas come to clash',description:'Ten minds. Two sides. One better perspective. Step inside the debate house.'};
export default function RootLayout({children}:{children:React.ReactNode}) {return <html lang="en"><body>{children}</body></html>}
