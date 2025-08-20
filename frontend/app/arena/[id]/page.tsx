'use client';

import { useState, useEffect } from 'react';
import { Instrument_Sans } from 'next/font/google';

const instrumentSans = Instrument_Sans({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-instrument-sans',
});
import { useParams } from 'next/navigation';

interface Organiser {
  email: string;
  name: string;
  phone: string;
}

interface Deliverable {
  description: string;
  type: string;
}

interface Phase {
  deliverables: Deliverable[];
  description: string;
  endDate: string;
  name: string;
  startDate: string;
}

interface Prize {
  description: string;
  title: string;
}

interface Sponsor {
  name: string;
}

interface HackathonData {
  admins: string[];
  eventDescription: string;
  eventEndDate: string;
  eventName: string;
  eventStartDate: string;
  eventTagline: string;
  eventType: string;
  fee: string;
  hackCode: string;
  hasFee: boolean;
  maxTeams: string;
  mode: string;
  organisers: Organiser[];
  phases: Phase[];
  prizes: Prize[];
  registrationEndDate: string;
  registrationStartDate: string;
  sponsors: Sponsor[];
  teamSize: string;
  upiId: string;
}

interface TeamData {
  team: any & {
    status?: string; // Added status field
  };
  teamId: string;
  teamName: string;
  members: Array<{
    email: string;
    name: string;
    role: string;
  }>;
}

interface ExistingSubmission {
  [key: string]: any;
}

export default function HackathonSubmissionPage() {
  return (
    <div className={instrumentSans.className}>
      <HackathonSubmissionContent />
    </div>
  );
}

function HackathonSubmissionContent() {
  const params = useParams();
  const hackCode = params.id as string;
  
  const [hackathonData, setHackathonData] = useState<HackathonData | null>(null);
  const [teamData, setTeamData] = useState<TeamData | null>(null);
  const [activePhase, setActivePhase] = useState<number>(0);
  const [submissions, setSubmissions] = useState<Record<string, string>>({});
  const [existingSubmissions, setExistingSubmissions] = useState<ExistingSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const baseURI = 'https://hatchplatform-dcdphngyewcwcuc4.centralindia-01.azurewebsites.net';

  useEffect(() => {
    fetchHackathonData();
    fetchTeamData();
  }, [hackCode]);

  useEffect(() => {
    if (teamData) {
      fetchExistingSubmissions();
    }
  }, [teamData]);

  useEffect(() => {
    // Pre-fill submissions when existing submissions are loaded or active phase changes
    if (existingSubmissions.length > 0 && hackathonData) {
      const currentPhaseSubmission = existingSubmissions.find(sub => sub.phaseIndex === activePhase);
      if (currentPhaseSubmission && currentPhaseSubmission.submissions) {
        setSubmissions(currentPhaseSubmission.submissions);
      } else {
        setSubmissions({});
      }
    }
  }, [existingSubmissions, activePhase, hackathonData]);

  // Helper function to check if team is active
  const isTeamActive = (): boolean => {
    return teamData?.team?.status !== 'inactive';
  };

  const fetchHackathonData = async () => {
    try {
      const response = await fetch(`${baseURI}/fetchhack?hackCode=${hackCode}`);
      if (!response.ok) throw new Error('Failed to fetch hackathon data');
      const data = await response.json();
      setHackathonData(data);
    } catch (err) {
      setError('Failed to load hackathon data');
      console.error(err);
    }
  };

  const fetchTeamData = async () => {
    try {
      const userEmail = JSON.parse(localStorage.getItem('user') || '{}').email;
      const authToken = localStorage.getItem('auth_token');
      
      if (!userEmail || !authToken) {
        // Skip team data fetch if no auth, but don't show error
        setLoading(false);
        return;
      }

      const response = await fetch(`${baseURI}/getTeamDetails`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: userEmail,
          hackCode: hackCode,
          auth_token: authToken,
        }),
      });

      if (!response.ok) throw new Error('Failed to fetch team data');
      const data = await response.json();
      setTeamData(data);
    } catch (err) {
      console.error('Failed to load team data:', err);
      // Don't set error, just log it
    } finally {
      setLoading(false);
    }
  };

  const fetchExistingSubmissions = async () => {
    try {
      if (!teamData) return;
      
      const authToken = localStorage.getItem('auth_token');
      const response = await fetch(`${baseURI}/fetchsubmissions?teamId=${teamData.team.teamId}&hackCode=${hackCode}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
      });
      console.log(`Fetching existing submissions:`);
      console.log(response);
      if (response.ok) {
        const data = await response.json();
        // Handle both array and object responses
        if (Array.isArray(data)) {
          setExistingSubmissions(data);
        } else if (data && typeof data === 'object') {
          setExistingSubmissions([data]);
        } else {
          setExistingSubmissions([]);
        }
      } else {
        // Natural fallback for no submissions
        setExistingSubmissions([]);
      }
    } catch (err) {
      console.error('Failed to fetch existing submissions:', err);
      // Natural fallback
      setExistingSubmissions([]);
    }
  };

  const getPhaseStatus = (phase: Phase): 'upcoming' | 'active' | 'completed' => {
    const now = new Date();
    const startDate = new Date(phase.startDate);
    const endDate = new Date(phase.endDate);

    if (now < startDate) return 'upcoming';
    if (now > endDate) return 'completed';
    return 'active';
  };

  const hasSubmissionForPhase = (phaseIndex: number): boolean => {
    return existingSubmissions.some(sub => sub.phaseIndex === phaseIndex);
  };

  const getSubmissionForPhase = (phaseIndex: number): ExistingSubmission | null => {
    return existingSubmissions.find(sub => sub.phaseIndex === phaseIndex) || null;
  };

  const handleSubmissionChange = (deliverableType: string, value: string) => {
    setSubmissions(prev => ({
      ...prev,
      [deliverableType]: value,
    }));
  };

  const handleSubmit = async () => {
    if (!teamData || !hackathonData) return;

    setSubmitting(true);
    try {
      const authToken = localStorage.getItem('auth_token');
      
      const response = await fetch(`${baseURI}/submissions?teamId=${teamData.team.teamId}&hackCode=${hackCode}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          submissions: submissions,
          teamId: teamData.team.teamId,
          hackCode: hackCode,
          phaseIndex: activePhase,
        }),
      });

      if (!response.ok) throw new Error('Failed to submit');
      
      alert('Submission successful!');
      // Refresh existing submissions after successful submit
      fetchExistingSubmissions();
    } catch (err) {
      alert('Submission failed. Please try again.');
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="flex items-center space-x-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <div className="text-xl text-gray-600">Loading...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="text-xl text-red-600 mb-4">{error}</div>
          <button 
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!hackathonData) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-xl text-gray-600">Hackathon not found</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="border-b border-gray-200 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col md:flex-row md:items-start md:justify-between">
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-900">{hackathonData.eventName}</h1>
              <p className="text-lg text-gray-600 mt-2">{hackathonData.eventTagline}</p>
              <div className="flex flex-wrap gap-3 mt-4">
                <span className="bg-blue-50 text-blue-700 px-3 py-1 rounded-md text-sm font-medium border border-blue-200">
                  Mode: {hackathonData.mode}
                </span>
                <span className="bg-green-50 text-green-700 px-3 py-1 rounded-md text-sm font-medium border border-green-200">
                  Team Size: {hackathonData.teamSize}
                </span>
                <span className="bg-gray-50 text-gray-700 px-3 py-1 rounded-md text-sm font-medium border border-gray-200">
                  Max Teams: {hackathonData.maxTeams}
                </span>
              </div>
            </div>
            {teamData && (
              <div className={`mt-6 md:mt-0 p-4 rounded-lg border ${
                isTeamActive() 
                  ? 'bg-green-50 border-green-200' 
                  : 'bg-red-50 border-red-200'
              }`}>
                <h3 className="font-semibold text-gray-900">
                  Team: {teamData.team.teamName}
                </h3>
                <p className="text-sm text-gray-600">
                  ID: {teamData.team.teamId}
                </p>
                {!isTeamActive() && (
                  <p className="text-sm text-red-600 mt-1 font-medium">
                    Status: Inactive
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Inactive Team Alert */}
      {teamData && !isTeamActive() && (
        <div className="bg-red-50 border-b border-red-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center space-x-3">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <h3 className="text-sm font-medium text-red-800">Team Inactive</h3>
                <p className="text-sm text-red-700">You are not part of this hackathon anymore. Submissions are not allowed.</p>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Event Details</h3>
              <div className="space-y-4">
                <div>
                  <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">Start Date</span>
                  <p className="text-sm text-gray-900 mt-1">{formatDate(hackathonData.eventStartDate)}</p>
                </div>
                <div>
                  <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">End Date</span>
                  <p className="text-sm text-gray-900 mt-1">{formatDate(hackathonData.eventEndDate)}</p>
                </div>
                {hackathonData.hasFee && (
                  <div>
                    <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">Entry Fee</span>
                    <p className="text-lg font-semibold text-gray-900 mt-1">₹{hackathonData.fee}</p>
                  </div>
                )}
              </div>

              {hackathonData.prizes.length > 0 && (
                <div className="mt-6">
                  <h4 className="text-md font-semibold text-gray-900 mb-3">🏆 Prizes</h4>
                  <div className="space-y-3">
                    {hackathonData.prizes.map((prize, index) => (
                      <div key={index} className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                        <div className="text-sm font-medium text-gray-900">{prize.title}</div>
                        <div className="text-sm text-gray-600 mt-1">{prize.description}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {hackathonData.sponsors.length > 0 && (
                <div className="mt-6">
                  <h4 className="text-md font-semibold text-gray-900 mb-3">🤝 Sponsors</h4>
                  <div className="space-y-2">
                    {hackathonData.sponsors.map((sponsor, index) => (
                      <div key={index} className="bg-gray-50 border border-gray-200 rounded-lg p-2 text-sm text-gray-700">
                        {sponsor.name}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {/* Phase Tabs */}
            <div className="bg-white border border-gray-200 rounded-lg mb-6">
              <div className="border-b border-gray-200">
                <nav className="flex space-x-1 p-1" aria-label="Phases">
                  {hackathonData.phases.map((phase, index) => {
                    const status = getPhaseStatus(phase);
                    const isActive = activePhase === index;
                    const hasSubmission = hasSubmissionForPhase(index);
                    
                    return (
                      <button
                        key={index}
                        onClick={() => setActivePhase(index)}
                        className={`py-2 px-4 text-sm font-medium rounded-md whitespace-nowrap ${
                          isActive
                            ? 'bg-blue-100 text-blue-700 border border-blue-200'
                            : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        <div className="flex items-center space-x-2">
                          <span>{phase.name}</span>
                          <div className="flex space-x-1">
                            <span
                              className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                                status === 'completed'
                                  ? 'bg-green-100 text-green-800'
                                  : status === 'active'
                                  ? 'bg-blue-100 text-blue-800'
                                  : 'bg-gray-100 text-gray-800'
                              }`}
                            >
                              {status.toUpperCase()}
                            </span>
                            {hasSubmission && (
                              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                                ✓
                              </span>
                            )}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </nav>
              </div>

              {/* Phase Content */}
              <div className="p-6">
                {hackathonData.phases.map((phase, index) => (
                  <div key={index} className={activePhase === index ? 'block' : 'hidden'}>
                    <div className="mb-6">
                      <h2 className="text-xl font-semibold text-gray-900 mb-2">{phase.name}</h2>
                      <p className="text-gray-600 mb-4">{phase.description}</p>
                      <div className="flex flex-col sm:flex-row sm:space-x-4 text-sm text-gray-600">
                        <span>📅 Start: {formatDate(phase.startDate)}</span>
                        <span>⏰ End: {formatDate(phase.endDate)}</span>
                      </div>
                    </div>

                    {/* Team Inactive Warning */}
                    {teamData && !isTeamActive() && (
                      <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
                        <div className="flex items-center space-x-3">
                          <svg className="h-5 w-5 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <div>
                            <p className="text-sm font-medium text-red-800">
                              You are not part of this hackathon anymore
                            </p>
                            <p className="text-sm text-red-700">
                              Your team status is inactive. Submissions are not allowed.
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Submission Status Indicator */}
                    {hasSubmissionForPhase(index) && (
                      <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4">
                        <div className="flex items-center space-x-3">
                          <svg className="h-5 w-5 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                          </svg>
                          <div>
                            <p className="text-sm font-medium text-green-800">
                              Submission Complete!
                            </p>
                            {isTeamActive() && (
                              <p className="text-sm text-green-700">
                                You can update your submission below if the phase is still active.
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    )}

                    {getPhaseStatus(phase) === 'active' && teamData && isTeamActive() ? (
                      <div className="space-y-6">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900 mb-4">📤 Submit Your Work</h3>
                          <div className="space-y-4">
                            {phase.deliverables.map((deliverable, deliverableIndex) => (
                              <div key={deliverableIndex} className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                                <label className="block text-sm font-medium text-gray-900 mb-2">
                                  {deliverable.type.charAt(0).toUpperCase() + deliverable.type.slice(1)}
                                </label>
                                <p className="text-sm text-gray-900 mb-3">{deliverable.description}</p>
                                <input
                                  type="text"
                                  placeholder={`Enter ${deliverable.type} link/details`}
                                  value={submissions[deliverable.type] || ''}
                                  onChange={(e) => handleSubmissionChange(deliverable.type, e.target.value)}
                                  className="w-full px-3 py-2 border border-gray-900 text-gray-900 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                                />

                              </div>
                            ))}
                          </div>
                        </div>
                        
                        <div className="flex justify-center">
                          <button
                            onClick={handleSubmit}
                            disabled={submitting || Object.keys(submissions).length === 0}
                            className="bg-blue-600 text-white px-6 py-2 rounded-md font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {submitting ? (
                              <div className="flex items-center space-x-2">
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                <span>Submitting...</span>
                              </div>
                            ) : hasSubmissionForPhase(index) ? 'Update Submission' : 'Submit'}
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900 mb-4">📋 Required Deliverables</h3>
                          <div className="space-y-4">
                            {phase.deliverables.map((deliverable, deliverableIndex) => {
                              const submissionData = getSubmissionForPhase(index);
                              const submittedValue = submissionData?.submissions?.[deliverable.type];
                              
                              return (
                                <div key={deliverableIndex} className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                                  <div className="text-sm font-medium text-gray-900 mb-1">
                                    {deliverable.type.charAt(0).toUpperCase() + deliverable.type.slice(1)}
                                  </div>
                                  <div className="text-sm text-gray-600 mb-3">{deliverable.description}</div>
                                  {submittedValue && (
                                    <div className="mt-3 p-3 bg-white border-l-4 border-green-500 rounded">
                                      <div className="text-xs font-medium text-green-600 mb-1 uppercase tracking-wider">✅ Your Submission:</div>
                                      <div className="text-sm text-gray-900 break-all">{submittedValue}</div>
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        </div>
                        
                        {getPhaseStatus(phase) === 'upcoming' && (
                          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                            <p className="text-sm text-yellow-800">⏳ Phase hasn't started yet. Come back when it begins!</p>
                          </div>
                        )}
                        
                        {getPhaseStatus(phase) === 'completed' && (
                          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                            <p className="text-sm text-gray-600">🔒 This phase has ended. No more submissions accepted.</p>
                          </div>
                        )}

                        {!teamData && (
                          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                            <p className="text-sm text-red-800">👥 Join a team first to submit deliverables!</p>
                          </div>
                        )}

                        {teamData && !isTeamActive() && (
                          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                            <p className="text-sm text-red-800">❌ Team inactive. Submissions not allowed.</p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}