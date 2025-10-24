'use client';

import styles from './info.module.css';

export default function Info() {
  return (
    <div className={styles.container}>
      {/* Header */}
      <header className={styles.header}>
        <h1 className={styles.title}>Info</h1>
        <p className={styles.subtitle}>Against Da Grain Barbershop</p>
      </header>

      {/* Contact info */}
      <div className={styles.section}>
        <div className={styles.infoCard}>
          <div className={styles.infoItem}>
            <span className={styles.infoIcon}>📍</span>
            <div className={styles.infoContent}>
              <h3 className={styles.infoLabel}>Location</h3>
              <p className={styles.infoValue}>123 Main Street</p>
              <p className={styles.infoValue}>New York, NY 10001</p>
              <a
                href="https://maps.google.com/?q=123+Main+Street+New+York+NY"
                target="_blank"
                rel="noopener noreferrer"
                className={styles.infoLink}
              >
                Open in Maps
              </a>
            </div>
          </div>
        </div>

        <div className={styles.infoCard}>
          <div className={styles.infoItem}>
            <span className={styles.infoIcon}>📞</span>
            <div className={styles.infoContent}>
              <h3 className={styles.infoLabel}>Phone</h3>
              <a href="tel:+15551234567" className={styles.infoValueLink}>
                (555) 123-4567
              </a>
              <p className={styles.infoSubtext}>Tap to call</p>
            </div>
          </div>
        </div>

        <div className={styles.infoCard}>
          <div className={styles.infoItem}>
            <span className={styles.infoIcon}>🕐</span>
            <div className={styles.infoContent}>
              <h3 className={styles.infoLabel}>Hours</h3>
              <div className={styles.hoursGrid}>
                <span>Mon - Fri</span>
                <span>9:00 AM - 7:00 PM</span>
                <span>Saturday</span>
                <span>10:00 AM - 6:00 PM</span>
                <span>Sunday</span>
                <span>Closed</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Social media */}
      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>Follow Us</h2>
        <div className={styles.socialButtons}>
          <a
            href="https://instagram.com/againstdagrain"
            target="_blank"
            rel="noopener noreferrer"
            className={styles.socialButton}
          >
            <span className={styles.socialIcon}>📷</span>
            <span>Instagram</span>
          </a>
          <a
            href="https://facebook.com/againstdagrain"
            target="_blank"
            rel="noopener noreferrer"
            className={styles.socialButton}
          >
            <span className={styles.socialIcon}>👍</span>
            <span>Facebook</span>
          </a>
        </div>
      </div>
    </div>
  );
}
