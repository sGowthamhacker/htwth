import React, { useState, useEffect } from 'react';
import { buildResumeHTML } from '../src/services/resumeTemplates';
import { ResumeData } from '../src/services/templates/types';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Download, X } from 'lucide-react';
// @ts-ignore
import html2pdf from 'html2pdf.js';

const TEMPLATES = [
  'swiss', 'federal', 'crisp', 'neat', 'pure', 'compact', 'mono', 'classic', 'minimal-line', 'notepad',
  'obsidian', 'aurora', 'neon', 'blush', 'metro', 'slate', 'horizon', 'ivory', 'grid', 'stark'
];

const MOCK_DATA: ResumeData = {
  template: 'swiss',
  accent: '#c8392b',
  font: 'Inter',
  hiddenSections: [],
  sectionOrder: ['summary', 'experience', 'education', 'skills', 'projects', 'awards', 'languages'],
  formData: {
    personal: {
      firstName: 'Jane',
      lastName: 'Doe',
      email: 'jane.doe@example.com',
      phone: '+1 (555) 123-4567',
      location: 'San Francisco, CA',
      website: 'janedoe.com',
      title: 'Senior Product Designer',
      summary: 'Award-winning product designer with 8+ years of experience creating intuitive, user-centered digital experiences for global brands. Proven track record of leading design teams and delivering products that drive engagement and revenue growth.',
    },
    experience: [
      {
        company: 'Tech Innovators Inc.',
        position: 'Lead Product Designer',
        location: 'San Francisco, CA',
        startDate: 'Jan 2020',
        endDate: 'Present',
        current: true,
        description: 'Spearheaded the redesign of the core SaaS platform, resulting in a 40% increase in user retention.\nManaged a team of 5 designers, establishing a unified design system.\nCollaborated closely with engineering and product teams to ensure seamless implementation.',
      },
      {
        company: 'Creative Solutions Agency',
        position: 'Senior UX/UI Designer',
        location: 'New York, NY',
        startDate: 'Mar 2016',
        endDate: 'Dec 2019',
        current: false,
        description: 'Designed end-to-end experiences for Fortune 500 clients across various industries.\nConducted extensive user research and usability testing to inform design decisions.\nMentored junior designers and facilitated design thinking workshops.',
      }
    ],
    education: [
      {
        school: 'Rhode Island School of Design',
        degree: 'BFA',
        field: 'Graphic Design',
        location: 'Providence, RI',
        startDate: 'Sep 2012',
        endDate: 'May 2016',
      }
    ],
    skills: [
      { name: 'UI/UX Design' },
      { name: 'Figma' },
      { name: 'Prototyping' },
      { name: 'User Research' },
      { name: 'Design Systems' },
      { name: 'HTML/CSS' },
      { name: 'Agile Methodology' }
    ],
    projects: [],
    awards: [],
    languages: []
  }
};

const AccordionSection: React.FC<{ title: string, isOpen: boolean, onToggle: () => void, children: React.ReactNode }> = ({ title, isOpen, onToggle, children }) => (
  <div className="border border-slate-200 dark:border-slate-700 rounded-lg mb-4 overflow-hidden bg-white dark:bg-slate-800 shadow-sm">
    <button 
      type="button"
      onClick={onToggle}
      className="w-full flex justify-between items-center p-4 bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
    >
      <h3 className="font-semibold text-slate-800 dark:text-slate-200">{title}</h3>
      <motion.div
        animate={{ rotate: isOpen ? 180 : 0 }}
        transition={{ duration: 0.2 }}
      >
        <ChevronDown className="w-5 h-5 text-slate-500" />
      </motion.div>
    </button>
    <AnimatePresence initial={false}>
      {isOpen && (
        <motion.div
          key="content"
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="overflow-hidden"
        >
          <div className="p-4 border-t border-slate-200 dark:border-slate-700 space-y-4">
            {children}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  </div>
);

const BuilderForm: React.FC<{ resumeData: ResumeData, setResumeData: React.Dispatch<React.SetStateAction<ResumeData>> }> = ({ resumeData, setResumeData }) => {
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({ personal: true, experience: false, education: false, skills: false, projects: false, awards: false, languages: false });

  const toggleSection = (section: string) => {
    setOpenSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const updatePersonal = (field: string, value: string) => {
    setResumeData(prev => ({
      ...prev,
      formData: {
        ...prev.formData,
        personal: { ...prev.formData.personal, [field]: value }
      }
    }));
  };

  const updateArray = (section: 'experience' | 'education' | 'skills' | 'projects' | 'awards' | 'languages', index: number, field: string, value: any) => {
    setResumeData(prev => {
      const newArray = [...prev.formData[section]];
      newArray[index] = { ...newArray[index], [field]: value };
      return {
        ...prev,
        formData: { ...prev.formData, [section]: newArray }
      };
    });
  };

  const addArrayItem = (section: 'experience' | 'education' | 'skills' | 'projects' | 'awards' | 'languages', defaultItem: any) => {
    setResumeData(prev => ({
      ...prev,
      formData: { ...prev.formData, [section]: [...prev.formData[section], defaultItem] }
    }));
  };

  const removeArrayItem = (section: 'experience' | 'education' | 'skills' | 'projects' | 'awards' | 'languages', index: number) => {
    setResumeData(prev => {
      const newArray = [...prev.formData[section]];
      newArray.splice(index, 1);
      return {
        ...prev,
        formData: { ...prev.formData, [section]: newArray }
      };
    });
  };

  return (
    <div className="max-w-2xl mx-auto pb-20">
      <AccordionSection title="Personal Information" isOpen={openSections['personal']} onToggle={() => toggleSection('personal')}>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">First Name</label>
            <input type="text" value={resumeData.formData.personal.firstName} onChange={e => updatePersonal('firstName', e.target.value)} className="w-full p-2 border border-slate-300 dark:border-slate-600 rounded bg-transparent dark:text-white" />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Last Name</label>
            <input type="text" value={resumeData.formData.personal.lastName} onChange={e => updatePersonal('lastName', e.target.value)} className="w-full p-2 border border-slate-300 dark:border-slate-600 rounded bg-transparent dark:text-white" />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Email</label>
            <input type="email" value={resumeData.formData.personal.email} onChange={e => updatePersonal('email', e.target.value)} className="w-full p-2 border border-slate-300 dark:border-slate-600 rounded bg-transparent dark:text-white" />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Phone</label>
            <input type="text" value={resumeData.formData.personal.phone} onChange={e => updatePersonal('phone', e.target.value)} className="w-full p-2 border border-slate-300 dark:border-slate-600 rounded bg-transparent dark:text-white" />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Location</label>
            <input type="text" value={resumeData.formData.personal.location || ''} onChange={e => updatePersonal('location', e.target.value)} className="w-full p-2 border border-slate-300 dark:border-slate-600 rounded bg-transparent dark:text-white" />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Website / Portfolio</label>
            <input type="text" value={resumeData.formData.personal.website || ''} onChange={e => updatePersonal('website', e.target.value)} className="w-full p-2 border border-slate-300 dark:border-slate-600 rounded bg-transparent dark:text-white" />
          </div>
          <div className="col-span-2">
            <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Professional Title</label>
            <input type="text" value={resumeData.formData.personal.title} onChange={e => updatePersonal('title', e.target.value)} className="w-full p-2 border border-slate-300 dark:border-slate-600 rounded bg-transparent dark:text-white" />
          </div>
          <div className="col-span-2">
            <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Professional Summary</label>
            <textarea value={resumeData.formData.personal.summary} onChange={e => updatePersonal('summary', e.target.value)} rows={4} className="w-full p-2 border border-slate-300 dark:border-slate-600 rounded bg-transparent dark:text-white" />
          </div>
        </div>
      </AccordionSection>

      <AccordionSection title="Experience" isOpen={openSections['experience']} onToggle={() => toggleSection('experience')}>
        {resumeData.formData.experience.map((exp, index) => (
          <div key={index} className="p-4 border border-slate-200 dark:border-slate-700 rounded mb-4 relative">
            <button type="button" onClick={() => removeArrayItem('experience', index)} className="absolute top-2 right-2 text-red-500 hover:text-red-700 text-sm">Remove</button>
            <div className="grid grid-cols-2 gap-4 mt-2">
              <div>
                <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Company</label>
                <input type="text" value={exp.company} onChange={e => updateArray('experience', index, 'company', e.target.value)} className="w-full p-2 border border-slate-300 dark:border-slate-600 rounded bg-transparent dark:text-white" />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Position</label>
                <input type="text" value={exp.position} onChange={e => updateArray('experience', index, 'position', e.target.value)} className="w-full p-2 border border-slate-300 dark:border-slate-600 rounded bg-transparent dark:text-white" />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Location</label>
                <input type="text" value={exp.location || ''} onChange={e => updateArray('experience', index, 'location', e.target.value)} className="w-full p-2 border border-slate-300 dark:border-slate-600 rounded bg-transparent dark:text-white" />
              </div>
              <div className="flex items-end pb-2">
                <label className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300 cursor-pointer">
                  <input type="checkbox" checked={exp.current || false} onChange={e => updateArray('experience', index, 'current', e.target.checked)} className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500" />
                  Currently Work Here
                </label>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Start Date</label>
                <input type="text" value={exp.startDate} onChange={e => updateArray('experience', index, 'startDate', e.target.value)} className="w-full p-2 border border-slate-300 dark:border-slate-600 rounded bg-transparent dark:text-white" placeholder="e.g. Jan 2020" />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">End Date</label>
                <input type="text" value={exp.endDate} onChange={e => updateArray('experience', index, 'endDate', e.target.value)} disabled={exp.current} className="w-full p-2 border border-slate-300 dark:border-slate-600 rounded bg-transparent dark:text-white disabled:opacity-50" placeholder="e.g. Dec 2022" />
              </div>
              <div className="col-span-2">
                <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Description</label>
                <textarea value={exp.description} onChange={e => updateArray('experience', index, 'description', e.target.value)} rows={3} className="w-full p-2 border border-slate-300 dark:border-slate-600 rounded bg-transparent dark:text-white" placeholder="Use newlines for bullet points" />
              </div>
            </div>
          </div>
        ))}
        <button type="button" onClick={() => addArrayItem('experience', { company: '', position: '', location: '', startDate: '', endDate: '', current: false, description: '' })} className="w-full py-2 border-2 border-dashed border-slate-300 dark:border-slate-600 rounded text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
          + Add Experience
        </button>
      </AccordionSection>

      <AccordionSection title="Education" isOpen={openSections['education']} onToggle={() => toggleSection('education')}>
        {resumeData.formData.education.map((edu, index) => (
          <div key={index} className="p-4 border border-slate-200 dark:border-slate-700 rounded mb-4 relative">
            <button type="button" onClick={() => removeArrayItem('education', index)} className="absolute top-2 right-2 text-red-500 hover:text-red-700 text-sm">Remove</button>
            <div className="grid grid-cols-2 gap-4 mt-2">
              <div>
                <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">School</label>
                <input type="text" value={edu.school} onChange={e => updateArray('education', index, 'school', e.target.value)} className="w-full p-2 border border-slate-300 dark:border-slate-600 rounded bg-transparent dark:text-white" />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Degree</label>
                <input type="text" value={edu.degree} onChange={e => updateArray('education', index, 'degree', e.target.value)} className="w-full p-2 border border-slate-300 dark:border-slate-600 rounded bg-transparent dark:text-white" />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Field of Study</label>
                <input type="text" value={edu.field || ''} onChange={e => updateArray('education', index, 'field', e.target.value)} className="w-full p-2 border border-slate-300 dark:border-slate-600 rounded bg-transparent dark:text-white" />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Location</label>
                <input type="text" value={edu.location || ''} onChange={e => updateArray('education', index, 'location', e.target.value)} className="w-full p-2 border border-slate-300 dark:border-slate-600 rounded bg-transparent dark:text-white" />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Start Date</label>
                <input type="text" value={edu.startDate} onChange={e => updateArray('education', index, 'startDate', e.target.value)} className="w-full p-2 border border-slate-300 dark:border-slate-600 rounded bg-transparent dark:text-white" />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">End Date</label>
                <input type="text" value={edu.endDate} onChange={e => updateArray('education', index, 'endDate', e.target.value)} className="w-full p-2 border border-slate-300 dark:border-slate-600 rounded bg-transparent dark:text-white" />
              </div>
            </div>
          </div>
        ))}
        <button type="button" onClick={() => addArrayItem('education', { school: '', degree: '', field: '', location: '', startDate: '', endDate: '' })} className="w-full py-2 border-2 border-dashed border-slate-300 dark:border-slate-600 rounded text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
          + Add Education
        </button>
      </AccordionSection>

      <AccordionSection title="Skills" isOpen={openSections['skills']} onToggle={() => toggleSection('skills')}>
        <div className="flex flex-wrap gap-2 mb-4">
          {resumeData.formData.skills.map((skill, index) => (
            <div key={index} className="flex items-center gap-2 bg-slate-100 dark:bg-slate-700 px-3 py-1 rounded-full">
              <input 
                type="text" 
                value={skill.name} 
                onChange={e => updateArray('skills', index, 'name', e.target.value)} 
                className="bg-transparent border-none outline-none text-sm w-24 dark:text-white"
              />
              <button type="button" onClick={() => removeArrayItem('skills', index)} className="text-slate-400 hover:text-red-500">×</button>
            </div>
          ))}
        </div>
        <button type="button" onClick={() => addArrayItem('skills', { name: 'New Skill' })} className="w-full py-2 border-2 border-dashed border-slate-300 dark:border-slate-600 rounded text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
          + Add Skill
        </button>
      </AccordionSection>

      <AccordionSection title="Projects" isOpen={openSections['projects']} onToggle={() => toggleSection('projects')}>
        {resumeData.formData.projects.map((proj, index) => (
          <div key={index} className="p-4 border border-slate-200 dark:border-slate-700 rounded mb-4 relative">
            <button type="button" onClick={() => removeArrayItem('projects', index)} className="absolute top-2 right-2 text-red-500 hover:text-red-700 text-sm">Remove</button>
            <div className="grid grid-cols-2 gap-4 mt-2">
              <div>
                <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Project Name</label>
                <input type="text" value={proj.name || ''} onChange={e => updateArray('projects', index, 'name', e.target.value)} className="w-full p-2 border border-slate-300 dark:border-slate-600 rounded bg-transparent dark:text-white" />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Role / Subtitle</label>
                <input type="text" value={proj.role || ''} onChange={e => updateArray('projects', index, 'role', e.target.value)} className="w-full p-2 border border-slate-300 dark:border-slate-600 rounded bg-transparent dark:text-white" />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Link / URL</label>
                <input type="text" value={proj.link || ''} onChange={e => updateArray('projects', index, 'link', e.target.value)} className="w-full p-2 border border-slate-300 dark:border-slate-600 rounded bg-transparent dark:text-white" />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Date</label>
                <input type="text" value={proj.date || ''} onChange={e => updateArray('projects', index, 'date', e.target.value)} className="w-full p-2 border border-slate-300 dark:border-slate-600 rounded bg-transparent dark:text-white" />
              </div>
              <div className="col-span-2">
                <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Description</label>
                <textarea value={proj.description || ''} onChange={e => updateArray('projects', index, 'description', e.target.value)} rows={3} className="w-full p-2 border border-slate-300 dark:border-slate-600 rounded bg-transparent dark:text-white" placeholder="Use newlines for bullet points" />
              </div>
            </div>
          </div>
        ))}
        <button type="button" onClick={() => addArrayItem('projects', { name: '', role: '', link: '', date: '', description: '' })} className="w-full py-2 border-2 border-dashed border-slate-300 dark:border-slate-600 rounded text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
          + Add Project
        </button>
      </AccordionSection>

      <AccordionSection title="Awards & Certifications" isOpen={openSections['awards']} onToggle={() => toggleSection('awards')}>
        {resumeData.formData.awards.map((award, index) => (
          <div key={index} className="p-4 border border-slate-200 dark:border-slate-700 rounded mb-4 relative">
            <button type="button" onClick={() => removeArrayItem('awards', index)} className="absolute top-2 right-2 text-red-500 hover:text-red-700 text-sm">Remove</button>
            <div className="grid grid-cols-2 gap-4 mt-2">
              <div>
                <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Award Name</label>
                <input type="text" value={award.name || ''} onChange={e => updateArray('awards', index, 'name', e.target.value)} className="w-full p-2 border border-slate-300 dark:border-slate-600 rounded bg-transparent dark:text-white" />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Issuer / Organization</label>
                <input type="text" value={award.issuer || ''} onChange={e => updateArray('awards', index, 'issuer', e.target.value)} className="w-full p-2 border border-slate-300 dark:border-slate-600 rounded bg-transparent dark:text-white" />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Date</label>
                <input type="text" value={award.date || ''} onChange={e => updateArray('awards', index, 'date', e.target.value)} className="w-full p-2 border border-slate-300 dark:border-slate-600 rounded bg-transparent dark:text-white" />
              </div>
            </div>
          </div>
        ))}
        <button type="button" onClick={() => addArrayItem('awards', { name: '', issuer: '', date: '' })} className="w-full py-2 border-2 border-dashed border-slate-300 dark:border-slate-600 rounded text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
          + Add Award
        </button>
      </AccordionSection>

      <AccordionSection title="Languages" isOpen={openSections['languages']} onToggle={() => toggleSection('languages')}>
        <div className="flex flex-wrap gap-2 mb-4">
          {resumeData.formData.languages.map((lang, index) => (
            <div key={index} className="flex items-center gap-2 bg-slate-100 dark:bg-slate-700 px-3 py-1 rounded-full">
              <input 
                type="text" 
                value={lang.name || ''} 
                onChange={e => updateArray('languages', index, 'name', e.target.value)} 
                placeholder="Language"
                className="bg-transparent border-none outline-none text-sm w-24 dark:text-white"
              />
              <span className="text-slate-400">-</span>
              <input 
                type="text" 
                value={lang.level || ''} 
                onChange={e => updateArray('languages', index, 'level', e.target.value)} 
                placeholder="Level"
                className="bg-transparent border-none outline-none text-sm w-20 dark:text-white"
              />
              <button type="button" onClick={() => removeArrayItem('languages', index)} className="text-slate-400 hover:text-red-500">×</button>
            </div>
          ))}
        </div>
        <button type="button" onClick={() => addArrayItem('languages', { name: '', level: '' })} className="w-full py-2 border-2 border-dashed border-slate-300 dark:border-slate-600 rounded text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
          + Add Language
        </button>
      </AccordionSection>
    </div>
  );
};

const TemplateThumbnail: React.FC<{ template: string, accentColor: string, onClick: () => void, isActive: boolean }> = ({ template, accentColor, onClick, isActive }) => {
  const [html, setHtml] = useState('');
  const containerRef = React.useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0.25);
  
  useEffect(() => {
    const data = { ...MOCK_DATA, template, accent: accentColor };
    setHtml(buildResumeHTML(data));
  }, [template, accentColor]);

  useEffect(() => {
    const updateScale = () => {
      if (containerRef.current) {
        const width = containerRef.current.offsetWidth;
        // 210mm is approx 794px at 96dpi
        setScale(width / 794);
      }
    };
    
    updateScale();
    window.addEventListener('resize', updateScale);
    return () => window.removeEventListener('resize', updateScale);
  }, []);

  return (
    <motion.div 
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={`cursor-pointer flex flex-col items-center gap-3 p-3 rounded-xl transition-all ${isActive ? 'bg-indigo-50 dark:bg-indigo-900/20 ring-2 ring-indigo-500' : 'hover:bg-slate-100 dark:hover:bg-slate-800'}`}
    >
      <div ref={containerRef} className="relative w-full aspect-[210/297] bg-white shadow-sm rounded-md overflow-hidden border border-slate-200 dark:border-slate-700">
        <div className="absolute top-0 left-0 origin-top-left" style={{ width: '794px', height: '1123px', transform: `scale(${scale})` }}>
          <iframe
            title={`Preview ${template}`}
            srcDoc={html}
            className="w-full h-full border-0 pointer-events-none"
            tabIndex={-1}
          />
        </div>
      </div>
      <span className={`text-sm font-medium capitalize ${isActive ? 'text-indigo-700 dark:text-indigo-400' : 'text-slate-700 dark:text-slate-300'}`}>
        {template}
      </span>
    </motion.div>
  );
};

const PreviewContainer: React.FC<{ htmlContent: string }> = ({ htmlContent }) => {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);

  useEffect(() => {
    const updateScale = () => {
      if (containerRef.current) {
        const width = containerRef.current.offsetWidth;
        // 210mm is approx 794px at 96dpi
        if (width < 794) {
          setScale(width / 794);
        } else {
          setScale(1);
        }
      }
    };
    
    updateScale();
    window.addEventListener('resize', updateScale);
    return () => window.removeEventListener('resize', updateScale);
  }, []);

  return (
    <div className="flex justify-center items-start min-h-full w-full">
      <div 
        ref={containerRef} 
        className="w-full max-w-[794px] bg-white shadow-2xl rounded-sm overflow-hidden relative" 
        style={{ height: `${1123 * scale}px` }}
      >
        <div className="absolute top-0 left-0 origin-top-left" style={{ width: '794px', height: '1123px', transform: `scale(${scale})` }}>
          <iframe
            id="preview-iframe"
            title="Resume Preview"
            srcDoc={htmlContent}
            className="w-full h-full border-0"
          />
        </div>
      </div>
    </div>
  );
};

const ResumeAIPage: React.FC = () => {
  const [resumeData, setResumeData] = useState<ResumeData>(MOCK_DATA);
  const [activeTemplate, setActiveTemplate] = useState<string>('swiss');
  const [htmlContent, setHtmlContent] = useState<string>('');
  const [accentColor, setAccentColor] = useState<string>('#c8392b');
  const [viewMode, setViewMode] = useState<'gallery' | 'preview' | 'builder'>('builder');
  const [showExportModal, setShowExportModal] = useState(false);

  useEffect(() => {
    const data = { ...resumeData, template: activeTemplate, accent: accentColor };
    const html = buildResumeHTML(data);
    setHtmlContent(html);
  }, [activeTemplate, accentColor, resumeData]);

  const handleDownload = (align: boolean, shouldPrint: boolean) => {
    setResumeData(prev => ({ ...prev, autoAlign: align }));
    setShowExportModal(false);
    
    if (shouldPrint) {
      // Generate the latest HTML with the new alignment setting
      const dataToPrint = { ...resumeData, template: activeTemplate, accent: accentColor, autoAlign: align };
      const htmlToPrint = buildResumeHTML(dataToPrint);

      // Remove any existing print iframe
      const existingIframe = document.getElementById('hidden-print-iframe');
      if (existingIframe) {
        document.body.removeChild(existingIframe);
      }

      // Create a fresh hidden iframe for rendering
      const printIframe = document.createElement('iframe');
      printIframe.id = 'hidden-print-iframe';
      printIframe.style.position = 'fixed';
      printIframe.style.right = '0';
      printIframe.style.bottom = '0';
      printIframe.style.width = '210mm'; // A4 width
      printIframe.style.height = '297mm'; // A4 height
      printIframe.style.zIndex = '-1000';
      printIframe.style.border = 'none';
      printIframe.style.opacity = '0';
      printIframe.style.pointerEvents = 'none';
      document.body.appendChild(printIframe);
      
      const doc = printIframe.contentWindow?.document;
      if (doc) {
        doc.open();
        doc.write(htmlToPrint);
        doc.close();
        
        // Wait for fonts and styles to load before generating PDF
        setTimeout(() => {
          if (printIframe.contentWindow) {
            const element = printIframe.contentWindow.document.querySelector('.resume-page') as HTMLElement;
            if (element) {
              const opt = {
                margin:       0,
                filename:     `${resumeData.formData.personal.firstName || 'Resume'}_${resumeData.formData.personal.lastName || ''}.pdf`,
                image:        { type: 'jpeg' as const, quality: 0.98 },
                html2canvas:  { scale: 2, useCORS: true, windowWidth: 800 },
                jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' as const }
              };

              html2pdf().set(opt).from(element).save().then(() => {
                document.body.removeChild(printIframe);
              });
            } else {
               document.body.removeChild(printIframe);
            }
          }
        }, 1500); // Give enough time for fonts to load
      }
    } else {
      // Switch to preview mode so they can see the alignment
      setViewMode('preview');
    }
  };

  return (
    <div className="h-full flex flex-col bg-slate-50 dark:bg-slate-900 overflow-hidden">
      {/* Header */}
      <div className="flex-none bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 p-4 md:px-8 flex items-center justify-between z-20">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Resume AI</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">Choose a template to get started</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-900 p-1.5 rounded-lg">
            <button 
              onClick={() => setViewMode('builder')}
              className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${viewMode === 'builder' ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'}`}
            >
              Builder
            </button>
            <button 
              onClick={() => setViewMode('gallery')}
              className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${viewMode === 'gallery' ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'}`}
            >
              Gallery
            </button>
            <button 
              onClick={() => setViewMode('preview')}
              className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${viewMode === 'preview' ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'}`}
            >
              Preview
            </button>
          </div>
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Accent:</label>
            <input 
              type="color" 
              value={accentColor} 
              onChange={(e) => setAccentColor(e.target.value)}
              className="h-8 w-8 rounded cursor-pointer border-0 p-0"
            />
          </div>
          <button 
            onClick={() => setShowExportModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-md transition-colors shadow-sm ml-2"
          >
            <Download className="w-4 h-4" />
            Export PDF
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-hidden p-4 md:p-8">
        {viewMode === 'builder' ? (
          <div className="flex flex-col lg:flex-row h-full gap-6">
            <div className="w-full lg:w-1/2 h-full overflow-y-auto pr-2">
              <BuilderForm resumeData={resumeData} setResumeData={setResumeData} />
            </div>
            <div className="w-full lg:w-1/2 h-full hidden lg:block overflow-y-auto bg-slate-100 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 p-4">
              <PreviewContainer htmlContent={htmlContent} />
            </div>
          </div>
        ) : viewMode === 'gallery' ? (
          <div className="h-full overflow-y-auto pb-20">
            <div className="max-w-7xl mx-auto">
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
                {TEMPLATES.map(template => (
                  <TemplateThumbnail 
                    key={template}
                    template={template}
                    accentColor={accentColor}
                    isActive={activeTemplate === template}
                    onClick={() => {
                      setActiveTemplate(template);
                      setViewMode('preview');
                    }}
                  />
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="h-full overflow-y-auto pb-20">
            <PreviewContainer htmlContent={htmlContent} />
          </div>
        )}
      </div>

      {/* Export Modal */}
      <AnimatePresence>
        {showExportModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl p-6 max-w-md w-full mx-4"
            >
              <div className="flex justify-between items-start mb-4">
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">Final Alignment</h2>
                <button onClick={() => setShowExportModal(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <p className="text-slate-600 dark:text-slate-300 mb-6">
                We noticed there might be some empty space on your resume. Would you like us to automatically rearrange and distribute the spacing for a cleaner layout before downloading?
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-end">
                <button 
                  onClick={() => handleDownload(resumeData.autoAlign || false, true)}
                  className="px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 rounded-md transition-colors"
                >
                  Download Current Layout
                </button>
                {!resumeData.autoAlign && (
                  <button 
                    onClick={() => handleDownload(true, false)}
                    className="px-4 py-2 text-sm font-medium text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/30 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 rounded-md transition-colors"
                  >
                    Auto-Align & Preview
                  </button>
                )}
                <button 
                  onClick={() => handleDownload(true, true)}
                  className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-md transition-colors shadow-sm"
                >
                  Auto-Align & Download
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ResumeAIPage;
