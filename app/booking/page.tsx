'use client';

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import styles from './booking.module.css';

function BookingContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const serviceName = searchParams.get('service') || 'Service';
  const servicePrice = searchParams.get('price') || '0';
  const serviceDuration = searchParams.get('duration') || '0 min';
  const numberOfPeople = parseInt(searchParams.get('people') || '1');

  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);

  // Calculate total duration (30 min per person)
  const durationMinutes = parseInt(serviceDuration.split(' ')[0]);
  const totalMinutes = durationMinutes * numberOfPeople;
  const totalDuration = `${totalMinutes} min`;

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

  const handleBooking = () => {
    if (selectedDate && selectedTime) {
      const totalPrice = parseInt(servicePrice) * numberOfPeople;
      // TODO: Save booking to backend/database
      // For now, just navigate to appointments page
      router.push('/appointments');
    }
  };

  return (
    <div className={styles.container}>
      {/* Header */}
      <header className={styles.header}>
        <button className={styles.backButton} onClick={() => window.history.back()}>
          ← Back
        </button>
        <div className={styles.serviceInfo}>
          <h1 className={styles.serviceName}>{serviceName}</h1>
          <p className={styles.serviceDetails}>
            ${servicePrice} × {numberOfPeople} {numberOfPeople > 1 ? 'people' : 'person'} • {totalDuration}
          </p>
        </div>
      </header>

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
          <button className={styles.bookButton} onClick={handleBooking}>
            Confirm Booking
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
