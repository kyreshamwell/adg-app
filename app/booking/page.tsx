'use client';

import { useState, Suspense, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useCart } from '@/contexts/CartContext';
import { auth, db } from '@/lib/firebase';
import { collection, addDoc } from 'firebase/firestore';
import styles from './booking.module.css';

function BookingContent() {
  const router = useRouter();
  const { cart, getTotalPrice, getTotalDuration, clearCart } = useCart();
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Redirect if cart is empty
  useEffect(() => {
    if (cart.length === 0) {
      router.push('/services');
    }
  }, [cart, router]);

  // Generate next 7 days
  const getNextWeek = () => {
    const days = [];
    const today = new Date();

    for (let i = 0; i < 7; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      days.push({
        full: date.toISOString().split('T')[0],
        day: date.toLocaleDateString('en-US', { weekday: 'short' }),
        date: date.getDate(),
        month: date.toLocaleDateString('en-US', { month: 'short' })
      });
    }
    return days;
  };

  // Sample available time slots (later from backend)
  const availableSlots = [
    '9:00 AM',
    '10:00 AM',
    '11:00 AM',
    '12:00 PM',
    '1:00 PM',
    '2:00 PM',
    '3:00 PM',
    '4:00 PM',
    '5:00 PM',
    '6:00 PM'
  ];

  const week = getNextWeek();

  const handleBooking = async () => {
    if (!selectedDate || !selectedTime || cart.length === 0) return;

    const user = auth.currentUser;
    if (!user) {
      alert('Please log in to book an appointment');
      router.push('/');
      return;
    }

    setLoading(true);

    try {
      // Create booking document
      await addDoc(collection(db, 'bookings'), {
        userId: user.uid,
        phoneNumber: user.phoneNumber,
        date: selectedDate,
        time: selectedTime,
        status: 'confirmed',
        items: cart.map(item => ({
          serviceId: item.serviceId,
          serviceName: item.serviceName,
          price: item.price,
          duration: item.duration,
          category: item.category,
        })),
        totalPrice: getTotalPrice(),
        totalDuration: getTotalDuration(),
        createdAt: new Date().toISOString(),
      });

      // Clear cart after successful booking
      clearCart();

      // Navigate to appointments
      router.push('/appointments');
    } catch (error) {
      console.error('Error creating booking:', error);
      alert('Failed to create booking. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      {/* Header */}
      <header className={styles.header}>
        <button className={styles.backButton} onClick={() => router.push('/cart')}>
          ← Back
        </button>
        <div className={styles.serviceInfo}>
          <h1 className={styles.serviceName}>Book Appointment</h1>
          <p className={styles.serviceDetails}>
            {cart.length} {cart.length === 1 ? 'service' : 'services'} • ${getTotalPrice()} • {getTotalDuration()} min
          </p>
        </div>
      </header>

      {/* Cart Summary */}
      <div className={styles.cartSummary}>
        <h2 className={styles.sectionTitle}>Your Services</h2>
        <div className={styles.servicesList}>
          {cart.map((item) => (
            <div key={item.id} className={styles.serviceItem}>
              <span className={styles.serviceItemName}>{item.serviceName}</span>
              <span className={styles.serviceItemPrice}>${item.price}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Week view */}
      <div className={styles.weekContainer}>
        <h2 className={styles.sectionTitle}>Select Date</h2>
        <div className={styles.weekGrid}>
          {week.map((day) => (
            <button
              key={day.full}
              className={`${styles.dayCard} ${selectedDate === day.full ? styles.dayCardActive : ''}`}
              onClick={() => setSelectedDate(day.full)}
            >
              <span className={styles.dayName}>{day.day}</span>
              <span className={styles.dayDate}>{day.date}</span>
              <span className={styles.dayMonth}>{day.month}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Time slots */}
      {selectedDate && (
        <div className={styles.timeSlotsContainer}>
          <h2 className={styles.sectionTitle}>Select Time</h2>
          <div className={styles.timeSlots}>
            {availableSlots.map((time) => (
              <button
                key={time}
                className={`${styles.timeSlot} ${selectedTime === time ? styles.timeSlotActive : ''}`}
                onClick={() => setSelectedTime(time)}
              >
                {time}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Book button */}
      {selectedDate && selectedTime && (
        <div className={styles.bookButtonContainer}>
          <button
            className={styles.bookButton}
            onClick={handleBooking}
            disabled={loading}
          >
            {loading ? 'Booking...' : 'Confirm Booking'}
          </button>
        </div>
      )}
    </div>
  );
}

export default function Booking() {
  return (
    <Suspense fallback={<div className={styles.container}>Loading...</div>}>
      <BookingContent />
    </Suspense>
  );
}
