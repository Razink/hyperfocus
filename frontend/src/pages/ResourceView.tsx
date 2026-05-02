import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, ExternalLink, FileCode2 } from 'lucide-react';
import { Layout } from '../components/Layout';
import { resourceService } from '../services/resource.service';
import { assessmentService } from '../services/assessment.service';
import type { AssessmentResource, LessonResource } from '../types';

const API_URL = (import.meta.env.VITE_API_URL as string | undefined)?.replace('/api', '') ?? 'http://localhost:3000';

type ResourceDetail = LessonResource & {
  lesson?: {
    id: string;
    title: string;
    subject: { id: string; name: string; color: string };
  };
};

type AssessmentResourceDetail = AssessmentResource & {
  assessment?: {
    id: string;
    kind: string;
    trimester: number;
    subject: { id: string; name: string; color: string };
  };
};

const isHtmlResource = (resource: { mimeType?: string; url: string }) =>
  resource.mimeType?.includes('html') || /\.html?$/i.test(resource.url);

export const ResourceView = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isAssessmentResource = window.location.pathname.startsWith('/assessment-resources/');
  const [resource, setResource] = useState<ResourceDetail | AssessmentResourceDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    const request = isAssessmentResource
      ? assessmentService.getResourceById(id)
      : resourceService.getById(id);
    request
      .then(res => setResource(res as ResourceDetail | AssessmentResourceDetail))
      .catch(err => setError(err?.response?.data?.error?.message ?? 'Document introuvable'))
      .finally(() => setLoading(false));
  }, [id, isAssessmentResource]);

  const fileUrl = resource ? `${API_URL}${resource.url}` : '';
  const lessonResource = resource as ResourceDetail | null;
  const assessmentResource = resource as AssessmentResourceDetail | null;
  const subject = lessonResource?.lesson
    ? lessonResource.lesson.subject
    : assessmentResource?.assessment
      ? assessmentResource.assessment.subject
      : null;
  const backUrl = subject?.id ? `/subjects/${subject.id}` : '/subjects';

  return (
    <Layout>
      <div className="flex min-h-screen flex-col bg-gray-50">
        <header className="sticky top-16 z-10 border-b border-gray-200 bg-white md:top-0">
          <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-4 sm:px-6">
            <div className="min-w-0">
              <button
                onClick={() => navigate(backUrl)}
                className="mb-2 flex items-center gap-2 text-sm text-gray-500 hover:text-gray-800"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>{subject?.name ?? 'Retour'}</span>
              </button>
              <div className="flex min-w-0 items-center gap-2">
                <FileCode2 className="h-5 w-5 shrink-0 text-emerald-500" />
                <h1 className="truncate text-xl font-bold text-gray-900">{resource?.title ?? 'Document HTML'}</h1>
              </div>
            </div>
            {resource && (
              <a
                href={fileUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex shrink-0 items-center gap-2 rounded-lg border border-gray-200 px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50"
              >
                <ExternalLink className="h-4 w-4" />
                Ouvrir
              </a>
            )}
          </div>
        </header>

        <main className="mx-auto flex w-full max-w-6xl flex-1 px-4 py-4 sm:px-6">
          {loading ? (
            <div className="flex h-64 w-full items-center justify-center text-gray-400">Chargement...</div>
          ) : error || !resource ? (
            <div className="rounded-xl border border-red-100 bg-white p-4 text-sm text-red-600">
              {error ?? 'Document introuvable'}
            </div>
          ) : !isHtmlResource(resource) ? (
            <div className="rounded-xl border border-gray-100 bg-white p-4 text-sm text-gray-600">
              Ce document n'est pas un fichier HTML.
            </div>
          ) : (
            <iframe
              title={resource.title}
              src={fileUrl}
              sandbox="allow-same-origin allow-forms allow-popups"
              className="min-h-[calc(100vh-11rem)] w-full rounded-xl border border-gray-200 bg-white shadow-sm"
            />
          )}
        </main>
      </div>
    </Layout>
  );
};
