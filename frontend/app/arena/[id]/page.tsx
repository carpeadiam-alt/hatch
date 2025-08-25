'use client';

import { useState, useEffect } from 'react';
import { Instrument_Sans } from 'next/font/google';
import { ArrowLeft, Calendar, Clock, Trophy, Building, Users, Target, CheckCircle, AlertCircle, Lock, Upload } from 'lucide-react';
import Navbar from '../../../components/navbar';

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
  team: {
    teamId: string;
    teamName: string;
    status?: string;
    [key: string]: unknown;
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
  phaseIndex?: number;
  submissions?: Record<string, string>;
  [key: string]: unknown;
}

export default function HackathonSubmissionPage() {
  return (
    <div className={instrumentSans.className}>
      <Navbar />
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

  const handleGoBack = () => {
    window.history.back();
  };

  const fetchHackathonData = async () => {
    try {
      const response = await fetch(`${baseURI}/fetchhack?hackCode=${hackCode}`);
      if (!response.ok) throw new Error('Failed to fetch hackathon data');
      const data: unknown = await response.json();
      setHackathonData(data as HackathonData);
    } catch (err) {
      setError('Failed to load hackathon data');
      console.error(err);
    }
  };

  const fetchTeamData = async () => {
    try {
      const userString = localStorage.getItem('user');
      const userEmail = userString ? JSON.parse(userString).email : null;
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
        const data: unknown = await response.json();
        // Handle both array and object responses
        if (Array.isArray(data)) {
          setExistingSubmissions(data);
        } else if (data && typeof data === 'object') {
          setExistingSubmissions([data as ExistingSubmission]);
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
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-lg p-8 flex items-center space-x-4">
          <div className="animate-spin rounded-full h-10 w-10 border-2 border-blue-600 border-t-transparent"></div>
          <div className="text-xl font-medium text-gray-700">Loading hackathon details...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-lg p-8 text-center max-w-md">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-8 h-8 text-red-600" />
          </div>
          <div className="text-xl font-semibold text-red-600 mb-4">{error}</div>
          <button 
            onClick={() => window.location.reload()}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors duration-200 shadow-md"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!hackathonData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
          <div className="text-xl font-medium text-gray-600">Hackathon not found</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
      {/* Header with enhanced design */}
      <div className="bg-white shadow-sm border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-6 py-8">
          {/* Back Button with better styling */}
          <button
            onClick={handleGoBack}
            className="group mb-8 inline-flex items-center px-4 py-2.5 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 hover:text-gray-900 hover:border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 shadow-sm hover:shadow-md"
          >
            <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-0.5 transition-transform duration-200" />
            Back to Dashboard
          </button>

          <div className="flex flex-col xl:flex-row xl:items-start xl:justify-between gap-8">
            <div className="flex-1">
              <div className="mb-4">
                <h1 className="text-4xl font-bold text-gray-900 mb-3">{hackathonData.eventName}</h1>
                <p className="text-xl text-gray-600 leading-relaxed">{hackathonData.eventTagline}</p>
              </div>
              
              <div className="flex flex-wrap gap-3">
                <div className="bg-gradient-to-r from-blue-50 to-blue-100 text-blue-700 px-4 py-2 rounded-xl text-sm font-semibold border border-blue-200 flex items-center space-x-2">
                  <Target className="w-4 h-4" />
                  <span>Mode: {hackathonData.mode}</span>
                </div>
                <div className="bg-gradient-to-r from-green-50 to-green-100 text-green-700 px-4 py-2 rounded-xl text-sm font-semibold border border-green-200 flex items-center space-x-2">
                  <Users className="w-4 h-4" />
                  <span>Team Size: {hackathonData.teamSize}</span>
                </div>
                <div className="bg-gradient-to-r from-purple-50 to-purple-100 text-purple-700 px-4 py-2 rounded-xl text-sm font-semibold border border-purple-200 flex items-center space-x-2">
                  <Building className="w-4 h-4" />
                  <span>Max Teams: {hackathonData.maxTeams}</span>
                </div>
              </div>
            </div>
            
            {teamData && (
              <div className={`p-6 rounded-2xl border-2 shadow-lg transition-all duration-200 ${
                isTeamActive() 
                  ? 'bg-gradient-to-br from-green-50 to-emerald-50 border-green-200 shadow-green-100' 
                  : 'bg-gradient-to-br from-red-50 to-rose-50 border-red-200 shadow-red-100'
              }`}>
                <div className="flex items-center space-x-3 mb-3">
                  <div className={`w-3 h-3 rounded-full ${isTeamActive() ? 'bg-green-500' : 'bg-red-500'}`}></div>
                  <h3 className="font-bold text-gray-900 text-lg">
                    {teamData.team.teamName}
                  </h3>
                </div>
                <p className="text-sm text-gray-600 mb-2">
                  Team ID: <span className="font-mono font-medium">{teamData.team.teamId}</span>
                </p>
                {!isTeamActive() && (
                  <div className="flex items-center space-x-2">
                    <AlertCircle className="w-4 h-4 text-red-500" />
                    <p className="text-sm text-red-600 font-semibold">
                      Status: Inactive
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Inactive Team Alert with better design */}
      {teamData && !isTeamActive() && (
        <div className="bg-gradient-to-r from-red-50 to-rose-50 border-b border-red-100">
          <div className="max-w-7xl mx-auto px-6 py-4">
            <div className="bg-white/60 backdrop-blur-sm rounded-xl p-4 border border-red-200">
              <div className="flex items-center space-x-4">
                <div className="flex-shrink-0 w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                  <AlertCircle className="h-5 w-5 text-red-500" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-red-800">Team Inactive</h3>
                  <p className="text-sm text-red-700">You are not part of this hackathon anymore. Submissions are not allowed.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 xl:grid-cols-5 gap-8">
          {/* Enhanced Sidebar */}
          <div className="xl:col-span-1">
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
              <div className="bg-gradient-to-r from-gray-50 to-white p-6 border-b border-gray-100">
                <h3 className="text-lg font-bold text-gray-900 flex items-center space-x-2">
                  <Calendar className="w-5 h-5 text-blue-600" />
                  <span>Event Details</span>
                </h3>
              </div>
              
              <div className="p-6 space-y-6">
                <div className="space-y-4">
                  <div className="bg-gray-50 rounded-xl p-4">
                    <span className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center space-x-1 mb-2">
                      <Calendar className="w-3 h-3" />
                      <span>Start Date</span>
                    </span>
                    <p className="text-sm font-medium text-gray-900">{formatDate(hackathonData.eventStartDate)}</p>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-4">
                    <span className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center space-x-1 mb-2">
                      <Clock className="w-3 h-3" />
                      <span>End Date</span>
                    </span>
                    <p className="text-sm font-medium text-gray-900">{formatDate(hackathonData.eventEndDate)}</p>
                  </div>
                  {hackathonData.hasFee && (
                    <div className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-xl p-4 border border-yellow-200">
                      <span className="text-xs font-bold text-orange-600 uppercase tracking-wider mb-2 block">Entry Fee</span>
                      <p className="text-xl font-bold text-orange-800">₹{hackathonData.fee}</p>
                    </div>
                  )}
                </div>

                {hackathonData.prizes.length > 0 && (
                  <div>
                    <h4 className="text-md font-bold text-gray-900 mb-4 flex items-center space-x-2">
                      <Trophy className="w-5 h-5 text-yellow-500" />
                      <span>Prizes</span>
                    </h4>
                    <div className="space-y-3">
                      {hackathonData.prizes.map((prize, index) => (
                        <div key={index} className="bg-gradient-to-br from-yellow-50 to-amber-50 border border-yellow-200 rounded-xl p-4 transition-all duration-200 hover:shadow-md">
                          <div className="text-sm font-semibold text-amber-800 mb-1">{prize.title}</div>
                          <div className="text-sm text-amber-700">{prize.description}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {hackathonData.sponsors.length > 0 && (
                  <div>
                    <h4 className="text-md font-bold text-gray-900 mb-4 flex items-center space-x-2">
                      <Building className="w-5 h-5 text-blue-500" />
                      <span>Sponsors</span>
                    </h4>
                    <div className="space-y-2">
                      {hackathonData.sponsors.map((sponsor, index) => (
                        <div key={index} className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-3 text-sm font-medium text-blue-800 transition-all duration-200 hover:shadow-md">
                          {sponsor.name}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Enhanced Main Content */}
          <div className="xl:col-span-4">
            {/* Enhanced Phase Tabs */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden mb-8">
              <div className="bg-gradient-to-r from-gray-50 to-white border-b border-gray-100">
                <nav className="flex overflow-x-auto scrollbar-hide p-2" aria-label="Phases">
                  {hackathonData.phases.map((phase, index) => {
                    const status = getPhaseStatus(phase);
                    const isActive = activePhase === index;
                    const hasSubmission = hasSubmissionForPhase(index);
                    
                    return (
                      <button
                        key={index}
                        onClick={() => setActivePhase(index)}
                        className={`flex-shrink-0 py-3 px-6 text-sm font-semibold rounded-xl whitespace-nowrap mx-1 transition-all duration-200 ${
                          isActive
                            ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-200'
                            : 'text-gray-600 hover:text-gray-900 hover:bg-white hover:shadow-md bg-gray-50'
                        }`}
                      >
                        <div className="flex items-center space-x-3">
                          <span>{phase.name}</span>
                          <div className="flex space-x-1">
                            <span
                              className={`inline-flex items-center px-2 py-1 rounded-lg text-xs font-bold ${
                                status === 'completed'
                                  ? isActive ? 'bg-white/20 text-white' : 'bg-green-100 text-green-700'
                                  : status === 'active'
                                  ? isActive ? 'bg-white/20 text-white' : 'bg-blue-100 text-blue-700'
                                  : isActive ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-600'
                              }`}
                            >
                              {status.toUpperCase()}
                            </span>
                            {hasSubmission && (
                              <span className={`inline-flex items-center px-2 py-1 rounded-lg text-xs font-bold ${
                                isActive ? 'bg-white/20 text-white' : 'bg-green-100 text-green-700'
                              }`}>
                                <CheckCircle className="w-3 h-3" />
                              </span>
                            )}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </nav>
              </div>

              {/* Enhanced Phase Content */}
              <div className="p-8">
                {hackathonData.phases.map((phase, index) => (
                  <div key={index} className={activePhase === index ? 'block' : 'hidden'}>
                    <div className="mb-8">
                      <h2 className="text-2xl font-bold text-gray-900 mb-3">{phase.name}</h2>
                      <p className="text-gray-600 text-lg leading-relaxed mb-6">{phase.description}</p>
                      <div className="flex flex-col sm:flex-row sm:space-x-6 space-y-2 sm:space-y-0">
                        <div className="flex items-center space-x-2 text-sm text-gray-600 bg-gray-50 rounded-lg px-3 py-2">
                          <Calendar className="w-4 h-4" />
                          <span className="font-medium">Start: {formatDate(phase.startDate)}</span>
                        </div>
                        <div className="flex items-center space-x-2 text-sm text-gray-600 bg-gray-50 rounded-lg px-3 py-2">
                          <Clock className="w-4 h-4" />
                          <span className="font-medium">End: {formatDate(phase.endDate)}</span>
                        </div>
                      </div>
                    </div>

                    {/* Enhanced Team Inactive Warning */}
                    {teamData && !isTeamActive() && (
                      <div className="mb-8 bg-gradient-to-r from-red-50 to-rose-50 border border-red-200 rounded-2xl p-6">
                        <div className="flex items-start space-x-4">
                          <div className="flex-shrink-0 w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                            <AlertCircle className="h-5 w-5 text-red-500" />
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-red-800 mb-1">
                              You are not part of this hackathon anymore
                            </p>
                            <p className="text-sm text-red-700">
                              Your team status is inactive. Submissions are not allowed.
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Enhanced Submission Status Indicator */}
                    {hasSubmissionForPhase(index) && (
                      <div className="mb-8 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-2xl p-6">
                        <div className="flex items-start space-x-4">
                          <div className="flex-shrink-0 w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                            <CheckCircle className="h-5 w-5 text-green-500" />
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-green-800 mb-1">
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
                      <div className="space-y-8">
                        <div>
                          <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center space-x-3">
                            <Upload className="w-6 h-6 text-blue-600" />
                            <span>Submit Your Work</span>
                          </h3>
                          <div className="space-y-6">
                            {phase.deliverables.map((deliverable, deliverableIndex) => (
                              <div key={deliverableIndex} className="bg-gradient-to-br from-gray-50 to-white border border-gray-200 rounded-2xl p-6 transition-all duration-200 hover:shadow-lg">
                                <label className="block text-sm font-bold text-gray-900 mb-3">
                                  {deliverable.type.charAt(0).toUpperCase() + deliverable.type.slice(1)}
                                </label>
                                <p className="text-sm text-gray-700 mb-4 leading-relaxed">{deliverable.description}</p>
                                <input
                                  type="text"
                                  placeholder={`Enter ${deliverable.type} link/details`}
                                  value={submissions[deliverable.type] || ''}
                                  onChange={(e) => handleSubmissionChange(deliverable.type, e.target.value)}
                                  className="w-full px-4 py-3 border border-gray-300 text-gray-900 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white hover:border-gray-400"
                                />
                              </div>
                            ))}
                          </div>
                        </div>
                        
                        <div className="flex justify-center pt-4">
                          <button
                            onClick={handleSubmit}
                            disabled={submitting || Object.keys(submissions).length === 0}
                            className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-8 py-4 rounded-xl font-semibold hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                          >
                            {submitting ? (
                              <div className="flex items-center space-x-3">
                                <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                                <span>Submitting...</span>
                              </div>
                            ) : hasSubmissionForPhase(index) ? 'Update Submission' : 'Submit Your Work'}
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-6">
                        <div>
                          <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center space-x-3">
                            <Target className="w-6 h-6 text-blue-600" />
                            <span>Required Deliverables</span>
                          </h3>
                          <div className="space-y-6">
                            {phase.deliverables.map((deliverable, deliverableIndex) => {
                              const submissionData = getSubmissionForPhase(index);
                              const submittedValue = submissionData?.submissions?.[deliverable.type];
                              
                              return (
                                <div key={deliverableIndex} className="bg-gradient-to-br from-gray-50 to-white border border-gray-200 rounded-2xl p-6 transition-all duration-200 hover:shadow-lg">
                                  <div className="text-sm font-bold text-gray-900 mb-2">
                                    {deliverable.type.charAt(0).toUpperCase() + deliverable.type.slice(1)}
                                  </div>
                                  <div className="text-sm text-gray-700 mb-4 leading-relaxed">{deliverable.description}</div>
                                  {submittedValue && (
                                    <div className="mt-4 p-4 bg-white border-l-4 border-green-500 rounded-xl shadow-sm">
                                      <div className="text-xs font-bold text-green-600 mb-2 uppercase tracking-wider flex items-center space-x-1">
                                        <CheckCircle className="w-3 h-3" />
                                        <span>Your Submission:</span>
                                      </div>
                                      <div className="text-sm text-gray-900 break-all font-mono bg-gray-50 p-3 rounded-lg">{submittedValue}</div>
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        </div>
                        
                        {getPhaseStatus(phase) === 'upcoming' && (
                          <div className="bg-gradient-to-r from-yellow-50 to-amber-50 border border-yellow-200 rounded-2xl p-6">
                            <div className="flex items-center space-x-3">
                              <Clock className="w-5 h-5 text-yellow-600" />
                              <p className="text-sm font-semibold text-yellow-800">Phase hasn't started yet. Come back when it begins!</p>
                            </div>
                          </div>
                        )}
                        
                        {getPhaseStatus(phase) === 'completed' && (
                          <div className="bg-gradient-to-r from-gray-50 to-slate-50 border border-gray-200 rounded-2xl p-6">
                            <div className="flex items-center space-x-3">
                              <Lock className="w-5 h-5 text-gray-600" />
                              <p className="text-sm font-semibold text-gray-700">This phase has ended. No more submissions accepted.</p>
                            </div>
                          </div>
                        )}

                        {!teamData && (
                          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-2xl p-6">
                            <div className="flex items-center space-x-3">
                              <Users className="w-5 h-5 text-blue-600" />
                              <p className="text-sm font-semibold text-blue-800">Join a team first to submit deliverables!</p>
                            </div>
                          </div>
                        )}

                        {teamData && !isTeamActive() && (
                          <div className="bg-gradient-to-r from-red-50 to-rose-50 border border-red-200 rounded-2xl p-6">
                            <div className="flex items-center space-x-3">
                              <AlertCircle className="w-5 h-5 text-red-500" />
                              <p className="text-sm font-semibold text-red-800">Team inactive. Submissions not allowed.</p>
                            </div>
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