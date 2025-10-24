'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import styles from './profile.module.css';

export default function Profile() {
  const router = useRouter();
  const [smsReminders, setSmsReminders] = useState(true);

  // TODO: Get from backend/auth
  const user = {
    name: 'John Doe',
    phone: '(555) 123-4567'
  };

  const handleLogout = () => {
    if (confirm('Are you sure you want to log out?')) {
      // TODO: Clear auth session
      router.push('/');
    }
  };

  return (
    <div className={styles.container}>
      {/* Header */}
      <header className={styles.header}>
        <h1 className={styles.title}>Profile</h1>
      </header>

      {/* User info */}
      <div className={styles.section}>
        <div className={styles.profileCard}>
          <div className={styles.avatar}>
            <span className={styles.avatarText}>{user.name.charAt(0)}</span>
          </div>
          <div className={styles.userInfo}>
            <h2 className={styles.userName}>{user.name}</h2>
            <p className={styles.userPhone}>{user.phone}</p>
          </div>
        </div>
      </div>

      {/* Settings */}
      <div className={styles.section}>
        <h3 className={styles.sectionTitle}>PREFERENCES</h3>
        <div className={styles.settingsCard}>
          <div className={styles.settingItem}>
            <div className={styles.settingInfo}>
              <h4 className={styles.settingLabel}>SMS Reminders</h4>
              <p className={styles.settingDesc}>Get text reminders before appointments</p>
            </div>
            <button
              className={`${styles.toggle} ${smsReminders ? styles.toggleActive : ''}`}
              onClick={() => setSmsReminders(!smsReminders)}
            >
              <span className={styles.toggleSlider}></span>
            </button>
          </div>
        </div>
      </div>

      {/* Account actions */}
      <div className={styles.section}>
        <button className={styles.editButton}>
          Edit Profile
        </button>
        <button className={styles.logoutButton} onClick={handleLogout}>
          Log Out
        </button>
      </div>
    </div>
  );
}
