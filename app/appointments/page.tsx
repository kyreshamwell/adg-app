'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { auth, db } from '@/lib/firebase';
import { collection, query, where, getDocs, deleteDoc, doc } from 'firebase/firestore';
import styles from './appointments.module.css';

interface BookingItem {
  serviceId: string;
  serviceName: string;
  price: number;
  duration: number;
  category: string;
}

interface Appointment {
  id: string;
  userId: string;
  phoneNumber: string;
  date: string;
  time: string;
  status: string;
  items: BookingItem[];
  totalPrice: number;
  totalDuration: number;
  createdAt: string;
}

export default function Appointments() {
  const router = useRouter();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch appointments on mount
  useEffect(() => {
    const fetchAppointments = async () => {
      const user = auth.currentUser;
      if (!user) {
        router.push('/');
        return;
      }

      try {
        // Simple query without orderBy to avoid index requirement
        const q = query(
          collection(db, 'bookings'),
          where('userId', '==', user.uid)
        );

        const querySnapshot = await getDocs(q);
        const bookings: Appointment[] = [];

        querySnapshot.forEach((docSnap) => {
          bookings.push({
            id: docSnap.id,
            ...docSnap.data()
          } as Appointment);
        });

        // Sort in JavaScript instead of Firestore
        bookings.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

        setAppointments(bookings);
      } catch (error) {
        console.error('Error fetching appointments:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAppointments();
  }, [router]);

  const handleCancelAppointment = async (appointmentId: string) => {
    if (!confirm('Cancel this appointment?')) return;

    try {
      await deleteDoc(doc(db, 'bookings', appointmentId));
      // Remove from local state
      setAppointments(prev => prev.filter(apt => apt.id !== appointmentId));
      alert('Appointment cancelled');
    } catch (error) {
      console.error('Error cancelling appointment:', error);
      alert('Failed to cancel appointment');
    }
  };

  const handleAddToCalendar = (appointment: Appointment) => {
    const servicesTitle = appointment.items.map(item => item.serviceName).join(', ');
    const title = `${servicesTitle} - Against Da Grain`;

    // Format date for calendar (YYYYMMDD)
    const dateStr = appointment.date.replace(/-/g, '');

    // Parse time (e.g., "2:00 PM" or "10:00 AM")
    const timeMatch = appointment.time.match(/(\d+):(\d+)\s*(AM|PM)/i);
    if (!timeMatch) {
      alert('Invalid time format');
      return;
    }

    let hours = parseInt(timeMatch[1]);
    const minutes = timeMatch[2];
    const period = timeMatch[3].toUpperCase();

    // Convert to 24-hour format
    if (period === 'PM' && hours !== 12) hours += 12;
    if (period === 'AM' && hours === 12) hours = 0;

    const startTime = `${hours.toString().padStart(2, '0')}${minutes}00`;
    const startDateTime = `${dateStr}T${startTime}`;

    // Calculate end time (add totalDuration minutes)
    const endDate = new Date(appointment.date);
    const [h, m] = [hours, parseInt(minutes)];
    endDate.setHours(h, m + appointment.totalDuration);
    const endDateTime = endDate.toISOString().replace(/[-:]/g, '').split('.')[0];

    // Service items list for description
    const servicesList = appointment.items
      .map(item => `• ${item.serviceName} ($${item.price})`)
      .join('%0A');

    const description = `${servicesList}%0A%0ATotal: $${appointment.totalPrice}%0ADuration: ${appointment.totalDuration} min`;

    // Create Google Calendar URL
    const googleCalendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(title)}&dates=${startDateTime}/${endDateTime}&details=${description}&location=Against%20Da%20Grain%20Barbershop`;

    window.open(googleCalendarUrl, '_blank');
  };

  return (
    <div className={styles.container}>
      {/* Header */}
      <header className={styles.header}>
        <h1 className={styles.title}>Appointments</h1>
        <p className={styles.subtitle}>Your upcoming bookings</p>
      </header>

      {/* Appointments list */}
      {loading ? (
        <div className={styles.emptyState}>
          <p className={styles.emptyText}>Loading appointments...</p>
        </div>
      ) : appointments.length === 0 ? (
        <div className={styles.emptyState}>
          <p className={styles.emptyText}>No upcoming appointments</p>
          <button
            className={styles.bookButton}
            onClick={() => router.push('/services')}
          >
            Book Now
          </button>
        </div>
      ) : (
        <div className={styles.appointmentsList}>
          {appointments.map((appointment) => (
            <div key={appointment.id} className={styles.appointmentCard}>
              <div className={styles.appointmentInfo}>
                <h3 className={styles.appointmentService}>
                  {appointment.items.map(item => item.serviceName).join(' + ')}
                </h3>
                <p className={styles.appointmentDetails}>
                  {new Date(appointment.date).toLocaleDateString('en-US', {
                    weekday: 'long',
                    month: 'long',
                    day: 'numeric',
                    year: 'numeric'
                  })}
                </p>
                <p className={styles.appointmentTime}>
                  {appointment.time} • {appointment.totalDuration} min
                </p>
                <div className={styles.serviceItems}>
                  {appointment.items.map((item, index) => (
                    <p key={index} className={styles.serviceItem}>
                      • {item.serviceName} (${item.price})
                    </p>
                  ))}
                </div>
                <p className={styles.appointmentPrice}>
                  Total: ${appointment.totalPrice}
                </p>
              </div>

              <div className={styles.appointmentActions}>
                <button
                  className={styles.calendarButton}
                  onClick={() => handleAddToCalendar(appointment)}
                >
                  Add to Calendar
                </button>
                <button
                  className={styles.cancelButton}
                  onClick={() => handleCancelAppointment(appointment.id)}
                >
                  Cancel
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
