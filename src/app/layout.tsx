import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/context/AuthContext';
import { TaskProvider } from '@/context/TaskContext';
import { NotificationProvider } from '@/context/NotificationContext';
import { AppShell } from '@/components/common/AppShell';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

export const metadata: Metadata = {
  title: 'Remindly | Modern Personal Task & Reminder Manager',
  description: 'Manage all your responsibilities, custom categories, reminders, and daily agenda in one place.',
  icons: {
    icon: '/favicon.ico',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full">
      <body className={`${inter.variable} font-sans antialiased bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-50 min-h-full flex flex-col`}>
        <AuthProvider>
          <TaskProvider>
            <NotificationProvider>
              <AppShell>{children}</AppShell>
            </NotificationProvider>
          </TaskProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
