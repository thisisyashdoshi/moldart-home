import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { RecordTable } from '@/components/portal/record-table';
import { SectionCard, WorkflowPanel } from '@/components/portal/workspace-shell';
import { listDocumentsForScope } from '@/server/repositories/portal-repository';
import { requireScope } from '@/server/auth/session';

export default async function BuyerDocumentsPage() {
  const session = await requireScope('buyer');
  const documents = await listDocumentsForScope(session);

  return (
    <div className="space-y-6">
      <WorkflowPanel
        title="Document controls"
        items={[
          { label: 'RFQ / quote', detail: 'Buyer can access scoped requirement files and quote PDFs.', tone: 'info' },
          { label: 'Payment', detail: 'Payment proofs and receipts stay tied to buyer-visible milestones.', tone: 'warning' },
          { label: 'Shipment', detail: 'PI, invoice, packing list, QC, COO, and BL/AWB are released by visibility rule.', tone: 'success' },
        ]}
      />
      <SectionCard title="Documents" subtitle="Buyer-visible technical, commercial, payment, and shipment files">
        <RecordTable
          columns={['Document', 'Type', 'Status', 'Visibility']}
          rows={documents.map((document) => [<Link key={document.id} href={`/api/documents/${document.publicId}/download`} className="font-semibold text-slate-950">{document.originalFilename}</Link>, document.documentType, <Badge key={`${document.id}-status`}>{document.status}</Badge>, document.accessRules.map((rule) => rule.visibility).join(', ')])}
          emptyLabel="No buyer-visible documents yet."
        />
      </SectionCard>
    </div>
  );
}
