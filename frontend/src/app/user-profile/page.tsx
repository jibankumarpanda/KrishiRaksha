import type { Metadata } from 'next';
import Header from '@/components/common/Header';
import NavigationBreadcrumb from '@/components/common/NavigationBreadcrumb';
import UserProfileInteractive from './components/UserProfileInteractive';

export const metadata: Metadata = {
  title: 'User Profile - KRISHI RAKSHA',
  description: 'Manage your personal information, farm details, documents, and track your activity on KRISHI RAKSHA platform.',
};

export default function UserProfilePage() {
  return (
    <>
      <Header isAuthenticated={true} />
      <NavigationBreadcrumb />
      <UserProfileInteractive />
    </>
  );
}
