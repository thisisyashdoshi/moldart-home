declare module 'lucide-react' {
  import type * as React from 'react';

  export type LucideProps = React.SVGProps<SVGSVGElement> & {
    size?: string | number;
    absoluteStrokeWidth?: boolean;
  };

  export type LucideIcon = React.FC<LucideProps>;

  export const Boxes: LucideIcon;
  export const Building2: LucideIcon;
  export const ClipboardCheck: LucideIcon;
  export const CreditCard: LucideIcon;
  export const FileText: LucideIcon;
  export const LayoutDashboard: LucideIcon;
  export const ListChecks: LucideIcon;
  export const PackageCheck: LucideIcon;
  export const RefreshCw: LucideIcon;
  export const ScrollText: LucideIcon;
  export const Search: LucideIcon;
  export const Settings: LucideIcon;
  export const ShieldCheck: LucideIcon;
  export const Truck: LucideIcon;
  export const Users: LucideIcon;
}
