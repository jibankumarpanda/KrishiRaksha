import { FC } from 'react';

declare module '@/components/common/NavigationBreadcrumb' {
  interface BreadcrumbItem {
    label: string;
    path: string;
  }

  interface NavigationBreadcrumbProps {
    customItems?: BreadcrumbItem[];
  }

  const NavigationBreadcrumb: FC<NavigationBreadcrumbProps>;
  export default NavigationBreadcrumb;
}
