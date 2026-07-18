import { useState, useEffect } from 'react'
import TopBar from './components/layout/TopBar'
import LeftPanel from './components/layout/LeftPanel'
import RightPanel from './components/layout/RightPanel'
import BottomPanel from './components/layout/BottomPanel'
import MainArea from './components/layout/MainArea'
import { MissionLogEntry } from './components/panels/MissionLog'
import { pipelineApi, PipelineResponse } from './api/pipeline'

function App() {
  const [pipelineData, setPipelineData] = useState<PipelineResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentScenario, setCurrentScenario] = useState('morning_rush')
  const [missionLog, setMissionLog] = useState<MissionLogEntry[]>([])

  const appendLog = (entry: MissionLogEntry) => {
    setMissionLog((prev) => [entry, ...prev].slice(0, 50))
  }

  useEffect(() => {
    loadPipelineData()
  }, [currentScenario])

  useEffect(() => {
    if (pipelineData && !loading) {
      appendLog({
        id: `pipeline-${Date.now()}`,
        timestamp: new Date().toLocaleTimeString('en-US', { hour12: false }),
        message: `PIPELINE COMPLETE — ${pipelineData.intersection_id} (${pipelineData.scenario.replace('_', ' ')})`,
        level: pipelineData.risk_score > 0.5 ? 'warning' : 'success',
      })
    }
  }, [pipelineData])

  const loadPipelineData = async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await pipelineApi.runDemo({
        scenario: currentScenario,
        intersection_id: 'INT-001',
        camera_id: 'CAM-001',
        frame_id: 'FRM-001'
      })
      if (response.success && response.data) {
        setPipelineData(response.data)
      } else {
        setError('Failed to load pipeline data')
      }
    } catch (err) {
      setError('Error connecting to backend')
      console.error('Pipeline API error:', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="h-screen w-screen bg-mission-black grid grid-cols-[280px_1fr_360px] grid-rows-[56px_1fr_220px] overflow-hidden">
      <header className="col-span-3">
        <TopBar
          currentScenario={currentScenario}
          loading={loading}
          error={error}
          pipelineData={pipelineData}
          onRetry={loadPipelineData}
        />
      </header>

      <LeftPanel
        currentScenario={currentScenario}
        onScenarioChange={setCurrentScenario}
        pipelineData={pipelineData}
        loading={loading}
        error={error}
      />

      <MainArea pipelineData={pipelineData} loading={loading} error={error} />

      <RightPanel
        pipelineData={pipelineData}
        loading={loading}
        error={error}
        onMissionLog={appendLog}
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
