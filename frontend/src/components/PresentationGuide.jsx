import React from 'react';
import { CheckCircle2, ChevronRight, Play, Sparkles, X, ArrowRight } from 'lucide-react';

const STEPS = [
  {
    step: 1,
    title: 'Dashboard: Live MySQL Statistics',
    tab: 'dashboard',
    desc: 'Point out the real-time card counters for Authors, Papers, Reviewers, and Reviews fetched via SQL COUNT() queries.',
    say: 'Examiner note: "All statistics on this dashboard are dynamically calculated using real-time COUNT() queries against MySQL conferencedb."'
  },
  {
    step: 2,
    title: 'Authors: View Existing Records',
    tab: 'authors',
    desc: 'Navigate to Authors table to view rows stored in the MySQL AUTHOR table (e.g., Rahul Sharma, Priya Reddy, Arjun Kumar).',
    say: 'Examiner note: "Here are the existing records retrieved via SELECT * FROM author joined with paper counts."'
  },
  {
    step: 3,
    title: 'Add Author: Live INSERT Operation',
    tab: 'authors',
    desc: 'Click "+ Add Author" and enter Name: Test Author, Email: test@example.com, Affiliation: Woxsen University.',
    say: 'Examiner note: "Now let us insert a new author record through the UI, sending a POST request to Express which executes a parameterized INSERT query."'
  },
  {
    step: 4,
    title: 'Verify INSERT in UI & Database',
    tab: 'authors',
    desc: 'Verify that "Test Author" immediately appears in the Authors table with toast confirmation.',
    say: 'Examiner note: "Notice the new author appears instantly in the table, confirmed by MySQL."'
  },
  {
    step: 5,
    title: 'Live DELETE Operation',
    tab: 'authors',
    desc: 'Click Delete on "Test Author". Notice the confirmation modal safeguards against accidental deletion.',
    say: 'Examiner note: "Now we test parameterized DELETE execution on the newly created record."'
  },
  {
    step: 6,
    title: 'Refresh & Verify Permanent Deletion',
    tab: 'authors',
    desc: 'Confirm the record is removed and click "Refresh" to prove persistence in MySQL.',
    say: 'Examiner note: "Refreshing the page confirms the record was permanently deleted from MySQL."'
  },
  {
    step: 7,
    title: 'Papers: M:N Relationships & Multi-Table JOINs',
    tab: 'papers',
    desc: 'View papers showing resolved foreign keys: Paper Title, Conference Name, and Co-Authors via PAPER_AUTHOR junction table.',
    say: 'Examiner note: "This view demonstrates 3-way relational joins resolving the M:N relationship between Papers and Authors."'
  },
  {
    step: 8,
    title: 'SQL Query Console: Master JOIN Query',
    tab: 'query-console',
    desc: 'Open the SQL Query Console and load the Master Presentation Query or Preset queries.',
    say: 'Examiner note: "This query console runs safe SELECT statements directly against MySQL and returns the exact relational dataset."'
  },
  {
    step: 9,
    title: 'Show Result Set & Execution Metrics',
    tab: 'query-console',
    desc: 'Execute query and review row count, execution time in milliseconds, and structured table data.',
    say: 'Examiner note: "The query successfully executes in milliseconds, displaying the live joined records from our normalized schema."'
  }
];

export default function PresentationGuide({ isOpen, onClose, currentStep, setCurrentStep, setActiveTab }) {
  if (!isOpen) return null;

  const current = STEPS[currentStep - 1] || STEPS[0];

  const handleNext = () => {
    if (currentStep < STEPS.length) {
      const nextStep = currentStep + 1;
      setCurrentStep(nextStep);
      setActiveTab(STEPS[nextStep - 1].tab);
    }
  };

  const handlePrev = () => {
    if (currentStep > 1) {
      const prevStep = currentStep - 1;
      setCurrentStep(prevStep);
      setActiveTab(STEPS[prevStep - 1].tab);
    }
  };

  const handleJump = (stepNum) => {
    setCurrentStep(stepNum);
    setActiveTab(STEPS[stepNum - 1].tab);
  };

  return (
    <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white border-b border-indigo-700/50 shadow-xl px-6 py-4 animate-fadeIn">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between pb-3 border-b border-white/10">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 bg-blue-500/20 border border-blue-400/30 rounded-lg text-blue-300">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-blue-300">College Viva Mode</span>
              <h3 className="text-sm font-bold text-white">5-Minute Presentation Demonstration Walkthrough</h3>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Current Step Spotlight */}
        <div className="mt-3 grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
          <div className="md:col-span-8 bg-white/5 border border-white/10 rounded-xl p-3.5 backdrop-blur-sm">
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2 py-0.5 rounded-full bg-blue-500 text-white font-mono text-xs font-bold">
                Step {current.step} of 9
              </span>
              <h4 className="text-sm font-bold text-white">{current.title}</h4>
            </div>
            <p className="text-xs text-slate-300 mt-1 leading-relaxed">
              {current.desc}
            </p>
            <div className="mt-2 text-[11px] text-amber-200 bg-amber-500/10 border border-amber-400/20 rounded-lg p-2 font-mono">
              💡 {current.say}
            </div>
          </div>

          <div className="md:col-span-4 flex flex-col gap-2">
            <div className="flex items-center justify-between gap-2">
              <button
                onClick={handlePrev}
                disabled={currentStep === 1}
                className="flex-1 px-3 py-1.5 text-xs font-medium rounded-lg bg-white/10 hover:bg-white/20 disabled:opacity-30 disabled:pointer-events-none transition-colors"
              >
                Previous Step
              </button>
              <button
                onClick={handleNext}
                disabled={currentStep === STEPS.length}
                className="flex-1 flex items-center justify-center gap-1 px-3 py-1.5 text-xs font-semibold rounded-lg bg-blue-600 hover:bg-blue-500 active:bg-blue-700 disabled:opacity-30 disabled:pointer-events-none transition-colors shadow-sm"
              >
                <span>Next Step</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Stepper Dots / Quick Numbers */}
            <div className="flex items-center justify-between gap-1 mt-1">
              {STEPS.map((s) => (
                <button
                  key={s.step}
                  onClick={() => handleJump(s.step)}
                  className={`w-6 h-6 rounded-md text-[10px] font-bold transition-all ${
                    currentStep === s.step
                      ? 'bg-blue-500 text-white ring-2 ring-blue-300 scale-110'
                      : currentStep > s.step
                      ? 'bg-emerald-600/60 text-emerald-100 hover:bg-emerald-600'
                      : 'bg-white/10 text-slate-400 hover:bg-white/20'
                  }`}
                  title={s.title}
                >
                  {s.step}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
