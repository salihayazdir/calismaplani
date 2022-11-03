import '../styles/globals.css';
import setDefaultOptions from 'date-fns/setDefaultOptions';
import tr from 'date-fns/locale/tr';

function MyApp({ Component, pageProps }) {
  setDefaultOptions({ locale: tr });
  const getLayout = Component.getLayout || ((page) => page);
  return getLayout(<Component {...pageProps} />);
}

export default MyApp;
