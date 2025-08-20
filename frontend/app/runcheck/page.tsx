'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import Navbar from '../../components/navbar';
import { Instrument_Sans } from 'next/font/google';
import { Suspense } from 'react';

interface SimilarFile {
  file1: string;
  file2: string;
  similarity: number;
}

interface CommitPatterns {
  commit_count: number;
  details: {
    author_score: number;
    message_score: number;
    size_score: number;
    timing_score: number;
  };
  indicators: string[];
  score: number;
}

interface InterRepositorySimilarity {
  files_checked: number;
  matches: any[];
  score: number;
  search_attempts: number;
}

interface IntraRepositorySimilarity {
  file_count: number;
  score: number;
  similar_files: SimilarFile[];
}

interface FinalAssessment {
  component_scores: {
    commit_patterns: number;
    inter_repository_similarity: number;
    intra_repository_similarity: number;
  };
  confidence: string;
  final_score: number;
  indicators: string[];
  risk_level: string;
}

interface Repository {
  created_at: string;
  language: string;
  name: string;
  owner: string;
  size: number;
  updated_at: string;
  url: string;
}

interface PlagiarismData {
  analysis: {
    commit_patterns: CommitPatterns;
    final_assessment: FinalAssessment;
    inter_repository_similarity: InterRepositorySimilarity;
    intra_repository_similarity: IntraRepositorySimilarity;
  };
  repository: Repository;
  timestamp: string;
  version: string;
}

interface ApiResponse {
  data: PlagiarismData;
  success: boolean;
}

const instrumentSans = Instrument_Sans({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-instrument-sans',
});

const getAuthToken = ()  => {
    return localStorage.getItem('auth_token');
};

const getRiskLevelColor = (riskLevel: string): string => {
  switch (riskLevel.toLowerCase()) {
    case 'low':
      return 'text-green-600 bg-green-50';
    case 'medium':
      return 'text-yellow-600 bg-yellow-50';
    case 'high':
      return 'text-red-600 bg-red-50';
    default:
      return 'text-gray-600 bg-gray-50';
  }
};

const getConfidenceColor = (confidence: string): string => {
  switch (confidence.toLowerCase()) {
    case 'high':
      return 'text-green-600';
    case 'medium':
      return 'text-yellow-600';
    case 'low':
      return 'text-red-600';
    default:
      return 'text-gray-600';
  }
};

export default function RunCheckContent() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen">
        <p>Loading...</p>
      </div>
    }>
      <RunCheckPage />
    </Suspense>
  );
}

function RunCheckPage() {
  const [data, setData] = useState<PlagiarismData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const searchParams = useSearchParams();

  useEffect(() => {
    const checkPlagiarism = async () => {
      try {
        const repositoryUrl = searchParams.get('link');
        if (!repositoryUrl) {
          throw new Error('Repository URL not provided');
        }

        const authToken = getAuthToken();
        if (!authToken) {
          throw new Error('Authentication token not found. Please login first.');
        }

        const response = await fetch(
          'https://hatchplatform-dcdphngyewcwcuc4.centralindia-01.azurewebsites.net/check-plagiarism',
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'auth_token': authToken,
            },
            body: JSON.stringify({
              repository_url: repositoryUrl,
            }),
          }
        );

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result: ApiResponse = await response.json();
        
        if (!result.success) {
          throw new Error('Plagiarism check failed');
        }

        setData(result.data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
      } finally {
        setLoading(false);
      }
    };

    checkPlagiarism();
  }, [searchParams]);

  if (loading) {
    return (
      <div className={`${instrumentSans} min-h-screen bg-gray-50 flex items-center justify-center`}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-700">Running Plagiarism Check...</h2>
          <p className="text-gray-500 mt-2">This may take a few moments</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`${instrumentSans.className} min-h-screen bg-gray-50 flex items-center justify-center`}>
        <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full mx-4">
          <div className="text-center">
            <div className="text-red-600 text-6xl mb-4">⚠️</div>
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Error</h2>
            <p className="text-gray-600 mb-6">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className={`${instrumentSans.className} min-h-screen bg-gray-50 flex items-center justify-center`}>
        <div className="text-center">
          <p className="text-gray-600">No data available</p>
        </div>
      </div>
    );
  }

  return (
    <>
    <Navbar/>
    <div className={`${instrumentSans.className} min-h-screen bg-gray-50 py-8`}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Plagiarism Analysis Report
              </h1>
              <div className="flex items-center gap-4 text-sm text-gray-600">
                <span>Repository: <strong>{data.repository.name}</strong></span>
                <span>Owner: <strong>{data.repository.owner}</strong></span>
                <span>Language: <strong>{data.repository.language}</strong></span>
              </div>
            </div>
            <div className="text-right">
              <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getRiskLevelColor(data.analysis.final_assessment.risk_level)}`}>
                {data.analysis.final_assessment.risk_level} Risk
              </div>
            </div>
          </div>
        </div>

        {/* Final Assessment */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Final Assessment</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-gray-900 mb-1">
                {data.analysis.final_assessment.final_score.toFixed(1)}%
              </div>
              <p className="text-gray-600">Overall Score</p>
            </div>
            <div className="text-center">
              <div className={`text-2xl font-bold mb-1 ${getConfidenceColor(data.analysis.final_assessment.confidence)}`}>
                {data.analysis.final_assessment.confidence}
              </div>
              <p className="text-gray-600">Confidence</p>
            </div>
            <div className="text-center">
              <div className={`text-2xl font-bold mb-1 ${getRiskLevelColor(data.analysis.final_assessment.risk_level).split(' ')[0]}`}>
                {data.analysis.final_assessment.risk_level}
              </div>
              <p className="text-gray-600">Risk Level</p>
            </div>
          </div>
          {data.analysis.final_assessment.indicators.length > 0 && (
            <div className="mt-6">
              <h3 className="font-medium text-gray-900 mb-2">Key Indicators:</h3>
              <ul className="list-disc list-inside text-gray-600 space-y-1">
                {data.analysis.final_assessment.indicators.map((indicator, index) => (
                  <li key={index}>{indicator}</li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Component Scores */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Commit Patterns</h3>
            <div className="text-2xl font-bold text-blue-600 mb-2">
              {data.analysis.final_assessment.component_scores.commit_patterns.toFixed(1)}%
            </div>
            <div className="space-y-2 text-sm text-gray-600">
              <p>Total Commits: {data.analysis.commit_patterns.commit_count}</p>
              <p>Author Score: {data.analysis.commit_patterns.details.author_score.toFixed(1)}%</p>
              <p>Message Score: {data.analysis.commit_patterns.details.message_score.toFixed(1)}%</p>
              <p>Size Score: {data.analysis.commit_patterns.details.size_score.toFixed(1)}%</p>
              <p>Timing Score: {data.analysis.commit_patterns.details.timing_score.toFixed(1)}%</p>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Inter-Repository</h3>
            <div className="text-2xl font-bold text-green-600 mb-2">
              {data.analysis.final_assessment.component_scores.inter_repository_similarity.toFixed(1)}%
            </div>
            <div className="space-y-2 text-sm text-gray-600">
              <p>Files Checked: {data.analysis.inter_repository_similarity.files_checked}</p>
              <p>Search Attempts: {data.analysis.inter_repository_similarity.search_attempts}</p>
              <p>Matches Found: {data.analysis.inter_repository_similarity.matches.length}</p>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Intra-Repository</h3>
            <div className="text-2xl font-bold text-orange-600 mb-2">
              {data.analysis.final_assessment.component_scores.intra_repository_similarity.toFixed(1)}%
            </div>
            <div className="space-y-2 text-sm text-gray-600">
              <p>Files Analyzed: {data.analysis.intra_repository_similarity.file_count}</p>
              <p>Similar Pairs: {data.analysis.intra_repository_similarity.similar_files.length}</p>
            </div>
          </div>
        </div>

        {/* Similar Files */}
        {data.analysis.intra_repository_similarity.similar_files.length > 0 && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Similar Files Detected</h2>
            <div className="overflow-x-auto">
              <table className="w-full table-auto">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">File 1</th>
                    <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">File 2</th>
                    <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Similarity</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {data.analysis.intra_repository_similarity.similar_files.map((file, index) => (
                    <tr key={index}>
                      <td className="px-4 py-2 text-sm text-gray-900 font-mono">{file.file1}</td>
                      <td className="px-4 py-2 text-sm text-gray-900 font-mono">{file.file2}</td>
                      <td className="px-4 py-2">
                        <div className={`inline-flex items-center px-2 py-1 rounded text-sm font-medium ${
                          file.similarity > 0.7 ? 'text-red-600 bg-red-50' :
                          file.similarity > 0.5 ? 'text-yellow-600 bg-yellow-50' :
                          'text-green-600 bg-green-50'
                        }`}>
                          {(file.similarity * 100).toFixed(1)}%
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="text-center mt-8 text-sm text-gray-500">
          <p>Analysis completed at {new Date(data.timestamp).toLocaleString()}</p>
          <p>Report version: {data.version}</p>
        </div>
      </div>
    </div>
    </>
  );
}