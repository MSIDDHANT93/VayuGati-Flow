import React from 'react'
import { AlertTriangle, TrendingDown, Gauge, Activity, Car } from 'lucide-react'
import { PipelineResponse } from '../../api/pipeline'
import PanelCard from '../ui/PanelCard'
import SectionHeader from '../ui/SectionHeader'
import KpiCard from '../ui/KpiCard'

interface SituationSummaryProps {
  pipelineData: PipelineResponse | null
  loading: boolean
}

const SituationSummary: React.FC<SituationSummaryProps> = ({ pipelineData, loading }) => {
  const getCongestionTone = (score: number): 'default' | 'warning' | 'danger' => {
    if (score >= 0.7) return 'danger'
    if (score >= 0.4) return 'warning'
    return 'default'
  }

  if (loading || !pipelineData) {
    return (
      <PanelCard className="h-full flex items-center justify-center">
        <span className="text-xs text-gray-500">Awaiting operational data...</span>
      </PanelCard>
    )
  }

  const congestionTone = getCongestionTone(pipelineData.congestion_score)

  return (
    <PanelCard className="space-y-2">
      <SectionHeader title="Situation Summary" icon={AlertTriangle} />
      <div className="grid grid-cols-3 gap-2">
        <KpiCard
          label="Congestion"
          value={pipelineData.congestion_score.toFixed(2)}
          icon={Activity}
          tone={congestionTone}
        />
        <KpiCard label="Vehicles" value={`${pipelineData.total_vehicles}`} icon={Car} tone="default" />
        <KpiCard
          label="Avg Speed"
          value={`${pipelineData.average_speed_kmh.toFixed(1)} km/h`}
          icon={Gauge}
          tone={pipelineData.average_speed_kmh < 20 ? 'warning' : 'default'}
        />
      </div>
      <div className="grid grid-cols-2 gap-2">
        <KpiCard
          label="Queue Length"
          value={`${pipelineData.queue_length_meters.toFixed(1)}m`}
          icon={TrendingDown}
          tone={pipelineData.queue_length_meters > 40 ? 'danger' : 'warning'}
        />
        <KpiCard
          label="Risk Score"
          value={pipelineData.risk_score.toFixed(2)}
          icon={AlertTriangle}
          tone={pipelineData.risk_score > 0.5 ? 'danger' : 'accent'}
        />
      </div>
    </PanelCard>
  )
}

export default SituationSummary
