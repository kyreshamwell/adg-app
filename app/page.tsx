'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { auth } from '@/lib/firebase';
import {
  RecaptchaVerifier,
  signInWithPhoneNumber,
  PhoneAuthProvider,
  signInWithCredential
} from 'firebase/auth';
import styles from './page.module.css';

export default function Home() {
  const router = useRouter();
  const [view, setView] = useState<'home' | 'login' | 'signup'>('home');
  const [showLoginVerification, setShowLoginVerification] = useState(false);
  const [showSignupVerification, setShowSignupVerification] = useState(false);

  const [phoneNumber, setPhoneNumber] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [fullName, setFullName] = useState('');
  const [confirmationResult, setConfirmationResult] = useState<any>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Set up reCAPTCHA verifier
  useEffect(() => {
    if (typeof window !== 'undefined') {
      (window as any).recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
        size: 'invisible',
        callback: () => {
          // reCAPTCHA solved
        }
      });
    }
  }, []);

  const handleLoginSendCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const appVerifier = (window as any).recaptchaVerifier;
      const formattedPhone = phoneNumber.startsWith('+') ? phoneNumber : `+1${phoneNumber.replace(/\D/g, '')}`;

      const confirmation = await signInWithPhoneNumber(auth, formattedPhone, appVerifier);
      setConfirmationResult(confirmation);
      setShowLoginVerification(true);
    } catch (err: any) {
      setError(err.message || 'Failed to send code');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSignupSendCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const appVerifier = (window as any).recaptchaVerifier;
      const formattedPhone = phoneNumber.startsWith('+') ? phoneNumber : `+1${phoneNumber.replace(/\D/g, '')}`;

      const confirmation = await signInWithPhoneNumber(auth, formattedPhone, appVerifier);
      setConfirmationResult(confirmation);
      setShowSignupVerification(true);
    } catch (err: any) {
      setError(err.message || 'Failed to send code');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyCode = async () => {
    setError('');
    setLoading(true);

    try {
      await confirmationResult.confirm(verificationCode);
      // Successfully signed in
      router.push('/services');
    } catch (err: any) {
      setError('Invalid verification code');
      console.error(err);
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
      </div>
    );
  }

  return null;
}