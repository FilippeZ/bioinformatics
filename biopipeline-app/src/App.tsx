import React, { useState, useEffect, Component, type ReactNode } from 'react';
import { PipelineProvider, usePipeline } from './context/PipelineContext';
import { Header } from './components/common/Header';
import { Sidebar } from './components/common/Sidebar';
import { StepperBar } from './components/common/StepperBar';
import { Module1Sequence } from './components/modules/Module1Sequence';
import { Module2Structure } from './components/modules/Module2Structure';
import { Module3Validation } from './components/modules/Module3Validation';
import { Module4Cheminformatics } from './components/modules/Module4Cheminformatics';
import { Module5QSAR } from './components/modules/Module5QSAR';
import { LandingPage } from './components/landing/LandingPage';
import { AlertCircle, RefreshCw } from 'lucide-react';

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class ModuleErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  public state: ErrorBoundaryState = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('BioHelix Component Error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="bg-surface-container border border-bio-amber/30 rounded-2xl p-8 text-center space-y-4 max-w-xl mx-auto my-8 animate-fade-in">
          <AlertCircle className="w-12 h-12 text-bio-amber mx-auto" />
          <h3 className="text-lg font-display font-bold text-text-bright">Something went wrong with this view</h3>
          <p className="text-sm font-sans text-text-muted leading-relaxed">
            Don't worry — your progress is saved! This view encountered a rendering issue
            {this.state.error?.message ? ` (${this.state.error.message})` : ''}. Click below to reload it.
          </p>
          <button
            onClick={() => this.setState({ hasError: false, error: null })}
            className="px-5 py-2.5 bg-brand-indigo/20 hover:bg-brand-indigo/30 border border-brand-indigo/50 text-brand-indigo font-sans font-semibold text-sm rounded-xl flex items-center justify-center gap-2 mx-auto transition-all hover:scale-105 active:scale-95"
          >
            <RefreshCw className="w-4 h-4" />
            Try Again
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

// Default DNA sequence used for auto-run on launch
const DEFAULT_DNA = 'GACACCTCAGTACTAGGATGTATCAGCCTGAACTAGCAGGCCTGGTTCCAAATTTTTTTATCAACACTCGTAGGGGGATTATCCTAGAGGGGGTCTGGGATTTCTTTGACATCAGAGTATTTTTGCCTTGCTCCTTCACAATTTGGGAACAAATAATTTAGTGGTTATTAACCCTGGCTACGCACTGGAAACTTTAAAAATAATGCTGGTATGAAATTTACACAGAGTATCGTGAAAATTTTCACTGAGTACCATGTGGTTATACATTGGATAAGGCTCCAGGAAGCAGCTACTGGAAGACAGCCATGCCAAGAGTGGTTAGTGGTTGGAATTTTGGCAAGTCAGTTTTAGTCTGCCTTATCAAATACATGGGCATACAGATAAATCCTTAGATGGCTCTCCTACTTACTGAAACATTTTCTATCTATCTATCTATCTATCTATCTATTTGGGAAGCTATCTATCTATCTATCATTTATTTAAGGTAGTCTCTATCTGCCTCTGTCTCTGTCTGTCTCTGTGTCTCTGTGTCTGTCTGCTCTCTCTCTCTCTCTGTGGGAATCTCTCTCTGTGTGTGTGTGTGTATGTGTGTGTGTGTGTGTGGTGTGCATGAACATGAGTAAAATCCATAAGGAAACTTTCAGAGTTGGTCCTCTCCTTATATCAAATGGATCCAGGAATTAAACTCAGGTTCAATTCTTGGTGCCTTTACTAGTTGAGCCATCTCACTGGCTCTTCATCATCTTTAGAATAAACTCACTTTATTACACACACACACACACACAACCTGGGAGTACACACACACACACAACCAAAGCCCCAACGGAAAACTACAATATTATAATGAATACACAGGTTCTCAACATAGTCTCTGCCACGCTTGCAGACAAAGATGAGTAGAAGTAGAAAGAACCAGGGAAACGTGGAGCAAGTCAGAAGGAATAACAGTCAGAAGGAATAACAGTCAGAAGGAATAACAGTCAGAAGGAGTAACAGTCAGAAGGAATAGCAGTCAGAAGGAATAACAGTCAGAAGACAGCACAGTCAGAAGGAATAACAGTCAGAAGGAATAACAGTCAGAAGGAATAACAGTCAGAAGGAATAACAGTCAGAAGGAATAGCAGTCAGAAGGAATAACAGTCAGAAGGAATAACAGTCAGAAGGAATAACAGTCAAAGAAATAGCAGTCAGAAGGAATAGCAGTCAGAAGGAATAACAGTCAAAGGAGCAGTCAGAAGGAGTAACAGTCAGAAGGAATAACAGTCAGAAGGAATAACAGTCAAAGGAATAGCAGTCAGAAGGAGTAACAGTCAGAGCAAACACAGAGATGACAAAGGCAATGGGGTCAGAGACTTCACCACTCTCCAAGA';

const PipelineLayout: React.FC = () => {
  const { state, runModule1 } = usePipeline();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Auto-run Module1 with the default sequence on first launch
  // so users see a populated dashboard immediately (no empty state)
  useEffect(() => {
    if (!state.module1Data || state.module1Data.sequenceLength === 0) {
      runModule1(DEFAULT_DNA, '[CGT][ACT]TGTGGT[CT][AT]', 'RUNX1_TGIF1_IKZF1');
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="min-h-screen bg-surface-base flex flex-col font-sans antialiased">
      <Header onToggleSidebar={() => setSidebarOpen(p => !p)} />
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <div className={`transition-all duration-300 ${sidebarOpen ? 'w-72' : 'w-0'} overflow-hidden flex-shrink-0`}>
          <Sidebar />
        </div>
        {/* Main Workspace */}
        <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
          <StepperBar />
          <div className="flex-1 overflow-y-auto p-6">
            <ModuleErrorBoundary>
              {state.currentStep === 1 && <Module1Sequence />}
              {state.currentStep === 2 && <Module2Structure />}
              {state.currentStep === 3 && <Module3Validation />}
              {state.currentStep === 4 && <Module4Cheminformatics />}
              {state.currentStep === 5 && <Module5QSAR />}
            </ModuleErrorBoundary>
          </div>
        </main>
      </div>
    </div>
  );
};

export function App() {
  const [launched, setLaunched] = useState(false);
  const [visible, setVisible] = useState(false);

  const handleLaunch = () => {
    setTimeout(() => {
      setLaunched(true);
      requestAnimationFrame(() => requestAnimationFrame(() => setVisible(true)));
    }, 900);
  };

  return (
    <PipelineProvider>
      {!launched && <LandingPage onEnter={handleLaunch} />}

      {launched && (
        <div
          className="transition-opacity duration-700"
          style={{ opacity: visible ? 1 : 0 }}
        >
          <PipelineLayout />
        </div>
      )}
    </PipelineProvider>
  );
}

export default App;
