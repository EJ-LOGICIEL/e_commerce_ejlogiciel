import './globals.css';
import React from 'react';
import Header from '@/ui/Header';
import Footer from '@/ui/Footer';
import Contact from "@/ui/Contact";
import ReduxProvider from "@/redux/Provider";

export default function RootLayout({
                                       children,
                                   }: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang='en'>
        <head>
            <meta charSet="UTF-8"/>
            <link rel="icon" href="/ej.jpg"/>
            <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
            <title>ej-logiciel</title>
        </head>
        <body className='bg-gradient-to-r from-blue-50 to-indigo-50'>
        <ReduxProvider>
            <div className='grid h-screen w-screen grid-rows-[auto_1fr_auto]'>
                <div>
                    <Header/>
                </div>
                <div>
                    <main>{children}</main>
                    <Contact/>
                </div>
                <div className='fixed right-0 bottom-0 left-0 block md:hidden'>
                    <Footer/>
                </div>
            </div>
        </ReduxProvider>
        </body>
        </html>
    );
}
