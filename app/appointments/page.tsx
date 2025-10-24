'use client';

import { useRouter } from 'next/navigation';
import styles from './appointments.module.css';

export default function Appointments() {
  const router = useRouter();

  // TODO: Later this will come from backend/database
  // For now, hardcoded sample appointments
  const appointments = [
    {
      id: 1,
      service: 'Classic Haircut',
      date: '2025-10-24',
      time: '2:00 PM',
      duration: '30 min',
      price: 35,
      numberOfPeople: 1
    }
  ];

  const handleAddToCalendar = (appointment: typeof appointments[0]) => {
    // Create calendar event (iOS/Google Calendar format)
    const title = `${appointment.service} - Against Da Grain`;
    const dateStr = appointment.date.replace(/-/g, '');
    const timeStr = appointment.time.replace(/[:\s]/g, '').replace('PM', '').replace('AM', '');

    // Format: YYYYMMDDTHHMMSS
    const startDateTime = `${dateStr}T${timeStr.padStart(4, '0')}00`;

    // Calculate end time (add duration)
    const durationMins = parseInt(appointment.duration);
    const endDate = new Date(appointment.date + 'T' + appointment.time);
    endDate.setMinutes(endDate.getMinutes() + durationMins);
    const endDateTime = endDate.toISOString().replace(/[-:]/g, '').split('.')[0];

    // Create Google Calendar link
    const googleCalendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(title)}&dates=${startDateTime}/${endDateTime}&details=${encodeURIComponent('Haircut appointment at Against Da Grain')}&location=Against Da Grain Barbershop`;

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
      {appointments.length === 0 ? (
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
                <h3 className={styles.appointmentService}>{appointment.service}</h3>
                <p className={styles.appointmentDetails}>
                  {new Date(appointment.date).toLocaleDateString('en-US', {
                    weekday: 'long',
                    month: 'long',
                    day: 'numeric',
                    year: 'numeric'
                  })}
                </p>
                <p className={styles.appointmentTime}>
                  {appointment.time} • {appointment.duration}
                </p>
                <p className={styles.appointmentPrice}>
                  ${appointment.price} {appointment.numberOfPeople > 1 && `× ${appointment.numberOfPeople} people`}
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
                  onClick={() => {
                    if (confirm('Cancel this appointment?')) {
                      // TODO: Handle cancellation
                      alert('Appointment cancelled');
                    }
                  }}
                >
                  Cancel
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Bottom navigation */}
      <div className={styles.bottomNav}>
        <button
          className={styles.navButton}
          onClick={() => router.push('/services')}
        >
          Book Again
        </button>
      </div>
    </div>
  );
}
