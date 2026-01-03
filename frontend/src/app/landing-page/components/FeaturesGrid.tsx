import Icon from '@/components/ui/AppIcon';

interface Feature {
  icon: string;
  title: string;
  description: string;
  color: string;
}

const FeaturesGrid = () => {
  const features: Feature[] = [
    {
      icon: 'CpuChipIcon',
      title: 'AI Yield Prediction',
      description: 'Advanced machine learning algorithms analyze weather patterns, soil conditions, and historical data to predict your crop yield with 94% accuracy.',
      color: 'text-primary',
    },
    {
      icon: 'ShieldCheckIcon',
      title: 'Smart Fraud Detection',
      description: 'Blockchain-powered verification system detects fraudulent claims in real-time, ensuring fair and transparent insurance processing for all farmers.',
      color: 'text-secondary',
    },
    {
      icon: 'ChartBarIcon',
      title: 'Real-Time Monitoring',
      description: 'Track your farm conditions 24/7 with satellite imagery integration, weather updates, and automated alerts for potential risks to your crops.',
      color: 'text-accent',
    },
    {
      icon: 'BanknotesIcon',
      title: 'Instant Payouts',
      description: 'Automated claim processing with blockchain verification ensures you receive insurance payouts within 48 hours of claim approval.',
      color: 'text-success',
    },
    {
      icon: 'LanguageIcon',
      title: 'Future Goal For Regional Language Support',
      description: 'Access the platform in 12+ Indian regional languages including Hindi, Tamil, Telugu, and more for seamless user experience.',
      color: 'text-primary',
    },
    {
      icon: 'ChatBubbleLeftRightIcon',
      title: '24/7 Support',
      description: 'Get instant assistance through WhatsApp, SMS, or voice support in your preferred language from our dedicated farmer support team.',
      color: 'text-secondary',
    },
  ];

  return (
    <section className="py-16 lg:py-24 bg-background">
      <div className="mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12 lg:mb-16">
          <div className="inline-flex items-center space-x-2 px-4 py-2 bg-primary/10 rounded-full border border-primary/20 mb-4">
            <Icon name="SparklesIcon" size={16} className="text-primary" />
            <span className="text-sm font-body font-medium text-primary">Powerful Features</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-heading font-bold text-foreground mb-4">
            Everything You Need to{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">
              Protect Your Harvest
            </span>
          </h2>
          <p className="text-lg text-text-secondary font-body max-w-3xl mx-auto">
            Comprehensive agricultural insurance platform powered by cutting-edge AI and blockchain technology
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="group p-6 lg:p-8 bg-card rounded-xl border border-border shadow-card hover:shadow-card-hover hover:scale-[1.02] transition-all duration-300"
            >
              <div className={`w-14 h-14 rounded-lg bg-gradient-to-br from-primary/10 to-secondary/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                <Icon name={feature.icon as any} size={28} className={feature.color} />
              </div>
              <h3 className="text-xl font-heading font-bold text-foreground mb-3">
                {feature.title}
              </h3>
              <p className="text-base text-text-secondary font-body leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesGrid;
