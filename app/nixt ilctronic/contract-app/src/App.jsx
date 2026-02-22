import { ThemeProvider } from './context/ThemeContext';
import BackgroundEffects from './components/BackgroundEffects';
import Header from './components/Header';
import Contract from './components/Contract';
import Footer from './components/Footer';

function App() {
  return (
    <ThemeProvider>
      <BackgroundEffects />
      <Header />
      <Contract />
      <Footer />
    </ThemeProvider>
  );
}

export default App;

