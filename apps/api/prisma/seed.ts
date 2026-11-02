import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting full database seed...');

  // 1. Create Super Admin
  const adminEmail = process.env.SUPER_ADMIN_EMAIL || 'admin@nexmart.com';
  const adminPassword = process.env.SUPER_ADMIN_PASSWORD || 'NexMart@Admin123';

  let superAdmin = await prisma.user.findUnique({ where: { email: adminEmail } });

  if (!superAdmin) {
    const passwordHash = await bcrypt.hash(adminPassword, 12);
    superAdmin = await prisma.user.create({
      data: {
        email: adminEmail,
        passwordHash,
        firstName: 'System',
        lastName: 'Admin',
        role: 'SUPER_ADMIN',
      },
    });
    console.log(`✅ Created Super Admin: ${adminEmail}`);
  } else {
    console.log(`ℹ️ Super Admin already exists: ${adminEmail}`);
  }

  // 2. Create Default Demo Store
  let demoStore = await prisma.store.findUnique({ where: { slug: 'demo-store' } });
  if (!demoStore) {
    demoStore = await prisma.store.create({
      data: {
        name: 'NexMart Flagship Store',
        slug: 'demo-store',
        status: 'ACTIVE',
        ownerId: superAdmin.id,
      },
    });
    console.log('✅ Created Demo Store');
  }

  // Assign storeId to Super Admin
  if (!superAdmin.storeId) {
    await prisma.user.update({
      where: { id: superAdmin.id },
      data: { storeId: demoStore.id },
    });
  }

  // 3. Store Settings
  const existingSettings = await prisma.storeSettings.findUnique({
    where: { storeId: demoStore.id },
  });
  if (!existingSettings) {
    await prisma.storeSettings.create({
      data: {
        storeId: demoStore.id,
        storeName: 'NexMart Flagship Store',
        description: 'Your premier destination for high-performance gear, fashion, and lifestyle items.',
        email: 'support@nexmart.com',
        phone: '+1 (800) 555-6396',
        currency: 'USD',
        currencySymbol: '$',
        language: 'en',
        timezone: 'UTC',
        copyrightText: '© 2026 NexMart Platform. All rights reserved.',
        address: JSON.stringify({
          street: '742 Evergreen Terrace',
          city: 'San Francisco',
          state: 'CA',
          country: 'United States',
          postalCode: '94107',
        }),
        socialLinks: JSON.stringify({
          facebook: 'https://facebook.com/nexmart',
          instagram: 'https://instagram.com/nexmart',
          twitter: 'https://x.com/nexmart',
          youtube: 'https://youtube.com/@nexmart',
        }),
        businessInfo: JSON.stringify({
          taxNumber: 'US-987654321',
          companyName: 'NexMart Commerce Inc.',
        }),
      },
    });
    console.log('✅ Created Default Store Settings');
  }

  // 4. Store Appearance
  const existingAppearance = await prisma.storeAppearance.findUnique({
    where: { storeId: demoStore.id },
  });
  if (!existingAppearance) {
    await prisma.storeAppearance.create({
      data: {
        storeId: demoStore.id,
        primaryColor: '#6366f1',
        secondaryColor: '#8b5cf6',
        accentColor: '#f59e0b',
        bgColor: '#ffffff',
        textColor: '#1f2937',
        buttonColor: '#6366f1',
        buttonTextColor: '#ffffff',
        fontFamily: 'Inter',
        borderRadius: '8px',
        headerStyle: 'default',
        footerStyle: 'default',
        productCardStyle: 'default',
        imageFit: 'AUTO',
      },
    });
    console.log('✅ Created Default Store Appearance');
  }

  // 5. Create Templates
  const templates = [
    {
      name: 'Modern Minimal',
      slug: 'modern',
      description: 'A clean, typography-focused design suitable for most modern brands.',
      category: 'General',
    },
    {
      name: 'Fashion Editorial',
      slug: 'fashion',
      description: 'Bold images and editorial layouts perfect for clothing and accessories.',
      category: 'Fashion',
    },
    {
      name: 'Tech & Electronics',
      slug: 'electronics',
      description: 'Information-dense layout with sidebar filters for tech products.',
      category: 'Electronics',
    },
  ];

  for (const t of templates) {
    const existing = await prisma.template.findUnique({ where: { slug: t.slug } });
    if (!existing) {
      await prisma.template.create({ data: t });
      console.log(`✅ Created Template: ${t.name}`);
    }
  }

  // 6. Sample Categories
  const categoryData = [
    { name: 'Electronics & Tech', slug: 'electronics-tech', description: 'Gadgets, audio, wireless chargers, and computing peripherals.' },
    { name: 'Apparel & Fashion', slug: 'apparel-fashion', description: 'Contemporary clothing, coats, and minimalist everyday wear.' },
    { name: 'Footwear & Sneakers', slug: 'footwear-sneakers', description: 'Performance athletic shoes and casual sneakers.' },
    { name: 'Home & Lifestyle', slug: 'home-lifestyle', description: 'Modern decor, desk setup accessories, and lighting.' },
  ];

  const createdCategories: Record<string, string> = {};

  for (const cat of categoryData) {
    let existingCat = await prisma.category.findFirst({
      where: { storeId: demoStore.id, slug: cat.slug },
    });
    if (!existingCat) {
      existingCat = await prisma.category.create({
        data: {
          storeId: demoStore.id,
          name: cat.name,
          slug: cat.slug,
          description: cat.description,
        },
      });
      console.log(`✅ Created Category: ${cat.name}`);
    }
    createdCategories[cat.slug] = existingCat.id;
  }

  // 7. Sample Products with Variants
  const products = [
    {
      name: 'Ultra Wireless Noise-Canceling Headphones',
      slug: 'ultra-wireless-headphones',
      description: 'Experience studio-grade acoustics with high-res audio drivers, active noise cancellation, and a 40-hour battery life.',
      shortDescription: 'Active Noise-Canceling Bluetooth 5.3 Over-Ear Headphones.',
      price: 199.99,
      compareAtPrice: 249.99,
      stockQuantity: 45,
      isPublished: true,
      isFeatured: true,
      categoryId: createdCategories['electronics-tech'],
      tags: JSON.stringify(['audio', 'wireless', 'bluetooth', 'bestseller']),
      variants: [
        { name: 'Matte Black', price: 199.99, stockQuantity: 25, attributes: JSON.stringify({ Color: 'Black' }) },
        { name: 'Silver Aluminum', price: 209.99, stockQuantity: 20, attributes: JSON.stringify({ Color: 'Silver' }) },
      ],
    },
    {
      name: 'Minimalist Merino Wool Overcoat',
      slug: 'merino-wool-overcoat',
      description: 'Hand-tailored from 100% organic Italian merino wool. Designed with subtle notch lapels and deep welt pockets.',
      shortDescription: 'Tailored 100% Merino Wool Winter Overcoat.',
      price: 289.00,
      compareAtPrice: 350.00,
      stockQuantity: 18,
      isPublished: true,
      isFeatured: true,
      categoryId: createdCategories['apparel-fashion'],
      tags: JSON.stringify(['wool', 'coat', 'winter', 'luxury']),
      variants: [
        { name: 'Charcoal / M', price: 289.00, stockQuantity: 10, attributes: JSON.stringify({ Color: 'Charcoal', Size: 'M' }) },
        { name: 'Charcoal / L', price: 289.00, stockQuantity: 8, attributes: JSON.stringify({ Color: 'Charcoal', Size: 'L' }) },
      ],
    },
    {
      name: 'Pro-Glide Athletic Trail Sneakers',
      slug: 'pro-glide-trail-sneakers',
      description: 'Lightweight responsive midsole cushioning combined with high-traction rubber outsoles for all-terrain durability.',
      shortDescription: 'All-Terrain Cushioned Trail Running Shoes.',
      price: 129.50,
      compareAtPrice: 159.00,
      stockQuantity: 60,
      isPublished: true,
      isFeatured: true,
      categoryId: createdCategories['footwear-sneakers'],
      tags: JSON.stringify(['shoes', 'running', 'trail', 'outdoors']),
      variants: [],
    },
    {
      name: 'Ergonomic Magnetic Desk Lamp',
      slug: 'magnetic-desk-lamp',
      description: 'Touch-controlled dimmable LED desk light with wireless phone charging base and color temperature adjustments.',
      shortDescription: 'Dimmable LED Lamp with Wireless Fast Charger.',
      price: 79.99,
      compareAtPrice: 99.99,
      stockQuantity: 30,
      isPublished: true,
      isFeatured: false,
      categoryId: createdCategories['home-lifestyle'],
      tags: JSON.stringify(['desk', 'led', 'lamp', 'charger']),
      variants: [],
    },
  ];

  for (const prod of products) {
    const existing = await prisma.product.findFirst({
      where: { storeId: demoStore.id, slug: prod.slug },
    });

    if (!existing) {
      const { variants, ...prodData } = prod;
      const createdProd = await prisma.product.create({
        data: {
          storeId: demoStore.id,
          ...prodData,
        },
      });

      if (variants && variants.length > 0) {
        for (const varData of variants) {
          await prisma.productVariant.create({
            data: {
              productId: createdProd.id,
              ...varData,
            },
          });
        }
      }
      console.log(`✅ Created Product: ${prod.name}`);
    }
  }

  console.log('✅ Full database seed completed successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
