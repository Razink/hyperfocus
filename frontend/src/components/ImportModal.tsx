import { useState } from 'react';
import { X, Upload } from 'lucide-react';
import api from '../services/api';

interface ImportModalProps {
  subjectId: string;
  onClose: () => void;
  onImported: (count: number) => void;
}

type Tab = 'text' | 'csv';

interface ParsedLesson {
  title: string;
  contentPercent: number;
  isRevised: boolean;
  valid: boolean;
  error?: string;
}

function parseText(raw: string): ParsedLesson[] {
  return raw
    .split('\n')
    .map(l => l.trim())
    .filter(l => l.length > 0)
    .map(title => ({
      title,
      contentPercent: 0,
      isRevised: false,
      valid: title.length <= 200,
      error: title.length > 200 ? 'Titre trop long (max 200)' : undefined,
    }));
}

function detectSeparator(line: string): string {
  const sc = (line.match(/;/g) ?? []).length;
  const cc = (line.match(/,/g) ?? []).length;
  return sc >= cc ? ';' : ',';
}

function parseBool(v: string): boolean {
  return ['true', '1', 'oui', 'yes'].includes(v.trim().toLowerCase());
}

function parseCsv(raw: string): ParsedLesson[] {
  const lines = raw.split('\n').map(l => l.trim()).filter(l => l.length > 0);
  if (lines.length < 2) return [];
  const sep = detectSeparator(lines[0]);
  const headers = lines[0].split(sep).map(h => h.trim().toLowerCase());
  const titleIdx = headers.indexOf('title');
  const pctIdx = headers.indexOf('contentpercent');
  const revIdx = headers.indexOf('isrevised');

  if (titleIdx === -1) return [];

  return lines.slice(1).map(line => {
    const cols = line.split(sep);
    const title = (cols[titleIdx] ?? '').trim();
    const pctRaw = pctIdx !== -1 ? (cols[pctIdx] ?? '').trim() : '';
    const revRaw = revIdx !== -1 ? (cols[revIdx] ?? '').trim() : '';

    const contentPercent = pctRaw !== '' ? parseInt(pctRaw, 10) : 0;
    const isRevised = revRaw !== '' ? parseBool(revRaw) : false;

    const errors: string[] = [];
    if (!title) errors.push('Titre vide');
    if (title.length > 200) errors.push('Titre trop long');
    if (pctRaw !== '' && (isNaN(contentPercent) || contentPercent < 0 || contentPercent > 100))
      errors.push('contentPercent invalide (0-100)');

    return {
      title,
      contentPercent: isNaN(contentPercent) ? 0 : Math.min(100, Math.max(0, contentPercent)),
      isRevised,
      valid: errors.length === 0,
      error: errors.join(', ') || undefined,
    };
  });
}

export const ImportModal = ({ subjectId, onClose, onImported }: ImportModalProps) => {
  const [tab, setTab] = useState<Tab>('text');
  const [raw, setRaw] = useState('');
  const [importing, setImporting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const parsed = tab === 'text' ? parseText(raw) : parseCsv(raw);
  const validLessons = parsed.filter(l => l.valid);
  const hasInvalid = parsed.some(l => !l.valid);

  const handleImport = async () => {
    if (validLessons.length === 0) return;
    setImporting(true);
    setError(null);
    try {
      const res = await api.post<{ count: number }>(`/subjects/${subjectId}/lessons/bulk`, {
        lessons: validLessons.map(({ title, contentPercent, isRevised }) => ({ title, contentPercent, isRevised })),
      });
      onImported(res.data.count);
      onClose();
    } catch (e: any) {
      setError(e?.response?.data?.error?.message ?? 'Erreur lors de l\'import');
    } finally {
      setImporting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center p-0 sm:items-center sm:p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative flex max-h-[92vh] w-full flex-col overflow-hidden rounded-t-2xl bg-white shadow-xl sm:max-w-lg sm:rounded-xl">

        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
          <h2 className="text-lg font-semibold text-gray-900">Importer des cours</h2>
          <button onClick={onClose} className="p-1.5 hover:bg-gray-100 rounded-lg">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-100 px-5">
          {(['text', 'csv'] as Tab[]).map(t => (
            <button
              key={t}
              onClick={() => { setTab(t); setRaw(''); }}
              className={`mr-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                tab === t
                  ? 'border-primary-600 text-primary-600'
                  : 'border-transparent text-gray-400 hover:text-gray-600'
              }`}
            >
              {t === 'text' ? 'Texte' : 'CSV'}
            </button>
          ))}
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
          {tab === 'text' ? (
            <>
              <p className="text-xs text-gray-500">Une ligne = un cours. Les lignes vides sont ignorées.</p>
              <textarea
                value={raw}
                onChange={e => setRaw(e.target.value)}
                placeholder={"Chapitre 1 — Les fractions\nChapitre 2 — Les décimaux\n..."}
                rows={10}
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-400 resize-none font-mono"
              />
            </>
          ) : (
            <>
              <p className="text-xs text-gray-500">
                Colle depuis Excel / Google Sheets. Colonnes : <code className="bg-gray-100 px-1 rounded">title</code> (requis),{' '}
                <code className="bg-gray-100 px-1 rounded">contentPercent</code>,{' '}
                <code className="bg-gray-100 px-1 rounded">isRevised</code>. Séparateur , ou ; auto-détecté.
              </p>
              <textarea
                value={raw}
                onChange={e => setRaw(e.target.value)}
                placeholder={"title;contentPercent;isRevised\nChapitre 1;80;oui\nChapitre 2;0;non"}
                rows={10}
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-400 resize-none font-mono"
              />
            </>
          )}

          {/* Preview */}
          {parsed.length > 0 && (
            <div>
              <p className="text-xs font-medium text-gray-500 mb-2">
                Aperçu — {validLessons.length} cours valide{validLessons.length > 1 ? 's' : ''}
                {hasInvalid && <span className="text-red-500 ml-1">· {parsed.length - validLessons.length} invalide{parsed.length - validLessons.length > 1 ? 's' : ''}</span>}
              </p>
              {tab === 'text' ? (
                <ul className="space-y-1 max-h-40 overflow-y-auto">
                  {parsed.map((l, i) => (
                    <li key={i} className={`flex items-center gap-2 text-sm ${l.valid ? 'text-gray-700' : 'text-red-500'}`}>
                      <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${l.valid ? 'bg-green-400' : 'bg-red-400'}`} />
                      <span className="truncate">{l.title || '(vide)'}</span>
                      {l.error && <span className="text-xs text-red-400 shrink-0">{l.error}</span>}
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="overflow-x-auto max-h-44 overflow-y-auto rounded-lg border border-gray-200">
                  <table className="w-full text-xs">
                    <thead className="bg-gray-50 sticky top-0">
                      <tr>
                        <th className="text-left px-3 py-2 font-medium text-gray-500">Titre</th>
                        <th className="text-left px-3 py-2 font-medium text-gray-500">%</th>
                        <th className="text-left px-3 py-2 font-medium text-gray-500">Révisé</th>
                        <th className="px-2 py-2" />
                      </tr>
                    </thead>
                    <tbody>
                      {parsed.map((l, i) => (
                        <tr key={i} className={l.valid ? 'border-t border-gray-100' : 'border-t border-red-100 bg-red-50'}>
                          <td className="px-3 py-1.5 max-w-[180px] truncate">{l.title || '(vide)'}</td>
                          <td className="px-3 py-1.5">{l.contentPercent}</td>
                          <td className="px-3 py-1.5">{l.isRevised ? 'oui' : 'non'}</td>
                          <td className="px-2 py-1.5 text-red-400 text-xs">{l.error}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {error && <p className="text-sm text-red-500">{error}</p>}
        </div>

        {/* Footer */}
        <div className="border-t border-gray-100 px-5 py-4">
          <button
            onClick={handleImport}
            disabled={validLessons.length === 0 || importing}
            className="w-full flex items-center justify-center gap-2 rounded-xl bg-primary-600 py-3 text-sm font-semibold text-white hover:bg-primary-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            <Upload className="w-4 h-4" />
            {importing ? 'Import en cours...' : `Importer ${validLessons.length > 0 ? `${validLessons.length} cours` : ''}`}
          </button>
        </div>
      </div>
    </div>
  );
};
