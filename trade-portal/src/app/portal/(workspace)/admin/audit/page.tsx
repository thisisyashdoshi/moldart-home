import { SectionCard } from '@/components/portal/workspace-shell';
import { getAdminSnapshot } from '@/server/repositories/portal-repository';
import { RecordTable } from '@/components/portal/record-table';
import { formatDate } from '@/lib/utils';

export default async function AdminAuditPage() {
  const snapshot = await getAdminSnapshot();

  return (
    <SectionCard title="Audit log" subtitle="Create / update / status change trail across the platform">
      <RecordTable columns={['Action', 'Entity', 'Created']} rows={snapshot.auditLogs.map((item) => [item.action, `${item.entityType} / ${item.entityId}`, formatDate(item.createdAt)])} />
    </SectionCard>
  );
}
