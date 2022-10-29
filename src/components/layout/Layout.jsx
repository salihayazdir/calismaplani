import Head from 'next/head';
import React from 'react';
import Header from './Header';

export default function Layout({ children, title, displayName }) {
  return (
    <div>
      <Head>
        <title>{title}</title>
        <meta name='description' content='' />
        <link rel='icon' href='/favicon.ico' />
      </Head>
      <Header displayName={displayName} />
      <main>{children}</main>
    </div>
  );
}
