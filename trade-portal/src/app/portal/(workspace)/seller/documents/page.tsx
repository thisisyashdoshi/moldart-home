import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { RecordTable } from '@/components/portal/record-table';
import { SectionCard, WorkflowPanel } from '@/components/portal/workspace-shell';
import { listDocumentsForScope } from '@/server/repositories/portal-repository';
import { requireScope } from '@/server/auth/session';

export default async function SellerDocumentsPage() {
  const session = await requireScope('seller');
  const documents = await listDocumentsForScope(session);

  return (
    <div className="space-y-6">
      <WorkflowPanel
        title="Document controls"
        items={[
          { label: 'Product', detail: 'Seller can review permitted technical and catalog files.', tone: 'info' },
          { label: 'Commercial', detail: 'Quote and order files stay scoped by assignment and company.', tone: 'warning' },
          { label: 'Shipment', detail: 'Packing list, QC, COO, and BL/AWB visibility follows ops rules.', tone: 'success' },
        ]}
      />
      <SectionCard title="Seller documents" subtitle="Seller-visible technical, commercial, and shipment files">
        <RecordTable
          columns={['Document', 'Type', 'Status', 'Visibility']}
          rows={documents.map((document) => [<Link key={document.id} href={`/api/documents/${document.publicId}/download`} className="font-semibold text-slate-950">{document.originalFilename}</Link>, document.documentType, <Badge key={`${document.id}-status`}>{document.status}</Badge>, document.accessRules.map((rule) => rule.visibility).join(', ')])}
          emptyLabel="No seller-visible documents yet."
        />
      </SectionCard>
    </div>
  );
}
