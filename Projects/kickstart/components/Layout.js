import React from 'react';
import { Container } from 'semantic-ui-react';
import Head from 'next/head'; // if we place anything inside it then our child tag will be looped to the <head></head>
import Header from './Header';

export default props => {
  return (
    <Container>
      <Head>
        <link
          rel="stylesheet"
          href="//cdn.jsdelivr.net/npm/semantic-ui@2.4.2/dist/semantic.min.css"
        />
      </Head>

      <Header />
      {props.children}
      {/*<h1>footer</h1>*/}
    </Container>
  );
};
