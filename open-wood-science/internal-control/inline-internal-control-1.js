const DOC_CODES = ['01_SOY','02_TANNIN','03_LIGNIN','04_MFC_CNF_CNC','05_pMDI_AUXILIARY','06_BASELINE_RESINS','07A_CATALYSTS_HARDENERS','07B_FORMALDEHYDE_SCAVENGERS','07C_WAX_HYDROPHOBES','07D_FR_PRESERVATIVES_DURABILITY','08_HPL_LPL_SURFACE_SYSTEMS'];
  const tokenInput = document.getElementById('admin-token');
  const statusBox = document.getElementById('status');
  const dashboard = document.getElementById('dashboard');
  const assignmentResult = document.getElementById('assignment-result');
  let activeToken = sessionStorage.getItem('owsAdminToken') || '';
  let lastDashboard = null;

  document.getElementById('document-code').innerHTML = '<option value="">Select...</option>' + DOC_CODES.map((code) => `<option value="${code}">${code}</option>`).join('');
  tokenInput.value = activeToken;

  function escapeHtml(value) {
    return String(value ?? '').replace(/[&<>"']/g, (char) => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' }[char]));
  }

  function show(type, message) {
    statusBox.className = `status show ${type}`;
    statusBox.textContent = message;
  }

  function headers() {
    return { Authorization: `Bearer ${activeToken}`, 'Content-Type': 'application/json' };
  }

  async function readJson(response) {
    const body = await response.json().catch(() => ({}));
    if (!response.ok || body.ok === false) {
      throw new Error((body.errors || [`Request failed with HTTP ${response.status}`]).join(' '));
    }
    return body;
  }

  function renderMetrics(metrics) {
    document.getElementById('metrics').innerHTML = metrics.map((item) => `<article class="metric ${escapeHtml(item.tone || 'neutral')}"><strong>${escapeHtml(item.value)}</strong><span>${escapeHtml(item.label)}</span></article>`).join('');
  }

  function renderRisks(risks) {
    document.getElementById('risks').innerHTML = `<h2>Risk queue</h2>${risks.map((item) => `<p><span class="pill ${escapeHtml(item.level)}">${escapeHtml(item.level)}</span> ${escapeHtml(item.message)}</p>`).join('')}`;
  }

  function renderTable(targetId, rows, columns) {
    const target = document.getElementById(targetId);
    if (!rows.length) {
      target.innerHTML = '<table><tbody><tr><td class="muted">No records in this view.</td></tr></tbody></table>';
      return;
    }
    const head = columns.map((col) => `<th>${escapeHtml(col.label)}</th>`).join('');
    const body = rows.map((row) => `<tr>${columns.map((col) => `<td>${escapeHtml(col.value(row) || '')}</td>`).join('')}</tr>`).join('');
    target.innerHTML = `<table><thead><tr>${head}</tr></thead><tbody>${body}</tbody></table>`;
  }

  function renderDashboard(data) {
    lastDashboard = data;
    dashboard.hidden = false;
    document.getElementById('generated-at').textContent = `Loaded ${data.generatedAt}. List window: ${data.listWindow}.`;
    document.getElementById('mutation-state').textContent = data.mutationsEnabled ? 'Live assignment creation is enabled on the server. Use only after screening is complete.' : 'Live assignment creation is disabled on the server. Assignment form returns dry-run previews only.';
    document.getElementById('request-live').disabled = !data.mutationsEnabled;
    renderMetrics(data.metrics || []);
    renderRisks(data.risks || []);
    renderTable('contributors', data.contributors || [], [
      { label: 'ID', value: (row) => row.id },
      { label: 'Name', value: (row) => row.name },
      { label: 'Email', value: (row) => row.email },
      { label: 'Organization', value: (row) => row.organization },
      { label: 'Preferred', value: (row) => row.preferredDraft },
      { label: 'Status', value: (row) => row.status },
      { label: 'Decision', value: (row) => row.approvalDecision },
    ]);
    renderTable('assignments', data.assignments || [], [
      { label: 'Assignment', value: (row) => row.assignmentId },
      { label: 'Reviewer', value: (row) => row.reviewerName || row.reviewerEmail },
      { label: 'Document', value: (row) => row.documentCode },
      { label: 'Access', value: (row) => row.accessStatus },
      { label: 'Review', value: (row) => row.reviewStatus },
      { label: 'Parent shared', value: (row) => row.parentFolderShared },
      { label: 'Due', value: (row) => row.dueDate },
    ]);
    renderTable('documents', data.documents || [], [
      { label: 'Code', value: (row) => row.code },
      { label: 'Status', value: (row) => row.status },
      { label: 'Version', value: (row) => row.draftVersion },
      { label: 'Path', value: (row) => row.path },
    ]);
    renderTable('changes', data.recentChanges || [], [
      { label: 'Modified', value: (row) => row.modified },
      { label: 'Document', value: (row) => row.documentCode },
      { label: 'Assignment', value: (row) => row.assignmentId },
      { label: 'Editor', value: (row) => row.editor },
      { label: 'Action', value: (row) => row.action },
      { label: 'File', value: (row) => row.filePath },
    ]);
  }

  async function loadDashboard() {
    if (!activeToken) {
      show('warn', 'Enter the admin API token first.');
      return;
    }
    show('ok', 'Loading OWS workflow status...');
    try {
      const data = await readJson(await fetch('/api/ows-admin', { headers: headers() }));
      renderDashboard(data);
      show('ok', 'Dashboard loaded.');
    } catch (err) {
      dashboard.hidden = true;
      show('error', err.message);
    }
  }

  document.getElementById('save-token').addEventListener('click', () => {
    activeToken = tokenInput.value.trim();
    if (activeToken) sessionStorage.setItem('owsAdminToken', activeToken);
    loadDashboard();
  });

  document.getElementById('clear-token').addEventListener('click', () => {
    activeToken = '';
    tokenInput.value = '';
    sessionStorage.removeItem('owsAdminToken');
    dashboard.hidden = true;
    show('warn', 'Token cleared.');
  });

  document.getElementById('refresh').addEventListener('click', loadDashboard);

  document.getElementById('assignment-form').addEventListener('submit', async (event) => {
    event.preventDefault();
    const fd = new FormData(event.currentTarget);
    const requestLive = document.getElementById('request-live').checked;
    const payload = {
      action: 'prepareAssignment',
      contributorItemId: fd.get('contributorItemId'),
      reviewerName: fd.get('reviewerName'),
      reviewerEmail: fd.get('reviewerEmail'),
      documentCode: fd.get('documentCode'),
      dueDate: fd.get('dueDate'),
      notes: fd.get('notes'),
      dryRun: !requestLive,
      confirmNoMasterAccess: document.getElementById('confirm-master').checked,
      confirmPrivateCopyOnly: document.getElementById('confirm-copy').checked,
    };
    show('ok', requestLive ? 'Submitting assignment request...' : 'Preparing dry-run assignment preview...');
    try {
      const result = await readJson(await fetch('/api/ows-admin', { method: 'POST', headers: headers(), body: JSON.stringify(payload) }));
      assignmentResult.hidden = false;
      assignmentResult.textContent = JSON.stringify(result, null, 2);
      show(result.dryRun ? 'warn' : 'ok', result.message || 'Assignment response received.');
      if (!result.dryRun) loadDashboard();
    } catch (err) {
      assignmentResult.hidden = true;
      show('error', err.message);
    }
  });

  if (activeToken) loadDashboard();
