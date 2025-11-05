'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { db } from '@/lib/firebase';
import { collection, getDocs, query, where } from 'firebase/firestore';
import styles from './services.module.css';

interface Service {
  id: string;
  name: string;
  description: string;
  price: number;
  duration: number;
  category: string;
  active: boolean;
}

export default function Services() {
  const router = useRouter();
  const [numberOfPeople, setNumberOfPeople] = useState(1);
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch services from Firestore on component mount
  useEffect(() => {
    const fetchServices = async () => {
      try {
        // Query only active services
        const q = query(
          collection(db, 'services'),
          where('active', '==', true)
        );

        const querySnapshot = await getDocs(q);
        const servicesData: Service[] = [];

        querySnapshot.forEach((doc) => {
          servicesData.push({
            id: doc.id,
            ...doc.data()
          } as Service);
        });

        setServices(servicesData);
      } catch (error) {
        console.error('Error fetching services:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchServices();
  }, []);

  const handleServiceClick = (serviceId: string) => {
    const service = services.find(s => s.id === serviceId);
    if (service) {
      // Navigate to booking page with service details and number of people
      router.push(`/booking?service=${encodeURIComponent(service.name)}&price=${service.price}&duration=${service.duration}&people=${numberOfPeople}`);
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
        {loading ? (
          <p style={{ textAlign: 'center', width: '100%', padding: '2rem' }}>Loading services...</p>
        ) : services.length === 0 ? (
          <p style={{ textAlign: 'center', width: '100%', padding: '2rem' }}>No services available</p>
        ) : (
          services.map((service) => (
            <div
              key={service.id}
              className={styles.serviceCard}
              onClick={() => handleServiceClick(service.id)}
            >
              <div className={styles.serviceDetails}>
                <h3 className={styles.serviceName}>{service.name}</h3>
                <span className={styles.duration}>{service.duration} min</span>
              </div>
              <span className={styles.price}>${service.price}</span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
