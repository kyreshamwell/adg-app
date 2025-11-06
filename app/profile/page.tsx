'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { auth, db } from '@/lib/firebase';
import { signOut } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import styles from './profile.module.css';

export default function Profile() {
  const router = useRouter();
  const [smsReminders, setSmsReminders] = useState(true);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<{ name: string; phone: string } | null>(null);

  // Fetch user data on mount
  useEffect(() => {
    const fetchUserData = async () => {
      const currentUser = auth.currentUser;
      if (!currentUser) {
        router.push('/');
        return;
      }

      try {
        const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
        if (userDoc.exists()) {
          const data = userDoc.data();
          setUser({
            name: data.fullName || 'User',
            phone: data.phoneNumber || currentUser.phoneNumber || 'N/A'
          });
        } else {
          // Fallback if user doc doesn't exist
          setUser({
            name: 'User',
            phone: currentUser.phoneNumber || 'N/A'
          });
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [router]);

  const handleLogout = async () => {
    if (confirm('Are you sure you want to log out?')) {
      try {
        await signOut(auth);
        router.push('/');
      } catch (error) {
        console.error('Error logging out:', error);
        alert('Failed to log out');
      }
    }
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <header className={styles.header}>
          <h1 className={styles.title}>Profile</h1>
        </header>
        <p style={{ color: '#8e8e93', textAlign: 'center', padding: '2rem' }}>Loading...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className={styles.container}>
        <header className={styles.header}>
          <h1 className={styles.title}>Profile</h1>
        </header>
        <p style={{ color: '#8e8e93', textAlign: 'center', padding: '2rem' }}>User not found</p>
      </div>
    );
  }

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
