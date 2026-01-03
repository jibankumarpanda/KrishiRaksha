import { FC, ImgHTMLAttributes } from 'react';

declare module '@/components/ui/AppImage' {
  interface AppImageProps extends ImgHTMLAttributes<HTMLImageElement> {
    src: string;
    alt: string;
    width?: number;
    height?: number;
    className?: string;
    priority?: boolean;
    quality?: number;
    placeholder?: 'blur' | 'empty';
    blurDataURL?: string;
    fill?: boolean;
    sizes?: string;
    fallbackSrc?: string;
  }

  const AppImage: FC<AppImageProps>;
  export default AppImage;
}
