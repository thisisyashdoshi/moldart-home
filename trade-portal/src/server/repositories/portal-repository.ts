import 'server-only';

import { Prisma } from '@prisma/client';
import { prisma } from '@/lib/db';
import type { SecureSession } from '@/server/auth/session';

function productSummarySelect() {
  return {
    id: true,
    slug: true,
    title: true,
    category: true,
    description: true,
    originCountry: true,
    currency: true,
    indicativeIncoterm: true,
    indicativePriceUsd: true,
    moq: true,
    leadTimeDays: true,
    sampleAvailable: true,
    isQuoteOnly: true,
    status: true,
    sellerCompany: { select: { name: true } },
    variants: { select: { id: true, sku: true, finish: true, size: true, grade: true } },
  } satisfies Prisma.ProductSelect;
}

function quoteSummarySelect() {
  return {
    publicId: true,
    status: true,
    currency: true,
    incoterm: true,
    fobPort: true,
    subtotalUsd: true,
    revisionNo: true,
    validityDate: true,
    rfq: { select: { publicId: true, destinationCountry: true, destinationPort: true } },
    sellerCompany: { select: { name: true } },
  } satisfies Prisma.QuoteSelect;
}

function orderSummarySelect() {
  return {
    publicId: true,
    status: true,
    currency: true,
    incoterm: true,
    orderTotalUsd: true,
    createdAt: true,
    buyerCompany: { select: { name: true } },
    sellerCompany: { select: { name: true } },
    payments: { select: { id: true, paymentType: true, amountUsd: true, status: true } },
    shipment: { select: { status: true, etd: true, eta: true, vessel: true, voyage: true, fobPort: true } },
  } satisfies Prisma.OrderSelect;
}

export async function getDashboardData(session: SecureSession) {
  if (session.scope === 'buyer') {
    const [products, rfqs, quotes, orders, notifications] = await Promise.all([
      prisma.product.count({ where: { status: 'PUBLISHED' } }),
      prisma.rfq.count({ where: { buyerCompanyId: session.companyId } }),
      prisma.quote.count({ where: { rfq: { buyerCompanyId: session.companyId } } }),
      prisma.order.count({ where: { buyerCompanyId: session.companyId } }),
      prisma.notification.findMany({
        where: { companyId: session.companyId, userId: session.userId },
        orderBy: { createdAt: 'desc' },
        take: 5,
      }),
    ]);

    return {
      cards: [
        { label: 'Products', value: products, detail: 'Published sourcing lines available for review.' },
        { label: 'RFQs', value: rfqs, detail: 'Buyer-side inquiries and draft sourcing packs.' },
        { label: 'Quotes', value: quotes, detail: 'Commercial offers received against RFQs.' },
        { label: 'Orders', value: orders, detail: 'Approved orders under commercial execution.' },
      ],
      notifications,
    };
  }

  if (session.scope === 'seller') {
    const [products, inquiries, quotes, orders, notifications] = await Promise.all([
      prisma.product.count({ where: { sellerCompanyId: session.companyId } }),
      prisma.rfq.count({ where: { assignedSellerCompanyId: session.companyId } }),
      prisma.quote.count({ where: { sellerCompanyId: session.companyId } }),
      prisma.order.count({ where: { sellerCompanyId: session.companyId } }),
      prisma.notification.findMany({
        where: { companyId: session.companyId, userId: session.userId },
        orderBy: { createdAt: 'desc' },
        take: 5,
      }),
    ]);

    return {
      cards: [
        { label: 'Products', value: products, detail: 'Seller catalog lines and drafts.' },
        { label: 'Inquiries', value: inquiries, detail: 'Assigned buyer RFQs requiring review.' },
        { label: 'Quotes', value: quotes, detail: 'Issued or revised commercial offers.' },
        { label: 'Orders', value: orders, detail: 'Confirmed orders in execution.' },
      ],
      notifications,
    };
  }

  const [companies, users, rfqs, orders, audits] = await Promise.all([
    prisma.company.count(),
    prisma.user.count(),
    prisma.rfq.count(),
    prisma.order.count(),
    prisma.auditLog.findMany({ orderBy: { createdAt: 'desc' }, take: 5 }),
  ]);

  return {
    cards: [
      { label: 'Companies', value: companies, detail: 'Buyer, seller, and internal companies.' },
      { label: 'Users', value: users, detail: 'Platform users and company memberships.' },
      { label: 'RFQs', value: rfqs, detail: 'Trade sourcing requests across the platform.' },
      { label: 'Orders', value: orders, detail: 'Confirmed orders across execution.' },
    ],
    notifications: audits.map((audit) => ({
      id: audit.id,
      title: audit.action,
      body: `${audit.entityType} • ${audit.entityId}`,
      link: '/portal/admin/audit',
      createdAt: audit.createdAt,
    })),
  };
}

export async function listBuyerProducts(search?: string) {
  return prisma.product.findMany({
    where: {
      status: 'PUBLISHED',
      ...(search
        ? {
            OR: [
              { title: { contains: search, mode: 'insensitive' } },
              { category: { contains: search, mode: 'insensitive' } },
              { description: { contains: search, mode: 'insensitive' } },
            ],
          }
        : {}),
    },
    orderBy: { updatedAt: 'desc' },
    select: productSummarySelect(),
  });
}

export async function listSellerProducts(session: SecureSession) {
  return prisma.product.findMany({
    where: { sellerCompanyId: session.companyId },
    orderBy: { updatedAt: 'desc' },
    select: productSummarySelect(),
  });
}

export async function getProductBySlugForScope(session: SecureSession, slug: string) {
  const baseWhere = session.scope === 'seller'
    ? { slug, sellerCompanyId: session.companyId }
    : session.scope === 'admin'
      ? { slug }
      : { slug, status: 'PUBLISHED' as const };

  return prisma.product.findFirst({
    where: baseWhere,
    select: {
      ...productSummarySelect(),
      documents: {
        select: {
          document: {
            select: {
              publicId: true,
              originalFilename: true,
              documentType: true,
              status: true,
              accessRules: { select: { visibility: true } },
            },
          },
        },
      },
    },
  });
}

export async function listBuyerRfqs(session: SecureSession) {
  return prisma.rfq.findMany({
    where: { buyerCompanyId: session.companyId },
    orderBy: { updatedAt: 'desc' },
    include: {
      items: true,
      assignedSellerCompany: { select: { name: true } },
    },
  });
}

export async function listAdminRfqs() {
  return prisma.rfq.findMany({
    orderBy: { updatedAt: 'desc' },
    include: {
      items: true,
      assignedSellerCompany: { select: { id: true, name: true } },
      buyerCompany: { select: { name: true } },
    },
  });
}

export async function listActiveSellerCompanies() {
  return prisma.company.findMany({
    where: { companyType: 'SELLER', status: 'ACTIVE' },
    orderBy: { name: 'asc' },
    select: { id: true, name: true },
  });
}

export async function getBuyerRfq(session: SecureSession, publicId: string) {
  return prisma.rfq.findFirst({
    where: { publicId, buyerCompanyId: session.companyId },
    include: {
      items: { include: { product: { select: { title: true, slug: true } } } },
      assignedSellerCompany: { select: { name: true } },
      quotes: { select: quoteSummarySelect() },
      attachments: {
        select: {
          document: {
            select: {
              publicId: true,
              originalFilename: true,
              documentType: true,
              status: true,
            },
          },
        },
      },
    },
  });
}

export async function listSellerInquiries(session: SecureSession) {
  return prisma.rfq.findMany({
    where: { assignedSellerCompanyId: session.companyId },
    orderBy: { updatedAt: 'desc' },
    include: {
      buyerCompany: { select: { name: true } },
      items: true,
    },
  });
}

export async function getSellerInquiry(session: SecureSession, publicId: string) {
  return prisma.rfq.findFirst({
    where: { publicId, assignedSellerCompanyId: session.companyId },
    include: {
      buyerCompany: { select: { name: true } },
      items: { include: { product: { select: { title: true } } } },
      quotes: { select: quoteSummarySelect() },
    },
  });
}

export async function listQuotesForScope(session: SecureSession) {
  const where =
    session.scope === 'buyer'
      ? { rfq: { buyerCompanyId: session.companyId } }
      : session.scope === 'seller'
        ? { sellerCompanyId: session.companyId }
        : {};

  return prisma.quote.findMany({
    where,
    orderBy: { updatedAt: 'desc' },
    select: quoteSummarySelect(),
  });
}

export async function getQuoteForScope(session: SecureSession, publicId: string) {
  const where =
    session.scope === 'buyer'
      ? { publicId, rfq: { buyerCompanyId: session.companyId } }
      : session.scope === 'seller'
        ? { publicId, sellerCompanyId: session.companyId }
        : { publicId };

  return prisma.quote.findFirst({
    where,
    include: {
      rfq: { select: { publicId: true, destinationCountry: true, destinationPort: true, shipmentType: true } },
      sellerCompany: { select: { name: true } },
      items: true,
      pdfDocument: { select: { publicId: true, originalFilename: true } },
      order: { select: orderSummarySelect() },
    },
  });
}

export async function listOrdersForScope(session: SecureSession) {
  const where =
    session.scope === 'buyer'
      ? { buyerCompanyId: session.companyId }
      : session.scope === 'seller'
        ? { sellerCompanyId: session.companyId }
        : {};

  return prisma.order.findMany({
    where,
    orderBy: { updatedAt: 'desc' },
    select: orderSummarySelect(),
  });
}

export async function getOrderForScope(session: SecureSession, publicId: string) {
  const where =
    session.scope === 'buyer'
      ? { publicId, buyerCompanyId: session.companyId }
      : session.scope === 'seller'
        ? { publicId, sellerCompanyId: session.companyId }
        : { publicId };

  return prisma.order.findFirst({
    where,
    include: {
      items: true,
      statusHistory: { orderBy: { changedAt: 'asc' } },
      payments: { include: { events: true } },
      shipment: { include: { milestones: { orderBy: { createdAt: 'asc' } } } },
    },
  });
}

export async function listPaymentsForScope(session: SecureSession) {
  const where =
    session.scope === 'buyer'
      ? { order: { buyerCompanyId: session.companyId } }
      : session.scope === 'seller'
        ? { order: { sellerCompanyId: session.companyId } }
        : {};

  return prisma.payment.findMany({
    where,
    orderBy: { dueDate: 'asc' },
    include: {
      order: { select: { publicId: true, status: true } },
      events: { orderBy: { createdAt: 'desc' }, take: 1 },
    },
  });
}

export async function listLogisticsForScope(session: SecureSession) {
  const where =
    session.scope === 'buyer'
      ? { order: { buyerCompanyId: session.companyId } }
      : session.scope === 'seller'
        ? { order: { sellerCompanyId: session.companyId } }
        : {};

  return prisma.shipment.findMany({
    where,
    orderBy: { eta: 'asc' },
    include: {
      order: { select: { publicId: true, status: true } },
      milestones: { orderBy: { createdAt: 'asc' } },
    },
  });
}

export async function listDocumentsForScope(session: SecureSession) {
  const documents = await prisma.document.findMany({
    where: session.scope === 'admin'
      ? {}
      : {
          OR: [
            { ownerCompanyId: session.companyId },
            {
              accessRules: {
                some:
                  session.scope === 'buyer'
                    ? { buyerCompanyId: session.companyId }
                    : { sellerCompanyId: session.companyId },
              },
            },
          ],
        },
    orderBy: { createdAt: 'desc' },
    include: { accessRules: true },
  });

  return documents.filter((document) => {
    if (session.scope === 'admin') return true;
    return document.accessRules.some((rule) =>
      session.scope === 'buyer'
        ? rule.buyerCompanyId === session.companyId && rule.visibility !== 'OPS_ONLY'
        : rule.sellerCompanyId === session.companyId && rule.visibility !== 'OPS_ONLY',
    );
  });
}

export async function getCompanyProfile(session: SecureSession) {
  return prisma.company.findUnique({
    where: { id: session.companyId },
    include: {
      companyUsers: {
        where: { approvedAt: { not: null } },
        include: {
          user: { select: { id: true, email: true, firstName: true, lastName: true, status: true } },
          role: { select: { key: true, label: true } },
        },
      },
    },
  });
}

export async function getAdminSnapshot() {
  const [pendingCompanies, pendingUsers, products, auditLogs] = await Promise.all([
    prisma.company.findMany({ where: { status: 'PENDING' }, orderBy: { createdAt: 'asc' } }),
    prisma.user.findMany({ where: { status: 'PENDING' }, orderBy: { createdAt: 'asc' } }),
    prisma.product.findMany({ orderBy: { updatedAt: 'desc' }, take: 10, select: productSummarySelect() }),
    prisma.auditLog.findMany({ orderBy: { createdAt: 'desc' }, take: 20 }),
  ]);

  return { pendingCompanies, pendingUsers, products, auditLogs };
}

export async function getDocumentDownload(session: SecureSession, publicId: string) {
  const document = await prisma.document.findFirst({
    where: { publicId },
    include: { accessRules: true },
  });

  if (!document) return null;
  if (session.scope === 'admin') return document;

  const allowed = document.accessRules.some((rule) =>
    session.scope === 'buyer'
      ? rule.buyerCompanyId === session.companyId && rule.visibility !== 'OPS_ONLY'
      : rule.sellerCompanyId === session.companyId && rule.visibility !== 'OPS_ONLY',
  );

  return allowed ? document : null;
}
