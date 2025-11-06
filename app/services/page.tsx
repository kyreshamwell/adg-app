'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { db } from '@/lib/firebase';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { useCart } from '@/contexts/CartContext';
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
  const { addToCart, getItemCount } = useCart();
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

  const handleAddToCart = (service: Service) => {
    addToCart({
      serviceId: service.id,
      serviceName: service.name,
      price: service.price,
      duration: service.duration,
      category: service.category,
    });
  };

  const handleViewCart = () => {
    router.push('/cart');
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div>
          <h1 className={styles.title}>Services</h1>
          <p className={styles.subtitle}>Select services and add to cart</p>
        </div>
        {getItemCount() > 0 && (
          <button className={styles.cartButton} onClick={handleViewCart}>
            Cart ({getItemCount()})
          </button>
        )}
      </header>

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
            >
              <div className={styles.serviceDetails}>
                <h3 className={styles.serviceName}>{service.name}</h3>
                <p className={styles.description}>{service.description}</p>
                <span className={styles.duration}>{service.duration} min</span>
              </div>
              <div className={styles.serviceFooter}>
                <span className={styles.price}>${service.price}</span>
                <button
                  className={styles.addButton}
                  onClick={() => handleAddToCart(service)}
                >
                  Add to Cart
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
