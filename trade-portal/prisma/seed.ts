import { PrismaClient, ShipmentType, ProductStatus, QuoteStatus, OrderStatus, PaymentStatus, PaymentType, ShipmentStatus, MilestoneStatus, DocumentStatus, DocumentType, DocumentVisibility, RfqStatus, CompanyStatus, CompanyType, UserStatus } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const permissions = [
  'auth.login',
  'company.view_own',
  'company.manage_own_users',
  'company.approve',
  'product.view_published',
  'product.create_own',
  'product.update_own',
  'product.publish',
  'catalog.manage_master',
  'rfq.create',
  'rfq.view_own_company',
  'rfq.respond',
  'rfq.override_status',
  'quote.create',
  'quote.revise',
  'quote.accept_reject',
  'quote.override',
  'order.view_own_company',
  'order.create_from_quote',
  'order.status_update',
  'order.correct',
  'payment.view_own_company',
  'payment.update_status',
  'payment.reconcile',
  'shipment.view_own_company',
  'shipment.update',
  'shipment.correct',
  'document.view_scoped',
  'document.upload',
  'document.review',
  'audit.view',
  'settings.manage_global',
];

const roles = {
  BUYER_USER: [
    'auth.login',
    'company.view_own',
    'product.view_published',
    'rfq.create',
    'rfq.view_own_company',
    'quote.accept_reject',
    'order.view_own_company',
    'payment.view_own_company',
    'shipment.view_own_company',
    'document.view_scoped',
    'document.upload',
  ],
  BUYER_ADMIN: [
    'auth.login',
    'company.view_own',
    'company.manage_own_users',
    'product.view_published',
    'rfq.create',
    'rfq.view_own_company',
    'quote.accept_reject',
    'order.view_own_company',
    'payment.view_own_company',
    'shipment.view_own_company',
    'document.view_scoped',
    'document.upload',
  ],
  SELLER_USER: [
    'auth.login',
    'company.view_own',
    'product.view_published',
    'rfq.view_own_company',
    'rfq.respond',
    'quote.create',
    'quote.revise',
    'order.view_own_company',
    'payment.view_own_company',
    'shipment.view_own_company',
    'shipment.update',
    'document.view_scoped',
    'document.upload',
  ],
  SELLER_ADMIN: [
    'auth.login',
    'company.view_own',
    'company.manage_own_users',
    'product.view_published',
    'product.create_own',
    'product.update_own',
    'rfq.view_own_company',
    'rfq.respond',
    'quote.create',
    'quote.revise',
    'order.view_own_company',
    'order.status_update',
    'payment.view_own_company',
    'payment.update_status',
    'shipment.view_own_company',
    'shipment.update',
    'document.view_scoped',
    'document.upload',
  ],
  INTERNAL_OPS: permissions.filter((item) => item !== 'settings.manage_global'),
  INTERNAL_ADMIN: permissions,
};

async function main() {
  await prisma.$transaction([
    prisma.notification.deleteMany(),
    prisma.auditLog.deleteMany(),
    prisma.documentAccessRule.deleteMany(),
    prisma.paymentEvent.deleteMany(),
    prisma.shipmentMilestone.deleteMany(),
    prisma.shipment.deleteMany(),
    prisma.payment.deleteMany(),
    prisma.orderStatusHistory.deleteMany(),
    prisma.orderItem.deleteMany(),
    prisma.order.deleteMany(),
    prisma.quoteItem.deleteMany(),
    prisma.quote.deleteMany(),
    prisma.rfqAttachment.deleteMany(),
    prisma.rfqItem.deleteMany(),
    prisma.rfq.deleteMany(),
    prisma.productDocument.deleteMany(),
    prisma.productVariant.deleteMany(),
    prisma.product.deleteMany(),
    prisma.document.deleteMany(),
    prisma.authToken.deleteMany(),
    prisma.companyInvite.deleteMany(),
    prisma.companyUser.deleteMany(),
    prisma.user.deleteMany(),
    prisma.company.deleteMany(),
    prisma.rolePermission.deleteMany(),
    prisma.permission.deleteMany(),
    prisma.role.deleteMany(),
  ]);

  const permissionMap = new Map<string, string>();
  for (const key of permissions) {
    const permission = await prisma.permission.create({
      data: { key, label: key.replaceAll('.', ' ') },
    });
    permissionMap.set(key, permission.id);
  }

  const roleMap = new Map<string, string>();
  for (const [key, rolePermissions] of Object.entries(roles)) {
    const role = await prisma.role.create({ data: { key, label: key.replaceAll('_', ' ') } });
    roleMap.set(key, role.id);
    await prisma.rolePermission.createMany({
      data: rolePermissions.map((permissionKey) => ({
        roleId: role.id,
        permissionId: permissionMap.get(permissionKey)!,
      })),
    });
  }

  const internalCompany = await prisma.company.create({
    data: {
      slug: 'moldart-internal',
      name: 'Moldart Internal Ops',
      companyType: CompanyType.INTERNAL,
      status: CompanyStatus.ACTIVE,
      countryCode: 'IN',
    },
  });

  const buyerCompany = await prisma.company.create({
    data: {
      slug: 'deco-build-buying',
      name: 'Deco Build Buying',
      companyType: CompanyType.BUYER,
      status: CompanyStatus.ACTIVE,
      countryCode: 'IN',
    },
  });

  const sellerCompany = await prisma.company.create({
    data: {
      slug: 'china-surface-export',
      name: 'China Surface Export',
      companyType: CompanyType.SELLER,
      status: CompanyStatus.ACTIVE,
      countryCode: 'CN',
    },
  });

  const passwordHash = await bcrypt.hash('Portal@12345', 12);

  const adminUser = await prisma.user.create({
    data: {
      email: 'admin@moldart.local',
      passwordHash,
      firstName: 'Internal',
      lastName: 'Admin',
      status: UserStatus.ACTIVE,
      emailVerifiedAt: new Date(),
    },
  });

  const opsUser = await prisma.user.create({
    data: {
      email: 'ops@moldart.local',
      passwordHash,
      firstName: 'Trade',
      lastName: 'Ops',
      status: UserStatus.ACTIVE,
      emailVerifiedAt: new Date(),
    },
  });

  const buyerUser = await prisma.user.create({
    data: {
      email: 'buyer@demo.local',
      passwordHash,
      firstName: 'Buyer',
      lastName: 'Admin',
      status: UserStatus.ACTIVE,
      emailVerifiedAt: new Date(),
    },
  });

  const sellerUser = await prisma.user.create({
    data: {
      email: 'seller@demo.local',
      passwordHash,
      firstName: 'Seller',
      lastName: 'Admin',
      status: UserStatus.ACTIVE,
      emailVerifiedAt: new Date(),
    },
  });

  await prisma.companyUser.createMany({
    data: [
      {
        companyId: internalCompany.id,
        userId: adminUser.id,
        roleId: roleMap.get('INTERNAL_ADMIN')!,
        title: 'Platform Admin',
        isPrimaryContact: true,
        approvedAt: new Date(),
      },
      {
        companyId: internalCompany.id,
        userId: opsUser.id,
        roleId: roleMap.get('INTERNAL_OPS')!,
        title: 'Trade Operations',
        isPrimaryContact: true,
        approvedAt: new Date(),
      },
      {
        companyId: buyerCompany.id,
        userId: buyerUser.id,
        roleId: roleMap.get('BUYER_ADMIN')!,
        title: 'Procurement Head',
        isPrimaryContact: true,
        approvedAt: new Date(),
      },
      {
        companyId: sellerCompany.id,
        userId: sellerUser.id,
        roleId: roleMap.get('SELLER_ADMIN')!,
        title: 'Sales Director',
        isPrimaryContact: true,
        approvedAt: new Date(),
      },
    ],
  });

  const techSheet = await prisma.document.create({
    data: {
      publicId: 'DOC-TECH-001',
      ownerCompanyId: sellerCompany.id,
      storageBucket: 'trade-portal-documents',
      storageKey: 'seed/products/press-plates-tech-sheet.pdf',
      originalFilename: 'press-plates-tech-sheet.pdf',
      storedFilename: 'DOC-TECH-001.pdf',
      mimeType: 'application/pdf',
      sizeBytes: 102400,
      checksumSha256: 'seed-tech-sheet',
      documentType: DocumentType.TECH_SHEET,
      status: DocumentStatus.READY,
      uploadedByUserId: sellerUser.id,
    },
  });

  const quotePdf = await prisma.document.create({
    data: {
      publicId: 'DOC-QUOTE-001',
      ownerCompanyId: sellerCompany.id,
      storageBucket: 'trade-portal-documents',
      storageKey: 'seed/quotes/quote-0001.pdf',
      originalFilename: 'quote-0001.pdf',
      storedFilename: 'DOC-QUOTE-001.pdf',
      mimeType: 'application/pdf',
      sizeBytes: 125440,
      checksumSha256: 'seed-quote-pdf',
      documentType: DocumentType.QUOTE_PDF,
      status: DocumentStatus.READY,
      uploadedByUserId: sellerUser.id,
    },
  });

  await prisma.documentAccessRule.createMany({
    data: [
      {
        documentId: techSheet.id,
        visibility: DocumentVisibility.BUYER_VISIBLE,
        buyerCompanyId: buyerCompany.id,
        sellerCompanyId: sellerCompany.id,
      },
      {
        documentId: quotePdf.id,
        visibility: DocumentVisibility.BUYER_VISIBLE,
        buyerCompanyId: buyerCompany.id,
        sellerCompanyId: sellerCompany.id,
      },
    ],
  });

  const pressPlates = await prisma.product.create({
    data: {
      slug: 'press-plates',
      sellerCompanyId: sellerCompany.id,
      title: 'Press Plates',
      category: 'Lamination Tooling',
      description: 'Chrome-finished press plates for laminate and panel programmes from China.',
      originCountry: 'CN',
      currency: 'USD',
      indicativeIncoterm: 'FOB',
      indicativePriceUsd: 98.5,
      moq: 40,
      leadTimeDays: 35,
      sampleAvailable: true,
      isQuoteOnly: false,
      status: ProductStatus.PUBLISHED,
      variants: {
        create: [
          {
            sku: 'PP-CH-1220-2440',
            finish: 'Chrome',
            size: '1220 x 2440 mm',
            grade: 'Tooling',
            specificationJson: { thickness: '0.8 mm', usage: 'Decorative laminates' },
          },
        ],
      },
      documents: {
        create: [{ documentId: techSheet.id }],
      },
    },
  });

  const decorPaper = await prisma.product.create({
    data: {
      slug: 'printed-decor-paper',
      sellerCompanyId: sellerCompany.id,
      title: 'Printed Decor Paper',
      category: 'Surface Material',
      description: 'Decor papers for panel and furniture programmes with China origin supply.',
      originCountry: 'CN',
      currency: 'USD',
      indicativeIncoterm: 'FOB',
      indicativePriceUsd: 7.8,
      moq: 100,
      leadTimeDays: 28,
      sampleAvailable: true,
      isQuoteOnly: true,
      status: ProductStatus.PUBLISHED,
    },
  });

  await prisma.product.create({
    data: {
      slug: 'decorative-ss-panels',
      sellerCompanyId: sellerCompany.id,
      title: 'Decorative SS Panels',
      category: 'Architecture',
      description: 'Stainless decorative panels for architectural interiors, quoted against project requirement.',
      originCountry: 'CN',
      currency: 'USD',
      indicativeIncoterm: 'FCA',
      indicativePriceUsd: 126,
      moq: 20,
      leadTimeDays: 30,
      sampleAvailable: true,
      isQuoteOnly: true,
      status: ProductStatus.PUBLISHED,
    },
  });

  const rfq = await prisma.rfq.create({
    data: {
      publicId: 'RFQ-24021',
      buyerCompanyId: buyerCompany.id,
      assignedSellerCompanyId: sellerCompany.id,
      createdByUserId: buyerUser.id,
      destinationCountry: 'IN',
      destinationPort: 'Nhava Sheva',
      targetShipmentMonth: '2026-06',
      incoterm: 'FOB',
      currency: 'USD',
      shipmentType: ShipmentType.FCL,
      sourceCountry: 'CN',
      notes: 'Containerized shipment preferred. FCA review required if stuffing arranged inland.',
      status: RfqStatus.QUOTED,
      items: {
        create: [
          {
            productId: pressPlates.id,
            itemNameSnapshot: 'Press Plates',
            specificationSnapshotJson: { size: '1220 x 2440 mm', finish: 'Chrome' },
            quantity: 60,
            uom: 'pcs',
            note: 'Laminate press line programme',
          },
          {
            productId: decorPaper.id,
            itemNameSnapshot: 'Printed Decor Paper',
            specificationSnapshotJson: { design: 'Oak series', gsm: '80' },
            quantity: 500,
            uom: 'reams',
            note: 'Matching programme with plate selection',
          },
        ],
      },
    },
    include: { items: true },
  });

  const quote = await prisma.quote.create({
    data: {
      publicId: 'Q-24021-1',
      rfqId: rfq.id,
      sellerCompanyId: sellerCompany.id,
      createdByUserId: sellerUser.id,
      revisionNo: 1,
      currency: 'USD',
      incoterm: 'FOB',
      fobPort: 'Shanghai',
      validityDate: new Date('2026-05-31T00:00:00.000Z'),
      leadTimeDays: 32,
      moqNote: 'MOQ aligned to programme batching',
      subtotalUsd: 9820,
      status: QuoteStatus.ACCEPTED,
      pdfDocumentId: quotePdf.id,
      items: {
        create: [
          {
            rfqItemId: rfq.items[0]?.id,
            productId: pressPlates.id,
            lineLabel: 'Press Plates',
            quantity: 60,
            unitPriceUsd: 98.5,
            totalPriceUsd: 5910,
            leadTimeDays: 32,
            moq: 40,
            note: 'FOB Shanghai, export packing included',
          },
          {
            rfqItemId: rfq.items[1]?.id,
            productId: decorPaper.id,
            lineLabel: 'Printed Decor Paper',
            quantity: 500,
            unitPriceUsd: 7.82,
            totalPriceUsd: 3910,
            leadTimeDays: 28,
            moq: 100,
            note: 'Design approval locked before mass production',
          },
        ],
      },
    },
  });

  const order = await prisma.order.create({
    data: {
      publicId: 'ORD-8834',
      quoteId: quote.id,
      buyerCompanyId: buyerCompany.id,
      sellerCompanyId: sellerCompany.id,
      createdByUserId: opsUser.id,
      currency: 'USD',
      incoterm: 'FOB',
      shipmentType: ShipmentType.FCL,
      sourceCountry: 'CN',
      orderTotalUsd: 9820,
      status: OrderStatus.IN_TRANSIT,
      commercialSnapshotJson: {
        quotePublicId: 'Q-24021-1',
        incoterm: 'FOB',
        currency: 'USD',
        sourceCountry: 'CN',
      },
      items: {
        create: [
          {
            productId: pressPlates.id,
            lineLabel: 'Press Plates',
            quantity: 60,
            uom: 'pcs',
            unitPriceUsd: 98.5,
            totalPriceUsd: 5910,
            specificationSnapshotJson: { size: '1220 x 2440 mm', finish: 'Chrome' },
          },
          {
            productId: decorPaper.id,
            lineLabel: 'Printed Decor Paper',
            quantity: 500,
            uom: 'reams',
            unitPriceUsd: 7.82,
            totalPriceUsd: 3910,
            specificationSnapshotJson: { design: 'Oak series', gsm: '80' },
          },
        ],
      },
      statusHistory: {
        create: [
          { fromStatus: OrderStatus.DRAFT, toStatus: OrderStatus.AWAITING_PI, changedByUserId: opsUser.id, note: 'Order created from accepted quote' },
          { fromStatus: OrderStatus.AWAITING_PI, toStatus: OrderStatus.PI_ISSUED, changedByUserId: opsUser.id, note: 'PI issued' },
          { fromStatus: OrderStatus.PI_ISSUED, toStatus: OrderStatus.DEPOSIT_RECEIVED, changedByUserId: opsUser.id, note: 'Deposit received' },
          { fromStatus: OrderStatus.DEPOSIT_RECEIVED, toStatus: OrderStatus.PRODUCTION, changedByUserId: sellerUser.id, note: 'Production released' },
          { fromStatus: OrderStatus.PRODUCTION, toStatus: OrderStatus.BALANCE_RECEIVED, changedByUserId: opsUser.id, note: 'Balance cleared' },
          { fromStatus: OrderStatus.BALANCE_RECEIVED, toStatus: OrderStatus.IN_TRANSIT, changedByUserId: sellerUser.id, note: 'Shipment sailed' },
        ],
      },
      payments: {
        create: [
          {
            paymentType: PaymentType.DEPOSIT,
            dueDate: new Date('2026-05-05T00:00:00.000Z'),
            percentage: 30,
            amountUsd: 2946,
            status: PaymentStatus.RECONCILED,
            events: {
              create: [
                {
                  eventType: 'RECONCILED',
                  actorUserId: opsUser.id,
                  note: 'TT deposit matched to bank statement',
                  remittanceReference: 'TT-DEP-8834',
                },
              ],
            },
          },
          {
            paymentType: PaymentType.BALANCE,
            dueDate: new Date('2026-05-28T00:00:00.000Z'),
            percentage: 70,
            amountUsd: 6874,
            status: PaymentStatus.RECONCILED,
            events: {
              create: [
                {
                  eventType: 'RECONCILED',
                  actorUserId: opsUser.id,
                  note: 'TT balance matched and released for shipment docs',
                  remittanceReference: 'TT-BAL-8834',
                },
              ],
            },
          },
        ],
      },
      shipment: {
        create: {
          incoterm: 'FOB',
          originCountry: 'CN',
          fobPort: 'Shanghai',
          etd: new Date('2026-05-31T00:00:00.000Z'),
          eta: new Date('2026-06-12T00:00:00.000Z'),
          vessel: 'MV Eastern Trade',
          voyage: 'ET-901',
          containerNo: 'TCLU1234567',
          blNo: 'BL8834',
          freightForwarder: 'Blue Sea Forwarding',
          status: ShipmentStatus.IN_TRANSIT,
          milestones: {
            create: [
              { code: 'booking_confirmed', label: 'Booking confirmed', occurredAt: new Date('2026-05-27T00:00:00.000Z'), status: MilestoneStatus.DONE, buyerVisible: true, sellerVisible: true, opsOnly: false, createdByUserId: sellerUser.id },
              { code: 'container_gated_in', label: 'Container gated in', occurredAt: new Date('2026-05-29T00:00:00.000Z'), status: MilestoneStatus.DONE, buyerVisible: true, sellerVisible: true, opsOnly: false, createdByUserId: sellerUser.id },
              { code: 'vessel_departed', label: 'Vessel departed', occurredAt: new Date('2026-05-31T00:00:00.000Z'), status: MilestoneStatus.DONE, buyerVisible: true, sellerVisible: true, opsOnly: false, createdByUserId: sellerUser.id },
              { code: 'arrival_pending', label: 'Arrival pending', status: MilestoneStatus.PENDING, buyerVisible: true, sellerVisible: true, opsOnly: false, createdByUserId: opsUser.id },
            ],
          },
        },
      },
    },
  });

  await prisma.notification.createMany({
    data: [
      {
        userId: buyerUser.id,
        companyId: buyerCompany.id,
        type: 'quote.accepted',
        title: 'Quote accepted',
        body: 'Accepted quote Q-24021-1 moved into order release.',
        link: '/portal/buyer/orders/ORD-8834',
      },
      {
        userId: sellerUser.id,
        companyId: sellerCompany.id,
        type: 'order.in_transit',
        title: 'Order in transit',
        body: 'ORD-8834 has sailed and buyer-visible milestones are active.',
        link: '/portal/seller/orders/ORD-8834',
      },
      {
        userId: adminUser.id,
        companyId: internalCompany.id,
        type: 'audit.seed',
        title: 'Seed complete',
        body: 'Demo buyer, seller, quotes, orders, payments, and shipment records loaded.',
        link: '/portal/admin/dashboard',
      },
    ],
  });

  await prisma.auditLog.createMany({
    data: [
      {
        actorUserId: opsUser.id,
        companyId: internalCompany.id,
        entityType: 'order',
        entityId: order.id,
        action: 'seed.order.created',
        afterJson: { publicId: 'ORD-8834', status: OrderStatus.IN_TRANSIT },
      },
      {
        actorUserId: adminUser.id,
        companyId: internalCompany.id,
        entityType: 'seed',
        entityId: 'system',
        action: 'seed.completed',
        afterJson: { buyer: buyerCompany.slug, seller: sellerCompany.slug },
      },
    ],
  });

  console.log('Seed complete');
  console.log('Admin login: admin@moldart.local / Portal@12345');
  console.log('Buyer login: buyer@demo.local / Portal@12345');
  console.log('Seller login: seller@demo.local / Portal@12345');
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
