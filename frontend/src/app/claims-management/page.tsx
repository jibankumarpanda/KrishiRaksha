import type { Metadata } from 'next';
import Header from '@/components/common/Header';
import NavigationBreadcrumb from '@/components/common/NavigationBreadcrumb';
import ClaimsInteractive from './components/ClaimsInteractive';

export const metadata: Metadata = {
  title: 'Claims Management - KRISHI RAKSHA',
  description:
    'Submit new insurance claims, track existing applications, and manage the complete claims lifecycle with blockchain-backed transparency and real-time status updates.',
};

export default function ClaimsManagementPage() {
  return (
    <>
      <Header isAuthenticated={true} />
      <NavigationBreadcrumb />
      <ClaimsInteractive />
    </>
  );
}
