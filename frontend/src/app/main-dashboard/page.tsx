import type { Metadata } from 'next';
import Header from '@/components/common/Header';
import NavigationBreadcrumb from '@/components/common/NavigationBreadcrumb';
import DashboardInteractive from './components/DashboardInteractive';

export const metadata: Metadata = {
  title: 'Main Dashboard - KRISHI RAKSHA',
  description: 'Comprehensive agricultural insurance dashboard with AI-powered yield predictions, fraud detection analytics, and real-time farm monitoring for Indian farmers.',
};

export default function MainDashboardPage() {
  // Authentication check happens client-side in DashboardInteractive
  return (
    <>
      <Header isAuthenticated={true} />
      <NavigationBreadcrumb />
      <DashboardInteractive />
    </>
  );
}
