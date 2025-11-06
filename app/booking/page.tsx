'use client';

import { useState, Suspense, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useCart } from '@/contexts/CartContext';
import { auth, db } from '@/lib/firebase';
import { collection, addDoc, query, where, getDocs } from 'firebase/firestore';
import styles from './booking.module.css';

interface ExistingBooking {
  date: string;
  time: string;
  totalDuration: number;
}

function BookingContent() {
  const router = useRouter();
  const { cart, getTotalPrice, getTotalDuration, clearCart } = useCart();
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [bookedSlots, setBookedSlots] = useState<Set<string>>(new Set());

  // Redirect if cart is empty
  useEffect(() => {
    if (cart.length === 0) {
      router.push('/services');
    }
  }, [cart, router]);

  // Fetch booked slots when date changes
  useEffect(() => {
    const fetchBookedSlots = async () => {
      if (!selectedDate) {
        setBookedSlots(new Set());
        return;
      }

      try {
        const q = query(
          collection(db, 'bookings'),
          where('date', '==', selectedDate),
          where('status', '==', 'confirmed')
        );

        const querySnapshot = await getDocs(q);
        const bookings: ExistingBooking[] = [];

        querySnapshot.forEach((doc) => {
          const data = doc.data();
          bookings.push({
            date: data.date,
            time: data.time,
            totalDuration: data.totalDuration,
          });
        });

        // Calculate which time slots are blocked
        const blocked = new Set<string>();
        const allSlots = [
          '9:00 AM', '9:30 AM', '10:00 AM', '10:30 AM',
          '11:00 AM', '11:30 AM', '12:00 PM', '12:30 PM',
          '1:00 PM', '1:30 PM', '2:00 PM', '2:30 PM',
          '3:00 PM', '3:30 PM', '4:00 PM', '4:30 PM',
          '5:00 PM', '5:30 PM', '6:00 PM'
        ];

        // For each existing booking, block overlapping slots
        bookings.forEach((booking) => {
          const bookingStart = parseTime(booking.time);
          const bookingEnd = bookingStart + booking.totalDuration;

          allSlots.forEach((slot) => {
            const slotStart = parseTime(slot);
            const slotEnd = slotStart + getTotalDuration();

            // Check if slots overlap
            if (
              (slotStart >= bookingStart && slotStart < bookingEnd) ||
              (slotEnd > bookingStart && slotEnd <= bookingEnd) ||
              (slotStart <= bookingStart && slotEnd >= bookingEnd)
            ) {
              blocked.add(slot);
            }
          });
        });

        setBookedSlots(blocked);
      } catch (error) {
        console.error('Error fetching booked slots:', error);
      }
    };

    fetchBookedSlots();
  }, [selectedDate, getTotalDuration]);

  // Helper function to parse time to minutes since midnight
  const parseTime = (timeStr: string): number => {
    const match = timeStr.match(/(\d+):(\d+)\s*(AM|PM)/i);
    if (!match) return 0;

    let hours = parseInt(match[1]);
    const minutes = parseInt(match[2]);
    const period = match[3].toUpperCase();

    if (period === 'PM' && hours !== 12) hours += 12;
    if (period === 'AM' && hours === 12) hours = 0;

    return hours * 60 + minutes;
  };

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

  // Available time slots in 30-minute increments
  const availableSlots = [
    '9:00 AM',
    '9:30 AM',
    '10:00 AM',
    '10:30 AM',
    '11:00 AM',
    '11:30 AM',
    '12:00 PM',
    '12:30 PM',
    '1:00 PM',
    '1:30 PM',
    '2:00 PM',
    '2:30 PM',
    '3:00 PM',
    '3:30 PM',
    '4:00 PM',
    '4:30 PM',
    '5:00 PM',
    '5:30 PM',
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
            {availableSlots.map((time) => {
              const isBooked = bookedSlots.has(time);
              return (
                <button
                  key={time}
                  className={`${styles.timeSlot} ${selectedTime === time ? styles.timeSlotActive : ''} ${isBooked ? styles.timeSlotBooked : ''}`}
                  onClick={() => !isBooked && setSelectedTime(time)}
                  disabled={isBooked}
                >
                  {time} {isBooked && '(Booked)'}
                </button>
              );
            })}
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
