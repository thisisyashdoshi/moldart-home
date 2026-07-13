import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { RecordTable } from '@/components/portal/record-table';
import { SectionCard, WorkflowPanel } from '@/components/portal/workspace-shell';
import { listDocumentsForScope } from '@/server/repositories/portal-repository';
import { requireScope } from '@/server/auth/session';

export default async function AdminDocumentsPage() {
  const session = await requireScope('admin');
  const documents = await listDocumentsForScope(session);

  return (
    <div className="space-y-6">
      <WorkflowPanel
        title="Document controls"
        items={[
          { label: 'Vault', detail: 'Ops can inspect all internal review documents and visibility rules.', tone: 'info' },
          { label: 'Scoped release', detail: 'Buyer and seller access must be explicit before external review or beta screenshots.', tone: 'warning' },
          { label: 'Audit ready', detail: 'Quote, PI, invoice, packing list, QC, COO, BL/AWB, and payment proof records are separated by type.', tone: 'success' },
        ]}
      />
      <SectionCard title="Documents" subtitle="Ops-visible file vault with document type and visibility tags">
        <RecordTable
          columns={['Document', 'Type', 'Status', 'Visibility']}
          rows={documents.map((document) => [<Link key={document.id} href={`/api/documents/${document.publicId}/download`} className="font-semibold text-slate-950">{document.originalFilename}</Link>, document.documentType, <Badge key={document.id}>{document.status}</Badge>, document.accessRules.map((rule) => rule.visibility).join(', ') || 'Unscoped'])}
          emptyLabel="No documents in the review vault yet."
        />
      </SectionCard>
    </div>
  );
}
