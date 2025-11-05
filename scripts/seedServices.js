// One-time script to populate services collection
// Run with: node scripts/seedServices.js

const { initializeApp, getApps } = require('firebase/app');
const { getFirestore, doc, setDoc } = require('firebase/firestore');

// Your Firebase config (same as in lib/firebase.ts)
const firebaseConfig = {
  apiKey: "AIzaSyCOpHt4w4OYIEaqdLyRycuOTr3nSbtd02k",
  authDomain: "adg-app-2ead0.firebaseapp.com",
  projectId: "adg-app-2ead0",
  storageBucket: "adg-app-2ead0.firebasestorage.app",
  messagingSenderId: "583158452743",
  appId: "1:583158452743:web:a39554695f3fc7ca6110a2",
  measurementId: "G-QZ6HMXK5PZ"
};

// Initialize Firebase
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
const db = getFirestore(app);

// Sample services data
const services = [
  {
    id: 'classic-haircut',
    name: 'Classic Haircut',
    description: 'Traditional haircut with scissors and clippers. Includes wash and style.',
    price: 50,
    duration: 45,
    category: 'haircut',
    active: true,
    imageUrl: '',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    createdBy: 'system', // Since no admin user yet
  },
  {
    id: 'taper-fade',
    name: 'Taper Fade',
    description: 'Precision taper fade with clean lines. Includes wash and style.',
    price: 60,
    duration: 60,
    category: 'haircut',
    active: true,
    imageUrl: '',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    createdBy: 'system',
  },
  {
    id: 'beard-trim',
    name: 'Beard Trim',
    description: 'Shape and trim your beard to perfection. Includes hot towel treatment.',
    price: 30,
    duration: 30,
    category: 'beard',
    active: true,
    imageUrl: '',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    createdBy: 'system',
  },
  {
    id: 'haircut-beard-combo',
    name: 'Haircut + Beard Combo',
    description: 'Complete grooming package. Haircut and beard trim with hot towel.',
    price: 75,
    duration: 75,
    category: 'combo',
    active: true,
    imageUrl: '',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    createdBy: 'system',
  },
];

async function seedServices() {
  console.log('🌱 Starting to seed services...');

  try {
    for (const service of services) {
      const { id, ...serviceData } = service;
      await setDoc(doc(db, 'services', id), serviceData);
      console.log(`✅ Added: ${service.name}`);
    }

    console.log('\n🎉 All services added successfully!');
    console.log('\n📋 Services added:');
    services.forEach(s => {
      console.log(`   - ${s.name}: $${s.price} (${s.duration} min)`);
    });

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding services:', error);
    process.exit(1);
  }
}

seedServices();
