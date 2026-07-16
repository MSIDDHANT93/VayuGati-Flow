import { useState, useEffect } from 'react'
import TopBar from './components/layout/TopBar'
import LeftPanel from './components/layout/LeftPanel'
import RightPanel from './components/layout/RightPanel'
import BottomPanel from './components/layout/BottomPanel'
import MainArea from './components/layout/MainArea'
import { pipelineApi, PipelineResponse } from './api/pipeline'

function App() {
  const [pipelineData, setPipelineData] = useState<PipelineResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentScenario, setCurrentScenario] = useState('morning_rush')

  useEffect(() => {
    loadPipelineData()
  }, [currentScenario])

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
    <div className="h-screen w-screen flex flex-col bg-mission-black overflow-hidden">
      {/* Top Bar */}
      <TopBar 
        currentScenario={currentScenario}
        onScenarioChange={setCurrentScenario}
        loading={loading}
        error={error}
        pipelineData={pipelineData}
        onRetry={loadPipelineData}
      />
      
      {/* Main Content Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Panel - Camera Feed */}
        <LeftPanel pipelineData={pipelineData} loading={loading} error={error} />
        
        {/* Main Area - Interactive Map */}
        <MainArea pipelineData={pipelineData} loading={loading} error={error} />
        
        {/* Right Panel - Traffic Intelligence */}
        <RightPanel pipelineData={pipelineData} loading={loading} error={error} />
      </div>
      
      {/* Bottom Panel - Historical Trends */}
      <BottomPanel pipelineData={pipelineData} loading={loading} error={error} />
    </div>
  )
}

export default App
