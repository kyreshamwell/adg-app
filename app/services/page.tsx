'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import styles from './services.module.css';

// Sample services data (later this will come from backend)
const services = [
  {
    id: 1,
    name: 'Classic Haircut',
    price: 35,
    duration: '30 min'
  },
  {
    id: 2,
    name: 'Fade',
    price: 40,
    duration: '45 min'
  },
  {
    id: 3,
    name: 'Beard Trim',
    price: 20,
    duration: '20 min'
  },
  {
    id: 4,
    name: 'Haircut + Beard',
    price: 50,
    duration: '50 min'
  },
  {
    id: 5,
    name: 'Hot Towel Shave',
    price: 45,
    duration: '40 min'
  },
  {
    id: 6,
    name: 'Kids Haircut',
    price: 25,
    duration: '25 min'
  }
];

export default function Services() {
  const router = useRouter();
  const [numberOfPeople, setNumberOfPeople] = useState(1);

  const handleServiceClick = (serviceId: number) => {
    const service = services.find(s => s.id === serviceId);
    if (service) {
      // Navigate to booking page with service details and number of people
      router.push(`/booking?service=${encodeURIComponent(service.name)}&price=${service.price}&duration=${encodeURIComponent(service.duration)}&people=${numberOfPeople}`);
    }
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.title}>Services</h1>
        <p className={styles.subtitle}>Choose your service</p>
      </header>

      {/* Number of people selector */}
      <div className={styles.peopleSelector}>
        <span className={styles.peopleSelectorLabel}>Number of people</span>
        <div className={styles.peopleSelectorButtons}>
          <button
            className={styles.peopleSelectorButton}
            onClick={() => setNumberOfPeople(Math.max(1, numberOfPeople - 1))}
            disabled={numberOfPeople === 1}
          >
            −
          </button>
          <span className={styles.peopleSelectorCount}>{numberOfPeople}</span>
          <button
            className={styles.peopleSelectorButton}
            onClick={() => setNumberOfPeople(Math.min(5, numberOfPeople + 1))}
            disabled={numberOfPeople === 5}
          >
            +
          </button>
        </div>
      </div>

      <div className={styles.servicesGrid}>
        {services.map((service) => (
          <div
            key={service.id}
            className={styles.serviceCard}
            onClick={() => handleServiceClick(service.id)}
          >
            <div className={styles.serviceDetails}>
              <h3 className={styles.serviceName}>{service.name}</h3>
              <span className={styles.duration}>{service.duration}</span>
            </div>
            <span className={styles.price}>${service.price}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
