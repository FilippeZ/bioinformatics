import React, { useState } from 'react';
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

const PipelineLayout: React.FC = () => {
  const { state } = usePipeline();
  const [sidebarOpen, setSidebarOpen] = useState(true);

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
            {state.currentStep === 1 && <Module1Sequence />}
            {state.currentStep === 2 && <Module2Structure />}
            {state.currentStep === 3 && <Module3Validation />}
            {state.currentStep === 4 && <Module4Cheminformatics />}
            {state.currentStep === 5 && <Module5QSAR />}
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
    // Landing fades out (handled inside LandingPage via 'entered' state)
    // Then we show the pipeline with a fade-in
    setTimeout(() => {
      setLaunched(true);
      requestAnimationFrame(() => requestAnimationFrame(() => setVisible(true)));
    }, 900);
  };

  return (
    <>
      {/* Landing page stays mounted during the fade-out transition */}
      {!launched && <LandingPage onEnter={handleLaunch} />}

      {/* Pipeline fades in after landing fades out */}
      {launched && (
        <div
          className="transition-opacity duration-700"
          style={{ opacity: visible ? 1 : 0 }}
        >
          <PipelineProvider>
            <PipelineLayout />
          </PipelineProvider>
        </div>
      )}
    </>
  );
}

export default App;
