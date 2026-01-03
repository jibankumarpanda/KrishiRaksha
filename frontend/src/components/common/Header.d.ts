import { FC } from 'react';

declare module '@/components/common/Header' {
  interface HeaderProps {
    isAuthenticated?: boolean;
    userName?: string;
    onLogout?: () => void;
  }

  const Header: FC<HeaderProps>;
  export default Header;
}
