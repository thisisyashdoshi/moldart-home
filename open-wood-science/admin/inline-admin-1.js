const DOC_CODES = ['01_SOY','02_TANNIN','03_LIGNIN','04_MFC_CNF_CNC','05_pMDI_AUXILIARY','06_BASELINE_RESINS','07A_CATALYSTS_HARDENERS','07B_FORMALDEHYDE_SCAVENGERS','07C_WAX_HYDROPHOBES','07D_FR_PRESERVATIVES_DURABILITY','08_HPL_LPL_SURFACE_SYSTEMS'];
  const tokenInput = document.getElementById('admin-token');
  const statusBox = document.getElementById('status');
  const dashboard = document.getElementById('dashboard');
  const assignmentResult = document.getElementById('assignment-result');
  let activeToken = sessionStorage.getItem('owsAdminToken') || '';

  document.getElementById('document-code').innerHTML = '<option value="">Select</option>' + DOC_CODES.map((code) => `<option value="${code}">${code}</option>`).join('');
  tokenInput.value = activeToken;

  function esc(value) {
    return String(value ?? '').replace(/[&<>"']/g, (char) => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' }[char]));
  }

  function show(type, message) {
    statusBox.className = `ows-status show ${type}`;
    statusBox.textContent = message;
  }

  function headers() {
    return { Authorization: `Bearer ${activeToken}`, 'Content-Type': 'application/json' };
  }

  async function readJson(response) {
    const body = await response.json().catch(() => ({}));
    if (!response.ok || body.ok === false) throw new Error((body.errors || [`HTTP ${response.status}`]).join(' '));
    return body;
  }

  function metricTone(item) {
    return item.tone === 'warn' ? 'warn' : item.tone === 'ok' ? 'ok' : '';
  }

  function renderMetrics(metrics) {
    document.getElementById('metrics').innerHTML = metrics.map((item) => `<article class="ows-metric ${metricTone(item)}"><strong>${esc(item.value)}</strong><span>${esc(item.label)}</span></article>`).join('');
  }

  function renderRisks(risks) {
    document.getElementById('risks').innerHTML = risks.map((item) => `<div class="ows-record"><div class="ows-record-top"><div><span class="ows-pill ${esc(item.level)}">${esc(item.level)}</span><p class="ows-record-copy">${esc(item.message)}</p></div></div></div>`).join('');
  }

  function emptyState(text) {
    return `<div class="ows-record"><p class="ows-muted">${esc(text)}</p></div>`;
  }

  function renderContributors(rows) {
    const target = document.getElementById('contributors');
    if (!rows.length) {
      target.innerHTML = emptyState('No contributors need screening in the loaded window.');
      return;
    }
    target.innerHTML = rows.map((row) => `<article class="ows-record">
      <div class="ows-record-top">
        <div><h3>${esc(row.name || 'Unnamed contributor')}</h3><p class="ows-muted">${esc(row.email)} - ${esc(row.organization || 'No organization')}</p></div>
        <span class="ows-pill medium">${esc(row.status || 'Screening')}</span>
      </div>
      <dl>
        <div><dt>Preferred draft</dt><dd>${esc(row.preferredDraft)}</dd></div>
        <div><dt>Decision</dt><dd>${esc(row.approvalDecision)}</dd></div>
        <div><dt>Country</dt><dd>${esc(row.country)}</dd></div>
        <div><dt>Item ID</dt><dd>${esc(row.id)}</dd></div>
      </dl>
      <div class="ows-actions ows-mt-14"><button class="ows-button ghost" type="button" data-fill='${esc(JSON.stringify(row))}'>Use for assignment draft</button></div>
    </article>`).join('');
    target.querySelectorAll('[data-fill]').forEach((button) => {
      button.addEventListener('click', () => {
        const row = JSON.parse(button.getAttribute('data-fill'));
        document.getElementById('reviewer-name').value = row.name || '';
        document.getElementById('reviewer-email').value = row.email || '';
        document.getElementById('contributor-id').value = row.id || '';
        if (DOC_CODES.includes(row.preferredDraft)) document.getElementById('document-code').value = row.preferredDraft;
        document.getElementById('assignment-notes').value = `Screened contributor item ${row.id}. Verify identity, conflict and source-backed review willingness before live creation.`;
        document.getElementById('assignment-form').scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
    });
  }

  function renderAssignments(rows) {
    const target = document.getElementById('assignments');
    if (!rows.length) {
      target.innerHTML = emptyState('No assignments in the loaded window.');
      return;
    }
    target.innerHTML = rows.map((row) => `<article class="ows-card">
      <div class="ows-record-top"><div><h3>${esc(row.assignmentId || 'Assignment')}</h3><p>${esc(row.reviewerName || row.reviewerEmail)}</p></div><span class="ows-pill ${row.parentFolderShared && row.parentFolderShared !== 'No' ? 'high' : 'low'}">folder ${esc(row.parentFolderShared || 'unknown')}</span></div>
      <p><strong>${esc(row.documentCode)}</strong> - ${esc(row.accessStatus || 'No access status')}</p>
      <p>${esc(row.reviewStatus || 'No review status')} ${row.dueDate ? `- due ${esc(row.dueDate)}` : ''}</p>
    </article>`).join('');
  }

  function renderDocuments(rows) {
    const target = document.getElementById('documents');
    if (!rows.length) {
      target.innerHTML = emptyState('No documents loaded.');
      return;
    }
    target.innerHTML = rows.map((row) => `<article class="ows-card"><h3>${esc(row.code)}</h3><p>${esc(row.status)} - ${esc(row.draftVersion)}</p><p class="ows-muted">${esc(row.path)}</p></article>`).join('');
  }

  function renderPublication(rows) {
    const target = document.getElementById('publication');
    if (!rows.length) {
      target.innerHTML = emptyState('No publication records loaded.');
      return;
    }
    target.innerHTML = rows.slice(0, 8).map((row) => `<div class="ows-record"><div class="ows-record-top"><div><h3>${esc(row.code)}</h3><p class="ows-muted">${esc(row.publicStatus || 'Not approved')}</p></div><span class="ows-pill medium">blocked</span></div></div>`).join('');
  }

  function fileLabel(path) {
    const parts = String(path || '').split('/');
    return parts.slice(-2).join('/');
  }

  function renderChanges(rows) {
    const target = document.getElementById('changes');
    const unique = [];
    const seen = new Set();
    for (const row of rows) {
      const key = row.filePath || row.title;
      if (!key || seen.has(key)) continue;
      seen.add(key);
      unique.push(row);
      if (unique.length >= 8) break;
    }
    if (!unique.length) {
      target.innerHTML = emptyState('No recent audit entries loaded.');
      return;
    }
    target.innerHTML = unique.map((row) => `<div class="ows-record"><div class="ows-record-top"><div><h3>${esc(fileLabel(row.filePath || row.title))}</h3><p class="ows-muted">${esc(row.modified)} - ${esc(row.editor || 'SharePoint')}</p></div><span class="ows-pill">audit</span></div></div>`).join('');
  }

  function renderDashboard(data) {
    dashboard.hidden = false;
    document.getElementById('refresh').hidden = false;
    document.getElementById('generated-at').textContent = `Loaded ${new Date(data.generatedAt).toLocaleString()} - list window ${data.listWindow}`;
    const mutation = document.getElementById('mutation-state');
    mutation.textContent = data.mutationsEnabled ? 'Live creation enabled' : 'Dry-run only';
    mutation.className = `ows-pill ${data.mutationsEnabled ? 'medium' : 'low'}`;
    document.getElementById('request-live').disabled = !data.mutationsEnabled;
    renderMetrics(data.metrics || []);
    renderRisks(data.risks || []);
    renderContributors(data.contributors || []);
    renderAssignments(data.assignments || []);
    renderDocuments(data.documents || []);
    renderPublication(data.publication || []);
    renderChanges(data.recentChanges || []);
  }

  async function loadDashboard() {
    if (!activeToken) return show('warn', 'Paste the admin token first.');
    show('ok', 'Loading live SharePoint status...');
    try {
      const data = await readJson(await fetch('/api/ows-admin', { headers: headers() }));
      renderDashboard(data);
      show('ok', 'Console loaded. Review the queue and keep assignment creation dry-run until approved.');
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
    document.getElementById('refresh').hidden = true;
    show('warn', 'Token cleared.');
  });
  document.getElementById('refresh').addEventListener('click', loadDashboard);

  document.getElementById('assignment-form').addEventListener('submit', async (event) => {
    event.preventDefault();
    const fd = new FormData(event.currentTarget);
    const payload = {
      action: 'prepareAssignment',
      contributorItemId: fd.get('contributorItemId'),
      reviewerName: fd.get('reviewerName'),
      reviewerEmail: fd.get('reviewerEmail'),
      documentCode: fd.get('documentCode'),
      dueDate: fd.get('dueDate'),
      notes: fd.get('notes'),
      dryRun: !document.getElementById('request-live').checked,
      confirmNoMasterAccess: document.getElementById('confirm-master').checked,
      confirmPrivateCopyOnly: document.getElementById('confirm-copy').checked,
    };
    show('ok', 'Preparing assignment preview...');
    try {
      const result = await readJson(await fetch('/api/ows-admin', { method: 'POST', headers: headers(), body: JSON.stringify(payload) }));
      assignmentResult.hidden = false;
      assignmentResult.textContent = JSON.stringify(result, null, 2);
      show(result.dryRun ? 'warn' : 'ok', result.message || 'Assignment response ready.');
      if (!result.dryRun) loadDashboard();
    } catch (err) {
      assignmentResult.hidden = true;
      show('error', err.message);
    }
  });

  if (activeToken) loadDashboard();
