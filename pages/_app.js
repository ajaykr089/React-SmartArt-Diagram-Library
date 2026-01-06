import '../styles/diagram.css';
import { ThemeProvider } from '../src/lib';

export default function App({ Component, pageProps }) {
  return (
    <ThemeProvider initialTheme="default">
      <Component {...pageProps} />
    </ThemeProvider>
  );
}
