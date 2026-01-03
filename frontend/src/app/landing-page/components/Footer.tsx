import Link from 'next/link';
import Icon from '@/components/ui/AppIcon';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const footerLinks = {
    product: [
      { label: 'Features', path: '/landing-page#features' },
      { label: 'How It Works', path: '/landing-page#how-it-works' },
      { label: 'Pricing', path: '/landing-page#pricing' },
      { label: 'Live Demo', path: '/landing-page#demo' },
    ],
    company: [
      { label: 'About Us', path: '/about' },
      { label: 'Careers', path: '/about#careers' },
      { label: 'Blog', path: '/about#blog' },
      { label: 'Press Kit', path: '/about#press' },
    ],
    support: [
      { label: 'Help Center', path: '/about#help' },
      { label: 'Contact Us', path: '/about#contact' },
      { label: 'FAQs', path: '/about#faq' },
      { label: 'Community', path: '/about#community' },
    ],
    legal: [
      { label: 'Privacy Policy', path: '/about#privacy' },
      { label: 'Terms of Service', path: '/about#terms' },
      { label: 'Cookie Policy', path: '/about#cookies' },
      { label: 'Compliance', path: '/about#compliance' },
    ],
  };

  const socialLinks = [
    { icon: 'ChatBubbleLeftRightIcon', label: 'WhatsApp', href: '#' },
    { icon: 'EnvelopeIcon', label: 'Email', href: '#' },
    { icon: 'PhoneIcon', label: 'Phone', href: '#' },
  ];

  return (
    <footer className="bg-card border-t border-border">
      <div className="mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid sm:grid-cols-2 lg:grid-cols-6 gap-8 mb-12">
          <div className="sm:col-span-2">
            <Link href="/landing-page" className="flex items-center space-x-2 mb-4">
              <svg
                width="40"
                height="40"
                viewBox="0 0 40 40"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <rect width="40" height="40" rx="8" fill="currentColor" className="text-primary" />
                <path
                  d="M20 10L12 18H16V28H24V18H28L20 10Z"
                  fill="currentColor"
                  className="text-primary-foreground"
                />
                <circle cx="20" cy="32" r="2" fill="currentColor" className="text-accent" />
              </svg>
              <span className="text-xl font-heading font-bold text-foreground">
                KRISHI RAKSHA
              </span>
            </Link>
            <p className="text-sm text-text-secondary font-body mb-4 max-w-xs">
              Empowering Indian farmers with AI-driven crop yield predictions and blockchain-backed transparent insurance claims processing.
            </p>
            <div className="flex items-center space-x-3">
              {socialLinks.map((social, index) => (
                <a
                  key={index}
                  href={social.href}
                  className="w-10 h-10 bg-muted rounded-lg flex items-center justify-center hover:bg-primary hover:text-primary-foreground transition-colors duration-200"
                  aria-label={social.label}
                >
                  <Icon name={social.icon as any} size={20} />
                </a>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-sm font-heading font-bold text-foreground mb-4">Product</h3>
            <ul className="space-y-3">
              {footerLinks.product.map((link, index) => (
                <li key={index}>
                  <Link
                    href={link.path}
                    className="text-sm text-text-secondary font-body hover:text-primary transition-colors duration-150"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-heading font-bold text-foreground mb-4">Company</h3>
            <ul className="space-y-3">
              {footerLinks.company.map((link, index) => (
                <li key={index}>
                  <Link
                    href={link.path}
                    className="text-sm text-text-secondary font-body hover:text-primary transition-colors duration-150"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-heading font-bold text-foreground mb-4">Support</h3>
            <ul className="space-y-3">
              {footerLinks.support.map((link, index) => (
                <li key={index}>
                  <Link
                    href={link.path}
                    className="text-sm text-text-secondary font-body hover:text-primary transition-colors duration-150"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-heading font-bold text-foreground mb-4">Legal</h3>
            <ul className="space-y-3">
              {footerLinks.legal.map((link, index) => (
                <li key={index}>
                  <Link
                    href={link.path}
                    className="text-sm text-text-secondary font-body hover:text-primary transition-colors duration-150"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-border">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-sm text-text-secondary font-body text-center sm:text-left">
              &copy; {currentYear} KRISHI RAKSHA. All rights reserved.
            </p>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Icon name="ShieldCheckIcon" size={16} className="text-success" />
                <span className="text-xs text-text-secondary font-body">Secure Platform</span>
              </div>
              <div className="flex items-center space-x-2">
                <Icon name="CheckBadgeIcon" size={16} className="text-primary" />
                <span className="text-xs text-text-secondary font-body">Govt. Certified</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
