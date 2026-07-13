'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { Prisma } from '@prisma/client';
import { z } from 'zod';
import { prisma } from '@/lib/db';
import { requireScope, requireSession } from '@/server/auth/session';

const assignRfqSchema = z.object({
  rfqPublicId: z.string().min(1),
  sellerCompanyId: z.string().min(1),
});

const issueQuoteSchema = z.object({
  rfqPublicId: z.string().min(1),
  unitPriceUsd: z.coerce.number().positive().max(1_000_000),
  fobPort: z.string().trim().min(2).max(80),
  validityDate: z.string().min(8),
  leadTimeDays: z.coerce.number().int().min(1).max(365).default(30),
  moqNote: z.string().trim().max(240).optional(),
});

const quotePublicIdSchema = z.object({
  quotePublicId: z.string().min(1),
});

const paymentReportSchema = z.object({
  paymentId: z.string().min(1),
  remittanceReference: z.string().trim().max(120).optional(),
  note: z.string().trim().max(500).optional(),
});

const paymentReconcileSchema = z.object({
  paymentId: z.string().min(1),
  decision: z.enum(['RECONCILED', 'FAILED']),
  note: z.string().trim().max(500).optional(),
});

const milestoneSchema = z.object({
  milestoneId: z.string().min(1),
  note: z.string().trim().max(500).optional(),
});

function makePublicId(prefix: string) {
  const now = Date.now().toString(36).toUpperCase();
  const suffix = Math.random().toString(36).slice(2, 5).toUpperCase();
  return `${prefix}-${now}-${suffix}`;
}

function addDays(days: number) {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date;
}

function formObject(formData: FormData) {
  return Object.fromEntries(formData.entries());
}

async function notifyCompanyUsers(tx: Prisma.TransactionClient, companyId: string, notification: { type: string; title: string; body: string; link: string }) {
  const memberships = await tx.companyUser.findMany({
    where: { companyId, approvedAt: { not: null }, user: { status: 'ACTIVE' } },
    select: { userId: true },
  });

  if (!memberships.length) return;

  await tx.notification.createMany({
    data: memberships.map((membership) => ({
      userId: membership.userId,
      companyId,
      ...notification,
    })),
  });
}

export async function assignRfqToSellerAction(formData: FormData) {
  const session = await requireScope('admin');
  const parsed = assignRfqSchema.parse(formObject(formData));

  await prisma.$transaction(async (tx) => {
    const seller = await tx.company.findFirst({
      where: { id: parsed.sellerCompanyId, companyType: 'SELLER', status: 'ACTIVE' },
      select: { id: true, name: true },
    });
    if (!seller) throw new Error('Selected seller is not active.');

    const rfq = await tx.rfq.findUnique({
      where: { publicId: parsed.rfqPublicId },
      select: { id: true, publicId: true, status: true },
    });
    if (!rfq) throw new Error('RFQ not found.');

    await tx.rfq.update({
      where: { id: rfq.id },
      data: {
        assignedSellerCompanyId: seller.id,
        status: rfq.status === 'SUBMITTED' ? 'UNDER_REVIEW' : rfq.status,
      },
    });

    await notifyCompanyUsers(tx, seller.id, {
      type: 'rfq.assigned',
      title: 'New RFQ assigned',
      body: `${rfq.publicId} is ready for seller review and quotation.`,
      link: `/portal/seller/inquiries/${rfq.publicId}`,
    });

    await tx.auditLog.create({
      data: {
        actorUserId: session.userId,
        companyId: session.companyId,
        entityType: 'rfq',
        entityId: rfq.publicId,
        action: 'rfq.assigned_to_seller',
        afterJson: { sellerCompanyId: seller.id, sellerCompanyName: seller.name },
      },
    });
  });

  revalidatePath('/portal/admin/rfqs');
}

export async function issueSellerQuoteAction(formData: FormData) {
  const session = await requireScope('seller');
  const parsed = issueQuoteSchema.parse(formObject(formData));

  const quotePublicId = await prisma.$transaction(async (tx) => {
    const rfq = await tx.rfq.findFirst({
      where: {
        publicId: parsed.rfqPublicId,
        assignedSellerCompanyId: session.companyId,
        status: { notIn: ['CLOSED', 'CANCELLED'] },
      },
      include: {
        items: true,
        buyerCompany: { select: { id: true, name: true } },
      },
    });
    if (!rfq) throw new Error('Assigned RFQ not found.');
    if (!rfq.items.length) throw new Error('RFQ has no line items.');

    const latestQuote = await tx.quote.findFirst({
      where: { rfqId: rfq.id, sellerCompanyId: session.companyId },
      orderBy: { revisionNo: 'desc' },
      select: { revisionNo: true },
    });

    await tx.quote.updateMany({
      where: { rfqId: rfq.id, sellerCompanyId: session.companyId, status: { in: ['ISSUED', 'REVISED'] } },
      data: { status: 'SUPERSEDED' },
    });

    const unitPrice = new Prisma.Decimal(parsed.unitPriceUsd);
    const subtotal = rfq.items.reduce((sum, item) => sum.plus(unitPrice.mul(item.quantity)), new Prisma.Decimal(0));
    const publicId = makePublicId('Q');
    const revisionNo = (latestQuote?.revisionNo ?? 0) + 1;

    const quote = await tx.quote.create({
      data: {
        publicId,
        rfqId: rfq.id,
        sellerCompanyId: session.companyId,
        createdByUserId: session.userId,
        revisionNo,
        currency: 'USD',
        incoterm: rfq.incoterm,
        fobPort: parsed.fobPort,
        validityDate: new Date(`${parsed.validityDate}T00:00:00.000Z`),
        leadTimeDays: parsed.leadTimeDays,
        moqNote: parsed.moqNote || null,
        subtotalUsd: subtotal,
        status: revisionNo === 1 ? 'ISSUED' : 'REVISED',
        items: {
          create: rfq.items.map((item) => ({
            rfqItemId: item.id,
            productId: item.productId,
            lineLabel: item.itemNameSnapshot,
            quantity: item.quantity,
            unitPriceUsd: unitPrice,
            totalPriceUsd: unitPrice.mul(item.quantity),
            leadTimeDays: parsed.leadTimeDays,
            note: parsed.moqNote || null,
          })),
        },
      },
      select: { publicId: true },
    });

    await tx.rfq.update({
      where: { id: rfq.id },
      data: { status: 'QUOTED' },
    });

    await notifyCompanyUsers(tx, rfq.buyerCompanyId, {
      type: 'quote.issued',
      title: 'Quote issued',
      body: `${quote.publicId} is ready for buyer review.`,
      link: `/portal/buyer/quotes/${quote.publicId}`,
    });

    await tx.auditLog.create({
      data: {
        actorUserId: session.userId,
        companyId: session.companyId,
        entityType: 'quote',
        entityId: quote.publicId,
        action: 'quote.issued',
        afterJson: { rfqPublicId: rfq.publicId, revisionNo, subtotalUsd: subtotal.toString() },
      },
    });

    return quote.publicId;
  });

  redirect(`/portal/seller/quotes/${quotePublicId}`);
}

export async function acceptQuoteAction(formData: FormData) {
  const session = await requireScope('buyer');
  const parsed = quotePublicIdSchema.parse(formObject(formData));

  const orderPublicId = await prisma.$transaction(async (tx) => {
    const quote = await tx.quote.findFirst({
      where: {
        publicId: parsed.quotePublicId,
        rfq: { buyerCompanyId: session.companyId },
      },
      include: {
        rfq: true,
        order: { select: { publicId: true } },
        items: { include: { rfqItem: true } },
      },
    });
    if (!quote) throw new Error('Quote not found.');
    if (quote.order) return quote.order.publicId;
    if (!['ISSUED', 'REVISED'].includes(quote.status)) throw new Error('Only issued or revised quotes can be accepted.');

    const total = new Prisma.Decimal(quote.subtotalUsd);
    const deposit = total.mul(new Prisma.Decimal('0.30')).toDecimalPlaces(2);
    const balance = total.minus(deposit);
    const publicId = makePublicId('ORD');

    await tx.quote.update({
      where: { id: quote.id },
      data: { status: 'ACCEPTED' },
    });

    await tx.quote.updateMany({
      where: { rfqId: quote.rfqId, id: { not: quote.id }, status: { in: ['ISSUED', 'REVISED'] } },
      data: { status: 'SUPERSEDED' },
    });

    await tx.rfq.update({
      where: { id: quote.rfqId },
      data: { status: 'APPROVED' },
    });

    const order = await tx.order.create({
      data: {
        publicId,
        quoteId: quote.id,
        buyerCompanyId: quote.rfq.buyerCompanyId,
        sellerCompanyId: quote.sellerCompanyId,
        createdByUserId: session.userId,
        currency: quote.currency,
        incoterm: quote.incoterm,
        shipmentType: quote.rfq.shipmentType,
        sourceCountry: quote.rfq.sourceCountry,
        orderTotalUsd: total,
        status: 'DEPOSIT_PENDING',
        commercialSnapshotJson: {
          quotePublicId: quote.publicId,
          rfqPublicId: quote.rfq.publicId,
          revisionNo: quote.revisionNo,
          fobPort: quote.fobPort,
          acceptedByUserId: session.userId,
        },
        items: {
          create: quote.items.map((item) => ({
            productId: item.productId,
            lineLabel: item.lineLabel,
            quantity: item.quantity,
            uom: item.rfqItem?.uom ?? 'lot',
            unitPriceUsd: item.unitPriceUsd,
            totalPriceUsd: item.totalPriceUsd,
            specificationSnapshotJson: item.rfqItem?.specificationSnapshotJson ?? {},
          })),
        },
        statusHistory: {
          create: {
            toStatus: 'DEPOSIT_PENDING',
            changedByUserId: session.userId,
            note: 'Quote accepted by buyer; deposit milestone opened.',
          },
        },
        payments: {
          create: [
            {
              paymentType: 'DEPOSIT',
              percentage: new Prisma.Decimal('30.00'),
              amountUsd: deposit,
              dueDate: addDays(7),
              status: 'DUE',
            },
            {
              paymentType: 'BALANCE',
              percentage: new Prisma.Decimal('70.00'),
              amountUsd: balance,
              dueDate: addDays(45),
              status: 'PENDING',
            },
          ],
        },
        shipment: {
          create: {
            incoterm: quote.incoterm,
            originCountry: quote.rfq.sourceCountry,
            fobPort: quote.fobPort,
            status: 'PLANNING',
            milestones: {
              create: [
                { code: 'fob_ready', label: 'FOB port details confirmed', createdByUserId: session.userId },
                { code: 'booking_confirmed', label: 'Forwarder booking confirmed', createdByUserId: session.userId },
                { code: 'on_board', label: 'Cargo on board', createdByUserId: session.userId },
                { code: 'arrival_notice', label: 'Arrival notice received', createdByUserId: session.userId },
                { code: 'customs_clearance', label: 'Customs cleared', createdByUserId: session.userId },
                { code: 'delivered', label: 'Delivered', createdByUserId: session.userId },
              ],
            },
          },
        },
      },
      select: { publicId: true },
    });

    await notifyCompanyUsers(tx, quote.sellerCompanyId, {
      type: 'quote.accepted',
      title: 'Quote accepted',
      body: `${quote.publicId} moved into order ${order.publicId}.`,
      link: `/portal/seller/orders/${order.publicId}`,
    });

    await tx.auditLog.create({
      data: {
        actorUserId: session.userId,
        companyId: session.companyId,
        entityType: 'order',
        entityId: order.publicId,
        action: 'order.created_from_quote',
        afterJson: { quotePublicId: quote.publicId, orderTotalUsd: total.toString() },
      },
    });

    return order.publicId;
  });

  redirect(`/portal/buyer/orders/${orderPublicId}`);
}

export async function reportPaymentAction(formData: FormData) {
  const session = await requireScope('buyer');
  const parsed = paymentReportSchema.parse(formObject(formData));

  await prisma.$transaction(async (tx) => {
    const payment = await tx.payment.findFirst({
      where: { id: parsed.paymentId, order: { buyerCompanyId: session.companyId } },
      include: { order: { select: { publicId: true } } },
    });
    if (!payment) throw new Error('Payment milestone not found.');

    await tx.payment.update({
      where: { id: payment.id },
      data: { status: 'REPORTED' },
    });

    await tx.paymentEvent.create({
      data: {
        paymentId: payment.id,
        eventType: 'MOCK_BUYER_REPORTED',
        actorUserId: session.userId,
        remittanceReference: parsed.remittanceReference || null,
        note: parsed.note || 'Buyer reported payment proof in internal review mode.',
      },
    });

    await tx.auditLog.create({
      data: {
        actorUserId: session.userId,
        companyId: session.companyId,
        entityType: 'payment',
        entityId: payment.id,
        action: 'payment.reported_mock',
        afterJson: { orderPublicId: payment.order.publicId, paymentType: payment.paymentType },
      },
    });
  });

  revalidatePath('/portal/buyer/payments');
  revalidatePath('/portal/buyer/orders');
}

export async function reconcilePaymentAction(formData: FormData) {
  const session = await requireScope('admin');
  const parsed = paymentReconcileSchema.parse(formObject(formData));

  await prisma.$transaction(async (tx) => {
    const payment = await tx.payment.findUnique({
      where: { id: parsed.paymentId },
      include: { order: { select: { id: true, publicId: true, status: true } } },
    });
    if (!payment) throw new Error('Payment milestone not found.');

    await tx.payment.update({
      where: { id: payment.id },
      data: { status: parsed.decision },
    });

    await tx.paymentEvent.create({
      data: {
        paymentId: payment.id,
        eventType: parsed.decision === 'RECONCILED' ? 'MOCK_GATEWAY_RECONCILED' : 'MOCK_GATEWAY_FAILED',
        actorUserId: session.userId,
        note: parsed.note || 'Internal mock gateway reconciliation event.',
      },
    });

    const nextOrderStatus =
      parsed.decision === 'RECONCILED' && payment.paymentType === 'DEPOSIT' && payment.order.status === 'DEPOSIT_PENDING'
        ? 'DEPOSIT_RECEIVED'
        : parsed.decision === 'RECONCILED' && payment.paymentType === 'BALANCE' && payment.order.status === 'BALANCE_PENDING'
          ? 'BALANCE_RECEIVED'
          : null;

    if (nextOrderStatus) {
      await tx.order.update({
        where: { id: payment.order.id },
        data: { status: nextOrderStatus },
      });

      await tx.orderStatusHistory.create({
        data: {
          orderId: payment.order.id,
          fromStatus: payment.order.status,
          toStatus: nextOrderStatus,
          changedByUserId: session.userId,
          note: `${payment.paymentType} payment reconciled in mock gateway flow.`,
        },
      });
    }

    await tx.auditLog.create({
      data: {
        actorUserId: session.userId,
        companyId: session.companyId,
        entityType: 'payment',
        entityId: payment.id,
        action: `payment.${parsed.decision.toLowerCase()}_mock`,
        afterJson: { orderPublicId: payment.order.publicId, paymentType: payment.paymentType },
      },
    });
  });

  revalidatePath('/portal/admin/payments');
  revalidatePath('/portal/admin/orders');
}

export async function completeShipmentMilestoneAction(formData: FormData) {
  const session = await requireSession();
  if (session.scope === 'buyer') throw new Error('Buyers cannot update shipment milestones.');
  const parsed = milestoneSchema.parse(formObject(formData));

  await prisma.$transaction(async (tx) => {
    const milestone = await tx.shipmentMilestone.findUnique({
      where: { id: parsed.milestoneId },
      include: {
        shipment: {
          include: {
            order: { select: { id: true, publicId: true, sellerCompanyId: true, status: true } },
          },
        },
      },
    });
    if (!milestone) throw new Error('Shipment milestone not found.');
    if (session.scope === 'seller' && milestone.shipment.order.sellerCompanyId !== session.companyId) {
      throw new Error('Milestone is outside this seller company.');
    }

    await tx.shipmentMilestone.update({
      where: { id: milestone.id },
      data: {
        status: 'DONE',
        occurredAt: new Date(),
        note: parsed.note || milestone.note,
        createdByUserId: session.userId,
      },
    });

    const shipmentStatusByCode: Record<string, 'BOOKED' | 'ON_BOARD' | 'ARRIVED' | 'CUSTOMS' | 'DELIVERED'> = {
      booking_confirmed: 'BOOKED',
      on_board: 'ON_BOARD',
      vessel_departed: 'ON_BOARD',
      arrival_notice: 'ARRIVED',
      arrival_pending: 'ARRIVED',
      customs_clearance: 'CUSTOMS',
      delivered: 'DELIVERED',
    };

    const nextShipmentStatus = shipmentStatusByCode[milestone.code];
    if (nextShipmentStatus) {
      await tx.shipment.update({
        where: { id: milestone.shipmentId },
        data: { status: nextShipmentStatus },
      });
    }

    if (nextShipmentStatus === 'DELIVERED') {
      await tx.order.update({
        where: { id: milestone.shipment.order.id },
        data: { status: 'DELIVERED' },
      });
    }

    await tx.auditLog.create({
      data: {
        actorUserId: session.userId,
        companyId: session.companyId,
        entityType: 'shipment_milestone',
        entityId: milestone.id,
        action: 'shipment.milestone_completed_manual',
        afterJson: { orderPublicId: milestone.shipment.order.publicId, code: milestone.code },
      },
    });
  });

  revalidatePath('/portal/admin/logistics');
  revalidatePath('/portal/seller/logistics');
}
