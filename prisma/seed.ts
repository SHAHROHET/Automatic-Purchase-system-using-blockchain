import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Create Users
  const adminPassword = await bcrypt.hash('admin123', 12);
  const managerPassword = await bcrypt.hash('manager123', 12);
  const userPassword = await bcrypt.hash('user123', 12);

  const admin = await prisma.user.upsert({
    where: { email: 'admin@wadein.com.au' },
    update: {},
    create: {
      email: 'admin@wadein.com.au',
      name: 'Muhammad Rizki Adi Pratama',
      passwordHash: adminPassword,
      role: 'ADMIN',
      department: 'Management',
    },
  });

  const manager = await prisma.user.upsert({
    where: { email: 'manager@wadein.com.au' },
    update: {},
    create: {
      email: 'manager@wadein.com.au',
      name: 'Ahmed Albadri',
      passwordHash: managerPassword,
      role: 'MANAGER',
      department: 'Procurement',
    },
  });

  const user = await prisma.user.upsert({
    where: { email: 'user@wadein.com.au' },
    update: {},
    create: {
      email: 'user@wadein.com.au',
      name: 'Sarah Johnson',
      passwordHash: userPassword,
      role: 'USER',
      department: 'IT Services',
    },
  });

  console.log('Users created');

  // Create Suppliers
  const suppliers = await Promise.all([
    prisma.supplier.upsert({
      where: { code: 'SUP-001' },
      update: {},
      create: {
        name: 'TechParts Australia',
        code: 'SUP-001',
        email: 'sales@techparts.com.au',
        phone: '+61 8 9200 1234',
        address: '120 Murray Street',
        city: 'Perth',
        state: 'WA',
        country: 'Australia',
        abn: '12 345 678 901',
        contactPerson: 'James Wilson',
        category: 'IT Hardware',
        rating: 4.5,
        status: 'ACTIVE',
        paymentTerms: 'NET30',
        leadTimeDays: 5,
        qualityScore: 92,
        deliveryScore: 88,
        complianceStatus: 'COMPLIANT',
      },
    }),
    prisma.supplier.upsert({
      where: { code: 'SUP-002' },
      update: {},
      create: {
        name: 'Digital Solutions WA',
        code: 'SUP-002',
        email: 'orders@digitalsolutions.com.au',
        phone: '+61 8 9300 5678',
        address: '85 Hay Street',
        city: 'Perth',
        state: 'WA',
        country: 'Australia',
        abn: '23 456 789 012',
        contactPerson: 'Emily Chen',
        category: 'Software',
        rating: 4.8,
        status: 'ACTIVE',
        paymentTerms: 'NET30',
        leadTimeDays: 3,
        qualityScore: 96,
        deliveryScore: 95,
        complianceStatus: 'COMPLIANT',
      },
    }),
    prisma.supplier.upsert({
      where: { code: 'SUP-003' },
      update: {},
      create: {
        name: 'CompuWholesale Pty Ltd',
        code: 'SUP-003',
        email: 'supply@compuwholesale.com.au',
        phone: '+61 8 9400 9012',
        address: '200 Adelaide Terrace',
        city: 'Perth',
        state: 'WA',
        country: 'Australia',
        abn: '34 567 890 123',
        contactPerson: 'Michael Brown',
        category: 'Components',
        rating: 4.2,
        status: 'ACTIVE',
        paymentTerms: 'NET60',
        leadTimeDays: 7,
        qualityScore: 85,
        deliveryScore: 82,
        complianceStatus: 'COMPLIANT',
      },
    }),
    prisma.supplier.upsert({
      where: { code: 'SUP-004' },
      update: {},
      create: {
        name: 'NetworkGear Australia',
        code: 'SUP-004',
        email: 'info@networkgear.com.au',
        phone: '+61 8 9500 3456',
        address: '50 William Street',
        city: 'Perth',
        state: 'WA',
        country: 'Australia',
        abn: '45 678 901 234',
        contactPerson: 'David Lee',
        category: 'Networking',
        rating: 4.0,
        status: 'ACTIVE',
        paymentTerms: 'NET30',
        leadTimeDays: 10,
        qualityScore: 88,
        deliveryScore: 78,
        complianceStatus: 'PENDING_REVIEW',
      },
    }),
    prisma.supplier.upsert({
      where: { code: 'SUP-005' },
      update: {},
      create: {
        name: 'Gaming Components Co',
        code: 'SUP-005',
        email: 'sales@gamingcomponents.com.au',
        phone: '+61 8 9600 7890',
        address: '75 Barrack Street',
        city: 'Perth',
        state: 'WA',
        country: 'Australia',
        abn: '56 789 012 345',
        contactPerson: 'Lisa Taylor',
        category: 'Gaming Hardware',
        rating: 4.6,
        status: 'ACTIVE',
        paymentTerms: 'NET30',
        leadTimeDays: 8,
        qualityScore: 94,
        deliveryScore: 90,
        complianceStatus: 'COMPLIANT',
      },
    }),
    prisma.supplier.upsert({
      where: { code: 'SUP-006' },
      update: {},
      create: {
        name: 'Peripheral World',
        code: 'SUP-006',
        email: 'orders@peripheralworld.com.au',
        phone: '+61 8 9700 1234',
        address: '30 St Georges Terrace',
        city: 'Perth',
        state: 'WA',
        country: 'Australia',
        abn: '67 890 123 456',
        contactPerson: 'Tom Harris',
        category: 'Accessories',
        rating: 3.8,
        status: 'INACTIVE',
        paymentTerms: 'COD',
        leadTimeDays: 4,
        qualityScore: 75,
        deliveryScore: 70,
        complianceStatus: 'NON_COMPLIANT',
      },
    }),
  ]);

  console.log('Suppliers created');

  // Create Inventory Items
  const inventoryItems = await Promise.all([
    prisma.inventoryItem.upsert({
      where: { sku: 'SSD-SAM-1TB' },
      update: {},
      create: {
        name: 'Samsung 870 EVO 1TB SSD',
        sku: 'SSD-SAM-1TB',
        description: 'Samsung 870 EVO SATA III 2.5" Internal SSD 1TB',
        category: 'Hardware',
        supplierId: suppliers[0].id,
        currentStock: 45,
        minimumStock: 10,
        maximumStock: 100,
        reorderPoint: 20,
        reorderQuantity: 50,
        unitPrice: 139.00,
        location: 'Warehouse A - Shelf 1',
        abcCategory: 'A',
        leadTimeDays: 5,
        averageDailyUsage: 3.2,
        safetyStock: 8,
        economicOrderQty: 50,
        status: 'ACTIVE',
      },
    }),
    prisma.inventoryItem.upsert({
      where: { sku: 'RAM-COR-16' },
      update: {},
      create: {
        name: 'Corsair Vengeance 16GB DDR4 RAM',
        sku: 'RAM-COR-16',
        description: 'Corsair Vengeance LPX 16GB (2x8GB) DDR4 3200MHz',
        category: 'Hardware',
        supplierId: suppliers[0].id,
        currentStock: 32,
        minimumStock: 8,
        maximumStock: 80,
        reorderPoint: 15,
        reorderQuantity: 40,
        unitPrice: 89.00,
        location: 'Warehouse A - Shelf 2',
        abcCategory: 'A',
        leadTimeDays: 5,
        averageDailyUsage: 2.5,
        safetyStock: 6,
        economicOrderQty: 40,
        status: 'ACTIVE',
      },
    }),
    prisma.inventoryItem.upsert({
      where: { sku: 'BAT-CMOS-01' },
      update: {},
      create: {
        name: 'CMOS Battery CR2032',
        sku: 'BAT-CMOS-01',
        description: 'CR2032 Lithium CMOS Battery for motherboards',
        category: 'Components',
        supplierId: suppliers[2].id,
        currentStock: 150,
        minimumStock: 50,
        maximumStock: 500,
        reorderPoint: 80,
        reorderQuantity: 200,
        unitPrice: 2.50,
        location: 'Warehouse B - Bin 5',
        abcCategory: 'C',
        leadTimeDays: 3,
        averageDailyUsage: 5.0,
        safetyStock: 15,
        economicOrderQty: 200,
        status: 'ACTIVE',
      },
    }),
    prisma.inventoryItem.upsert({
      where: { sku: 'GPU-ASU-3070' },
      update: {},
      create: {
        name: 'ASUS ROG Strix RTX 3070',
        sku: 'GPU-ASU-3070',
        description: 'ASUS ROG Strix NVIDIA GeForce RTX 3070 Gaming Graphics Card',
        category: 'Gaming Hardware',
        supplierId: suppliers[4].id,
        currentStock: 5,
        minimumStock: 3,
        maximumStock: 20,
        reorderPoint: 5,
        reorderQuantity: 10,
        unitPrice: 899.00,
        location: 'Warehouse A - Secure Bay 1',
        abcCategory: 'A',
        leadTimeDays: 8,
        averageDailyUsage: 0.8,
        safetyStock: 3,
        economicOrderQty: 10,
        status: 'ACTIVE',
      },
    }),
    prisma.inventoryItem.upsert({
      where: { sku: 'CAB-ETH-5M' },
      update: {},
      create: {
        name: 'Ethernet Cable Cat6 5m',
        sku: 'CAB-ETH-5M',
        description: 'Cat6 Ethernet Network Cable 5 metres',
        category: 'Networking',
        supplierId: suppliers[3].id,
        currentStock: 8,
        minimumStock: 20,
        maximumStock: 200,
        reorderPoint: 30,
        reorderQuantity: 100,
        unitPrice: 12.50,
        location: 'Warehouse B - Shelf 8',
        abcCategory: 'C',
        leadTimeDays: 4,
        averageDailyUsage: 4.0,
        safetyStock: 10,
        economicOrderQty: 100,
        status: 'ACTIVE',
      },
    }),
    prisma.inventoryItem.upsert({
      where: { sku: 'PSU-COR-750' },
      update: {},
      create: {
        name: 'Corsair RM750x PSU',
        sku: 'PSU-COR-750',
        description: 'Corsair RM750x 750W 80+ Gold Fully Modular Power Supply',
        category: 'Hardware',
        supplierId: suppliers[0].id,
        currentStock: 18,
        minimumStock: 5,
        maximumStock: 40,
        reorderPoint: 10,
        reorderQuantity: 20,
        unitPrice: 169.00,
        location: 'Warehouse A - Shelf 3',
        abcCategory: 'B',
        leadTimeDays: 5,
        averageDailyUsage: 1.2,
        safetyStock: 4,
        economicOrderQty: 20,
        status: 'ACTIVE',
      },
    }),
    prisma.inventoryItem.upsert({
      where: { sku: 'THM-ARC-MX5' },
      update: {},
      create: {
        name: 'Arctic MX-5 Thermal Paste',
        sku: 'THM-ARC-MX5',
        description: 'Arctic MX-5 Thermal Compound 4g',
        category: 'Components',
        supplierId: suppliers[2].id,
        currentStock: 65,
        minimumStock: 20,
        maximumStock: 150,
        reorderPoint: 30,
        reorderQuantity: 80,
        unitPrice: 8.50,
        location: 'Warehouse B - Bin 3',
        abcCategory: 'C',
        leadTimeDays: 3,
        averageDailyUsage: 3.0,
        safetyStock: 8,
        economicOrderQty: 80,
        status: 'ACTIVE',
      },
    }),
    prisma.inventoryItem.upsert({
      where: { sku: 'SWT-NET-24' },
      update: {},
      create: {
        name: 'Netgear 24-Port Gigabit Switch',
        sku: 'SWT-NET-24',
        description: 'Netgear GS324 24-Port Gigabit Ethernet Unmanaged Switch',
        category: 'Networking',
        supplierId: suppliers[3].id,
        currentStock: 12,
        minimumStock: 3,
        maximumStock: 25,
        reorderPoint: 5,
        reorderQuantity: 10,
        unitPrice: 189.00,
        location: 'Warehouse A - Shelf 6',
        abcCategory: 'B',
        leadTimeDays: 7,
        averageDailyUsage: 0.5,
        safetyStock: 2,
        economicOrderQty: 10,
        status: 'ACTIVE',
      },
    }),
    prisma.inventoryItem.upsert({
      where: { sku: 'ALN-BAT-01' },
      update: {},
      create: {
        name: 'Alienware Laptop Battery',
        sku: 'ALN-BAT-01',
        description: 'Replacement battery for Alienware M15/M17 laptops',
        category: 'Gaming Hardware',
        supplierId: suppliers[4].id,
        currentStock: 2,
        minimumStock: 5,
        maximumStock: 30,
        reorderPoint: 8,
        reorderQuantity: 15,
        unitPrice: 149.00,
        location: 'Warehouse A - Shelf 7',
        abcCategory: 'B',
        leadTimeDays: 10,
        averageDailyUsage: 0.3,
        safetyStock: 3,
        economicOrderQty: 15,
        status: 'ACTIVE',
      },
    }),
    prisma.inventoryItem.upsert({
      where: { sku: 'WIN-LIC-PRO' },
      update: {},
      create: {
        name: 'Windows 11 Pro License',
        sku: 'WIN-LIC-PRO',
        description: 'Microsoft Windows 11 Professional License Key',
        category: 'Software',
        supplierId: suppliers[1].id,
        currentStock: 25,
        minimumStock: 10,
        maximumStock: 100,
        reorderPoint: 15,
        reorderQuantity: 50,
        unitPrice: 259.00,
        location: 'Digital Inventory',
        abcCategory: 'A',
        leadTimeDays: 1,
        averageDailyUsage: 1.5,
        safetyStock: 5,
        economicOrderQty: 50,
        status: 'ACTIVE',
      },
    }),
  ]);

  console.log('Inventory items created');

  // Create Purchase Orders
  const po1 = await prisma.purchaseOrder.create({
    data: {
      orderNumber: 'PO-2026-00001',
      supplierId: suppliers[0].id,
      createdById: admin.id,
      status: 'DELIVERED',
      priority: 'HIGH',
      orderDate: new Date('2026-01-15'),
      expectedDelivery: new Date('2026-01-22'),
      actualDelivery: new Date('2026-01-21'),
      subtotal: 6950.00,
      tax: 695.00,
      shippingCost: 45.00,
      totalAmount: 7690.00,
      notes: 'Urgent SSD restock for gaming builds',
      blockchainTxHash: '0xabc123def456789012345678901234567890abcdef1234567890abcdef123456',
      blockchainStatus: 'CONFIRMED',
      items: {
        create: [
          {
            description: 'Samsung 870 EVO 1TB SSD',
            sku: 'SSD-SAM-1TB',
            quantity: 50,
            unitPrice: 139.00,
            totalPrice: 6950.00,
            inventoryItemId: inventoryItems[0].id,
            receivedQty: 50,
          },
        ],
      },
    },
  });

  const po2 = await prisma.purchaseOrder.create({
    data: {
      orderNumber: 'PO-2026-00002',
      supplierId: suppliers[1].id,
      createdById: manager.id,
      status: 'APPROVED',
      priority: 'MEDIUM',
      orderDate: new Date('2026-02-01'),
      expectedDelivery: new Date('2026-02-05'),
      subtotal: 12950.00,
      tax: 1295.00,
      shippingCost: 0,
      totalAmount: 14245.00,
      notes: 'Windows licenses for new client deployments',
      blockchainTxHash: '0xdef456789012345678901234567890abcdef1234567890abcdef123456789abc',
      blockchainStatus: 'CONFIRMED',
      items: {
        create: [
          {
            description: 'Windows 11 Pro License',
            sku: 'WIN-LIC-PRO',
            quantity: 50,
            unitPrice: 259.00,
            totalPrice: 12950.00,
            inventoryItemId: inventoryItems[9].id,
          },
        ],
      },
    },
  });

  const po3 = await prisma.purchaseOrder.create({
    data: {
      orderNumber: 'PO-2026-00003',
      supplierId: suppliers[4].id,
      createdById: admin.id,
      status: 'SHIPPED',
      priority: 'HIGH',
      orderDate: new Date('2026-02-20'),
      expectedDelivery: new Date('2026-03-01'),
      subtotal: 8990.00,
      tax: 899.00,
      shippingCost: 85.00,
      totalAmount: 9974.00,
      notes: 'Gaming GPU restock - high demand',
      blockchainTxHash: '0x789012345678901234567890abcdef1234567890abcdef123456789abcdef012',
      blockchainStatus: 'CONFIRMED',
      isAutomated: true,
      items: {
        create: [
          {
            description: 'ASUS ROG Strix RTX 3070',
            sku: 'GPU-ASU-3070',
            quantity: 10,
            unitPrice: 899.00,
            totalPrice: 8990.00,
            inventoryItemId: inventoryItems[3].id,
          },
        ],
      },
    },
  });

  const po4 = await prisma.purchaseOrder.create({
    data: {
      orderNumber: 'PO-2026-00004',
      supplierId: suppliers[3].id,
      createdById: user.id,
      status: 'PENDING_APPROVAL',
      priority: 'MEDIUM',
      orderDate: new Date('2026-03-10'),
      expectedDelivery: new Date('2026-03-20'),
      subtotal: 1250.00,
      tax: 125.00,
      shippingCost: 30.00,
      totalAmount: 1405.00,
      notes: 'Ethernet cables running low',
      items: {
        create: [
          {
            description: 'Ethernet Cable Cat6 5m',
            sku: 'CAB-ETH-5M',
            quantity: 100,
            unitPrice: 12.50,
            totalPrice: 1250.00,
            inventoryItemId: inventoryItems[4].id,
          },
        ],
      },
    },
  });

  const po5 = await prisma.purchaseOrder.create({
    data: {
      orderNumber: 'PO-2026-00005',
      supplierId: suppliers[2].id,
      createdById: manager.id,
      status: 'ORDERED',
      priority: 'LOW',
      orderDate: new Date('2026-03-12'),
      expectedDelivery: new Date('2026-03-19'),
      subtotal: 1180.00,
      tax: 118.00,
      shippingCost: 15.00,
      totalAmount: 1313.00,
      notes: 'Regular components restock',
      blockchainTxHash: '0x345678901234567890abcdef1234567890abcdef123456789abcdef012345678',
      blockchainStatus: 'CONFIRMED',
      items: {
        create: [
          {
            description: 'CMOS Battery CR2032',
            sku: 'BAT-CMOS-01',
            quantity: 200,
            unitPrice: 2.50,
            totalPrice: 500.00,
            inventoryItemId: inventoryItems[2].id,
          },
          {
            description: 'Arctic MX-5 Thermal Paste',
            sku: 'THM-ARC-MX5',
            quantity: 80,
            unitPrice: 8.50,
            totalPrice: 680.00,
            inventoryItemId: inventoryItems[6].id,
          },
        ],
      },
    },
  });

  const po6 = await prisma.purchaseOrder.create({
    data: {
      orderNumber: 'PO-2026-00006',
      supplierId: suppliers[0].id,
      createdById: admin.id,
      status: 'DRAFT',
      priority: 'URGENT',
      orderDate: new Date('2026-03-16'),
      expectedDelivery: new Date('2026-03-20'),
      subtotal: 3560.00,
      tax: 356.00,
      shippingCost: 50.00,
      totalAmount: 3966.00,
      notes: 'Urgent RAM and PSU restock',
      items: {
        create: [
          {
            description: 'Corsair Vengeance 16GB DDR4 RAM',
            sku: 'RAM-COR-16',
            quantity: 20,
            unitPrice: 89.00,
            totalPrice: 1780.00,
            inventoryItemId: inventoryItems[1].id,
          },
          {
            description: 'Corsair RM750x PSU',
            sku: 'PSU-COR-750',
            quantity: 10,
            unitPrice: 169.00,
            totalPrice: 1690.00,
            inventoryItemId: inventoryItems[5].id,
          },
        ],
      },
    },
  });

  console.log('Purchase orders created');

  // Create Shipments
  await prisma.shipment.create({
    data: {
      purchaseOrderId: po1.id,
      trackingNumber: 'AP123456789AU',
      carrier: 'Australia Post',
      status: 'DELIVERED',
      origin: 'Sydney, NSW',
      destination: '45 St Georges Terrace, Perth WA 6000',
      estimatedArrival: new Date('2026-01-22'),
      actualArrival: new Date('2026-01-21'),
      weight: 15.5,
      notes: 'Delivered one day early',
      events: {
        create: [
          { status: 'PENDING', location: 'Sydney, NSW', description: 'Order placed with carrier', timestamp: new Date('2026-01-16') },
          { status: 'PICKED_UP', location: 'Sydney, NSW', description: 'Package picked up from supplier', timestamp: new Date('2026-01-17') },
          { status: 'IN_TRANSIT', location: 'Adelaide, SA', description: 'In transit - Adelaide hub', timestamp: new Date('2026-01-19') },
          { status: 'OUT_FOR_DELIVERY', location: 'Perth, WA', description: 'Out for delivery', timestamp: new Date('2026-01-21') },
          { status: 'DELIVERED', location: 'Perth, WA', description: 'Delivered - signed by M. Pratama', timestamp: new Date('2026-01-21') },
        ],
      },
    },
  });

  await prisma.shipment.create({
    data: {
      purchaseOrderId: po3.id,
      trackingNumber: 'DHL7890123456',
      carrier: 'DHL Express',
      status: 'IN_TRANSIT',
      origin: 'Melbourne, VIC',
      destination: '45 St Georges Terrace, Perth WA 6000',
      estimatedArrival: new Date('2026-03-01'),
      weight: 25.0,
      events: {
        create: [
          { status: 'PENDING', location: 'Melbourne, VIC', description: 'Shipment created', timestamp: new Date('2026-02-22') },
          { status: 'PICKED_UP', location: 'Melbourne, VIC', description: 'Picked up from Gaming Components Co', timestamp: new Date('2026-02-23') },
          { status: 'IN_TRANSIT', location: 'Adelaide, SA', description: 'Arrived at Adelaide sorting facility', timestamp: new Date('2026-02-25') },
        ],
      },
    },
  });

  await prisma.shipment.create({
    data: {
      purchaseOrderId: po5.id,
      trackingNumber: 'TNT456789012AU',
      carrier: 'TNT Express',
      status: 'PENDING',
      origin: 'Perth, WA',
      destination: '45 St Georges Terrace, Perth WA 6000',
      estimatedArrival: new Date('2026-03-19'),
      weight: 8.0,
      events: {
        create: [
          { status: 'PENDING', location: 'Perth, WA', description: 'Awaiting pickup', timestamp: new Date('2026-03-13') },
        ],
      },
    },
  });

  console.log('Shipments created');

  // Create Supplier Contracts
  await Promise.all([
    prisma.supplierContract.create({
      data: {
        supplierId: suppliers[0].id,
        contractNumber: 'CON-2026-001',
        title: 'Annual IT Hardware Supply Agreement',
        startDate: new Date('2026-01-01'),
        endDate: new Date('2026-12-31'),
        value: 250000,
        status: 'ACTIVE',
        terms: 'Annual supply agreement for IT hardware components. NET30 payment terms. 5% volume discount on orders over $10,000.',
        blockchainTxHash: '0xcontract123456789abcdef0123456789abcdef0123456789abcdef01234567',
      },
    }),
    prisma.supplierContract.create({
      data: {
        supplierId: suppliers[1].id,
        contractNumber: 'CON-2026-002',
        title: 'Software Licensing Partnership',
        startDate: new Date('2026-01-01'),
        endDate: new Date('2027-06-30'),
        value: 150000,
        status: 'ACTIVE',
        terms: 'Software licensing supply for Microsoft and Adobe products. Volume licensing discount applicable.',
      },
    }),
    prisma.supplierContract.create({
      data: {
        supplierId: suppliers[4].id,
        contractNumber: 'CON-2026-003',
        title: 'Gaming Hardware Supply Contract',
        startDate: new Date('2026-03-01'),
        endDate: new Date('2027-02-28'),
        value: 180000,
        status: 'ACTIVE',
        terms: 'Exclusive supply agreement for ASUS and Alienware gaming components.',
      },
    }),
  ]);

  console.log('Contracts created');

  // Create Blockchain Transactions
  await Promise.all([
    prisma.blockchainTransaction.create({
      data: {
        txHash: '0xabc123def456789012345678901234567890abcdef1234567890abcdef123456',
        blockNumber: 15234567,
        from: '0x742d35Cc6634C0532925a3b844Bc9e7595f2bD68',
        to: '0x1234567890abcdef1234567890abcdef12345678',
        method: 'createPurchaseOrder',
        referenceId: po1.id,
        referenceType: 'PURCHASE_ORDER',
        status: 'CONFIRMED',
        gasUsed: '85432',
        confirmedAt: new Date('2026-01-15'),
      },
    }),
    prisma.blockchainTransaction.create({
      data: {
        txHash: '0xdef456789012345678901234567890abcdef1234567890abcdef123456789abc',
        blockNumber: 15234890,
        from: '0x742d35Cc6634C0532925a3b844Bc9e7595f2bD68',
        to: '0x1234567890abcdef1234567890abcdef12345678',
        method: 'approvePurchaseOrder',
        referenceId: po2.id,
        referenceType: 'PURCHASE_ORDER',
        status: 'CONFIRMED',
        gasUsed: '62100',
        confirmedAt: new Date('2026-02-01'),
      },
    }),
    prisma.blockchainTransaction.create({
      data: {
        txHash: '0x789012345678901234567890abcdef1234567890abcdef123456789abcdef012',
        blockNumber: 15235123,
        from: '0x742d35Cc6634C0532925a3b844Bc9e7595f2bD68',
        to: '0x1234567890abcdef1234567890abcdef12345678',
        method: 'createPurchaseOrder',
        referenceId: po3.id,
        referenceType: 'PURCHASE_ORDER',
        status: 'CONFIRMED',
        gasUsed: '91200',
        confirmedAt: new Date('2026-02-20'),
      },
    }),
    prisma.blockchainTransaction.create({
      data: {
        txHash: '0x345678901234567890abcdef1234567890abcdef123456789abcdef012345678',
        blockNumber: 15235456,
        from: '0x742d35Cc6634C0532925a3b844Bc9e7595f2bD68',
        to: '0x1234567890abcdef1234567890abcdef12345678',
        method: 'createPurchaseOrder',
        referenceId: po5.id,
        referenceType: 'PURCHASE_ORDER',
        status: 'CONFIRMED',
        gasUsed: '78900',
        confirmedAt: new Date('2026-03-12'),
      },
    }),
    prisma.blockchainTransaction.create({
      data: {
        txHash: '0xcontract123456789abcdef0123456789abcdef0123456789abcdef01234567',
        blockNumber: 15234100,
        from: '0x742d35Cc6634C0532925a3b844Bc9e7595f2bD68',
        to: '0x1234567890abcdef1234567890abcdef12345678',
        method: 'createSupplierContract',
        referenceType: 'CONTRACT',
        status: 'CONFIRMED',
        gasUsed: '105600',
        confirmedAt: new Date('2026-01-01'),
      },
    }),
  ]);

  console.log('Blockchain transactions created');

  // Create Stock Movements
  await Promise.all([
    prisma.stockMovement.create({
      data: { inventoryItemId: inventoryItems[0].id, type: 'IN', quantity: 50, reference: 'PO-2026-00001', notes: 'Restock from TechParts', createdAt: new Date('2026-01-21') },
    }),
    prisma.stockMovement.create({
      data: { inventoryItemId: inventoryItems[0].id, type: 'OUT', quantity: 5, reference: 'JOB-2026-101', notes: 'Used for customer repairs', createdAt: new Date('2026-02-15') },
    }),
    prisma.stockMovement.create({
      data: { inventoryItemId: inventoryItems[3].id, type: 'OUT', quantity: 3, reference: 'JOB-2026-115', notes: 'Gaming builds', createdAt: new Date('2026-03-01') },
    }),
    prisma.stockMovement.create({
      data: { inventoryItemId: inventoryItems[4].id, type: 'OUT', quantity: 12, reference: 'JOB-2026-120', notes: 'Network installations', createdAt: new Date('2026-03-05') },
    }),
  ]);

  console.log('Stock movements created');

  // Create Audit Logs
  await Promise.all([
    prisma.auditLog.create({
      data: { userId: admin.id, action: 'CREATE', entity: 'PURCHASE_ORDER', entityId: po1.id, details: '{"orderNumber":"PO-2026-00001","supplier":"TechParts Australia"}', createdAt: new Date('2026-01-15') },
    }),
    prisma.auditLog.create({
      data: { userId: manager.id, action: 'APPROVE', entity: 'PURCHASE_ORDER', entityId: po2.id, details: '{"orderNumber":"PO-2026-00002","action":"approved"}', createdAt: new Date('2026-02-01') },
    }),
    prisma.auditLog.create({
      data: { userId: admin.id, action: 'CREATE', entity: 'SUPPLIER', entityId: suppliers[0].id, details: '{"supplierName":"TechParts Australia"}', createdAt: new Date('2026-01-10') },
    }),
  ]);

  console.log('Audit logs created');

  // System Settings
  await Promise.all([
    prisma.systemSetting.upsert({ where: { key: 'company_name' }, update: {}, create: { key: 'company_name', value: 'WADEIN', category: 'GENERAL' } }),
    prisma.systemSetting.upsert({ where: { key: 'company_address' }, update: {}, create: { key: 'company_address', value: '45 St Georges Terrace, Perth WA 6000, Australia', category: 'GENERAL' } }),
    prisma.systemSetting.upsert({ where: { key: 'company_abn' }, update: {}, create: { key: 'company_abn', value: '65 229 626 266', category: 'GENERAL' } }),
    prisma.systemSetting.upsert({ where: { key: 'default_currency' }, update: {}, create: { key: 'default_currency', value: 'AUD', category: 'GENERAL' } }),
    prisma.systemSetting.upsert({ where: { key: 'tax_rate' }, update: {}, create: { key: 'tax_rate', value: '10', category: 'GENERAL' } }),
    prisma.systemSetting.upsert({ where: { key: 'blockchain_network' }, update: {}, create: { key: 'blockchain_network', value: 'Ethereum (Local)', category: 'BLOCKCHAIN' } }),
    prisma.systemSetting.upsert({ where: { key: 'auto_reorder_enabled' }, update: {}, create: { key: 'auto_reorder_enabled', value: 'true', category: 'PROCUREMENT' } }),
    prisma.systemSetting.upsert({ where: { key: 'approval_threshold' }, update: {}, create: { key: 'approval_threshold', value: '5000', category: 'PROCUREMENT' } }),
    prisma.systemSetting.upsert({ where: { key: 'low_stock_email_alert' }, update: {}, create: { key: 'low_stock_email_alert', value: 'true', category: 'NOTIFICATIONS' } }),
    prisma.systemSetting.upsert({ where: { key: 'po_approval_alert' }, update: {}, create: { key: 'po_approval_alert', value: 'true', category: 'NOTIFICATIONS' } }),
  ]);

  console.log('System settings created');
  console.log('Database seeding completed successfully!');
  console.log('\nLogin credentials:');
  console.log('  Admin: admin@wadein.com.au / admin123');
  console.log('  Manager: manager@wadein.com.au / manager123');
  console.log('  User: user@wadein.com.au / user123');
}

main()
  .catch((e) => {
    console.error('Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
