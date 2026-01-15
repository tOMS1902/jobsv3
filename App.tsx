
import React, { useState, useEffect } from 'react';
import Layout from './components/Layout';
import AuthModal from './components/AuthModal';
import { User, UserMode, StudentProfile, JobListing, Message, Experience } from './types';
import { MOCK_JOBS } from './constants';
import JobCard from './components/JobCard';
import { generateJobDescription, improveBio } from './services/geminiService';
import { apiService } from './services/apiService';

type Screen = 'feed' | 'profile' | 'tracker' | 'dashboard' | 'create-job' | 'inbox';

// --- Screen: Job Details (Overlay) ---
const JobDetails = ({ job, onClose, onMessage, canMessage }: { job: JobListing, onClose: () => void, onMessage: (msg: string) => void, canMessage: boolean }) => {
  const [message, setMessage] = useState('');
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSend = () => {
    if (!message.trim()) {
      setError("Please enter a message before sending.");
      return;
    }
    setError(null);
    try {
      onMessage(message);
      setSent(true);
      setTimeout(() => {
        setSent(false);
        setMessage('');
        onClose();
      }, 2000);
    } catch (e) {
      setError("Failed to send message. Please try again.");
    }
  };

  return (
    <div className="fixed inset-0 z-[100] bg-zinc-950/50 backdrop-blur-sm animate-in fade-in flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="bg-white dark:bg-zinc-900 w-full max-w-2xl h-[90vh] sm:h-auto sm:max-h-[85vh] rounded-t-3xl sm:rounded-2xl shadow-2xl overflow-hidden flex flex-col animate-in slide-in-from-bottom-10">
        <header className="p-4 border-b border-warm-100 dark:border-zinc-800 flex justify-between items-center bg-white dark:bg-zinc-900 sticky top-0 z-10">
          <h2 className="font-bold text-lg">Job Details</h2>
          <button onClick={onClose} className="p-2 hover:bg-warm-50 dark:hover:bg-zinc-800 rounded-full">
            <span className="material-symbols-outlined">close</span>
          </button>
        </header>

        <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
          <div className="flex gap-4">
            <div className="w-20 h-20 rounded-2xl shadow-sm overflow-hidden bg-warm-100 dark:bg-zinc-800 flex-shrink-0">
              <img src={job.logo || `https://picsum.photos/seed/${job.id}/200`} className="w-full h-full object-cover" alt="" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-magenta leading-tight">{job.title}</h1>
              <p className="font-semibold text-zinc-600 dark:text-zinc-400">{job.company}</p>
              <div className="flex items-center gap-1 text-xs text-zinc-400 mt-1">
                <span className="material-symbols-outlined text-sm">location_on</span>
                {job.location}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-warm-50 dark:bg-zinc-800/50 p-4 rounded-xl border border-warm-100 dark:border-zinc-800">
              <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-1">Pay Rate</p>
              <p className="text-lg font-bold">€{job.salaryMin}-{job.salaryMax}/hr</p>
            </div>
            <div className="bg-warm-50 dark:bg-zinc-800/50 p-4 rounded-xl border border-warm-100 dark:border-zinc-800">
              <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-1">Status</p>
              <p className="text-lg font-bold text-green-500 uppercase text-sm">Active</p>
            </div>
          </div>

          <div>
            <h3 className="font-bold mb-2">Description</h3>
            <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed whitespace-pre-wrap">{job.description}</p>
          </div>

          {job.responsibilities?.length > 0 && (
            <div>
              <h3 className="font-bold mb-2">Responsibilities</h3>
              <ul className="list-disc list-inside text-sm text-zinc-600 dark:text-zinc-400 space-y-1">
                {job.responsibilities.map((r, i) => r ? <li key={i}>{r}</li> : null)}
              </ul>
            </div>
          )}

          {canMessage && (
            <div className="border-t border-warm-100 dark:border-zinc-800 pt-6">
              <h3 className="font-bold mb-4 flex items-center gap-2">
                <span className="material-symbols-outlined text-magenta">mail</span>
                Message Employer
              </h3>
              {error && <p className="text-red-500 text-xs font-bold mb-2">{error}</p>}
              <div className="space-y-3">
                <textarea 
                  placeholder="Ask a question about the role or pitch yourself..."
                  className="w-full p-4 bg-warm-50 dark:bg-zinc-800 border border-warm-100 dark:border-zinc-700 rounded-xl text-sm outline-none focus:ring-2 focus:ring-magenta transition-all"
                  rows={3}
                  value={message}
                  onChange={e => setMessage(e.target.value)}
                ></textarea>
                <button 
                  onClick={handleSend}
                  disabled={sent}
                  className={`w-full py-3 rounded-xl font-bold transition-all shadow-lg ${sent ? 'bg-green-500 text-white' : 'bg-magenta text-white active:scale-95 shadow-magenta/20'}`}
                >
                  {sent ? 'Message Sent!' : 'Send Message'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// --- Screen: Inbox (Employer View) ---
const InboxPage = ({ messages, jobs }: { messages: Message[], jobs: JobListing[] }) => {
  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <h2 className="text-2xl font-bold">Employer Inbox</h2>
      <div className="grid gap-4">
        {messages.length === 0 ? (
          <div className="py-20 text-center text-zinc-400">
            <span className="material-symbols-outlined text-5xl mb-2">inbox</span>
            <p>No messages yet.</p>
          </div>
        ) : (
          messages.map(msg => {
            const job = jobs.find(j => j.id === msg.jobId);
            return (
              <div key={msg.id} className="bg-white dark:bg-zinc-900 border border-warm-100 dark:border-zinc-800 p-4 rounded-2xl shadow-sm flex gap-4">
                <div className="w-10 h-10 rounded-full bg-magenta/10 flex items-center justify-center text-magenta font-bold">
                  {msg.studentName.charAt(0)}
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-start">
                    <h4 className="font-bold text-sm">{msg.studentName}</h4>
                    <span className="text-[9px] text-zinc-400">{msg.timestamp}</span>
                  </div>
                  <p className="text-[10px] text-magenta font-medium mb-2">Re: {job?.title || 'Job Listing'}</p>
                  <p className="text-xs text-zinc-600 dark:text-zinc-400 italic">"{msg.text}"</p>
                  <div className="mt-4 flex gap-2">
                    <button className="px-3 py-1 bg-magenta text-white text-[10px] font-bold rounded-lg">Reply</button>
                    <button className="px-3 py-1 bg-warm-50 dark:bg-zinc-800 text-[10px] font-bold rounded-lg">View Profile</button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

// --- Screen: Job Feed ---
const JobFeed = ({ jobs, onJobClick }: { jobs: JobListing[], onJobClick: (id: string) => void }) => {
  const [activeFilter, setActiveFilter] = useState('All');
  const filters = ['All', 'Remote', 'Nearby', 'Internships', 'On-Campus'];

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="relative group">
        <input 
          type="text" 
          placeholder="Search for jobs (e.g. Barista, Tutor)" 
          className="w-full pl-12 pr-4 py-4 bg-white dark:bg-zinc-900 border border-warm-200 dark:border-zinc-800 rounded-full shadow-lg shadow-warm-200/20 dark:shadow-none focus:ring-2 focus:ring-magenta outline-none transition-all"
        />
        <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400">search</span>
      </div>

      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
        <button className="flex-shrink-0 flex items-center gap-1 px-4 py-2 bg-warm-100 dark:bg-zinc-800 text-zinc-500 rounded-full font-bold text-xs">
          <span className="material-symbols-outlined text-sm">tune</span>
          Filters
        </button>
        {filters.map(f => (
          <button 
            key={f}
            onClick={() => setActiveFilter(f)}
            className={`flex-shrink-0 px-5 py-2 rounded-full font-bold text-xs transition-all ${activeFilter === f ? 'bg-magenta text-white shadow-md shadow-magenta/20' : 'bg-white dark:bg-zinc-900 border border-warm-200 dark:border-zinc-800 text-zinc-500 hover:bg-warm-50 dark:hover:bg-zinc-800'}`}
          >
            {f}
          </button>
        ))}
      </div>

      <div className="grid gap-4">
        {jobs.length === 0 ? (
          <div className="py-20 text-center text-zinc-400">
             <span className="material-symbols-outlined text-5xl mb-2">work_off</span>
             <p>No jobs available right now.</p>
          </div>
        ) : (
          jobs.map(job => (
            <JobCard key={job.id} job={job} onClick={() => onJobClick(job.id)} />
          ))
        )}
      </div>
    </div>
  );
};

// --- Screen 3: Student Profile ---
const ProfilePage = ({ user }: { user: User | null }) => {
  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [saveStatus, setSaveStatus] = useState<{type: 'success' | 'error', text: string} | null>(null);

  useEffect(() => {
    // Attempt to load from localStorage first (Legacy)
    const savedProfile = localStorage.getItem(`ptj:profile:${user?.email}`);
    if (savedProfile) {
      setProfile(JSON.parse(savedProfile));
      setLoading(false);
    } else if (user) {
      setProfile({
        id: user.studentId || '1',
        firstName: user.firstName || 'Alex',
        lastName: user.lastName || 'Byrne',
        dob: '2001-05-15',
        email: user.email,
        phone: '+353 87 123 4567',
        university: (user as any).university || 'Trinity College Dublin (TCD)',
        degree: 'BSc Computer Science',
        bio: 'Dedicated student looking for a part-time role to gain experience.',
        skills: ['Communication', 'Time Management'],
        experience: [],
        portfolioUrl: '',
        linkedInUrl: ''
      });
      setLoading(false);
    }
  }, [user]);

  const handleSave = async () => {
    if (!profile) return;
    setSaving(true);
    setSaveStatus(null);
    
    // Save to local storage (Immediate feedback)
    localStorage.setItem(`ptj:profile:${user?.email}`, JSON.stringify(profile));
    
    // Simulate API call to Cloud SQL via apiService
    const success = await apiService.saveStudentProfile(profile);
    
    setSaving(false);
    if (success) {
      setSaveStatus({ type: 'success', text: 'Profile saved successfully!' });
    } else {
      setSaveStatus({ type: 'error', text: 'Failed to sync with server.' });
    }
    setTimeout(() => setSaveStatus(null), 3000);
  };

  const handleAiImprove = async () => {
    if (!profile?.bio) return;
    setAiLoading(true);
    try {
      const improved = await improveBio(profile.bio);
      setProfile({ ...profile, bio: improved });
    } catch (e) {
      setSaveStatus({ type: 'error', text: 'AI refinement failed.' });
    } finally {
      setAiLoading(false);
    }
  };

  const addExperience = () => {
    if (!profile) return;
    setProfile({
      ...profile,
      experience: [...profile.experience, { role: '', company: '', period: '' }]
    });
  };

  const updateExperience = (index: number, field: keyof Experience, value: string) => {
    if (!profile) return;
    const newExp = [...profile.experience];
    newExp[index] = { ...newExp[index], [field]: value };
    setProfile({ ...profile, experience: newExp });
  };

  const removeExperience = (index: number) => {
    if (!profile) return;
    const newExp = profile.experience.filter((_, i) => i !== index);
    setProfile({ ...profile, experience: newExp });
  };

  if (loading) return <div className="p-8 text-center text-zinc-400">Loading profile...</div>;

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-20">
      <section className="bg-magenta rounded-3xl p-8 text-white relative overflow-hidden shadow-xl shadow-magenta/20">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center gap-6">
          <div className="w-24 h-24 bg-white/20 backdrop-blur-md border border-white/30 rounded-full flex items-center justify-center text-4xl font-bold shadow-inner">
            {profile?.firstName.charAt(0)}{profile?.lastName.charAt(0)}
          </div>
          <div>
            <h2 className="text-3xl font-bold mb-1">{profile?.firstName} {profile?.lastName}</h2>
            <p className="opacity-90 flex items-center gap-2 text-sm font-medium">
              <span className="material-symbols-outlined text-sm">school</span>
              {profile?.university}
            </p>
            <p className="opacity-75 text-xs mt-1">{profile?.degree}</p>
          </div>
        </div>
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-20 -mt-20 blur-3xl"></div>
      </section>

      <div className="grid md:grid-cols-3 gap-6">
        {/* Left Column: Essential Links & Skills */}
        <div className="md:col-span-1 space-y-6">
          <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-warm-200 dark:border-zinc-800 p-6 shadow-sm">
            <h3 className="font-bold mb-4 text-xs uppercase tracking-widest text-zinc-400">Professional Links</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-zinc-500 uppercase mb-1">LinkedIn URL</label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 text-sm">link</span>
                  <input 
                    type="url"
                    value={profile?.linkedInUrl}
                    onChange={e => setProfile(p => p ? {...p, linkedInUrl: e.target.value} : null)}
                    placeholder="linkedin.com/in/..."
                    className="w-full pl-9 pr-4 py-2 bg-warm-50 dark:bg-zinc-800 border border-warm-200 dark:border-zinc-700 rounded-xl text-xs outline-none focus:ring-2 focus:ring-magenta transition-all"
                  />
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-bold text-zinc-500 uppercase mb-1">Portfolio/CV Link</label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 text-sm">language</span>
                  <input 
                    type="url"
                    value={profile?.portfolioUrl}
                    onChange={e => setProfile(p => p ? {...p, portfolioUrl: e.target.value} : null)}
                    placeholder="myportfolio.com"
                    className="w-full pl-9 pr-4 py-2 bg-warm-50 dark:bg-zinc-800 border border-warm-200 dark:border-zinc-700 rounded-xl text-xs outline-none focus:ring-2 focus:ring-magenta transition-all"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-warm-200 dark:border-zinc-800 p-6 shadow-sm">
            <h3 className="font-bold mb-4 text-xs uppercase tracking-widest text-zinc-400">Skills</h3>
            <textarea 
              rows={3}
              placeholder="e.g. Retail, Customer Service, Python, Design"
              value={profile?.skills.join(', ')}
              onChange={e => setProfile(p => p ? {...p, skills: e.target.value.split(',').map(s => s.trim())} : null)}
              className="w-full px-4 py-3 bg-warm-50 dark:bg-zinc-800 border border-warm-200 dark:border-zinc-700 rounded-xl text-xs outline-none focus:ring-2 focus:ring-magenta transition-all resize-none"
            ></textarea>
            <p className="text-[10px] text-zinc-400 mt-2">Separate skills with commas.</p>
          </div>
        </div>

        {/* Main Column: Bio & Experience */}
        <div className="md:col-span-2 space-y-6">
          <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-warm-200 dark:border-zinc-800 p-6 shadow-sm">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-xs uppercase tracking-widest text-zinc-400">Professional Bio</h3>
              <button 
                onClick={handleAiImprove}
                disabled={aiLoading || !profile?.bio}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-magenta/5 text-magenta rounded-full text-[10px] font-bold border border-magenta/10 hover:bg-magenta/10 transition-all disabled:opacity-50"
              >
                {aiLoading ? (
                  <span className="w-3 h-3 border-2 border-magenta/30 border-t-magenta rounded-full animate-spin"></span>
                ) : (
                  <span className="material-symbols-outlined text-xs">auto_awesome</span>
                )}
                Refine with AI
              </button>
            </div>
            <textarea 
              rows={4}
              value={profile?.bio}
              onChange={e => setProfile(p => p ? {...p, bio: e.target.value} : null)}
              className="w-full px-4 py-3 bg-warm-50 dark:bg-zinc-800 border border-warm-200 dark:border-zinc-700 rounded-xl outline-none focus:ring-2 focus:ring-magenta transition-all text-sm leading-relaxed"
            ></textarea>
          </div>

          <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-warm-200 dark:border-zinc-800 p-6 shadow-sm">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-bold text-xs uppercase tracking-widest text-zinc-400">Work Experience</h3>
              <button 
                onClick={addExperience}
                className="flex items-center gap-1 text-[10px] font-bold text-magenta hover:underline"
              >
                <span className="material-symbols-outlined text-sm">add_circle</span>
                Add Position
              </button>
            </div>
            
            <div className="space-y-4">
              {profile?.experience.length === 0 ? (
                <div className="text-center py-8 border-2 border-dashed border-warm-100 dark:border-zinc-800 rounded-2xl">
                  <span className="material-symbols-outlined text-zinc-300 text-3xl mb-2">work_outline</span>
                  <p className="text-xs text-zinc-400">No experience added yet. Tell employers about your past gigs!</p>
                </div>
              ) : (
                profile?.experience.map((exp, idx) => (
                  <div key={idx} className="p-4 bg-warm-50 dark:bg-zinc-800/50 rounded-2xl border border-warm-100 dark:border-zinc-700 relative group">
                    <button 
                      onClick={() => removeExperience(idx)}
                      className="absolute top-2 right-2 p-1 text-zinc-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <span className="material-symbols-outlined text-sm">delete</span>
                    </button>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-[9px] font-bold text-zinc-400 uppercase mb-1">Role</label>
                        <input 
                          value={exp.role}
                          onChange={e => updateExperience(idx, 'role', e.target.value)}
                          placeholder="e.g. Floor Staff"
                          className="w-full bg-transparent border-b border-warm-200 dark:border-zinc-700 pb-1 text-sm font-bold outline-none focus:border-magenta transition-colors"
                        />
                      </div>
                      <div>
                        <label className="block text-[9px] font-bold text-zinc-400 uppercase mb-1">Company</label>
                        <input 
                          value={exp.company}
                          onChange={e => updateExperience(idx, 'company', e.target.value)}
                          placeholder="e.g. Centra"
                          className="w-full bg-transparent border-b border-warm-200 dark:border-zinc-700 pb-1 text-sm font-medium outline-none focus:border-magenta transition-colors"
                        />
                      </div>
                      <div>
                        <label className="block text-[9px] font-bold text-zinc-400 uppercase mb-1">Period</label>
                        <input 
                          value={exp.period}
                          onChange={e => updateExperience(idx, 'period', e.target.value)}
                          placeholder="e.g. Summer 2023"
                          className="w-full bg-transparent border-b border-warm-200 dark:border-zinc-700 pb-1 text-sm outline-none focus:border-magenta transition-colors"
                        />
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Floating Action Bar */}
      <div className="fixed bottom-24 left-1/2 -translate-x-1/2 w-full max-w-lg px-4 z-[60]">
        <div className="glass border border-warm-200 dark:border-zinc-800 p-4 rounded-2xl shadow-2xl flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">Database Sync</span>
            <span className={`text-xs font-bold ${saveStatus?.type === 'error' ? 'text-red-500' : 'text-green-500'}`}>
              {saveStatus?.text || 'Ready to sync'}
            </span>
          </div>
          <button 
            onClick={handleSave}
            disabled={saving}
            className="bg-magenta text-white px-8 py-3 rounded-xl font-bold hover:bg-magenta-600 transition-all active:scale-95 shadow-lg shadow-magenta/20 disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Save & Sync'}
          </button>
        </div>
      </div>
    </div>
  );
};

// --- Screen 4: Application Tracker ---
const TrackerPage = () => {
  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <h2 className="text-2xl font-bold tracking-tight">Applications</h2>
      <div className="grid gap-4">
        <div className="py-20 text-center text-zinc-400">
           <span className="material-symbols-outlined text-5xl mb-2">assignment_turned_in</span>
           <p>No applications tracked yet.</p>
        </div>
      </div>
    </div>
  );
};

// --- Screen 6: Employer Dashboard ---
const EmployerDashboard = ({ jobs, onAddListing }: { jobs: JobListing[], onAddListing: () => void }) => {
  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-white dark:bg-zinc-900 p-4 rounded-2xl border border-warm-200 dark:border-zinc-800 shadow-sm text-center">
          <h4 className="text-xl font-bold">{jobs.length}</h4>
          <p className="text-[9px] font-bold text-zinc-400 uppercase">Active</p>
        </div>
        <div className="bg-white dark:bg-zinc-900 p-4 rounded-2xl border border-warm-200 dark:border-zinc-800 shadow-sm text-center">
          <h4 className="text-xl font-bold">0</h4>
          <p className="text-[9px] font-bold text-zinc-400 uppercase">Views</p>
        </div>
        <div className="bg-white dark:bg-zinc-900 p-4 rounded-2xl border border-warm-200 dark:border-zinc-800 shadow-sm text-center">
          <h4 className="text-xl font-bold text-magenta">0</h4>
          <p className="text-[9px] font-bold text-zinc-400 uppercase">Applicants</p>
        </div>
      </div>
      <h2 className="text-xl font-bold">Your Listings</h2>
      <div className="grid gap-4">
        {jobs.length === 0 ? (
          <div className="bg-white dark:bg-zinc-900 p-8 rounded-2xl border border-dashed border-warm-300 dark:border-zinc-800 text-center text-zinc-400">
            <p className="text-sm">You haven't posted any jobs yet.</p>
            <button onClick={onAddListing} className="text-magenta font-bold text-xs mt-2 underline">Post your first job</button>
          </div>
        ) : (
          jobs.map(job => (
            <div key={job.id} className="bg-white dark:bg-zinc-900 rounded-2xl border border-warm-200 dark:border-zinc-800 p-4 flex gap-4">
               <img src={job.logo || `https://picsum.photos/seed/${job.id}/200`} className="w-12 h-12 rounded-xl object-cover" alt="" />
               <div className="flex-1">
                  <h3 className="font-bold text-sm">{job.title}</h3>
                  <p className="text-[10px] text-zinc-400">{job.applicantCount || 0} Applicants</p>
               </div>
               <button className="text-magenta text-xs font-bold">Edit</button>
            </div>
          ))
        )}
      </div>
      <button 
        onClick={onAddListing}
        className="fixed bottom-24 right-6 w-14 h-14 bg-magenta text-white rounded-full shadow-2xl flex items-center justify-center active:scale-90 transition-all z-40"
      >
        <span className="material-symbols-outlined text-3xl">add</span>
      </button>
    </div>
  );
};

// --- Screen 7: Create Job ---
const CreateJobPage = ({ onCancel, onSubmit, companyName }: { onCancel: () => void, onSubmit: (job: Partial<JobListing>) => void, companyName: string }) => {
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<{type: 'error' | 'success', text: string} | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    location: '',
    deadline: '',
    description: '',
    salaryMin: '12.50',
    salaryMax: '15.00',
    responsibilities: [''],
  });

  const handleAI = async () => {
    if (!formData.title) {
      setStatus({ type: 'error', text: 'Enter a job title first so AI can help!' });
      return;
    }
    setStatus(null);
    setLoading(true);
    try {
      const result = await generateJobDescription(formData.title, companyName);
      setFormData(f => ({ ...f, description: result }));
    } catch (e) {
      setStatus({ type: 'error', text: 'AI failed to generate description. Please try manually.' });
    } finally {
      setLoading(false);
    }
  };

  const addResp = () => setFormData(f => ({ ...f, responsibilities: [...f.responsibilities, ''] }));
  const updateResp = (i: number, val: string) => {
    const resps = [...formData.responsibilities];
    resps[i] = val;
    setFormData(f => ({ ...f, responsibilities: resps }));
  };

  const handleSubmit = () => {
    if (!formData.title || !formData.location || !formData.deadline || !formData.description) {
      setStatus({ type: 'error', text: 'Please fill in all required fields.' });
      return;
    }
    if (parseFloat(formData.salaryMin) > parseFloat(formData.salaryMax)) {
      setStatus({ type: 'error', text: 'Minimum pay cannot be greater than maximum pay.' });
      return;
    }

    setLoading(true);
    setStatus(null);
    const newJob: Partial<JobListing> = {
      title: formData.title,
      company: companyName,
      location: formData.location,
      deadline: formData.deadline,
      description: formData.description,
      salaryMin: parseFloat(formData.salaryMin),
      salaryMax: parseFloat(formData.salaryMax),
      responsibilities: formData.responsibilities.filter(r => r.trim() !== ''),
      tags: ['New'],
      postedAt: 'Just now',
      applicantCount: 0,
      status: 'active'
    };
    setTimeout(() => {
      onSubmit(newJob);
      setLoading(false);
    }, 800);
  };

  const isFormValid = formData.title && formData.location && formData.deadline && formData.description;

  return (
    <div className="bg-warm-50 dark:bg-zinc-950 min-h-screen pb-32 animate-in slide-in-from-bottom-10 duration-500">
      <header className="sticky top-0 z-50 glass border-b border-warm-200 dark:border-zinc-800 px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button onClick={onCancel} className="p-2 hover:bg-warm-100 dark:hover:bg-zinc-800 rounded-full transition-colors">
            <span className="material-symbols-outlined">arrow_back</span>
          </button>
          <h2 className="font-bold text-lg">Create Job Listing</h2>
        </div>
        <button 
          onClick={handleSubmit} 
          disabled={loading}
          className={`px-6 py-2 rounded-full font-bold text-sm transition-all shadow-md ${isFormValid ? 'bg-magenta text-white shadow-magenta/20 active:scale-95' : 'bg-warm-200 dark:bg-zinc-800 text-zinc-400 opacity-50'}`}
        >
          {loading ? 'Posting...' : 'Post Job'}
        </button>
      </header>

      <div className="max-w-2xl mx-auto p-4 space-y-6 mt-4">
        {status && (
          <div className={`p-4 rounded-xl text-sm font-bold border ${status.type === 'error' ? 'bg-red-50 text-red-600 border-red-100' : 'bg-green-50 text-green-600 border-green-100'}`}>
            {status.text}
          </div>
        )}

        <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-warm-200 dark:border-zinc-800 shadow-sm space-y-4">
          <h3 className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest border-b border-warm-50 dark:border-zinc-800 pb-2">1. Role Basics</h3>
          <div>
            <label className="block text-[10px] font-bold text-zinc-500 uppercase mb-1">Job Title</label>
            <input 
              placeholder="e.g. Student Barista" 
              className="w-full px-4 py-3 bg-warm-50 dark:bg-zinc-800 border border-warm-200 dark:border-zinc-700 rounded-xl outline-none focus:ring-2 focus:ring-magenta transition-all font-semibold" 
              value={formData.title} 
              onChange={e => setFormData({...formData, title: e.target.value})} 
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-bold text-zinc-500 uppercase mb-1">Location</label>
              <input 
                placeholder="Dublin 2..." 
                className="w-full px-4 py-3 bg-warm-50 dark:bg-zinc-800 border border-warm-200 dark:border-zinc-700 rounded-xl outline-none focus:ring-2 focus:ring-magenta transition-all text-sm" 
                value={formData.location} 
                onChange={e => setFormData({...formData, location: e.target.value})} 
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-zinc-500 uppercase mb-1">Apply By</label>
              <input 
                type="date" 
                className="w-full px-4 py-3 bg-warm-50 dark:bg-zinc-800 border border-warm-200 dark:border-zinc-700 rounded-xl outline-none focus:ring-2 focus:ring-magenta transition-all text-sm" 
                value={formData.deadline} 
                onChange={e => setFormData({...formData, deadline: e.target.value})} 
              />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-warm-200 dark:border-zinc-800 shadow-sm space-y-4">
          <div className="flex justify-between items-center border-b border-warm-50 dark:border-zinc-800 pb-2">
            <h3 className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">2. Description</h3>
            <button 
              onClick={handleAI}
              disabled={loading}
              className="flex items-center gap-1 text-[10px] font-bold text-magenta bg-magenta/5 px-3 py-1 rounded-full border border-magenta/10 hover:bg-magenta/10 transition-colors disabled:opacity-50"
            >
              <span className="material-symbols-outlined text-xs">auto_awesome</span>
              Draft with AI
            </button>
          </div>
          <textarea 
            rows={5}
            placeholder="Tell students about the role..."
            className="w-full p-4 bg-warm-50 dark:bg-zinc-800 border border-warm-200 dark:border-zinc-700 rounded-2xl outline-none focus:ring-2 focus:ring-magenta text-sm transition-all"
            value={formData.description}
            onChange={e => setFormData({...formData, description: e.target.value})}
          ></textarea>
        </div>

        <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-warm-200 dark:border-zinc-800 shadow-sm space-y-4">
          <h3 className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest border-b border-warm-50 dark:border-zinc-800 pb-2">3. Compensation</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-bold text-zinc-500 uppercase mb-1">Min Pay (€/hr)</label>
              <input 
                type="number" step="0.5" 
                className="w-full px-4 py-3 bg-warm-50 dark:bg-zinc-800 border border-warm-200 dark:border-zinc-700 rounded-xl outline-none focus:ring-2 focus:ring-magenta transition-all text-sm font-bold" 
                value={formData.salaryMin} 
                onChange={e => setFormData({...formData, salaryMin: e.target.value})} 
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-zinc-500 uppercase mb-1">Max Pay (€/hr)</label>
              <input 
                type="number" step="0.5" 
                className="w-full px-4 py-3 bg-warm-50 dark:bg-zinc-800 border border-warm-200 dark:border-zinc-700 rounded-xl outline-none focus:ring-2 focus:ring-magenta transition-all text-sm font-bold" 
                value={formData.salaryMax} 
                onChange={e => setFormData({...formData, salaryMax: e.target.value})} 
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [mode, setMode] = useState<UserMode>(UserMode.STUDENT);
  const [screen, setScreen] = useState<Screen>('feed');
  const [darkMode, setDarkMode] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);
  const [jobs, setJobs] = useState<JobListing[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  
  useEffect(() => {
    const savedUser = localStorage.getItem('ptj:user');
    if (savedUser) {
      const parsed = JSON.parse(savedUser);
      setUser(parsed);
      setMode(parsed.mode);
      setScreen(parsed.mode === UserMode.EMPLOYER ? 'dashboard' : 'feed');
    }

    const savedJobs = localStorage.getItem('ptj:jobs');
    if (savedJobs) {
      setJobs(JSON.parse(savedJobs));
    }

    const savedMsgs = localStorage.getItem('ptj:messages');
    if (savedMsgs) {
      setMessages(JSON.parse(savedMsgs));
    }

    if (window.matchMedia('(prefers-color-scheme: dark)').matches) setDarkMode(true);
  }, []);

  useEffect(() => {
    localStorage.setItem('ptj:jobs', JSON.stringify(jobs));
  }, [jobs]);

  useEffect(() => {
    localStorage.setItem('ptj:messages', JSON.stringify(messages));
  }, [messages]);

  useEffect(() => {
    if (darkMode) document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
  }, [darkMode]);

  // Ensure user is on a valid screen for their role
  useEffect(() => {
    if (user) {
      if (user.mode === UserMode.STUDENT && ['dashboard', 'inbox', 'create-job'].includes(screen)) {
        setScreen('feed');
      } else if (user.mode === UserMode.EMPLOYER && ['feed', 'profile', 'tracker'].includes(screen)) {
        setScreen('dashboard');
      }
    }
  }, [user, screen]);

  const handleLoginSuccess = (userData: User) => {
    setUser(userData);
    setMode(userData.mode);
    setScreen(userData.mode === UserMode.EMPLOYER ? 'dashboard' : 'feed');
    localStorage.setItem('ptj:user', JSON.stringify(userData));
    setShowAuthModal(false);
  };

  const handlePostJob = (newJobData: Partial<JobListing>) => {
    const newJob: JobListing = {
      ...newJobData,
      id: Math.random().toString(36).substr(2, 9),
      logo: `https://picsum.photos/seed/${Math.random()}/200`,
    } as JobListing;
    
    setJobs(prev => [newJob, ...prev]);
    setScreen('dashboard');
  };

  const handleSendMessage = (text: string) => {
    if (!user || !selectedJobId) return;
    const newMessage: Message = {
      id: Math.random().toString(36).substr(2, 9),
      jobId: selectedJobId,
      studentId: user.studentId || 'anon',
      studentName: user.firstName || 'Anonymous Student',
      text,
      timestamp: new Date().toLocaleString(),
      isRead: false
    };
    setMessages(prev => [newMessage, ...prev]);
  };

  const renderContent = () => {
    // Guest User Content
    if (!user) {
      if (mode === UserMode.STUDENT) return <JobFeed jobs={jobs} onJobClick={(id) => setSelectedJobId(id)} />;
      // If guest toggles to employer mode, show a dashboard preview or hire CTA
      return (
        <div className="py-20 text-center space-y-4 animate-in fade-in">
          <div className="w-20 h-20 bg-magenta/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <span className="material-symbols-outlined text-4xl text-magenta">campaign</span>
          </div>
          <h2 className="text-2xl font-bold">Post a student job in seconds.</h2>
          <p className="text-zinc-500 max-w-sm mx-auto">Access the best Irish student talent for your local business or campus project.</p>
          <button onClick={() => setShowAuthModal(true)} className="bg-magenta text-white px-8 py-3 rounded-xl font-bold shadow-lg shadow-magenta/20 active:scale-95 transition-all">
            Join as Employer
          </button>
        </div>
      );
    }

    // Role-Based Screen Rendering
    if (user.mode === UserMode.STUDENT) {
      switch(screen) {
        case 'feed': return <JobFeed jobs={jobs} onJobClick={(id) => setSelectedJobId(id)} />;
        case 'profile': return <ProfilePage user={user} />;
        case 'tracker': return <TrackerPage />;
        default: return <JobFeed jobs={jobs} onJobClick={(id) => setSelectedJobId(id)} />;
      }
    } else {
      switch(screen) {
        case 'dashboard': return <EmployerDashboard jobs={jobs.filter(j => j.company === user?.firstName)} onAddListing={() => setScreen('create-job')} />;
        case 'inbox': return <InboxPage messages={messages} jobs={jobs} />;
        case 'create-job': return <CreateJobPage companyName={user?.firstName || 'Company'} onCancel={() => setScreen('dashboard')} onSubmit={handlePostJob} />;
        default: return <EmployerDashboard jobs={jobs.filter(j => j.company === user?.firstName)} onAddListing={() => setScreen('create-job')} />;
      }
    }
  };

  const selectedJob = jobs.find(j => j.id === selectedJobId);

  return (
    <Layout 
      user={user} 
      activeMode={mode} 
      onModeSwitch={(m) => { setMode(m); if (!user) setScreen(m === UserMode.STUDENT ? 'feed' : 'dashboard'); }} 
      onLogout={() => { setUser(null); setScreen('feed'); localStorage.removeItem('ptj:user'); }}
      darkMode={darkMode}
      toggleDarkMode={() => setDarkMode(!darkMode)}
      onAuthClick={() => setShowAuthModal(true)}
      currentScreen={screen}
      setScreen={setScreen}
    >
      {renderContent()}
      {showAuthModal && <AuthModal onClose={() => setShowAuthModal(false)} onSuccess={handleLoginSuccess} />}
      {selectedJob && (
        <JobDetails 
          job={selectedJob} 
          onClose={() => setSelectedJobId(null)} 
          onMessage={handleSendMessage}
          canMessage={!!user && user.mode === UserMode.STUDENT}
        />
      )}
    </Layout>
  );
};

export default App;
