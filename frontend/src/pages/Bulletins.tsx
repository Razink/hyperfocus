import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, Sparkles, Trash2, TrendingUp } from 'lucide-react';
import type { BulletinSummary } from '../types';
import { bulletinService } from '../services/bulletin.service';
import { Layout } from '../components/Layout';
import { Card } from '../components/Card';
import { Button } from '../components/Button';

const TRIM_LABEL: Record<number, string> = {
  1: '1er trimestre',
  2: '2ème trimestre',
  3: '3ème trimestre',
};

export const Bulletins = () => {
  const navigate = useNavigate();
  const [bulletins, setBulletins] = useState<BulletinSummary[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    load();
  }, []);

  const load = async () => {
    try {
      const data = await bulletinService.list();
      setBulletins(data);
    } catch (e) {
      console.error('Error loading bulletins:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (!confirm('Supprimer ce bulletin ?')) return;
    try {
      await bulletinService.delete(id);
      load();
    } catch (err) {
      console.error('Error deleting bulletin:', err);
    }
  };

  const officials = bulletins.filter(b => !b.isProjection);
  const projections = bulletins.filter(b => b.isProjection);

  return (
    <Layout>
      <div className="mx-auto max-w-5xl p-4 md:p-8">
        <header className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="font-display text-2xl font-bold text-gray-900">Bulletins</h1>
            <p className="mt-1 text-sm text-gray-500">Historique et projections de tes moyennes par trimestre</p>
          </div>
          <Button onClick={() => navigate('/bulletins/projection')}>
            <span className="flex items-center gap-2">
              <Sparkles className="h-4 w-4" />
              Nouvelle projection
            </span>
          </Button>
        </header>

        {loading ? (
          <p className="text-gray-500">Chargement…</p>
        ) : bulletins.length === 0 ? (
          <Card className="text-center text-gray-500">
            <FileText className="mx-auto mb-2 h-10 w-10 text-gray-400" />
            Aucun bulletin pour le moment.
          </Card>
        ) : (
          <>
            {officials.length > 0 && (
              <section className="mb-8">
                <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-500">Bulletins officiels</h2>
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {officials.map(b => (
                    <BulletinCard key={b.id} b={b} onClick={() => navigate(`/bulletins/${b.id}`)} onDelete={(e) => handleDelete(e, b.id)} />
                  ))}
                </div>
              </section>
            )}
            {projections.length > 0 && (
              <section>
                <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-gray-500">
                  <TrendingUp className="h-4 w-4" />
                  Projections
                </h2>
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {projections.map(b => (
                    <BulletinCard key={b.id} b={b} onClick={() => navigate(`/bulletins/${b.id}`)} onDelete={(e) => handleDelete(e, b.id)} />
                  ))}
                </div>
              </section>
            )}
          </>
        )}
      </div>
    </Layout>
  );
};

const BulletinCard = ({ b, onClick, onDelete }: { b: BulletinSummary; onClick: () => void; onDelete: (e: React.MouseEvent) => void }) => (
  <Card onClick={onClick} color={b.isProjection ? '#a855f7' : '#3b82f6'}>
    <div className="flex items-start justify-between gap-2">
      <div className="min-w-0">
        <p className="truncate text-xs uppercase tracking-wide text-gray-500">{b.schoolYear}</p>
        <p className="font-semibold text-gray-900">{TRIM_LABEL[b.trimester] ?? `T${b.trimester}`}</p>
        {b.className && <p className="mt-1 truncate text-xs text-gray-500">{b.className}</p>}
      </div>
      <button
        onClick={onDelete}
        className="rounded p-1 text-gray-400 hover:bg-red-50 hover:text-red-600"
        aria-label="Supprimer"
      >
        <Trash2 className="h-4 w-4" />
      </button>
    </div>
    <div className="mt-3 flex items-end justify-between">
      <div>
        <p className="text-xs text-gray-500">Moyenne</p>
        <p className="font-display text-3xl font-bold text-gray-900">
          {b.generalAverage !== null ? b.generalAverage.toFixed(2) : '—'}
        </p>
      </div>
      {b.rank !== null && b.classSize !== null && (
        <div className="text-right text-xs text-gray-500">
          <p>Rang</p>
          <p className="text-base font-semibold text-gray-900">{b.rank}/{b.classSize}</p>
        </div>
      )}
    </div>
  </Card>
);
