'use client';

import { useRouter } from 'next/navigation';
import { useCart } from '@/contexts/CartContext';
import styles from './cart.module.css';

export default function Cart() {
  const router = useRouter();
  const { cart, removeFromCart, clearCart, getTotalPrice, getTotalDuration } = useCart();

  const handleContinueShopping = () => {
    router.push('/services');
  };

  const handleProceedToBooking = () => {
    if (cart.length === 0) return;
    router.push('/booking');
  };

  if (cart.length === 0) {
    return (
      <div className={styles.container}>
        <header className={styles.header}>
          <h1 className={styles.title}>Cart</h1>
        </header>

        <div className={styles.emptyCart}>
          <div className={styles.emptyIcon}>🛒</div>
          <h2 className={styles.emptyTitle}>Your cart is empty</h2>
          <p className={styles.emptyText}>Add services to get started</p>
          <button className={styles.continueButton} onClick={handleContinueShopping}>
            Browse Services
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.title}>Cart ({cart.length})</h1>
        <button className={styles.clearButton} onClick={clearCart}>
          Clear All
        </button>
      </header>

      <div className={styles.cartItems}>
        {cart.map((item) => (
          <div key={item.id} className={styles.cartItem}>
            <div className={styles.itemDetails}>
              <h3 className={styles.itemName}>{item.serviceName}</h3>
              <span className={styles.itemDuration}>{item.duration} min</span>
            </div>
            <div className={styles.itemFooter}>
              <span className={styles.itemPrice}>${item.price}</span>
              <button
                className={styles.removeButton}
                onClick={() => removeFromCart(item.id)}
              >
                Remove
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className={styles.summary}>
        <div className={styles.summaryRow}>
          <span className={styles.summaryLabel}>Total Duration</span>
          <span className={styles.summaryValue}>{getTotalDuration()} min</span>
        </div>
        <div className={styles.summaryRow}>
          <span className={styles.summaryLabel}>Total Price</span>
          <span className={styles.summaryPrice}>${getTotalPrice()}</span>
        </div>
      </div>

      <div className={styles.actions}>
        <button className={styles.continueButton} onClick={handleContinueShopping}>
          Add More Services
        </button>
        <button className={styles.bookButton} onClick={handleProceedToBooking}>
          Proceed to Booking
        </button>
      </div>
    </div>
  );
}
