import type {Metadata} from 'next';
import './globals.css';
import './ux.css';
import './dr.css';
export const metadata:Metadata={title:'DeepGrid Semi — DG32 Lockstep RISC-V Motor-Control Silicon',description:'DG32-LITE and DG32-2DOM: dual-core lockstep RISC-V SoCs that put the MCU, motor-control peripherals and a hardware safety monitor on one 130 nm chip.',icons:{icon:'./favicon.svg'}};
export default function RootLayout({children}:Readonly<{children:React.ReactNode}>){return <html lang="en" className="dark"><body>{children}</body></html>;}
