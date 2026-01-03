import Icon from '@/components/ui/AppIcon';

interface Feature {
  id: number;
  icon: string;
  title: string;
  description: string;
  color: string;
}

export default function FeaturesSection() {
  const features: Feature[] = [
    {
      id: 1,
      icon: 'ChartBarIcon',
      title: 'Yield Prediction Algorithms',
      description: 'Our AI models analyze 50+ parameters including soil moisture, rainfall patterns, temperature variations, and historical crop data to predict yields with 92% accuracy. The system continuously learns from new data, improving predictions season after season.',
      color: 'primary',
    },
    {
      id: 2,
      icon: 'ShieldExclamationIcon',
      title: 'Fraud Detection System',
      description: 'Advanced pattern recognition identifies suspicious claims by cross-referencing satellite imagery, weather data, and historical patterns. Our blockchain-backed verification ensures only genuine claims are processed, protecting honest farmers and reducing premium costs.',
      color: 'error',
    },
    {
      id: 3,
      icon: 'EyeIcon',
      title: 'Real-Time Monitoring',
      description: 'Satellite imagery integration provides daily updates on crop health, irrigation levels, and pest detection. Farmers receive instant alerts about potential threats, enabling proactive measures to protect their harvest and maximize yields.',
      color: 'secondary',
    },
    {
      id: 4,
      icon: 'BoltIcon',
      title: 'Instant Payout Mechanism',
      description: 'Smart contracts automatically trigger payouts when predefined conditions are met, eliminating lengthy claim processing. Funds are transferred directly to farmers\' accounts within 24-48 hours, ensuring financial support reaches them when needed most.',
      color: 'success',
    },
    {
      id: 5,
      icon: 'LanguageIcon',
      title: 'Future Goal For Regional Language Support',
      description: 'Complete platform availability in Hindi, Tamil, Telugu, Marathi, Bengali, Gujarati, Kannada, Malayalam, Punjabi, and Odia. Voice assistance and WhatsApp integration ensure accessibility for farmers with varying literacy levels.',
      color: 'accent',
    },
    {
      id: 6,
      icon: 'ChatBubbleLeftRightIcon',
      title: '24/7 Support System',
      description: 'Multilingual support team available via phone, WhatsApp, and SMS. Agricultural experts provide guidance on crop management, insurance queries, and platform usage. Emergency helpline ensures immediate assistance during critical situations.',
      color: 'secondary',
    },
  ];

  const getColorClasses = (color: string) => {
    const colorMap: Record<string, { bg: string; text: string }> = {
      primary: { bg: 'bg-primary/10', text: 'text-primary' },
      error: { bg: 'bg-error/10', text: 'text-error' },
      secondary: { bg: 'bg-secondary/10', text: 'text-secondary' },
      success: { bg: 'bg-success/10', text: 'text-success' },
      accent: { bg: 'bg-accent/10', text: 'text-accent' },
    };
    return colorMap[color] || colorMap.primary;
  };

  return (
    <section className="mb-16 lg:mb-24">
      <div className="text-center mb-12">
        <h2 className="text-2xl sm:text-3xl lg:text-4xl font-heading font-bold text-foreground mb-4">
          Platform Features Explained
        </h2>
        <p className="text-lg text-text-secondary max-w-2xl mx-auto">
          Understanding the technology that protects your harvest
        </p>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
        {features.map((feature) => {
          const colors = getColorClasses(feature.color);
          return (
            <div
              key={feature.id}
              className="bg-card rounded-lg shadow-card hover:shadow-card-hover transition-all duration-300 p-6 border border-border group"
            >
              <div className={`w-14 h-14 ${colors.bg} rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                <Icon name={feature.icon as any} size={28} className={colors.text} />
              </div>
              <h3 className="text-xl font-heading font-bold text-foreground mb-3">
                {feature.title}
              </h3>
              <p className="text-text-secondary leading-relaxed">
                {feature.description}
              </p>
            </div>
          );
        })}
      </div>
    </section>
  );
}
