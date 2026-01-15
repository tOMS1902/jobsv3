
import React from 'react';
import { JobListing } from '../types';

interface JobCardProps {
  job: JobListing;
  onClick: () => void;
}

const JobCard: React.FC<JobCardProps> = ({ job, onClick }) => {
  return (
    <div 
      onClick={onClick}
      className="group bg-white dark:bg-zinc-900 border border-warm-200 dark:border-zinc-800 rounded-2xl p-4 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all cursor-pointer overflow-hidden relative"
    >
      <div className="flex gap-4">
        <div className="w-16 h-16 rounded-xl overflow-hidden bg-warm-100 dark:bg-zinc-800 flex-shrink-0">
          <img src={job.logo} alt={job.company} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex justify-between items-start">
            <h3 className="text-lg font-bold truncate pr-6 group-hover:text-magenta transition-colors">{job.title}</h3>
            <span className="text-magenta font-bold whitespace-nowrap text-sm">€{job.salaryMin}-{job.salaryMax}/hr</span>
          </div>
          <p className="text-zinc-500 dark:text-zinc-400 text-sm font-medium">{job.company}</p>
          <div className="flex items-center gap-1 text-zinc-400 dark:text-zinc-500 text-xs mt-1">
            <span className="material-symbols-outlined text-sm">location_on</span>
            {job.location}
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 mt-4">
        {job.tags.map(tag => (
          <span key={tag} className="px-3 py-1 bg-magenta/5 dark:bg-magenta/10 text-magenta text-[10px] font-bold uppercase tracking-wider rounded-full border border-magenta/10">
            {tag}
          </span>
        ))}
      </div>

      <div className="mt-4 pt-4 border-t border-warm-100 dark:border-zinc-800 flex items-center justify-between">
        <span className="text-[10px] text-zinc-400 font-medium">Posted {job.postedAt}</span>
        <button className="text-magenta text-xs font-bold flex items-center gap-1 group/btn">
          View Details
          <span className="material-symbols-outlined text-xs group-hover/btn:translate-x-1 transition-transform">arrow_forward</span>
        </button>
      </div>
    </div>
  );
};

export default JobCard;
