import Icon from '@/components/ui/AppIcon';

interface Technology {
  id: number;
  icon: string;
  title: string;
  description: string;
  benefits: string[];
}

export default function TechnologySection() {
  const technologies: Technology[] = [
    {
      id: 1,
      icon: 'CpuChipIcon',
      title: 'Artificial Intelligence',
      description: 'Machine learning models trained on millions of data points from Indian farms',
      benefits: [
        'Predicts crop yields with 92% accuracy',
        'Identifies pest and disease patterns early',
        'Optimizes irrigation and fertilizer usage',
        'Learns continuously from new farm data',
      ],
    },
    {
      id: 2,
      icon: 'CubeTransparentIcon',
      title: 'Blockchain Technology',
      description: 'Decentralized ledger ensuring transparency and preventing fraud',
      benefits: [
        'Immutable record of all transactions',
        'Smart contracts for automatic payouts',
        'Complete transparency in claim processing',
        'Eliminates intermediary manipulation',
      ],
    },
    {
      id: 3,
      icon: 'GlobeAltIcon',
      title: 'Satellite Integration',
      description: 'ISRO satellite imagery for real-time farm monitoring',
      benefits: [
        'Daily crop health monitoring',
        'Accurate land area measurement',
        'Weather pattern analysis',
        'Disaster impact assessment',
      ],
    },
  ];

  return (
    <section className="mb-16 lg:mb-24">
      <div className="text-center mb-12">
        <h2 className="text-2xl sm:text-3xl lg:text-4xl font-heading font-bold text-foreground mb-4">
          Technology That Works for Farmers
        </h2>
        <p className="text-lg text-text-secondary max-w-2xl mx-auto">
          Complex technology, simple benefits
        </p>
      </div>

      <div className="space-y-8">
        {technologies.map((tech, index) => (
          <div
            key={tech.id}
            className="bg-card rounded-lg shadow-card hover:shadow-card-hover transition-all duration-300 p-6 lg:p-8 border border-border"

          >
            <div className="flex flex-col lg:flex-row lg:items-start lg:space-x-6">
              <div className="flex-shrink-0 mb-4 lg:mb-0">
                <div className="w-16 h-16 bg-primary/10 rounded-lg flex items-center justify-center">
                  <Icon name={tech.icon as any} size={32} className="text-primary" />
                </div>
              </div>

              <div className="flex-1">
                <h3 className="text-2xl font-heading font-bold text-foreground mb-2">
                  {tech.title}
                </h3>
                <p className="text-text-secondary mb-4">
                  {tech.description}
                </p>

                <div className="grid sm:grid-cols-2 gap-3">
                  {tech.benefits.map((benefit, idx) => (
                    <div key={idx} className="flex items-start space-x-2">
                      <Icon name="CheckCircleIcon" size={20} className="text-success flex-shrink-0 mt-0.5" />
                      <span className="text-sm text-foreground">{benefit}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-12 bg-gradient-to-r from-primary/10 to-secondary/10 rounded-lg p-6 lg:p-8 border border-primary/20">
        <div className="text-center">
          <Icon name="LightBulbIcon" size={48} className="text-accent mx-auto mb-4" />
          <h3 className="text-xl font-heading font-bold text-foreground mb-2">
            No Technical Knowledge Required
          </h3>
          <p className="text-text-secondary max-w-2xl mx-auto">
            Our platform handles all the complex technology in the background. You just need to provide basic farm information, and we take care of the rest. Available in your local language with voice support.
          </p>
        </div>
      </div>
    </section>
  );
}
