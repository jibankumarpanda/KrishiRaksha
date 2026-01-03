import type { Metadata } from 'next';
import Header from '@/components/common/Header';
import LandingPageInteractive from './components/LandingPageInteractive';

export const metadata: Metadata = {
  title: 'KRISHI RAKSHA - AI-Powered Agricultural Insurance for Indian Farmers',
  description: 'Secure your harvest with AI-driven crop yield predictions, smart fraud detection, and blockchain-backed transparent insurance claims processing. Trusted by 12,000+ farmers across India.',
};

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-background">
      <Header isAuthenticated={false} />
      <LandingPageInteractive />
    </main>
  );
}