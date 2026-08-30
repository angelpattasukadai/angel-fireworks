const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Product = require('./models/Product');

dotenv.config();

const dummyProducts = [
  {
    name: 'Golden Rain Sparklers',
    description: 'Beautiful golden sparks that last for up to 60 seconds. Safe for children under supervision.',
    price: 450,
    category: 'Sparklers',
    image: 'https://images.unsplash.com/photo-1543881028-569d4cb7df51?w=600&auto=format&fit=crop',
    inStock: true
  },
  {
    name: 'Titanium Flower Pot',
    description: 'A brilliant fountain of silver and gold sparks reaching up to 10 feet.',
    price: 800,
    category: 'Fountains',
    image: 'https://images.unsplash.com/photo-1533230676451-408990cf2bdf?w=600&auto=format&fit=crop',
    inStock: true
  },
  {
    name: 'Midnight Symphony 100 Shots',
    description: 'A continuous spectacular aerial display of 100 multi-colored shots.',
    price: 3500,
    category: 'Aerials',
    image: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=600&auto=format&fit=crop',
    inStock: true
  },
  {
    name: 'Whistling Rockets Pack',
    description: 'Pack of 12 rockets that whistle loudly as they ascend, bursting into colorful stars.',
    price: 600,
    category: 'Rockets',
    image: 'https://images.unsplash.com/photo-1469502690022-f673da4c2f13?w=600&auto=format&fit=crop',
    inStock: true
  },
  {
    name: 'Giant Chakkars (Ground Spinners)',
    description: 'Large spinning wheels that create a beautiful spiral of colors on the ground.',
    price: 300,
    category: 'Spinners',
    image: 'https://images.unsplash.com/photo-1498425263435-08e0ee447816?w=600&auto=format&fit=crop',
    inStock: true
  },
  {
    name: 'Premium Wedding Celebration Box',
    description: 'A complete assortment of premium fireworks perfect for a wedding celebration.',
    price: 7500,
    category: 'Gift Boxes',
    image: 'https://images.unsplash.com/photo-1519750157634-b6d493a0f77c?w=600&auto=format&fit=crop',
    inStock: true
  }
];

// SAFETY: by default this will NOT touch existing data. It only inserts the sample
// products when the catalog is empty. To intentionally wipe & replace everything,
// run `npm run seed:reset` (or `node seed.js --reset`).
const RESET = process.argv.includes('--reset');

mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/angelfireworks', { serverSelectionTimeoutMS: 8000 })
.then(async () => {
  console.log('MongoDB connected for seeding.');

  const existing = await Product.countDocuments();

  if (RESET) {
    console.log(`⚠️  RESET mode: deleting all ${existing} existing product(s)...`);
    await Product.deleteMany({});
    await Product.insertMany(dummyProducts);
    console.log(`✅ Catalog reset — inserted ${dummyProducts.length} sample products.`);
  } else if (existing > 0) {
    console.log(`ℹ️  Catalog already has ${existing} product(s). Nothing changed (your data is safe).`);
    console.log('   To wipe & replace with samples, run:  npm run seed:reset');
  } else {
    await Product.insertMany(dummyProducts);
    console.log(`✅ Catalog was empty — inserted ${dummyProducts.length} sample products.`);
  }

  await mongoose.connection.close();
})
.catch(err => {
  console.error('Error connecting to DB or seeding:', err.message);
  process.exit(1);
});
