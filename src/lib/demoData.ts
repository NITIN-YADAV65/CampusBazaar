import type { Listing, Category } from './database.types';

export const DEMO_CATEGORIES: Category[] = [
  { id: 'books', name: 'Books & Study Material', slug: 'books', icon: 'BookOpen', itemCount: 42 },
  { id: 'electronics', name: 'Electronics', slug: 'electronics', icon: 'Cpu', itemCount: 31 },
  { id: 'mobiles', name: 'Mobiles', slug: 'mobiles', icon: 'Smartphone', itemCount: 19 },
  { id: 'laptops', name: 'Laptops', slug: 'laptops', icon: 'Laptop', itemCount: 15 },
  { id: 'cycles', name: 'Cycles', slug: 'cycles', icon: 'Bike', itemCount: 27 },
  { id: 'furniture', name: 'Furniture', slug: 'furniture', icon: 'Armchair', itemCount: 18 },
  { id: 'hostel', name: 'Hostel Essentials', slug: 'hostel', icon: 'Home', itemCount: 35 },
  { id: 'fashion', name: 'Fashion', slug: 'fashion', icon: 'Shirt', itemCount: 22 },
  { id: 'sports', name: 'Sports', slug: 'sports', icon: 'Trophy', itemCount: 14 },
  { id: 'accessories', name: 'Accessories', slug: 'accessories', icon: 'Watch', itemCount: 20 },
  { id: 'vehicles', name: 'Vehicles', slug: 'vehicles', icon: 'Car', itemCount: 8 },
  { id: 'other', name: 'Other', slug: 'other', icon: 'Package', itemCount: 11 },
];

export const DEMO_LISTINGS: Listing[] = [
  {
    id: 'demo-1',
    seller_id: 'seller-1',
    title: 'Engineering Mathematics (Advanced - B.S. Grewal)',
    description: 'B.Tech 1st & 2nd year standard reference book. In great condition with highlighted formula summaries and no torn pages. Perfect for semester exams.',
    price: 350,
    condition: 'Good',
    category_id: 'books',
    location: 'UniMall / Block 34, LPU Campus',
    contact_preference: 'Chat or Call',
    status: 'active',
    views_count: 124,
    created_at: new Date(Date.now() - 3600000 * 4).toISOString(),
    updated_at: new Date(Date.now() - 3600000 * 4).toISOString(),
    seller: {
      id: 'seller-1',
      full_name: 'Aarav Sharma',
      phone: '+91 98765 43210',
      avatar_url: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80',
      role: 'user',
      created_at: '2024-01-15T10:00:00Z',
      updated_at: '2024-01-15T10:00:00Z',
      bio: 'Final year CSE student at LPU. Selling semester textbooks and accessories.'
    },
    images: [
      {
        id: 'img-1',
        listing_id: 'demo-1',
        image_url: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=800&q=80',
        position: 0,
        created_at: new Date().toISOString()
      },
      {
        id: 'img-1-2',
        listing_id: 'demo-1',
        image_url: 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&w=800&q=80',
        position: 1,
        created_at: new Date().toISOString()
      }
    ]
  },
  {
    id: 'demo-2',
    seller_id: 'seller-2',
    title: 'Casio fx-991EX ClassWiz Scientific Calculator',
    description: 'High-res natural textbook display, 552 functions including matrix, vectors, and spreadsheets. Allowed in campus exams. Battery recently replaced.',
    price: 700,
    condition: 'Like New',
    category_id: 'electronics',
    location: 'Boys Hostel BH-4, LPU',
    contact_preference: 'Chat',
    status: 'active',
    views_count: 89,
    created_at: new Date(Date.now() - 3600000 * 8).toISOString(),
    updated_at: new Date(Date.now() - 3600000 * 8).toISOString(),
    seller: {
      id: 'seller-2',
      full_name: 'Rohan Mehra',
      phone: '+91 98111 22233',
      avatar_url: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=150&q=80',
      role: 'user',
      created_at: '2024-02-10T10:00:00Z',
      updated_at: '2024-02-10T10:00:00Z',
      bio: 'ECE 3rd year. Gadget lover.'
    },
    images: [
      {
        id: 'img-2',
        listing_id: 'demo-2',
        image_url: 'https://images.unsplash.com/photo-1594980596870-8aa52a78d8cd?auto=format&fit=crop&w=800&q=80',
        position: 0,
        created_at: new Date().toISOString()
      }
    ]
  },
  {
    id: 'demo-3',
    seller_id: 'seller-3',
    title: 'Hero Sprint 26T Mountain Bicycle with Lock & Helmet',
    description: 'Dual suspension mountain cycle with front disc brake and mudguards. Serviced last month. Smooth gears, ideal for travelling between UniMall and hostels.',
    price: 4500,
    condition: 'Good',
    category_id: 'cycles',
    location: 'Law Gate / Main Campus Gate',
    contact_preference: 'Chat or Phone',
    status: 'active',
    views_count: 215,
    created_at: new Date(Date.now() - 3600000 * 20).toISOString(),
    updated_at: new Date(Date.now() - 3600000 * 20).toISOString(),
    seller: {
      id: 'seller-3',
      full_name: 'Pooja Verma',
      phone: '+91 97234 56789',
      avatar_url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80',
      role: 'user',
      created_at: '2023-11-20T10:00:00Z',
      updated_at: '2023-11-20T10:00:00Z',
      bio: 'Architecture student at LPU.'
    },
    images: [
      {
        id: 'img-3',
        listing_id: 'demo-3',
        image_url: 'https://images.unsplash.com/photo-1485965120184-e220f721d03e?auto=format&fit=crop&w=800&q=80',
        position: 0,
        created_at: new Date().toISOString()
      },
      {
        id: 'img-3-2',
        listing_id: 'demo-3',
        image_url: 'https://images.unsplash.com/photo-1532298229144-0ec0c57515c7?auto=format&fit=crop&w=800&q=80',
        position: 1,
        created_at: new Date().toISOString()
      }
    ]
  },
  {
    id: 'demo-4',
    seller_id: 'seller-4',
    title: 'Ergonomic Wooden Study Table with Bookshelf Rack',
    description: 'Compact wooden desk with pre-fitted upper shelves and cable grommet. Fits nicely inside hostel rooms. Solid condition, no wobbling.',
    price: 1200,
    condition: 'Like New',
    category_id: 'furniture',
    location: 'Girls Hostel GH-2, LPU',
    contact_preference: 'Chat',
    status: 'active',
    views_count: 142,
    created_at: new Date(Date.now() - 3600000 * 30).toISOString(),
    updated_at: new Date(Date.now() - 3600000 * 30).toISOString(),
    seller: {
      id: 'seller-4',
      full_name: 'Simran Kaur',
      phone: '+91 98450 11223',
      avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
      role: 'user',
      created_at: '2024-01-05T10:00:00Z',
      updated_at: '2024-01-05T10:00:00Z'
    },
    images: [
      {
        id: 'img-4',
        listing_id: 'demo-4',
        image_url: 'https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?auto=format&fit=crop&w=800&q=80',
        position: 0,
        created_at: new Date().toISOString()
      }
    ]
  },
  {
    id: 'demo-5',
    seller_id: 'seller-5',
    title: 'Redragon K552 Mechanical Gaming Keyboard (RGB, Blue Switches)',
    description: 'Compact 87-key tenkeyless layout, mechanical switches with tactile click sound, rainbow RGB backlighting. Original box and keycap puller included.',
    price: 1800,
    condition: 'Good',
    category_id: 'electronics',
    location: 'Boys Hostel BH-2, LPU',
    contact_preference: 'Chat',
    status: 'active',
    views_count: 178,
    created_at: new Date(Date.now() - 3600000 * 48).toISOString(),
    updated_at: new Date(Date.now() - 3600000 * 48).toISOString(),
    seller: {
      id: 'seller-5',
      full_name: 'Vikramaditya Roy',
      phone: '+91 98777 88990',
      avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80',
      role: 'user',
      created_at: '2024-03-01T10:00:00Z',
      updated_at: '2024-03-01T10:00:00Z'
    },
    images: [
      {
        id: 'img-5',
        listing_id: 'demo-5',
        image_url: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=800&q=80',
        position: 0,
        created_at: new Date().toISOString()
      }
    ]
  },
  {
    id: 'demo-6',
    seller_id: 'seller-1',
    title: 'Lenovo ThinkPad E14 (Core i5 11th Gen / 16GB RAM / 512GB SSD)',
    description: 'Workhorse laptop with legendary ThinkPad keyboard, military-grade durability, FHD IPS anti-glare display. Battery backup ~4.5 hours. Charger and Lenovo bag included.',
    price: 25000,
    condition: 'Good',
    category_id: 'laptops',
    location: 'Block 34, Computer Science Department',
    contact_preference: 'Chat or Phone',
    status: 'active',
    views_count: 432,
    created_at: new Date(Date.now() - 3600000 * 60).toISOString(),
    updated_at: new Date(Date.now() - 3600000 * 60).toISOString(),
    seller: {
      id: 'seller-1',
      full_name: 'Aarav Sharma',
      avatar_url: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80',
      role: 'user',
      created_at: '2024-01-15T10:00:00Z',
      updated_at: '2024-01-15T10:00:00Z'
    },
    images: [
      {
        id: 'img-6',
        listing_id: 'demo-6',
        image_url: 'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?auto=format&fit=crop&w=800&q=80',
        position: 0,
        created_at: new Date().toISOString()
      },
      {
        id: 'img-6-2',
        listing_id: 'demo-6',
        image_url: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=800&q=80',
        position: 1,
        created_at: new Date().toISOString()
      }
    ]
  },
  {
    id: 'demo-7',
    seller_id: 'seller-2',
    title: 'Havells 1.2L Stainless Steel Electric Kettle',
    description: 'Auto shut-off, rapid boiling, 360-degree cordless base. Essential for late-night Maggi, coffee, and tea in hostel rooms. Clean inside with zero scaling.',
    price: 650,
    condition: 'Like New',
    category_id: 'hostel',
    location: 'Boys Hostel BH-4',
    contact_preference: 'Chat',
    status: 'active',
    views_count: 98,
    created_at: new Date(Date.now() - 3600000 * 72).toISOString(),
    updated_at: new Date(Date.now() - 3600000 * 72).toISOString(),
    seller: {
      id: 'seller-2',
      full_name: 'Rohan Mehra',
      avatar_url: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=150&q=80',
      role: 'user',
      created_at: '2024-02-10T10:00:00Z',
      updated_at: '2024-02-10T10:00:00Z'
    },
    images: [
      {
        id: 'img-7',
        listing_id: 'demo-7',
        image_url: 'https://images.unsplash.com/photo-1594824813689-130d22080fa9?auto=format&fit=crop&w=800&q=80',
        position: 0,
        created_at: new Date().toISOString()
      }
    ]
  },
  {
    id: 'demo-8',
    seller_id: 'seller-4',
    title: 'Yonex Muscle Power 29 Light Badminton Racquet',
    description: 'Isometric head shape, lightweight carbon graphite shaft with BG65 titanium string tensioned at 24 lbs. Comes with full padded cover.',
    price: 1400,
    condition: 'Good',
    category_id: 'sports',
    location: 'Indoor Stadium / Shanti Devi Mittal Center',
    contact_preference: 'Chat',
    status: 'active',
    views_count: 67,
    created_at: new Date(Date.now() - 3600000 * 85).toISOString(),
    updated_at: new Date(Date.now() - 3600000 * 85).toISOString(),
    seller: {
      id: 'seller-4',
      full_name: 'Simran Kaur',
      avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
      role: 'user',
      created_at: '2024-01-05T10:00:00Z',
      updated_at: '2024-01-05T10:00:00Z'
    },
    images: [
      {
        id: 'img-8',
        listing_id: 'demo-8',
        image_url: 'https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?auto=format&fit=crop&w=800&q=80',
        position: 0,
        created_at: new Date().toISOString()
      }
    ]
  }
];
