import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';
import { redirect } from 'next/navigation';
import { auth } from '@/auth';
import AppSidebar from '@/components/app-siderbar';

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session || !session.user) return redirect('/api/auth/signin?callbackUrl=/');

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>{children}</SidebarInset>
    </SidebarProvider>
  );
}
