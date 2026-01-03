import type { Metadata } from 'next';
import AuthenticationInteractive from './components/AuthenticationInteractive';

export const metadata: Metadata = {
  title: 'Authentication - KRISHI RAKSHA',
  description:
    'Secure login and registration for farmers to access AI-powered crop yield predictions, fraud detection, and transparent blockchain-backed insurance claims processing.',
};

export default function AuthenticationPage() {
  return <AuthenticationInteractive />;
}
