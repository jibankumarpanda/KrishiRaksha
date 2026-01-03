'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Icon from '@/components/ui/AppIcon';

interface BreadcrumbItem {
  label: string;
  path: string;
}

interface NavigationBreadcrumbProps {
  customItems?: BreadcrumbItem[];
}

const NavigationBreadcrumb = ({ customItems }: NavigationBreadcrumbProps) => {
  const pathname = usePathname();

  const routeLabels: Record<string, string> = {
    '/landing-page': 'Home',
    '/authentication': 'Authentication',
    '/main-dashboard': 'Dashboard',
    '/user-profile': 'Profile',
    '/claims-management': 'Claims',
    '/about': 'About',
  };

  const generateBreadcrumbs = (): BreadcrumbItem[] => {
    if (customItems) return customItems;

    const paths = pathname.split('/').filter(Boolean);
    const breadcrumbs: BreadcrumbItem[] = [
      { label: 'Home', path: '/landing-page' },
    ];

    let currentPath = '';
    paths.forEach((path) => {
      currentPath += `/${path}`;
      const label = routeLabels[currentPath] || path.charAt(0).toUpperCase() + path.slice(1);
      breadcrumbs.push({ label, path: currentPath });
    });

    return breadcrumbs;
  };

  const breadcrumbs = generateBreadcrumbs();

  if (breadcrumbs.length <= 1) return null;

  return (
    <nav aria-label="Breadcrumb" className="py-3 px-4 sm:px-6 lg:px-8 bg-background">
      <ol className="flex items-center space-x-2 text-sm font-body">
        {breadcrumbs.map((item, index) => {
          const isLast = index === breadcrumbs.length - 1;
          const isFirst = index === 0;

          return (
            <li key={item.path} className="flex items-center">
              {!isFirst && (
                <Icon
                  name="ChevronRightIcon"
                  size={16}
                  className="text-muted-foreground mx-2"
                />
              )}
              {isLast ? (
                <span className="text-foreground font-medium truncate max-w-[200px] sm:max-w-none">
                  {item.label}
                </span>
              ) : (
                <Link
                  href={item.path}
                  className="text-text-secondary hover:text-primary transition-colors duration-150 truncate max-w-[150px] sm:max-w-none"
                >
                  {item.label}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
};

export default NavigationBreadcrumb;
