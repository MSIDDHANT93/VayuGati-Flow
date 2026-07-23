import { useSyncExternalStore } from 'react'
import TopBar from './components/layout/TopBar'
import LeftPanel from './components/layout/LeftPanel'
import RightPanel from './components/layout/RightPanel'
import BottomPanel from './components/layout/BottomPanel'
import MainArea from './components/layout/MainArea'
import type { TrafficApp } from './app/TrafficApp'

interface AppProps {
  app: TrafficApp
}

function App({ app }: AppProps) {
  const { pipelineData, loading, error, currentScenario, missionLog, selectedIntersectionId, visibleLayers } =
    useSyncExternalStore(app.subscribe, app.getState, app.getState)

  return (
    <div className="h-screen w-screen bg-mission-black grid grid-cols-[280px_1fr_360px] grid-rows-[56px_1fr_220px] overflow-hidden">
      <header className="col-span-3">
        <TopBar
          currentScenario={currentScenario}
          loading={loading}
          error={error}
          pipelineData={pipelineData}
          onRetry={() => app.retry()}
        />
      </header>

      <LeftPanel
        currentScenario={currentScenario}
        onScenarioChange={(scenario) => app.setScenario(scenario)}
        pipelineData={pipelineData}
        loading={loading}
        error={error}
      />

      <MainArea
        pipelineData={pipelineData}
        loading={loading}
        error={error}
        selectedIntersectionId={selectedIntersectionId}
        visibleLayers={visibleLayers}
        onSelectIntersection={(intersectionId) => app.map.selectIntersection(intersectionId)}
        onToggleLayer={(layerId) => app.map.toggleLayer(layerId)}
      />

      <RightPanel
        pipelineData={pipelineData}
        loading={loading}
        error={error}
        onSimulate={(title) => app.simulation.recordSimulation(title)}
        onApprove={(title) => app.reasoning.recordApproval(title)}
        onViewEvidence={(title) => app.reasoning.recordEvidenceReview(title)}
      />

      <BottomPanel
        pipelineData={pipelineData}
        loading={loading}
        error={error}
        logEntries={missionLog}
      />
    </div>
  )
}

export default App
