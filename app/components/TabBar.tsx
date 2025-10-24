'use client';

import { usePathname, useRouter } from 'next/navigation';
import styles from './TabBar.module.css';

export default function TabBar() {
  const pathname = usePathname();
  const router = useRouter();

  // Don't show tab bar on login/signup pages
  if (pathname === '/' || pathname === '/login' || pathname === '/signup' || pathname === '/booking') {
    return null;
  }

  const tabs = [
    { name: 'Services', path: '/services' },
    { name: 'Appointments', path: '/appointments' },
    { name: 'Info', path: '/info' },
    { name: 'Profile', path: '/profile' }
  ];

  return (
    <nav className={styles.tabBar}>
      {tabs.map((tab) => (
        <button
          key={tab.path}
          className={`${styles.tab} ${pathname === tab.path ? styles.tabActive : ''}`}
          onClick={() => router.push(tab.path)}
        >
          <span className={styles.tabLabel}>{tab.name}</span>
        </button>
      ))}
    </nav>
  );
}
