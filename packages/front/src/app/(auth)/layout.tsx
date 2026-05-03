// import { ModeToggle } from '@/components/mode-toggle';
// import { ConfigMenu } from "@/components/config-menu"

export default function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="relative flex min-h-screen flex-col">
      {children}
    </div>
  );
}
