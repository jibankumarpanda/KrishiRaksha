import AppImage from '@/components/ui/AppImage';
import Icon from '@/components/ui/AppIcon';

export default function MissionSection() {
  return (
    <section className="mb-16 lg:mb-24">
      <div className="text-center mb-12">
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-heading font-bold text-foreground mb-4">
          Empowering Indian Farmers with AI & Blockchain
        </h1>
        <p className="text-lg sm:text-xl text-text-secondary max-w-3xl mx-auto">
          Our mission is to secure the harvest and livelihood of every Indian farmer through cutting-edge technology and transparent insurance processes.
        </p>
      </div>

      <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
        <div className="order-2 lg:order-1">
          <div className="bg-card rounded-lg shadow-card p-6 lg:p-8 border border-border">
            <div className="flex items-start space-x-4 mb-6">
              <div className="flex-shrink-0 w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                <Icon name="SparklesIcon" size={24} className="text-primary" />
              </div>
              <div>
                <h3 className="text-xl font-heading font-bold text-foreground mb-2">
                  AI-Powered Predictions
                </h3>
                <p className="text-text-secondary">
                  Advanced machine learning algorithms analyze weather patterns, soil conditions, and historical data to provide accurate crop yield predictions, helping farmers make informed decisions.
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-4 mb-6">
              <div className="flex-shrink-0 w-12 h-12 bg-secondary/10 rounded-lg flex items-center justify-center">
                <Icon name="ShieldCheckIcon" size={24} className="text-secondary" />
              </div>
              <div>
                <h3 className="text-xl font-heading font-bold text-foreground mb-2">
                  Blockchain Transparency
                </h3>
                <p className="text-text-secondary">
                  Every insurance claim is recorded on the blockchain, ensuring complete transparency, preventing fraud, and enabling instant verification of transactions and payouts.
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0 w-12 h-12 bg-success/10 rounded-lg flex items-center justify-center">
                <Icon name="HeartIcon" size={24} className="text-success" />
              </div>
              <div>
                <h3 className="text-xl font-heading font-bold text-foreground mb-2">
                  Farmer-First Approach
                </h3>
                <p className="text-text-secondary">
                  Designed with input from thousands of Indian farmers, our platform supports 10+ regional languages and integrates with WhatsApp for seamless rural communication.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="order-1 lg:order-2">
          <div className="relative rounded-lg overflow-hidden shadow-card-hover h-[400px] lg:h-[500px]">
            <AppImage
              src="https://img.rocket.new/generatedImages/rocket_gen_img_194ad82d6-1764650746007.png"
              alt="Indian farmer in traditional white kurta standing in lush green rice field with smartphone, examining crops under bright sunlight"
              fill
              className="object-cover" />

            <div className="absolute inset-0 bg-gradient-to-t from-foreground/60 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
              <p className="text-lg font-body font-medium">
                "Technology that understands the heart of Indian agriculture"
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>);

}
