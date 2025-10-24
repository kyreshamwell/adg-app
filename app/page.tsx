'use client';

import { useState } from 'react';
import styles from './page.module.css';

export default function Home() {
  const [view, setView] = useState<'home' | 'login' | 'signup'>('home');
  const [showLoginVerification, setShowLoginVerification] = useState(false);
  const [showSignupVerification, setShowSignupVerification] = useState(false);

  const handleLoginSendCode = (e: React.FormEvent) => {
    e.preventDefault();
    setShowLoginVerification(true);
  };

  const handleSignupSendCode = (e: React.FormEvent) => {
    e.preventDefault();
    setShowSignupVerification(true);
  };

  // Home view - show title and options
  if (view === 'home') {
    return (
      <div className={styles.container}>
        <div className={styles.title}>
          <h1>Against</h1>
          <h1>Da</h1>
          <h1>Grain</h1>
        </div>

        <div className={styles.optionsStack}>
          <button
            className={styles.optionButton}
            onClick={() => setView('signup')}
          >
            Sign Up
          </button>
          <button
            className={styles.optionButton}
            onClick={() => setView('login')}
          >
            Login
          </button>
        </div>
      </div>
    );
  }

  // Login view - phone number and verification
  if (view === 'login') {
    return (
      <div className={styles.container}>
        <div className={styles.formBox}>
          <h2 className={styles.formHeading}>Login</h2>

          <form className={styles.form} onSubmit={handleLoginSendCode}>
            <div className={styles.inputGroup}>
              <label htmlFor="login-phone" className={styles.label}>Phone Number</label>
              <input
                id="login-phone"
                type="tel"
                placeholder="(555) 123-4567"
                className={styles.input}
              />
            </div>

            {!showLoginVerification ? (
              <button type="submit" className={styles.submitButton}>
                Send Code
              </button>
            ) : (
              <>
                <div className={styles.inputGroup}>
                  <label htmlFor="login-code" className={styles.label}>Verification Code</label>
                  <input
                    id="login-code"
                    type="text"
                    placeholder="Enter code"
                    className={styles.input}
                  />
                </div>

                <button type="button" className={styles.submitButton}>
                  Sign In
                </button>
              </>
            )}

            <button
              type="button"
              className={styles.backButton}
              onClick={() => setView('home')}
            >
              Back
            </button>
          </form>
        </div>
      </div>
    );
  }

  // Sign Up view - name, phone, and verification
  if (view === 'signup') {
    return (
      <div className={styles.container}>
        <div className={styles.formBox}>
          <h2 className={styles.formHeading}>Sign Up</h2>

          <form className={styles.form} onSubmit={handleSignupSendCode}>
            <div className={styles.inputGroup}>
              <label htmlFor="signup-name" className={styles.label}>Full Name</label>
              <input
                id="signup-name"
                type="text"
                placeholder="John Doe"
                className={styles.input}
              />
            </div>

            <div className={styles.inputGroup}>
              <label htmlFor="signup-phone" className={styles.label}>Phone Number</label>
              <input
                id="signup-phone"
                type="tel"
                placeholder="(555) 123-4567"
                className={styles.input}
              />
            </div>

            {!showSignupVerification ? (
              <button type="submit" className={styles.submitButton}>
                Send Code
              </button>
            ) : (
              <>
                <div className={styles.inputGroup}>
                  <label htmlFor="signup-code" className={styles.label}>Verification Code</label>
                  <input
                    id="signup-code"
                    type="text"
                    placeholder="Enter code"
                    className={styles.input}
                  />
                </div>

                <button type="button" className={styles.submitButton}>
                  Create Account
                </button>
              </>
            )}

            <button
              type="button"
              className={styles.backButton}
              onClick={() => setView('home')}
            >
              Back
            </button>
          </form>
        </div>
      </div>
    );
  }

  return null;
}