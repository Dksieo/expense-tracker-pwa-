export function exportCsv(expenses) {
  const header = [
    'date', 'amount', 'currency', 'category', 'note', 'payment_method', 'tags'
  ];
  const rows = expenses.map(e => [
    e.date_time || '',
    e.amount ?? '',
    e.currency || '',
    e.category_id || '',
    (e.note || '').replace(/\n/g, ' '),
    e.payment_method || '',
    (e.tags || []).join('|'),
  ]);
  const csv = [header, ...rows].map(r => r.map(cell => {
    const text = String(cell);
    if (text.includes(',') || text.includes('"')) {
      return '"' + text.replace(/"/g, '""') + '"';
    }
    return text;
  }).join(',')).join('\n');

  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  const ts = new Date().toISOString().replace(/[:.]/g, '-');
  a.href = url;
  a.download = `expenses-${ts}.csv`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}
