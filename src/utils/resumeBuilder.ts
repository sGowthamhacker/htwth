export interface ResumeData {
  template: string;
  accent?: string;
  font?: string;
  hiddenSections?: string[];
  sectionOrder?: string[];
  formData: {
    personal: {
      name: string;
      title: string;
      email: string;
      phone: string;
      location: string;
      website?: string;
      summary?: string;
    };
    skills: string[];
    experience: Array<{
      company: string;
      role: string;
      startDate: string;
      endDate: string;
      location?: string;
      description: string[];
    }>;
    education: Array<{
      school: string;
      degree: string;
      startDate: string;
      endDate: string;
      location?: string;
    }>;
    projects: Array<{
      name: string;
      description: string;
      link?: string;
    }>;
    awards: Array<{
      name: string;
      date: string;
      issuer: string;
    }>;
    languages: Array<{
      name: string;
      level: string;
    }>;
  };
}

function getContactString(personal: any, separator: string = ' · ') {
  const parts = [];
  if (personal.email) parts.push(personal.email);
  if (personal.phone) parts.push(personal.phone);
  if (personal.location) parts.push(personal.location);
  if (personal.website) parts.push(personal.website);
  return parts.join(separator);
}

function generateSections(resume: ResumeData, renderSection: (key: string) => string) {
  const order = resume.sectionOrder || ['summary', 'experience', 'education', 'skills', 'projects', 'awards', 'languages'];
  const hidden = resume.hiddenSections || [];
  return order.filter(sec => !hidden.includes(sec)).map(sec => renderSection(sec)).join('');
}

export function buildResumeHTML(resume: ResumeData): string {
  switch(resume.template) {
    case 'swiss': return renderSwiss(resume);
    case 'federal': return renderFederal(resume);
    case 'crisp': return renderCrisp(resume);
    case 'neat': return renderNeat(resume);
    case 'pure': return renderPure(resume);
    case 'compact': return renderCompact(resume);
    case 'mono': return renderMono(resume);
    case 'classic': return renderClassic(resume);
    case 'minimal-line': return renderMinimalLine(resume);
    case 'notepad': return renderNotepad(resume);
    case 'obsidian': return renderObsidian(resume);
    case 'aurora': return renderAurora(resume);
    case 'neon': return renderNeon(resume);
    case 'blush': return renderBlush(resume);
    case 'metro': return renderMetro(resume);
    case 'slate': return renderSlate(resume);
    case 'horizon': return renderHorizon(resume);
    case 'ivory': return renderIvory(resume);
    case 'grid': return renderGrid(resume);
    case 'stark': return renderStark(resume);
    default: return renderSwiss(resume);
  }
}

// TEMPLATE 01: SWISS
function renderSwiss(resume: ResumeData): string {
  const accent = resume.accent || '#c8392b';
  const font = resume.font || 'Inter';
  const { personal, experience, education, skills } = resume.formData;
  
  const renderSection = (key: string) => {
    if (key === 'summary' && personal.summary) {
      return `<div class="section"><h2 class="section-title">SUMMARY</h2><p>${personal.summary}</p></div>`;
    }
    if (key === 'experience' && experience?.length) {
      return `<div class="section"><h2 class="section-title">EXPERIENCE</h2>
        ${experience.map(exp => `
          <div class="item">
            <div class="item-header">
              <span class="item-title"><strong>${exp.company}</strong>, ${exp.role}</span>
              <span class="item-date">${exp.startDate} - ${exp.endDate}</span>
            </div>
            <ul>${exp.description.map(d => `<li>${d}</li>`).join('')}</ul>
          </div>
        `).join('')}
      </div>`;
    }
    if (key === 'education' && education?.length) {
      return `<div class="section"><h2 class="section-title">EDUCATION</h2>
        ${education.map(edu => `
          <div class="item">
            <div class="item-header">
              <span class="item-title"><strong>${edu.school}</strong>, ${edu.degree}</span>
              <span class="item-date">${edu.startDate} - ${edu.endDate}</span>
            </div>
          </div>
        `).join('')}
      </div>`;
    }
    if (key === 'skills' && skills?.length) {
      return `<div class="section"><h2 class="section-title">SKILLS</h2><p>${skills.join(', ')}</p></div>`;
    }
    return '';
  };

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #f0f0f0; display: flex; justify-content: center; padding: 20px; }
        .resume-page {
          width: 210mm; min-height: 297mm; background: white;
          padding: 20mm; font-family: '${font}', sans-serif;
          box-shadow: 0 4px 10px rgba(0,0,0,0.1);
          color: #333;
        }
        @media print {
          body { padding: 0; background: white; }
          .resume-page { box-shadow: none; margin: 0; width: 210mm; height: 297mm; }
        }
        .header { margin-bottom: 18px; }
        .name { font-size: 28px; font-weight: 700; color: #000; }
        .title { font-size: 14px; color: #666; margin-top: 4px; }
        .contact { font-size: 11px; color: #666; margin-top: 8px; }
        .section { margin-bottom: 18px; }
        .section-title {
          font-size: 8px; text-transform: uppercase; letter-spacing: 0.2em;
          border-bottom: 1px solid #000; margin-bottom: 8px; padding-bottom: 4px;
        }
        p, li { font-size: 12.5px; line-height: 1.6; }
        ul { margin-left: 14px; margin-top: 4px; }
        li { font-size: 12px; margin-bottom: 2px; }
        .item { margin-bottom: 12px; }
        .item-header { display: flex; justify-content: space-between; align-items: baseline; }
        .item-date { font-size: 11px; color: #666; font-family: monospace; float: right; }
      </style>
    </head>
    <body>
      <div class="resume-page">
        <div class="header">
          <div class="name">${personal.name}</div>
          <div class="title">${personal.title}</div>
          <div class="contact">${getContactString(personal, ' · ')}</div>
        </div>
        ${generateSections(resume, renderSection)}
      </div>
    </body>
    </html>
  `;
}

// TEMPLATE 02: FEDERAL
function renderFederal(resume: ResumeData): string {
  const font = resume.font || 'Georgia';
  const { personal, experience, education, skills } = resume.formData;
  
  const renderSection = (key: string) => {
    if (key === 'summary' && personal.summary) {
      return `<div class="section"><h2 class="section-title">SUMMARY</h2><p>${personal.summary}</p></div>`;
    }
    if (key === 'experience' && experience?.length) {
      return `<div class="section"><h2 class="section-title">EXPERIENCE</h2>
        ${experience.map(exp => `
          <div class="item">
            <div class="item-header">
              <span class="item-title"><strong>${exp.company}</strong> - ${exp.role}</span>
              <span class="item-date">${exp.startDate} – ${exp.endDate}</span>
            </div>
            <ul>${exp.description.map(d => `<li>${d}</li>`).join('')}</ul>
          </div>
        `).join('')}
      </div>`;
    }
    if (key === 'education' && education?.length) {
      return `<div class="section"><h2 class="section-title">EDUCATION</h2>
        ${education.map(edu => `
          <div class="item">
            <div class="item-header">
              <span class="item-title"><strong>${edu.school}</strong> - ${edu.degree}</span>
              <span class="item-date">${edu.startDate} – ${edu.endDate}</span>
            </div>
          </div>
        `).join('')}
      </div>`;
    }
    if (key === 'skills' && skills?.length) {
      return `<div class="section"><h2 class="section-title">SKILLS</h2><p>${skills.join(', ')}</p></div>`;
    }
    return '';
  };

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Georgia:wght@400;700&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #f0f0f0; display: flex; justify-content: center; padding: 20px; }
        .resume-page {
          width: 210mm; min-height: 297mm; background: white;
          padding: 20mm; font-family: '${font}', serif;
          box-shadow: 0 4px 10px rgba(0,0,0,0.1);
          color: #000;
        }
        @media print {
          body { padding: 0; background: white; }
          .resume-page { box-shadow: none; margin: 0; width: 210mm; height: 297mm; }
        }
        .header { text-align: center; margin-bottom: 14px; }
        .name { font-size: 24px; font-weight: 700; }
        .title { font-size: 13px; color: #555; margin-top: 4px; }
        .contact { font-size: 11px; margin-top: 6px; }
        .section { margin-bottom: 14px; }
        .section-title {
          font-size: 11px; font-weight: 700; text-transform: uppercase;
          border-bottom: 2px solid #000; margin-bottom: 8px; padding-bottom: 2px;
        }
        p, li { font-size: 12px; line-height: 1.7; }
        ul { margin-left: 18px; margin-top: 4px; }
        .item { margin-bottom: 10px; }
        .item-header { display: flex; justify-content: space-between; align-items: baseline; }
        .item-date { float: right; }
      </style>
    </head>
    <body>
      <div class="resume-page">
        <div class="header">
          <div class="name">${personal.name}</div>
          <div class="title">${personal.title}</div>
          <div class="contact">${getContactString(personal, ' | ')}</div>
        </div>
        ${generateSections(resume, renderSection)}
      </div>
    </body>
    </html>
  `;
}

// TEMPLATE 03: CRISP
function renderCrisp(resume: ResumeData): string {
  const accent = resume.accent || '#c8392b';
  const font = resume.font || 'IBM Plex Sans';
  const { personal, experience, education, skills } = resume.formData;
  
  const renderSection = (key: string) => {
    if (key === 'summary' && personal.summary) {
      return `<div class="section"><h2 class="section-title">SUMMARY</h2><p>${personal.summary}</p></div>`;
    }
    if (key === 'experience' && experience?.length) {
      return `<div class="section"><h2 class="section-title">EXPERIENCE</h2>
        ${experience.map(exp => `
          <div class="item">
            <div class="item-header">
              <span class="item-title"><strong>${exp.company}</strong>, ${exp.role}</span>
              <span class="item-date">${exp.startDate} - ${exp.endDate}</span>
            </div>
            <ul>${exp.description.map(d => `<li>${d}</li>`).join('')}</ul>
          </div>
        `).join('')}
      </div>`;
    }
    if (key === 'education' && education?.length) {
      return `<div class="section"><h2 class="section-title">EDUCATION</h2>
        ${education.map(edu => `
          <div class="item">
            <div class="item-header">
              <span class="item-title"><strong>${edu.school}</strong>, ${edu.degree}</span>
              <span class="item-date">${edu.startDate} - ${edu.endDate}</span>
            </div>
          </div>
        `).join('')}
      </div>`;
    }
    if (key === 'skills' && skills?.length) {
      return `<div class="section"><h2 class="section-title">SKILLS</h2><p>${skills.join(', ')}</p></div>`;
    }
    return '';
  };

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@400;600;700&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #f0f0f0; display: flex; justify-content: center; padding: 20px; }
        .resume-page {
          width: 210mm; min-height: 297mm; background: white;
          padding: 20mm; font-family: '${font}', sans-serif;
          box-shadow: 0 4px 10px rgba(0,0,0,0.1);
          color: #111;
        }
        @media print {
          body { padding: 0; background: white; }
          .resume-page { box-shadow: none; margin: 0; width: 210mm; height: 297mm; }
        }
        .header { margin-bottom: 20px; }
        .name { font-size: 26px; font-weight: 700; color: #111; }
        .contact-row { font-size: 12px; color: #666; margin-top: 4px; }
        .section { margin-bottom: 16px; }
        .section-title {
          font-size: 10px; text-transform: uppercase; letter-spacing: 0.1em;
          color: ${accent}; margin-bottom: 8px;
        }
        p, li { font-size: 12.5px; line-height: 1.55; }
        ul { margin-left: 16px; margin-top: 4px; }
        .item { margin-bottom: 12px; }
        .item-header { display: flex; justify-content: space-between; align-items: baseline; }
        .item-date { font-size: 11px; color: #666; float: right; }
      </style>
    </head>
    <body>
      <div class="resume-page">
        <div class="header">
          <div class="name">${personal.name}</div>
          <div class="contact-row">${personal.title} | ${getContactString(personal, ' | ')}</div>
        </div>
        ${generateSections(resume, renderSection)}
      </div>
    </body>
    </html>
  `;
}

// TEMPLATE 04: NEAT
function renderNeat(resume: ResumeData): string {
  const accent = resume.accent || '#c8392b';
  const font = resume.font || 'Raleway';
  const { personal, experience, education, skills } = resume.formData;
  
  const renderSection = (key: string) => {
    if (key === 'summary' && personal.summary) {
      return `<div class="section"><h2 class="section-title">Summary</h2><p>${personal.summary}</p></div>`;
    }
    if (key === 'experience' && experience?.length) {
      return `<div class="section"><h2 class="section-title">Experience</h2>
        ${experience.map(exp => `
          <div class="item">
            <div class="item-header">
              <span class="item-title"><strong>${exp.company}</strong>, ${exp.role}</span>
              <span class="item-date">${exp.startDate} - ${exp.endDate}</span>
            </div>
            <ul class="dash-list">${exp.description.map(d => `<li>${d}</li>`).join('')}</ul>
          </div>
        `).join('')}
      </div>`;
    }
    if (key === 'education' && education?.length) {
      return `<div class="section"><h2 class="section-title">Education</h2>
        ${education.map(edu => `
          <div class="item">
            <div class="item-header">
              <span class="item-title"><strong>${edu.school}</strong>, ${edu.degree}</span>
              <span class="item-date">${edu.startDate} - ${edu.endDate}</span>
            </div>
          </div>
        `).join('')}
      </div>`;
    }
    if (key === 'skills' && skills?.length) {
      return `<div class="section"><h2 class="section-title">Skills</h2><p>${skills.join(', ')}</p></div>`;
    }
    return '';
  };

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Raleway:wght@400;600;700&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #f0f0f0; display: flex; justify-content: center; padding: 20px; }
        .resume-page {
          width: 210mm; min-height: 297mm; background: white;
          padding: 20mm; font-family: '${font}', sans-serif;
          box-shadow: 0 4px 10px rgba(0,0,0,0.1);
          color: #222;
        }
        @media print {
          body { padding: 0; background: white; }
          .resume-page { box-shadow: none; margin: 0; width: 210mm; height: 297mm; }
        }
        .header { margin-bottom: 20px; }
        .name { font-size: 27px; font-weight: 700; border-bottom: 1px solid ${accent}; padding-bottom: 4px; margin-bottom: 6px; }
        .contact { font-size: 11px; color: #555; }
        .section { margin-bottom: 18px; }
        .section-title {
          font-size: 12px; font-weight: 700; border-left: 3px solid ${accent};
          padding-left: 8px; margin-bottom: 8px;
        }
        p, li { font-size: 13px; line-height: 1.6; }
        .dash-list { list-style-type: none; margin-left: 0; }
        .dash-list li::before { content: "– "; color: #333; }
        .item { margin-bottom: 12px; }
        .item-header { display: flex; justify-content: space-between; align-items: baseline; }
        .item-date { font-size: 11px; color: #666; }
      </style>
    </head>
    <body>
      <div class="resume-page">
        <div class="header">
          <div class="name">${personal.name}</div>
          <div class="contact">${personal.title} · ${getContactString(personal, ' · ')}</div>
        </div>
        ${generateSections(resume, renderSection)}
      </div>
    </body>
    </html>
  `;
}

// TEMPLATE 05: PURE
function renderPure(resume: ResumeData): string {
  const font = resume.font || 'Source Sans Pro';
  const { personal, experience, education, skills } = resume.formData;
  
  const renderSection = (key: string) => {
    if (key === 'summary' && personal.summary) {
      return `<div class="section"><h2 class="section-title">SUMMARY</h2><p>${personal.summary}</p></div>`;
    }
    if (key === 'experience' && experience?.length) {
      return `<div class="section"><h2 class="section-title">EXPERIENCE</h2>
        ${experience.map(exp => `
          <div class="item">
            <div class="item-header">
              <span class="item-title"><strong>${exp.company}</strong>, ${exp.role}</span>
              <span class="item-date">${exp.startDate} - ${exp.endDate}</span>
            </div>
            <ul class="square-list">${exp.description.map(d => `<li>${d}</li>`).join('')}</ul>
          </div>
        `).join('')}
      </div>`;
    }
    if (key === 'education' && education?.length) {
      return `<div class="section"><h2 class="section-title">EDUCATION</h2>
        ${education.map(edu => `
          <div class="item">
            <div class="item-header">
              <span class="item-title"><strong>${edu.school}</strong>, ${edu.degree}</span>
              <span class="item-date">${edu.startDate} - ${edu.endDate}</span>
            </div>
          </div>
        `).join('')}
      </div>`;
    }
    if (key === 'skills' && skills?.length) {
      return `<div class="section"><h2 class="section-title">SKILLS</h2><p>${skills.join(', ')}</p></div>`;
    }
    return '';
  };

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Source+Sans+Pro:wght@300;400;600&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #f0f0f0; display: flex; justify-content: center; padding: 20px; }
        .resume-page {
          width: 210mm; min-height: 297mm; background: white;
          padding: 25mm 20mm; font-family: '${font}', sans-serif;
          box-shadow: 0 4px 10px rgba(0,0,0,0.1);
          color: #444;
        }
        @media print {
          body { padding: 0; background: white; }
          .resume-page { box-shadow: none; margin: 0; width: 210mm; height: 297mm; }
        }
        .header { margin-bottom: 30px; }
        .name { font-size: 32px; font-weight: 300; color: #111; }
        .title { font-size: 13px; margin-top: 4px; }
        .contact { font-size: 10px; font-family: monospace; color: #888; margin-top: 6px; }
        .section { margin-top: 20px; margin-bottom: 20px; }
        .section-title {
          font-size: 11px; text-transform: uppercase; letter-spacing: 3px;
          margin-bottom: 12px; color: #111;
        }
        p, li { font-size: 13px; line-height: 1.7; }
        .square-list { list-style-type: square; margin-left: 16px; }
        .square-list li { font-size: 10px; }
        .square-list li span { font-size: 13px; }
        .item { margin-bottom: 16px; }
        .item-header { display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 4px; }
        .item-date { font-size: 11px; color: #888; }
      </style>
    </head>
    <body>
      <div class="resume-page">
        <div class="header">
          <div class="name">${personal.name}</div>
          <div class="title">${personal.title}</div>
          <div class="contact">${getContactString(personal, ' | ')}</div>
        </div>
        ${generateSections(resume, renderSection)}
      </div>
    </body>
    </html>
  `;
}

// TEMPLATE 06: COMPACT
function renderCompact(resume: ResumeData): string {
  const font = resume.font || 'Arial';
  const { personal, experience, education, skills } = resume.formData;
  
  const renderSection = (key: string) => {
    if (key === 'summary' && personal.summary) {
      return `<div class="section"><h2 class="section-title">SUMMARY</h2><p>${personal.summary}</p></div>`;
    }
    if (key === 'experience' && experience?.length) {
      return `<div class="section"><h2 class="section-title">EXPERIENCE</h2>
        ${experience.map(exp => `
          <div class="item">
            <div class="item-header">
              <span class="item-title"><strong>${exp.company}</strong>, ${exp.role}</span>
              <span class="item-date">${exp.startDate} - ${exp.endDate}</span>
            </div>
            <ul>${exp.description.map(d => `<li>${d}</li>`).join('')}</ul>
          </div>
        `).join('')}
      </div>`;
    }
    if (key === 'education' && education?.length) {
      return `<div class="section"><h2 class="section-title">EDUCATION</h2>
        ${education.map(edu => `
          <div class="item">
            <div class="item-header">
              <span class="item-title"><strong>${edu.school}</strong>, ${edu.degree}</span>
              <span class="item-date">${edu.startDate} - ${edu.endDate}</span>
            </div>
          </div>
        `).join('')}
      </div>`;
    }
    if (key === 'skills' && skills?.length) {
      return `<div class="section"><h2 class="section-title">SKILLS</h2><p>${skills.join(', ')}</p></div>`;
    }
    return '';
  };

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #f0f0f0; display: flex; justify-content: center; padding: 20px; }
        .resume-page {
          width: 210mm; min-height: 297mm; background: white;
          padding: 15mm; font-family: '${font}', sans-serif;
          box-shadow: 0 4px 10px rgba(0,0,0,0.1);
          color: #000;
        }
        @media print {
          body { padding: 0; background: white; }
          .resume-page { box-shadow: none; margin: 0; width: 210mm; height: 297mm; }
        }
        .header { text-align: center; margin-bottom: 12px; }
        .name { font-size: 22px; font-weight: bold; }
        .contact { font-size: 10px; margin-top: 4px; }
        .section { margin-bottom: 10px; }
        .section-title {
          font-size: 11px; font-weight: bold; text-transform: uppercase;
          border-bottom: 1px solid #000; margin-bottom: 6px; padding-bottom: 2px;
        }
        p, li { font-size: 11px; line-height: 1.4; }
        ul { margin-left: 14px; margin-top: 2px; }
        .item { margin-bottom: 8px; }
        .item-header { display: flex; justify-content: space-between; align-items: baseline; }
        .item-date { font-size: 10px; }
      </style>
    </head>
    <body>
      <div class="resume-page">
        <div class="header">
          <div class="name">${personal.name}</div>
          <div class="contact">${personal.title} | ${getContactString(personal, ' | ')}</div>
        </div>
        ${generateSections(resume, renderSection)}
      </div>
    </body>
    </html>
  `;
}

// TEMPLATE 07: MONO
function renderMono(resume: ResumeData): string {
  const font = resume.font || 'Roboto Mono';
  const { personal, experience, education, skills } = resume.formData;
  
  const renderSection = (key: string) => {
    if (key === 'summary' && personal.summary) {
      return `<div class="section"><h2 class="section-title">SUMMARY</h2><p>${personal.summary}</p></div>`;
    }
    if (key === 'experience' && experience?.length) {
      return `<div class="section"><h2 class="section-title">EXPERIENCE</h2>
        ${experience.map(exp => `
          <div class="item">
            <div class="item-header">
              <span class="item-title"><strong>${exp.company}</strong>, ${exp.role}</span>
              <span class="item-date">${exp.startDate} - ${exp.endDate}</span>
            </div>
            <ul>${exp.description.map(d => `<li>${d}</li>`).join('')}</ul>
          </div>
        `).join('')}
      </div>`;
    }
    if (key === 'education' && education?.length) {
      return `<div class="section"><h2 class="section-title">EDUCATION</h2>
        ${education.map(edu => `
          <div class="item">
            <div class="item-header">
              <span class="item-title"><strong>${edu.school}</strong>, ${edu.degree}</span>
              <span class="item-date">${edu.startDate} - ${edu.endDate}</span>
            </div>
          </div>
        `).join('')}
      </div>`;
    }
    if (key === 'skills' && skills?.length) {
      return `<div class="section"><h2 class="section-title">SKILLS</h2><p>${skills.join(', ')}</p></div>`;
    }
    return '';
  };

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Roboto+Mono:wght@400;700&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #f0f0f0; display: flex; justify-content: center; padding: 20px; }
        .resume-page {
          width: 210mm; min-height: 297mm; background: white;
          padding: 20mm; font-family: '${font}', monospace;
          box-shadow: 0 4px 10px rgba(0,0,0,0.1);
          color: #000;
        }
        @media print {
          body { padding: 0; background: white; }
          .resume-page { box-shadow: none; margin: 0; width: 210mm; height: 297mm; }
        }
        .header { margin-bottom: 24px; border-bottom: 2px dashed #000; padding-bottom: 12px; }
        .name { font-size: 20px; font-weight: 700; }
        .contact { font-size: 11px; margin-top: 8px; }
        .section { margin-bottom: 20px; }
        .section-title {
          font-size: 12px; font-weight: 700; text-transform: uppercase;
          margin-bottom: 10px;
        }
        .section-title::before { content: "> "; }
        p, li { font-size: 11px; line-height: 1.6; }
        ul { list-style-type: none; margin-left: 0; }
        ul li::before { content: "* "; }
        .item { margin-bottom: 14px; }
        .item-header { display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 4px; }
        .item-date { font-size: 10px; }
      </style>
    </head>
    <body>
      <div class="resume-page">
        <div class="header">
          <div class="name">${personal.name}</div>
          <div class="contact">${personal.title}<br>${getContactString(personal, ' | ')}</div>
        </div>
        ${generateSections(resume, renderSection)}
      </div>
    </body>
    </html>
  `;
}

// TEMPLATE 08: CLASSIC
function renderClassic(resume: ResumeData): string {
  const font = resume.font || 'Times New Roman';
  const { personal, experience, education, skills } = resume.formData;
  
  const renderSection = (key: string) => {
    if (key === 'summary' && personal.summary) {
      return `<div class="section"><h2 class="section-title">SUMMARY</h2><p>${personal.summary}</p></div>`;
    }
    if (key === 'experience' && experience?.length) {
      return `<div class="section"><h2 class="section-title">EXPERIENCE</h2>
        ${experience.map(exp => `
          <div class="item">
            <div class="item-header">
              <span class="item-title"><strong>${exp.company}</strong>, ${exp.role}</span>
              <span class="item-date">${exp.startDate} - ${exp.endDate}</span>
            </div>
            <ul>${exp.description.map(d => `<li>${d}</li>`).join('')}</ul>
          </div>
        `).join('')}
      </div>`;
    }
    if (key === 'education' && education?.length) {
      return `<div class="section"><h2 class="section-title">EDUCATION</h2>
        ${education.map(edu => `
          <div class="item">
            <div class="item-header">
              <span class="item-title"><strong>${edu.school}</strong>, ${edu.degree}</span>
              <span class="item-date">${edu.startDate} - ${edu.endDate}</span>
            </div>
          </div>
        `).join('')}
      </div>`;
    }
    if (key === 'skills' && skills?.length) {
      return `<div class="section"><h2 class="section-title">SKILLS</h2><p>${skills.join(', ')}</p></div>`;
    }
    return '';
  };

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #f0f0f0; display: flex; justify-content: center; padding: 20px; }
        .resume-page {
          width: 210mm; min-height: 297mm; background: white;
          padding: 25mm; font-family: '${font}', serif;
          box-shadow: 0 4px 10px rgba(0,0,0,0.1);
          color: #000;
        }
        @media print {
          body { padding: 0; background: white; }
          .resume-page { box-shadow: none; margin: 0; width: 210mm; height: 297mm; }
        }
        .header { text-align: center; margin-bottom: 20px; }
        .name { font-size: 24px; font-weight: bold; text-transform: uppercase; }
        .contact { font-size: 12px; margin-top: 6px; }
        .section { margin-bottom: 16px; }
        .section-title {
          font-size: 14px; font-weight: bold; text-transform: uppercase;
          text-align: center; border-bottom: 1px solid #000;
          margin-bottom: 10px; padding-bottom: 4px;
        }
        p, li { font-size: 12px; line-height: 1.5; }
        ul { margin-left: 20px; margin-top: 4px; }
        .item { margin-bottom: 12px; }
        .item-header { display: flex; justify-content: space-between; align-items: baseline; }
        .item-date { font-size: 12px; font-style: italic; }
      </style>
    </head>
    <body>
      <div class="resume-page">
        <div class="header">
          <div class="name">${personal.name}</div>
          <div class="contact">${personal.title}<br>${getContactString(personal, ' | ')}</div>
        </div>
        ${generateSections(resume, renderSection)}
      </div>
    </body>
    </html>
  `;
}

// TEMPLATE 09: MINIMAL LINE
function renderMinimalLine(resume: ResumeData): string {
  const font = resume.font || 'Lato';
  const { personal, experience, education, skills } = resume.formData;
  
  const renderSection = (key: string) => {
    if (key === 'summary' && personal.summary) {
      return `<div class="section"><h2 class="section-title">SUMMARY</h2><p>${personal.summary}</p></div>`;
    }
    if (key === 'experience' && experience?.length) {
      return `<div class="section"><h2 class="section-title">EXPERIENCE</h2>
        ${experience.map(exp => `
          <div class="item">
            <div class="item-header">
              <span class="item-title"><strong>${exp.company}</strong>, ${exp.role}</span>
              <span class="item-date">${exp.startDate} - ${exp.endDate}</span>
            </div>
            <ul>${exp.description.map(d => `<li>${d}</li>`).join('')}</ul>
          </div>
        `).join('')}
      </div>`;
    }
    if (key === 'education' && education?.length) {
      return `<div class="section"><h2 class="section-title">EDUCATION</h2>
        ${education.map(edu => `
          <div class="item">
            <div class="item-header">
              <span class="item-title"><strong>${edu.school}</strong>, ${edu.degree}</span>
              <span class="item-date">${edu.startDate} - ${edu.endDate}</span>
            </div>
          </div>
        `).join('')}
      </div>`;
    }
    if (key === 'skills' && skills?.length) {
      return `<div class="section"><h2 class="section-title">SKILLS</h2><p>${skills.join(', ')}</p></div>`;
    }
    return '';
  };

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Lato:wght@300;400;700&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #f0f0f0; display: flex; justify-content: center; padding: 20px; }
        .resume-page {
          width: 210mm; min-height: 297mm; background: white;
          padding: 20mm; font-family: '${font}', sans-serif;
          box-shadow: 0 4px 10px rgba(0,0,0,0.1);
          color: #333;
        }
        @media print {
          body { padding: 0; background: white; }
          .resume-page { box-shadow: none; margin: 0; width: 210mm; height: 297mm; }
        }
        .header { margin-bottom: 24px; }
        .name { font-size: 28px; font-weight: 300; letter-spacing: 2px; text-transform: uppercase; }
        .title { font-size: 14px; font-weight: 700; margin-top: 4px; }
        .contact { font-size: 11px; color: #777; margin-top: 8px; }
        .section { margin-bottom: 20px; }
        .section-title {
          font-size: 12px; font-weight: 700; text-transform: uppercase;
          letter-spacing: 1px; margin-bottom: 12px;
          border-top: 1px solid #ddd; padding-top: 8px;
        }
        p, li { font-size: 12.5px; line-height: 1.6; }
        ul { margin-left: 16px; margin-top: 4px; }
        .item { margin-bottom: 14px; }
        .item-header { display: flex; justify-content: space-between; align-items: baseline; }
        .item-date { font-size: 11px; color: #777; }
      </style>
    </head>
    <body>
      <div class="resume-page">
        <div class="header">
          <div class="name">${personal.name}</div>
          <div class="title">${personal.title}</div>
          <div class="contact">${getContactString(personal, ' | ')}</div>
        </div>
        ${generateSections(resume, renderSection)}
      </div>
    </body>
    </html>
  `;
}

// TEMPLATE 10: NOTEPAD
function renderNotepad(resume: ResumeData): string {
  const font = resume.font || 'Courier New';
  const { personal, experience, education, skills } = resume.formData;
  
  const renderSection = (key: string) => {
    if (key === 'summary' && personal.summary) {
      return `<div class="section"><h2 class="section-title">SUMMARY</h2><p>${personal.summary}</p></div>`;
    }
    if (key === 'experience' && experience?.length) {
      return `<div class="section"><h2 class="section-title">EXPERIENCE</h2>
        ${experience.map(exp => `
          <div class="item">
            <div class="item-header">
              <span class="item-title"><strong>${exp.company}</strong>, ${exp.role}</span>
              <span class="item-date">${exp.startDate} - ${exp.endDate}</span>
            </div>
            <ul>${exp.description.map(d => `<li>${d}</li>`).join('')}</ul>
          </div>
        `).join('')}
      </div>`;
    }
    if (key === 'education' && education?.length) {
      return `<div class="section"><h2 class="section-title">EDUCATION</h2>
        ${education.map(edu => `
          <div class="item">
            <div class="item-header">
              <span class="item-title"><strong>${edu.school}</strong>, ${edu.degree}</span>
              <span class="item-date">${edu.startDate} - ${edu.endDate}</span>
            </div>
          </div>
        `).join('')}
      </div>`;
    }
    if (key === 'skills' && skills?.length) {
      return `<div class="section"><h2 class="section-title">SKILLS</h2><p>${skills.join(', ')}</p></div>`;
    }
    return '';
  };

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #f0f0f0; display: flex; justify-content: center; padding: 20px; }
        .resume-page {
          width: 210mm; min-height: 297mm; background: white;
          padding: 20mm; font-family: '${font}', monospace;
          box-shadow: 0 4px 10px rgba(0,0,0,0.1);
          color: #000;
        }
        @media print {
          body { padding: 0; background: white; }
          .resume-page { box-shadow: none; margin: 0; width: 210mm; height: 297mm; }
        }
        .header { margin-bottom: 20px; }
        .name { font-size: 24px; font-weight: bold; }
        .contact { font-size: 12px; margin-top: 8px; }
        .section { margin-bottom: 16px; }
        .section-title {
          font-size: 14px; font-weight: bold; text-decoration: underline;
          margin-bottom: 8px;
        }
        p, li { font-size: 12px; line-height: 1.5; }
        ul { margin-left: 20px; margin-top: 4px; list-style-type: disc; }
        .item { margin-bottom: 12px; }
        .item-header { display: flex; justify-content: space-between; align-items: baseline; }
        .item-date { font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="resume-page">
        <div class="header">
          <div class="name">${personal.name}</div>
          <div class="contact">${personal.title}<br>${getContactString(personal, ' | ')}</div>
        </div>
        ${generateSections(resume, renderSection)}
      </div>
    </body>
    </html>
  `;
}

// TEMPLATE 11: OBSIDIAN
function renderObsidian(resume: ResumeData): string {
  const accent = resume.accent || '#c8392b';
  const font = resume.font || 'Inter';
  const { personal, experience, education, skills } = resume.formData;
  
  const renderSection = (key: string) => {
    if (key === 'summary' && personal.summary) {
      return `<div class="section"><h2 class="section-title">SUMMARY</h2><p>${personal.summary}</p></div>`;
    }
    if (key === 'experience' && experience?.length) {
      return `<div class="section"><h2 class="section-title">EXPERIENCE</h2>
        ${experience.map(exp => `
          <div class="item">
            <div class="item-header">
              <span class="item-title"><strong>${exp.company}</strong>, ${exp.role}</span>
              <span class="item-date">${exp.startDate} - ${exp.endDate}</span>
            </div>
            <ul>${exp.description.map(d => `<li>${d}</li>`).join('')}</ul>
          </div>
        `).join('')}
      </div>`;
    }
    if (key === 'education' && education?.length) {
      return `<div class="section"><h2 class="section-title">EDUCATION</h2>
        ${education.map(edu => `
          <div class="item">
            <div class="item-header">
              <span class="item-title"><strong>${edu.school}</strong>, ${edu.degree}</span>
              <span class="item-date">${edu.startDate} - ${edu.endDate}</span>
            </div>
          </div>
        `).join('')}
      </div>`;
    }
    if (key === 'skills' && skills?.length) {
      return `<div class="section"><h2 class="section-title">SKILLS</h2>
        <div class="skills-grid">
          ${skills.map(s => `<span class="skill-tag">${s}</span>`).join('')}
        </div>
      </div>`;
    }
    return '';
  };

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;800&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #f0f0f0; display: flex; justify-content: center; padding: 20px; }
        .resume-page {
          width: 210mm; min-height: 297mm; background: #111;
          padding: 20mm; font-family: '${font}', sans-serif;
          box-shadow: 0 4px 10px rgba(0,0,0,0.1);
          color: #eee;
        }
        @media print {
          body { padding: 0; background: white; }
          .resume-page { box-shadow: none; margin: 0; width: 210mm; height: 297mm; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
        }
        .header { margin-bottom: 24px; border-bottom: 1px solid #333; padding-bottom: 16px; }
        .name { font-size: 32px; font-weight: 800; color: #fff; text-transform: uppercase; letter-spacing: 1px; }
        .title { font-size: 14px; color: ${accent}; font-weight: 600; margin-top: 4px; }
        .contact { font-size: 11px; color: #aaa; margin-top: 8px; }
        .section { margin-bottom: 20px; }
        .section-title {
          font-size: 12px; font-weight: 800; text-transform: uppercase;
          color: #fff; margin-bottom: 12px; letter-spacing: 1px;
        }
        p, li { font-size: 12px; line-height: 1.6; color: #ccc; }
        ul { margin-left: 16px; margin-top: 4px; }
        .item { margin-bottom: 16px; }
        .item-header { display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 4px; }
        .item-title { color: #fff; }
        .item-date { font-size: 11px; color: ${accent}; font-weight: 600; }
        .skills-grid { display: flex; flex-wrap: wrap; gap: 6px; }
        .skill-tag { background: #222; color: #fff; padding: 4px 8px; border-radius: 4px; font-size: 10px; border: 1px solid #333; }
      </style>
    </head>
    <body>
      <div class="resume-page">
        <div class="header">
          <div class="name">${personal.name}</div>
          <div class="title">${personal.title}</div>
          <div class="contact">${getContactString(personal, ' | ')}</div>
        </div>
        ${generateSections(resume, renderSection)}
      </div>
    </body>
    </html>
  `;
}

// TEMPLATE 12: AURORA
function renderAurora(resume: ResumeData): string {
  const accent = resume.accent || '#c8392b';
  const font = resume.font || 'Outfit';
  const { personal, experience, education, skills } = resume.formData;
  
  const renderSection = (key: string) => {
    if (key === 'summary' && personal.summary) {
      return `<div class="section"><h2 class="section-title">SUMMARY</h2><p>${personal.summary}</p></div>`;
    }
    if (key === 'experience' && experience?.length) {
      return `<div class="section"><h2 class="section-title">EXPERIENCE</h2>
        ${experience.map(exp => `
          <div class="item">
            <div class="item-header">
              <span class="item-title"><strong>${exp.company}</strong>, ${exp.role}</span>
              <span class="item-date">${exp.startDate} - ${exp.endDate}</span>
            </div>
            <ul>${exp.description.map(d => `<li>${d}</li>`).join('')}</ul>
          </div>
        `).join('')}
      </div>`;
    }
    if (key === 'education' && education?.length) {
      return `<div class="section"><h2 class="section-title">EDUCATION</h2>
        ${education.map(edu => `
          <div class="item">
            <div class="item-header">
              <span class="item-title"><strong>${edu.school}</strong>, ${edu.degree}</span>
              <span class="item-date">${edu.startDate} - ${edu.endDate}</span>
            </div>
          </div>
        `).join('')}
      </div>`;
    }
    if (key === 'skills' && skills?.length) {
      return `<div class="section"><h2 class="section-title">SKILLS</h2>
        <div class="skills-grid">
          ${skills.map(s => `<span class="skill-tag">${s}</span>`).join('')}
        </div>
      </div>`;
    }
    return '';
  };

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;500;700&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #f0f0f0; display: flex; justify-content: center; padding: 20px; }
        .resume-page {
          width: 210mm; min-height: 297mm; background: white;
          font-family: '${font}', sans-serif;
          box-shadow: 0 4px 10px rgba(0,0,0,0.1);
          color: #333;
          position: relative;
        }
        @media print {
          body { padding: 0; background: white; }
          .resume-page { box-shadow: none; margin: 0; width: 210mm; height: 297mm; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
        }
        .header { 
          background: linear-gradient(135deg, ${accent} 0%, #111 100%);
          color: white; padding: 25mm 20mm 15mm 20mm;
        }
        .name { font-size: 36px; font-weight: 700; letter-spacing: -1px; }
        .title { font-size: 16px; font-weight: 300; margin-top: 4px; opacity: 0.9; }
        .contact { font-size: 11px; margin-top: 12px; opacity: 0.8; }
        .content { padding: 15mm 20mm; }
        .section { margin-bottom: 24px; }
        .section-title {
          font-size: 14px; font-weight: 700; color: ${accent};
          margin-bottom: 12px; display: inline-block;
          border-bottom: 2px solid ${accent}; padding-bottom: 2px;
        }
        p, li { font-size: 12px; line-height: 1.6; }
        ul { margin-left: 16px; margin-top: 4px; }
        .item { margin-bottom: 16px; }
        .item-header { display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 4px; }
        .item-title { color: #111; }
        .item-date { font-size: 11px; color: #666; font-weight: 500; }
        .skills-grid { display: flex; flex-wrap: wrap; gap: 8px; }
        .skill-tag { background: #f4f4f4; color: #333; padding: 5px 10px; border-radius: 20px; font-size: 11px; font-weight: 500; }
      </style>
    </head>
    <body>
      <div class="resume-page">
        <div class="header">
          <div class="name">${personal.name}</div>
          <div class="title">${personal.title}</div>
          <div class="contact">${getContactString(personal, ' • ')}</div>
        </div>
        <div class="content">
          ${generateSections(resume, renderSection)}
        </div>
      </div>
    </body>
    </html>
  `;
}

// TEMPLATE 13: NEON
function renderNeon(resume: ResumeData): string {
  const accent = resume.accent || '#00ffcc';
  const font = resume.font || 'Space Grotesk';
  const { personal, experience, education, skills } = resume.formData;
  
  const renderSection = (key: string) => {
    if (key === 'summary' && personal.summary) {
      return `<div class="section"><h2 class="section-title">SUMMARY</h2><p>${personal.summary}</p></div>`;
    }
    if (key === 'experience' && experience?.length) {
      return `<div class="section"><h2 class="section-title">EXPERIENCE</h2>
        ${experience.map(exp => `
          <div class="item">
            <div class="item-header">
              <span class="item-title"><strong>${exp.company}</strong>, ${exp.role}</span>
              <span class="item-date">${exp.startDate} - ${exp.endDate}</span>
            </div>
            <ul>${exp.description.map(d => `<li>${d}</li>`).join('')}</ul>
          </div>
        `).join('')}
      </div>`;
    }
    if (key === 'education' && education?.length) {
      return `<div class="section"><h2 class="section-title">EDUCATION</h2>
        ${education.map(edu => `
          <div class="item">
            <div class="item-header">
              <span class="item-title"><strong>${edu.school}</strong>, ${edu.degree}</span>
              <span class="item-date">${edu.startDate} - ${edu.endDate}</span>
            </div>
          </div>
        `).join('')}
      </div>`;
    }
    if (key === 'skills' && skills?.length) {
      return `<div class="section"><h2 class="section-title">SKILLS</h2>
        <div class="skills-grid">
          ${skills.map(s => `<span class="skill-tag">${s}</span>`).join('')}
        </div>
      </div>`;
    }
    return '';
  };

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;600;700&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #f0f0f0; display: flex; justify-content: center; padding: 20px; }
        .resume-page {
          width: 210mm; min-height: 297mm; background: #0a0a0a;
          padding: 20mm; font-family: '${font}', sans-serif;
          box-shadow: 0 4px 10px rgba(0,0,0,0.1);
          color: #e0e0e0;
        }
        @media print {
          body { padding: 0; background: white; }
          .resume-page { box-shadow: none; margin: 0; width: 210mm; height: 297mm; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
        }
        .header { margin-bottom: 30px; text-align: center; }
        .name { font-size: 36px; font-weight: 700; color: #fff; text-transform: uppercase; text-shadow: 0 0 10px ${accent}40; }
        .title { font-size: 14px; color: ${accent}; font-weight: 600; margin-top: 8px; letter-spacing: 2px; text-transform: uppercase; }
        .contact { font-size: 11px; color: #888; margin-top: 12px; }
        .section { margin-bottom: 24px; }
        .section-title {
          font-size: 14px; font-weight: 700; text-transform: uppercase;
          color: ${accent}; margin-bottom: 16px; letter-spacing: 1px;
          border-bottom: 1px solid #333; padding-bottom: 8px;
        }
        p, li { font-size: 12px; line-height: 1.6; color: #bbb; }
        ul { margin-left: 16px; margin-top: 8px; }
        li { margin-bottom: 4px; }
        .item { margin-bottom: 20px; }
        .item-header { display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 6px; }
        .item-title { color: #fff; font-size: 13px; }
        .item-date { font-size: 11px; color: #666; font-family: monospace; }
        .skills-grid { display: flex; flex-wrap: wrap; gap: 8px; }
        .skill-tag { border: 1px solid ${accent}; color: ${accent}; padding: 4px 10px; border-radius: 2px; font-size: 11px; }
      </style>
    </head>
    <body>
      <div class="resume-page">
        <div class="header">
          <div class="name">${personal.name}</div>
          <div class="title">${personal.title}</div>
          <div class="contact">${getContactString(personal, ' | ')}</div>
        </div>
        ${generateSections(resume, renderSection)}
      </div>
    </body>
    </html>
  `;
}

// TEMPLATE 14: BLUSH
function renderBlush(resume: ResumeData): string {
  const accent = resume.accent || '#e8a598';
  const font = resume.font || 'Playfair Display';
  const { personal, experience, education, skills } = resume.formData;
  
  const renderSection = (key: string) => {
    if (key === 'summary' && personal.summary) {
      return `<div class="section"><h2 class="section-title">Summary</h2><p>${personal.summary}</p></div>`;
    }
    if (key === 'experience' && experience?.length) {
      return `<div class="section"><h2 class="section-title">Experience</h2>
        ${experience.map(exp => `
          <div class="item">
            <div class="item-header">
              <span class="item-title"><strong>${exp.company}</strong>, ${exp.role}</span>
              <span class="item-date">${exp.startDate} - ${exp.endDate}</span>
            </div>
            <ul>${exp.description.map(d => `<li>${d}</li>`).join('')}</ul>
          </div>
        `).join('')}
      </div>`;
    }
    if (key === 'education' && education?.length) {
      return `<div class="section"><h2 class="section-title">Education</h2>
        ${education.map(edu => `
          <div class="item">
            <div class="item-header">
              <span class="item-title"><strong>${edu.school}</strong>, ${edu.degree}</span>
              <span class="item-date">${edu.startDate} - ${edu.endDate}</span>
            </div>
          </div>
        `).join('')}
      </div>`;
    }
    if (key === 'skills' && skills?.length) {
      return `<div class="section"><h2 class="section-title">Skills</h2><p>${skills.join(', ')}</p></div>`;
    }
    return '';
  };

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;1,400&family=Lato:wght@300;400&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #f0f0f0; display: flex; justify-content: center; padding: 20px; }
        .resume-page {
          width: 210mm; min-height: 297mm; background: #fffaf9;
          padding: 25mm; font-family: 'Lato', sans-serif;
          box-shadow: 0 4px 10px rgba(0,0,0,0.1);
          color: #4a4a4a;
        }
        @media print {
          body { padding: 0; background: white; }
          .resume-page { box-shadow: none; margin: 0; width: 210mm; height: 297mm; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
        }
        .header { text-align: center; margin-bottom: 30px; }
        .name { font-family: '${font}', serif; font-size: 36px; font-weight: 700; color: #2c2c2c; }
        .title { font-family: '${font}', serif; font-size: 16px; font-style: italic; color: ${accent}; margin-top: 4px; }
        .contact { font-size: 11px; margin-top: 10px; color: #888; }
        .section { margin-bottom: 20px; }
        .section-title {
          font-family: '${font}', serif; font-size: 18px; font-weight: 700; color: #2c2c2c;
          margin-bottom: 12px; text-align: center; position: relative;
        }
        .section-title::after {
          content: ''; display: block; width: 40px; height: 2px; background: ${accent};
          margin: 6px auto 0 auto;
        }
        p, li { font-size: 12px; line-height: 1.6; }
        ul { margin-left: 20px; margin-top: 6px; }
        .item { margin-bottom: 16px; }
        .item-header { display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 4px; }
        .item-title { color: #2c2c2c; font-size: 13px; }
        .item-date { font-size: 11px; color: #888; font-style: italic; }
      </style>
    </head>
    <body>
      <div class="resume-page">
        <div class="header">
          <div class="name">${personal.name}</div>
          <div class="title">${personal.title}</div>
          <div class="contact">${getContactString(personal, ' | ')}</div>
        </div>
        ${generateSections(resume, renderSection)}
      </div>
    </body>
    </html>
  `;
}

// TEMPLATE 15: METRO
function renderMetro(resume: ResumeData): string {
  const accent = resume.accent || '#0078d7';
  const font = resume.font || 'Segoe UI';
  const { personal, experience, education, skills } = resume.formData;
  
  const renderSection = (key: string) => {
    if (key === 'summary' && personal.summary) {
      return `<div class="section"><h2 class="section-title">SUMMARY</h2><p>${personal.summary}</p></div>`;
    }
    if (key === 'experience' && experience?.length) {
      return `<div class="section"><h2 class="section-title">EXPERIENCE</h2>
        ${experience.map(exp => `
          <div class="item">
            <div class="item-header">
              <span class="item-title"><strong>${exp.company}</strong>, ${exp.role}</span>
              <span class="item-date">${exp.startDate} - ${exp.endDate}</span>
            </div>
            <ul>${exp.description.map(d => `<li>${d}</li>`).join('')}</ul>
          </div>
        `).join('')}
      </div>`;
    }
    if (key === 'education' && education?.length) {
      return `<div class="section"><h2 class="section-title">EDUCATION</h2>
        ${education.map(edu => `
          <div class="item">
            <div class="item-header">
              <span class="item-title"><strong>${edu.school}</strong>, ${edu.degree}</span>
              <span class="item-date">${edu.startDate} - ${edu.endDate}</span>
            </div>
          </div>
        `).join('')}
      </div>`;
    }
    if (key === 'skills' && skills?.length) {
      return `<div class="section"><h2 class="section-title">SKILLS</h2>
        <div class="skills-grid">
          ${skills.map(s => `<span class="skill-tag">${s}</span>`).join('')}
        </div>
      </div>`;
    }
    return '';
  };

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Open+Sans:wght@400;600;700&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #f0f0f0; display: flex; justify-content: center; padding: 20px; }
        .resume-page {
          width: 210mm; min-height: 297mm; background: white;
          font-family: '${font}', 'Open Sans', sans-serif;
          box-shadow: 0 4px 10px rgba(0,0,0,0.1);
          color: #333; display: flex;
        }
        @media print {
          body { padding: 0; background: white; }
          .resume-page { box-shadow: none; margin: 0; width: 210mm; height: 297mm; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
        }
        .sidebar { width: 35%; background: #f4f4f4; padding: 20mm 10mm; border-right: 4px solid ${accent}; }
        .main { width: 65%; padding: 20mm 15mm; }
        .name { font-size: 28px; font-weight: 700; color: #111; line-height: 1.1; margin-bottom: 8px; }
        .title { font-size: 14px; color: ${accent}; font-weight: 600; margin-bottom: 20px; }
        .contact-item { font-size: 11px; margin-bottom: 8px; color: #555; word-break: break-all; }
        .section { margin-bottom: 24px; }
        .section-title {
          font-size: 14px; font-weight: 700; text-transform: uppercase;
          color: #111; margin-bottom: 12px;
        }
        p, li { font-size: 12px; line-height: 1.5; }
        ul { margin-left: 16px; margin-top: 4px; }
        .item { margin-bottom: 16px; }
        .item-header { margin-bottom: 4px; }
        .item-title { display: block; color: #111; font-size: 13px; }
        .item-date { font-size: 11px; color: ${accent}; font-weight: 600; display: block; margin-top: 2px; }
        .skills-grid { display: flex; flex-direction: column; gap: 6px; }
        .skill-tag { background: #e0e0e0; padding: 4px 8px; font-size: 11px; }
      </style>
    </head>
    <body>
      <div class="resume-page">
        <div class="sidebar">
          <div class="name">${personal.name}</div>
          <div class="title">${personal.title}</div>
          <div style="margin-bottom: 30px;">
            ${personal.email ? `<div class="contact-item">${personal.email}</div>` : ''}
            ${personal.phone ? `<div class="contact-item">${personal.phone}</div>` : ''}
            ${personal.location ? `<div class="contact-item">${personal.location}</div>` : ''}
            ${personal.website ? `<div class="contact-item">${personal.website}</div>` : ''}
          </div>
          ${skills?.length ? `
            <div class="section">
              <h2 class="section-title">SKILLS</h2>
              <div class="skills-grid">
                ${skills.map(s => `<span class="skill-tag">${s}</span>`).join('')}
              </div>
            </div>
          ` : ''}
        </div>
        <div class="main">
          ${generateSections({ ...resume, hiddenSections: [...(resume.hiddenSections || []), 'skills'] }, renderSection)}
        </div>
      </div>
    </body>
    </html>
  `;
}

// TEMPLATE 16: SLATE
function renderSlate(resume: ResumeData): string {
  const accent = resume.accent || '#475569';
  const font = resume.font || 'Inter';
  const { personal, experience, education, skills } = resume.formData;
  
  const renderSection = (key: string) => {
    if (key === 'summary' && personal.summary) {
      return `<div class="section"><h2 class="section-title">SUMMARY</h2><p>${personal.summary}</p></div>`;
    }
    if (key === 'experience' && experience?.length) {
      return `<div class="section"><h2 class="section-title">EXPERIENCE</h2>
        ${experience.map(exp => `
          <div class="item">
            <div class="item-header">
              <span class="item-title"><strong>${exp.company}</strong>, ${exp.role}</span>
              <span class="item-date">${exp.startDate} - ${exp.endDate}</span>
            </div>
            <ul>${exp.description.map(d => `<li>${d}</li>`).join('')}</ul>
          </div>
        `).join('')}
      </div>`;
    }
    if (key === 'education' && education?.length) {
      return `<div class="section"><h2 class="section-title">EDUCATION</h2>
        ${education.map(edu => `
          <div class="item">
            <div class="item-header">
              <span class="item-title"><strong>${edu.school}</strong>, ${edu.degree}</span>
              <span class="item-date">${edu.startDate} - ${edu.endDate}</span>
            </div>
          </div>
        `).join('')}
      </div>`;
    }
    if (key === 'skills' && skills?.length) {
      return `<div class="section"><h2 class="section-title">SKILLS</h2><p>${skills.join(' • ')}</p></div>`;
    }
    return '';
  };

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;600&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #f0f0f0; display: flex; justify-content: center; padding: 20px; }
        .resume-page {
          width: 210mm; min-height: 297mm; background: white;
          padding: 25mm; font-family: '${font}', sans-serif;
          box-shadow: 0 4px 10px rgba(0,0,0,0.1);
          color: #334155;
        }
        @media print {
          body { padding: 0; background: white; }
          .resume-page { box-shadow: none; margin: 0; width: 210mm; height: 297mm; }
        }
        .header { margin-bottom: 30px; border-left: 4px solid ${accent}; padding-left: 16px; }
        .name { font-size: 32px; font-weight: 300; color: #0f172a; letter-spacing: -0.5px; }
        .title { font-size: 14px; color: ${accent}; font-weight: 600; margin-top: 4px; }
        .contact { font-size: 11px; color: #64748b; margin-top: 8px; }
        .section { margin-bottom: 24px; }
        .section-title {
          font-size: 11px; font-weight: 600; text-transform: uppercase;
          color: #94a3b8; margin-bottom: 12px; letter-spacing: 1px;
        }
        p, li { font-size: 12.5px; line-height: 1.6; color: #475569; }
        ul { margin-left: 16px; margin-top: 6px; }
        .item { margin-bottom: 16px; }
        .item-header { display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 4px; }
        .item-title { color: #0f172a; }
        .item-date { font-size: 11px; color: #94a3b8; }
      </style>
    </head>
    <body>
      <div class="resume-page">
        <div class="header">
          <div class="name">${personal.name}</div>
          <div class="title">${personal.title}</div>
          <div class="contact">${getContactString(personal, ' | ')}</div>
        </div>
        ${generateSections(resume, renderSection)}
      </div>
    </body>
    </html>
  `;
}

// TEMPLATE 17: HORIZON
function renderHorizon(resume: ResumeData): string {
  const accent = resume.accent || '#000000';
  const font = resume.font || 'Helvetica Neue';
  const { personal, experience, education, skills } = resume.formData;
  
  const renderSection = (key: string) => {
    if (key === 'summary' && personal.summary) {
      return `<div class="section"><h2 class="section-title">SUMMARY</h2><div class="section-content"><p>${personal.summary}</p></div></div>`;
    }
    if (key === 'experience' && experience?.length) {
      return `<div class="section"><h2 class="section-title">EXPERIENCE</h2>
        <div class="section-content">
        ${experience.map(exp => `
          <div class="item">
            <div class="item-header">
              <span class="item-title"><strong>${exp.company}</strong>, ${exp.role}</span>
              <span class="item-date">${exp.startDate} - ${exp.endDate}</span>
            </div>
            <ul>${exp.description.map(d => `<li>${d}</li>`).join('')}</ul>
          </div>
        `).join('')}
        </div>
      </div>`;
    }
    if (key === 'education' && education?.length) {
      return `<div class="section"><h2 class="section-title">EDUCATION</h2>
        <div class="section-content">
        ${education.map(edu => `
          <div class="item">
            <div class="item-header">
              <span class="item-title"><strong>${edu.school}</strong>, ${edu.degree}</span>
              <span class="item-date">${edu.startDate} - ${edu.endDate}</span>
            </div>
          </div>
        `).join('')}
        </div>
      </div>`;
    }
    if (key === 'skills' && skills?.length) {
      return `<div class="section"><h2 class="section-title">SKILLS</h2><div class="section-content"><p>${skills.join(', ')}</p></div></div>`;
    }
    return '';
  };

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #f0f0f0; display: flex; justify-content: center; padding: 20px; }
        .resume-page {
          width: 210mm; min-height: 297mm; background: white;
          padding: 20mm; font-family: '${font}', Helvetica, Arial, sans-serif;
          box-shadow: 0 4px 10px rgba(0,0,0,0.1);
          color: #222;
        }
        @media print {
          body { padding: 0; background: white; }
          .resume-page { box-shadow: none; margin: 0; width: 210mm; height: 297mm; }
        }
        .header { margin-bottom: 30px; border-bottom: 1px solid #ddd; padding-bottom: 20px; }
        .name { font-size: 28px; font-weight: bold; text-transform: uppercase; letter-spacing: 1px; }
        .title { font-size: 13px; color: #666; margin-top: 4px; text-transform: uppercase; letter-spacing: 1px; }
        .contact { font-size: 11px; color: #888; margin-top: 8px; }
        .section { display: flex; margin-bottom: 20px; }
        .section-title {
          width: 25%; font-size: 10px; font-weight: bold; text-transform: uppercase;
          color: ${accent}; letter-spacing: 1px; padding-right: 10px;
        }
        .section-content { width: 75%; }
        p, li { font-size: 12px; line-height: 1.6; color: #444; }
        ul { margin-left: 16px; margin-top: 4px; }
        .item { margin-bottom: 16px; }
        .item-header { display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 4px; }
        .item-date { font-size: 11px; color: #888; }
      </style>
    </head>
    <body>
      <div class="resume-page">
        <div class="header">
          <div class="name">${personal.name}</div>
          <div class="title">${personal.title}</div>
          <div class="contact">${getContactString(personal, ' | ')}</div>
        </div>
        ${generateSections(resume, renderSection)}
      </div>
    </body>
    </html>
  `;
}

// TEMPLATE 18: IVORY
function renderIvory(resume: ResumeData): string {
  const accent = resume.accent || '#8b7355';
  const font = resume.font || 'Cormorant Garamond';
  const { personal, experience, education, skills } = resume.formData;
  
  const renderSection = (key: string) => {
    if (key === 'summary' && personal.summary) {
      return `<div class="section"><h2 class="section-title">SUMMARY</h2><p>${personal.summary}</p></div>`;
    }
    if (key === 'experience' && experience?.length) {
      return `<div class="section"><h2 class="section-title">EXPERIENCE</h2>
        ${experience.map(exp => `
          <div class="item">
            <div class="item-header">
              <span class="item-title"><strong>${exp.company}</strong>, ${exp.role}</span>
              <span class="item-date">${exp.startDate} - ${exp.endDate}</span>
            </div>
            <ul>${exp.description.map(d => `<li>${d}</li>`).join('')}</ul>
          </div>
        `).join('')}
      </div>`;
    }
    if (key === 'education' && education?.length) {
      return `<div class="section"><h2 class="section-title">EDUCATION</h2>
        ${education.map(edu => `
          <div class="item">
            <div class="item-header">
              <span class="item-title"><strong>${edu.school}</strong>, ${edu.degree}</span>
              <span class="item-date">${edu.startDate} - ${edu.endDate}</span>
            </div>
          </div>
        `).join('')}
      </div>`;
    }
    if (key === 'skills' && skills?.length) {
      return `<div class="section"><h2 class="section-title">SKILLS</h2><p>${skills.join(', ')}</p></div>`;
    }
    return '';
  };

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,600;1,400&family=Proza+Libre:wght@400;600&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #f0f0f0; display: flex; justify-content: center; padding: 20px; }
        .resume-page {
          width: 210mm; min-height: 297mm; background: #faf9f6;
          padding: 25mm; font-family: 'Proza Libre', sans-serif;
          box-shadow: 0 4px 10px rgba(0,0,0,0.1);
          color: #333;
        }
        @media print {
          body { padding: 0; background: white; }
          .resume-page { box-shadow: none; margin: 0; width: 210mm; height: 297mm; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
        }
        .header { text-align: center; margin-bottom: 30px; }
        .name { font-family: '${font}', serif; font-size: 38px; font-weight: 600; color: #111; }
        .title { font-size: 12px; color: ${accent}; text-transform: uppercase; letter-spacing: 2px; margin-top: 8px; }
        .contact { font-size: 11px; color: #666; margin-top: 12px; }
        .section { margin-bottom: 24px; }
        .section-title {
          font-family: '${font}', serif; font-size: 20px; font-style: italic;
          color: ${accent}; margin-bottom: 12px; text-align: center;
        }
        p, li { font-size: 12px; line-height: 1.6; }
        ul { margin-left: 16px; margin-top: 6px; }
        .item { margin-bottom: 16px; }
        .item-header { display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 4px; }
        .item-title { color: #111; }
        .item-date { font-size: 11px; color: #888; }
      </style>
    </head>
    <body>
      <div class="resume-page">
        <div class="header">
          <div class="name">${personal.name}</div>
          <div class="title">${personal.title}</div>
          <div class="contact">${getContactString(personal, ' | ')}</div>
        </div>
        ${generateSections(resume, renderSection)}
      </div>
    </body>
    </html>
  `;
}

// TEMPLATE 19: GRID
function renderGrid(resume: ResumeData): string {
  const accent = resume.accent || '#000000';
  const font = resume.font || 'Space Mono';
  const { personal, experience, education, skills } = resume.formData;
  
  const renderSection = (key: string) => {
    if (key === 'summary' && personal.summary) {
      return `<div class="section"><h2 class="section-title">SUMMARY</h2><p>${personal.summary}</p></div>`;
    }
    if (key === 'experience' && experience?.length) {
      return `<div class="section"><h2 class="section-title">EXPERIENCE</h2>
        ${experience.map(exp => `
          <div class="item">
            <div class="item-header">
              <span class="item-title"><strong>${exp.company}</strong><br>${exp.role}</span>
              <span class="item-date">${exp.startDate} - ${exp.endDate}</span>
            </div>
            <ul>${exp.description.map(d => `<li>${d}</li>`).join('')}</ul>
          </div>
        `).join('')}
      </div>`;
    }
    if (key === 'education' && education?.length) {
      return `<div class="section"><h2 class="section-title">EDUCATION</h2>
        ${education.map(edu => `
          <div class="item">
            <div class="item-header">
              <span class="item-title"><strong>${edu.school}</strong><br>${edu.degree}</span>
              <span class="item-date">${edu.startDate} - ${edu.endDate}</span>
            </div>
          </div>
        `).join('')}
      </div>`;
    }
    if (key === 'skills' && skills?.length) {
      return `<div class="section"><h2 class="section-title">SKILLS</h2><p>${skills.join(', ')}</p></div>`;
    }
    return '';
  };

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Space+Mono:wght@400;700&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #f0f0f0; display: flex; justify-content: center; padding: 20px; }
        .resume-page {
          width: 210mm; min-height: 297mm; background: white;
          padding: 15mm; font-family: '${font}', monospace;
          box-shadow: 0 4px 10px rgba(0,0,0,0.1);
          color: #000; display: grid; grid-template-columns: 1fr 1fr; gap: 10mm;
        }
        @media print {
          body { padding: 0; background: white; }
          .resume-page { box-shadow: none; margin: 0; width: 210mm; height: 297mm; }
        }
        .header { grid-column: 1 / -1; border-bottom: 2px solid #000; padding-bottom: 10px; margin-bottom: 10px; }
        .name { font-size: 24px; font-weight: 700; text-transform: uppercase; }
        .title { font-size: 12px; margin-top: 4px; }
        .contact { font-size: 10px; margin-top: 8px; }
        .col-left { grid-column: 1 / 2; }
        .col-right { grid-column: 2 / 3; }
        .section { margin-bottom: 20px; }
        .section-title {
          font-size: 12px; font-weight: 700; text-transform: uppercase;
          background: #000; color: #fff; padding: 4px 8px; display: inline-block;
          margin-bottom: 12px;
        }
        p, li { font-size: 10px; line-height: 1.5; }
        ul { margin-left: 14px; margin-top: 4px; }
        .item { margin-bottom: 16px; }
        .item-header { margin-bottom: 6px; }
        .item-title { display: block; font-size: 11px; }
        .item-date { font-size: 10px; color: #666; display: block; margin-top: 2px; }
      </style>
    </head>
    <body>
      <div class="resume-page">
        <div class="header">
          <div class="name">${personal.name}</div>
          <div class="title">${personal.title}</div>
          <div class="contact">${getContactString(personal, ' | ')}</div>
        </div>
        <div class="col-left">
          ${generateSections({ ...resume, hiddenSections: [...(resume.hiddenSections || []), 'skills', 'education'] }, renderSection)}
        </div>
        <div class="col-right">
          ${generateSections({ ...resume, hiddenSections: [...(resume.hiddenSections || []), 'summary', 'experience'] }, renderSection)}
        </div>
      </div>
    </body>
    </html>
  `;
}

// TEMPLATE 20: STARK
function renderStark(resume: ResumeData): string {
  const font = resume.font || 'Helvetica Neue';
  const { personal, experience, education, skills } = resume.formData;
  
  const renderSection = (key: string) => {
    if (key === 'summary' && personal.summary) {
      return `<div class="section"><h2 class="section-title">SUMMARY</h2><p>${personal.summary}</p></div>`;
    }
    if (key === 'experience' && experience?.length) {
      return `<div class="section"><h2 class="section-title">EXPERIENCE</h2>
        ${experience.map(exp => `
          <div class="item">
            <div class="item-header">
              <span class="item-title"><strong>${exp.company}</strong>, ${exp.role}</span>
              <span class="item-date">${exp.startDate} - ${exp.endDate}</span>
            </div>
            <ul>${exp.description.map(d => `<li>${d}</li>`).join('')}</ul>
          </div>
        `).join('')}
      </div>`;
    }
    if (key === 'education' && education?.length) {
      return `<div class="section"><h2 class="section-title">EDUCATION</h2>
        ${education.map(edu => `
          <div class="item">
            <div class="item-header">
              <span class="item-title"><strong>${edu.school}</strong>, ${edu.degree}</span>
              <span class="item-date">${edu.startDate} - ${edu.endDate}</span>
            </div>
          </div>
        `).join('')}
      </div>`;
    }
    if (key === 'skills' && skills?.length) {
      return `<div class="section"><h2 class="section-title">SKILLS</h2><p>${skills.join(', ')}</p></div>`;
    }
    return '';
  };

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #f0f0f0; display: flex; justify-content: center; padding: 20px; }
        .resume-page {
          width: 210mm; min-height: 297mm; background: white;
          padding: 25mm 20mm; font-family: '${font}', Helvetica, Arial, sans-serif;
          box-shadow: 0 4px 10px rgba(0,0,0,0.1);
          color: #000;
        }
        @media print {
          body { padding: 0; background: white; }
          .resume-page { box-shadow: none; margin: 0; width: 210mm; height: 297mm; }
        }
        .header { margin-bottom: 40px; }
        .name { font-size: 40px; font-weight: bold; letter-spacing: -1px; line-height: 1; }
        .contact { font-size: 11px; margin-top: 12px; color: #666; }
        .section { margin-bottom: 24px; }
        .section-title {
          font-size: 10px; font-weight: bold; text-transform: uppercase;
          letter-spacing: 2px; margin-bottom: 16px; color: #888;
        }
        p, li { font-size: 13px; line-height: 1.6; }
        ul { margin-left: 16px; margin-top: 6px; }
        .item { margin-bottom: 20px; }
        .item-header { display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 4px; }
        .item-title { font-size: 14px; }
        .item-date { font-size: 11px; color: #888; }
      </style>
    </head>
    <body>
      <div class="resume-page">
        <div class="header">
          <div class="name">${personal.name}</div>
          <div class="contact">${personal.title}<br>${getContactString(personal, ' | ')}</div>
        </div>
        ${generateSections(resume, renderSection)}
      </div>
    </body>
    </html>
  `;
}
