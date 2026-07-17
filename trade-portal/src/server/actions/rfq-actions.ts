'use server';

import { redirect } from 'next/navigation';
import { z } from 'zod';
import { prisma } from '@/lib/db';
import { requireScope } from '@/server/auth/session';
import { canTransition } from '@/lib/state-machines';

const rfqDraftSchema = z.object({
  productIds: z.array(z.string()).min(1),
  destinationCountry: z.string().min(2),
  destinationPort: z.string().min(2),
  targetShipmentMonth: z.string().min(7),
  incoterm: z.enum(['FOB', 'FCA']),
  shipmentType: z.enum(['LCL', 'FCL', 'AIR', 'OTHER']),
  notes: z.string().optional().default(''),
});

export async function createBuyerRfqAction(formData: FormData) {
  const session = await requireScope('buyer');
  const productIds = formData.getAll('productIds').map(String).filter(Boolean);
  const parsed = rfqDraftSchema.safeParse({
    productIds,
    destinationCountry: formData.get('destinationCountry'),
    destinationPort: formData.get('destinationPort'),
    targetShipmentMonth: formData.get('targetShipmentMonth'),
    incoterm: formData.get('incoterm'),
    shipmentType: formData.get('shipmentType'),
    notes: formData.get('notes'),
  });

  if (!parsed.success) {
    throw new Error(parsed.error.issues.map((issue) => issue.message).join(', '));
  }

  if (!canTransition('rfq', 'DRAFT', 'SUBMITTED')) {
    throw new Error('RFQ state machine is misconfigured');
  }

  const products = await prisma.product.findMany({
    where: { id: { in: parsed.data.productIds }, status: 'PUBLISHED' },
  });

  if (!products.length) {
    throw new Error('At least one published product is required');
  }

  const publicId = `RFQ-${Date.now().toString().slice(-6)}`;

  await prisma.rfq.create({
    data: {
      publicId,
      buyerCompanyId: session.companyId,
      createdByUserId: session.userId,
      destinationCountry: parsed.data.destinationCountry,
      destinationPort: parsed.data.destinationPort,
      targetShipmentMonth: parsed.data.targetShipmentMonth,
      incoterm: parsed.data.incoterm,
      currency: 'USD',
      shipmentType: parsed.data.shipmentType,
      sourceCountry: 'CN',
      notes: parsed.data.notes,
      status: 'SUBMITTED',
      items: {
        create: products.map((product) => ({
          productId: product.id,
          itemNameSnapshot: product.title,
          quantity: 1,
          uom: 'lot',
          specificationSnapshotJson: {
            category: product.category,
            originCountry: product.originCountry,
          },
        })),
      },
    },
  });

  await prisma.auditLog.create({
    data: {
      actorUserId: session.userId,
      companyId: session.companyId,
      entityType: 'rfq',
      entityId: publicId,
      action: 'rfq.submitted',
      afterJson: {
        publicId,
        incoterm: parsed.data.incoterm,
        shipmentType: parsed.data.shipmentType,
      },
    },
  });

  redirect(`/portal/buyer/rfqs/${publicId}`);
}
