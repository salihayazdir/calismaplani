import '../styles/globals.css';
import setDefaultOptions from 'date-fns/setDefaultOptions';
import tr from 'date-fns/locale/tr';
import ErrorBoundary from '../components/ErrorBoundry';

function MyApp({ Component, pageProps }) {
  setDefaultOptions({ locale: tr });
  const getLayout = Component.getLayout || ((page) => page);
  return getLayout(
    <ErrorBoundary>
      <Component {...pageProps} />
    </ErrorBoundary>
  );
}

export default MyApp;
