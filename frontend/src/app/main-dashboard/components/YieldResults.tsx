import Icon from '@/components/ui/AppIcon';

interface YieldResultsProps {
  predictedYield: number;
  confidence: number;
  riskLevel: string;
  recommendations: string[];
}

const YieldResults = ({ predictedYield, confidence, riskLevel, recommendations }: YieldResultsProps) => {
  const getRiskColor = () => {
    if (riskLevel === 'low') return 'bg-success/10 text-success border-success';
    if (riskLevel === 'medium') return 'bg-warning/10 text-warning border-warning';
    return 'bg-error/10 text-error border-error';
  };

  const getRiskIcon = () => {
    if (riskLevel === 'low') return 'CheckCircleIcon';
    if (riskLevel === 'medium') return 'ExclamationTriangleIcon';
    return 'XCircleIcon';
  };

  return (
    <div className="bg-card border border-border rounded-lg p-6 shadow-card">
      <div className="flex items-center space-x-2 mb-6">
        <Icon name="ChartPieIcon" size={24} className="text-secondary" />
        <h2 className="text-xl font-heading font-bold text-foreground">Prediction Results</h2>
      </div>

      {/* Predicted Yield */}
      <div className="mb-6">
        <div className="flex items-baseline space-x-2 mb-2">
          <span className="text-4xl font-heading font-bold text-primary">{predictedYield}</span>
          <span className="text-text-secondary text-lg font-body">quintals/acre</span>
        </div>
        <p className="text-sm text-text-secondary font-body">Expected yield for this season</p>
      </div>

      {/* Confidence Level */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-body font-medium text-foreground">Confidence Level</span>
          <span className="text-sm font-body font-bold text-primary">{confidence}%</span>
        </div>
        <div className="w-full bg-muted rounded-full h-2.5 overflow-hidden">
          <div
            className="bg-primary h-full rounded-full transition-all duration-500"
            style={{ width: `${confidence}%` }}
          />
        </div>
      </div>

      {/* Risk Assessment */}
      <div className="mb-6">
        <h3 className="text-sm font-body font-medium text-foreground mb-3">Risk Assessment</h3>
        <div className={`flex items-center space-x-2 px-4 py-3 rounded-md border ${getRiskColor()}`}>
          <Icon name={getRiskIcon() as any} size={20} />
          <span className="font-body font-medium capitalize">{riskLevel} Risk</span>
        </div>
      </div>

      {/* Recommendations */}
      <div>
        <h3 className="text-sm font-body font-medium text-foreground mb-3">AI Recommendations</h3>
        <div className="space-y-2">
          {recommendations.map((recommendation, index) => (
            <div key={index} className="flex items-start space-x-2">
              <Icon name="LightBulbIcon" size={16} className="text-accent mt-0.5 flex-shrink-0" />
              <p className="text-sm text-text-secondary font-body">{recommendation}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default YieldResults;
