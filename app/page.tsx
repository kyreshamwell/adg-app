'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { auth, db } from '@/lib/firebase';
import {
  RecaptchaVerifier,
  signInWithPhoneNumber,
  PhoneAuthProvider,
  signInWithCredential,
  ConfirmationResult
} from 'firebase/auth';
import { FirebaseError } from 'firebase/app';

// Extend Window interface to include recaptchaVerifier
declare global {
  interface Window {
    recaptchaVerifier?: RecaptchaVerifier;
  }
}
import { doc, setDoc } from 'firebase/firestore';
import styles from './page.module.css';

export default function Home() {
  const router = useRouter();
  const [view, setView] = useState<'home' | 'login' | 'signup'>('home');
  const [showLoginVerification, setShowLoginVerification] = useState(false);
  const [showSignupVerification, setShowSignupVerification] = useState(false);

  const [phoneNumber, setPhoneNumber] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [fullName, setFullName] = useState('');
  const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Set up reCAPTCHA verifier - recreate when view changes
  useEffect(() => {
    if (typeof window !== 'undefined' && (view === 'login' || view === 'signup')) {
      // Clear the reCAPTCHA container element completely
      const container = document.getElementById('recaptcha-container');
      if (container) {
        container.innerHTML = '';
      }

      // Clear existing verifier if it exists
      if (window.recaptchaVerifier) {
        try {
          window.recaptchaVerifier.clear();
          delete window.recaptchaVerifier;
        } catch (e) {
          // Ignore if already cleared
        }
      }

      // Create new verifier only if it doesn't exist
      if (!window.recaptchaVerifier) {
        window.recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
          size: 'invisible',
          callback: () => {
            // reCAPTCHA solved
          }
        });
      }
    }

    // Cleanup function
    return () => {
      if (window.recaptchaVerifier) {
        try {
          window.recaptchaVerifier.clear();
          delete window.recaptchaVerifier;
        } catch (e) {
          // Ignore errors during cleanup
        }
      }
    };
  }, [view]);

  const handleLoginSendCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const appVerifier = window.recaptchaVerifier;
      if (!appVerifier) {
        setError('reCAPTCHA not initialized. Please refresh the page.');
        return;
      }

      const formattedPhone = phoneNumber.startsWith('+') ? phoneNumber : `+1${phoneNumber.replace(/\D/g, '')}`;

      const confirmation = await signInWithPhoneNumber(auth, formattedPhone, appVerifier);
      setConfirmationResult(confirmation);
      setShowLoginVerification(true);
    } catch (err) {
      console.error('Firebase Auth Error:', err);

      // Type guard to check if it's a FirebaseError
      if (err instanceof FirebaseError) {
        if (err.code === 'auth/billing-not-enabled') {
          setError('Billing not enabled. Please: 1) Enable billing in Firebase Console, 2) Enable Phone Authentication in Authentication > Sign-in method, 3) Wait 5-10 minutes for activation.');
        } else if (err.code === 'auth/quota-exceeded') {
          setError('SMS quota exceeded. Please check your Firebase billing.');
        } else if (err.code === 'auth/invalid-phone-number') {
          setError('Invalid phone number format. Please include country code (e.g., +15551234567)');
        } else {
          setError(err.message || `Failed to send code. Error: ${err.code || 'Unknown'}`);
        }
      } else {
        setError('An unexpected error occurred. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSignupSendCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const appVerifier = window.recaptchaVerifier;
      if (!appVerifier) {
        setError('reCAPTCHA not initialized. Please refresh the page.');
        return;
      }

      const formattedPhone = phoneNumber.startsWith('+') ? phoneNumber : `+1${phoneNumber.replace(/\D/g, '')}`;

      const confirmation = await signInWithPhoneNumber(auth, formattedPhone, appVerifier);
      setConfirmationResult(confirmation);
      setShowSignupVerification(true);
    } catch (err) {
      console.error('Firebase Auth Error:', err);

      // Type guard to check if it's a FirebaseError
      if (err instanceof FirebaseError) {
        if (err.code === 'auth/billing-not-enabled') {
          setError('Billing not enabled. Please: 1) Enable billing in Firebase Console, 2) Enable Phone Authentication in Authentication > Sign-in method, 3) Wait 5-10 minutes for activation.');
        } else if (err.code === 'auth/quota-exceeded') {
          setError('SMS quota exceeded. Please check your Firebase billing.');
        } else if (err.code === 'auth/invalid-phone-number') {
          setError('Invalid phone number format. Please include country code (e.g., +15551234567)');
        } else {
          setError(err.message || `Failed to send code. Error: ${err.code || 'Unknown'}`);
        }
      } else {
        setError('An unexpected error occurred. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyCode = async () => {
    setError('');
    setLoading(true);

    try {
      // Check if confirmationResult exists
      if (!confirmationResult) {
        setError('No confirmation result found. Please request a new code.');
        return;
      }

      // Verify the SMS code and sign in
      const userCredential = await confirmationResult.confirm(verificationCode);
      const user = userCredential.user;

      // If this is signup (not login), save user data to Firestore
      if (view === 'signup' && fullName) {
        await setDoc(doc(db, 'users', user.uid), {
          fullName: fullName,
          phoneNumber: user.phoneNumber,
          createdAt: new Date().toISOString(),
        });
      }

      // Successfully signed in
      router.push('/services');
    } catch (err) {
      console.error('Verification Error:', err);

      // Type guard to check if it's a FirebaseError
      if (err instanceof FirebaseError) {
        if (err.code === 'auth/invalid-verification-code') {
          setError('Invalid verification code. Please check and try again.');
        } else if (err.code === 'auth/code-expired') {
          setError('Verification code expired. Please request a new code.');
        } else {
          setError(err.message || 'Failed to verify code.');
        }
      } else {
        setError('Invalid verification code');
      }
    } finally {
      setLoading(false);
    }
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

        {/* Hidden reCAPTCHA container */}
        <div id="recaptcha-container"></div>
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
            {error && <p style={{ color: '#ff3b30', fontSize: '0.875rem', margin: '0 0 1rem 0' }}>{error}</p>}

            <div className={styles.inputGroup}>
              <label htmlFor="login-phone" className={styles.label}>Phone Number</label>
              <input
                id="login-phone"
                type="tel"
                placeholder="5551234567"
                className={styles.input}
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                disabled={showLoginVerification}
              />
            </div>

            {!showLoginVerification ? (
              <button type="submit" className={styles.submitButton} disabled={loading}>
                {loading ? 'Sending...' : 'Send Code'}
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
                    value={verificationCode}
                    onChange={(e) => setVerificationCode(e.target.value)}
                  />
                </div>

                <button
                  type="button"
                  className={styles.submitButton}
                  onClick={handleVerifyCode}
                  disabled={loading}
                >
                  {loading ? 'Verifying...' : 'Sign In'}
                </button>
              </>
            )}

            <button
              type="button"
              className={styles.backButton}
              onClick={() => {
                setView('home');
                setShowLoginVerification(false);
                setPhoneNumber('');
                setVerificationCode('');
                setError('');
              }}
            >
              Back
            </button>
          </form>
        </div>

        {/* Hidden reCAPTCHA container */}
        <div id="recaptcha-container"></div>
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
            {error && <p style={{ color: '#ff3b30', fontSize: '0.875rem', margin: '0 0 1rem 0' }}>{error}</p>}

            <div className={styles.inputGroup}>
              <label htmlFor="signup-name" className={styles.label}>Full Name</label>
              <input
                id="signup-name"
                type="text"
                placeholder="John Doe"
                className={styles.input}
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                disabled={showSignupVerification}
              />
            </div>

            <div className={styles.inputGroup}>
              <label htmlFor="signup-phone" className={styles.label}>Phone Number</label>
              <input
                id="signup-phone"
                type="tel"
                placeholder="5551234567"
                className={styles.input}
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                disabled={showSignupVerification}
              />
            </div>

            {!showSignupVerification ? (
              <button type="submit" className={styles.submitButton} disabled={loading}>
                {loading ? 'Sending...' : 'Send Code'}
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
                    value={verificationCode}
                    onChange={(e) => setVerificationCode(e.target.value)}
                  />
                </div>

                <button
                  type="button"
                  className={styles.submitButton}
                  onClick={handleVerifyCode}
                  disabled={loading}
                >
                  {loading ? 'Creating Account...' : 'Create Account'}
                </button>
              </>
            )}

            <button
              type="button"
              className={styles.backButton}
              onClick={() => {
                setView('home');
                setShowSignupVerification(false);
                setPhoneNumber('');
                setVerificationCode('');
                setFullName('');
                setError('');
              }}
            >
              Back
            </button>
          </form>
        </div>

        {/* Hidden reCAPTCHA container */}
        <div id="recaptcha-container"></div>
      </div>
    );
  }

  return null;
}