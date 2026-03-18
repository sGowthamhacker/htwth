
import { ResumeData, getCommonStyles } from './templates/types';
import {
  renderObsidian,
  renderAurora,
  renderNeon,
  renderBlush,
  renderMetro,
  renderSlate,
  renderHorizon,
  renderIvory,
  renderGrid,
  renderStark
} from './templates/category2';

export function buildResumeHTML(resume: ResumeData): string {
  switch (resume.template) {
    case 'swiss':
      return renderSwiss(resume);
    case 'federal':
      return renderFederal(resume);
    case 'crisp':
      return renderCrisp(resume);
    case 'neat':
      return renderNeat(resume);
    case 'pure':
      return renderPure(resume);
    case 'compact':
      return renderCompact(resume);
    case 'mono':
      return renderMono(resume);
    case 'classic':
      return renderClassic(resume);
    case 'minimal-line':
      return renderMinimalLine(resume);
    case 'notepad':
      return renderNotepad(resume);
    case 'obsidian':
      return renderObsidian(resume);
    case 'aurora':
      return renderAurora(resume);
    case 'neon':
      return renderNeon(resume);
    case 'blush':
      return renderBlush(resume);
    case 'metro':
      return renderMetro(resume);
    case 'slate':
      return renderSlate(resume);
    case 'horizon':
      return renderHorizon(resume);
    case 'ivory':
      return renderIvory(resume);
    case 'grid':
      return renderGrid(resume);
    case 'stark':
      return renderStark(resume);
    default:
      return renderSwiss(resume);
  }
}

function renderSwiss(resume: ResumeData) {
  const { personal, experience, education, skills, projects, awards, languages } = resume.formData;
  const accent = resume.accent || '#c8392b';
  
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;700&family=DM+Sans:wght@400;700&display=swap');
        ${getCommonStyles(resume)}
        body { font-family: 'Inter', sans-serif; }
        .header { margin-bottom: 24px; }
        .name { font-size: 28px; font-weight: bold; color: black; margin: 0; }
        .title { font-size: 14px; color: #666; margin-top: 4px; }
        .contact { font-size: 11px; color: #666; margin-top: 8px; }
        .contact span:not(:last-child)::after { content: ' · '; margin: 0 4px; }
        .section-title { font-size: 8px; letter-spacing: .2em; border-bottom: 1px solid #000; margin-bottom: 8px; padding-bottom: 2px; }
        .body-text { font-size: 12.5px; color: #333; line-height: 1.6; }
        .item-title { font-weight: bold; }
        .item-subtitle { font-style: italic; color: #444; }
        .date { font-family: monospace; font-size: 11px; color: #666; float: right; }
        ul { margin-left: 14px; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="resume-page">
        <div class="header">
          <h1 class="name">${personal.firstName} ${personal.lastName}</h1>
          <div class="title">${personal.title}</div>
          <div class="contact">
            ${personal.email ? `<span>${personal.email}</span>` : ''}
            ${personal.phone ? `<span>${personal.phone}</span>` : ''}
            ${personal.location ? `<span>${personal.location}</span>` : ''}
            ${personal.website ? `<span>${personal.website}</span>` : ''}
          </div>
        </div>

        ${personal.summary && !resume.hiddenSections.includes('summary') ? `
          <div class="section">
            <div class="section-title">SUMMARY</div>
            <div class="body-text">${personal.summary}</div>
          </div>
        ` : ''}

        ${experience.length > 0 && !resume.hiddenSections.includes('experience') ? `
          <div class="section">
            <div class="section-title">EXPERIENCE</div>
            ${experience.map(exp => `
              <div class="item">
                <div class="item-header">
                  <span class="item-title">${exp.position}</span>
                  <span class="date">${exp.startDate} – ${exp.current ? 'Present' : exp.endDate}</span>
                </div>
                <div class="item-subtitle">${exp.company} ${exp.location ? `| ${exp.location}` : ''}</div>
                <div class="body-text">${exp.description ? `<ul>${exp.description.split('\n').map(l => `<li>${l}</li>`).join('')}</ul>` : ''}</div>
              </div>
            `).join('')}
          </div>
        ` : ''}

        ${education.length > 0 && !resume.hiddenSections.includes('education') ? `
          <div class="section">
            <div class="section-title">EDUCATION</div>
            ${education.map(edu => `
              <div class="item">
                <div class="item-header">
                  <span class="item-title">${edu.degree} in ${edu.field}</span>
                  <span class="date">${edu.startDate} – ${edu.endDate}</span>
                </div>
                <div class="item-subtitle">${edu.school} ${edu.location ? `| ${edu.location}` : ''}</div>
              </div>
            `).join('')}
          </div>
        ` : ''}

        ${skills.length > 0 && !resume.hiddenSections.includes('skills') ? `
          <div class="section">
            <div class="section-title">SKILLS</div>
            <div class="body-text">${skills.map(s => s.name).join(', ')}</div>
          </div>
        ` : ''}
      </div>
    </body>
    </html>
  `;
}

function renderFederal(resume: ResumeData) {
  const { personal, experience, education, skills } = resume.formData;
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Georgia&display=swap');
        ${getCommonStyles(resume)}
        body { font-family: 'Georgia', serif; }
        .resume-page { padding: 15mm; }
        .header { text-align: center; margin-bottom: 20px; }
        .name { font-size: 24px; font-weight: bold; margin: 0; }
        .title { font-size: 13px; color: #666; margin-top: 4px; }
        .contact { font-size: 11px; margin-top: 8px; }
        .contact span:not(:last-child)::after { content: ' | '; margin: 0 4px; }
        .section-title { font-size: 11px; font-weight: bold; text-transform: uppercase; border-bottom: 2px solid black; margin-bottom: 10px; margin-top: 14px; }
        .body-text { font-size: 12px; line-height: 1.7; }
        .item { margin-bottom: 14px; }
        .item-header { display: flex; justify-content: space-between; font-weight: bold; }
        .date { float: right; font-weight: normal; }
      </style>
    </head>
    <body>
      <div class="resume-page">
        <div class="header">
          <h1 class="name">${personal.firstName} ${personal.lastName}</h1>
          <div class="title">${personal.title}</div>
          <div class="contact">
            ${personal.email ? `<span>${personal.email}</span>` : ''}
            ${personal.phone ? `<span>${personal.phone}</span>` : ''}
            ${personal.location ? `<span>${personal.location}</span>` : ''}
          </div>
        </div>
        
        ${experience.length > 0 ? `
          <div class="section">
            <div class="section-title">PROFESSIONAL EXPERIENCE</div>
            ${experience.map(exp => `
              <div class="item">
                <div class="item-header">
                  <span>${exp.position.toUpperCase()}, ${exp.company.toUpperCase()}</span>
                  <span class="date">${exp.startDate} – ${exp.current ? 'Present' : exp.endDate}</span>
                </div>
                <div class="body-text">${exp.description ? `<ul>${exp.description.split('\n').map(l => `<li>${l}</li>`).join('')}</ul>` : ''}</div>
              </div>
            `).join('')}
          </div>
        ` : ''}
      </div>
    </body>
    </html>
  `;
}

function renderCrisp(resume: ResumeData) {
  const { personal, experience, education, skills } = resume.formData;
  const accent = resume.accent || '#c8392b';
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@400;600&display=swap');
        ${getCommonStyles(resume)}
        body { font-family: 'IBM Plex Sans', sans-serif; color: #111; }
        .name { font-size: 26px; font-weight: 600; margin: 0; }
        .header-meta { font-size: 12px; color: #666; margin-top: 4px; }
        .section-title { font-size: 10px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.1em; color: ${accent}; border: none; margin-top: 20px; }
        .body-text { font-size: 12.5px; line-height: 1.55; }
        .item-header { display: flex; justify-content: space-between; font-weight: 600; }
        .date { font-size: 11px; color: #666; font-weight: normal; }
      </style>
    </head>
    <body>
      <div class="resume-page">
        <div class="header">
          <h1 class="name">${personal.firstName} ${personal.lastName}</h1>
          <div class="header-meta">
            ${personal.title} | ${personal.email} | ${personal.phone} | ${personal.location}
          </div>
        </div>
        <div class="section">
          <div class="section-title">Experience</div>
          ${experience.map(exp => `
            <div class="item">
              <div class="item-header">
                <span>${exp.company}</span>
                <span class="date">${exp.startDate} – ${exp.endDate}</span>
              </div>
              <div class="body-text"><strong>${exp.position}</strong></div>
              <div class="body-text">${exp.description ? `<ul>${exp.description.split('\n').map(l => `<li>${l}</li>`).join('')}</ul>` : ''}</div>
            </div>
          `).join('')}
        </div>
        <div class="section">
          <div class="section-title">Skills</div>
          <div class="body-text">${skills.map(s => s.name).join(', ')}</div>
        </div>
      </div>
    </body>
    </html>
  `;
}

function renderNeat(resume: ResumeData) {
  const { personal, experience, education, skills } = resume.formData;
  const accent = resume.accent || '#c8392b';
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Raleway:wght@400;700&display=swap');
        ${getCommonStyles(resume)}
        body { font-family: 'Raleway', sans-serif; }
        .name { font-size: 27px; margin: 0; }
        .header-line { height: 1px; background: ${accent}; margin: 8px 0; }
        .contact { font-size: 11px; color: #666; }
        .contact span:not(:last-child)::after { content: ' • '; margin: 0 4px; }
        .section-title { font-size: 12px; font-weight: bold; text-transform: none; border: none; border-left: 3px solid ${accent}; padding-left: 8px; margin-top: 20px; }
        .body-text { font-size: 13px; line-height: 1.6; }
        .bullets { list-style-type: none; }
        .bullets li::before { content: '– '; }
      </style>
    </head>
    <body>
      <div class="resume-page">
        <h1 class="name">${personal.firstName} ${personal.lastName}</h1>
        <div class="header-line"></div>
        <div class="contact">
          <span>${personal.email}</span><span>${personal.phone}</span><span>${personal.location}</span>
        </div>
        <div class="section">
          <div class="section-title">Experience</div>
          ${experience.map(exp => `
            <div class="item">
              <div class="item-header"><strong>${exp.position}</strong> <span class="date">${exp.startDate} – ${exp.endDate}</span></div>
              <div>${exp.company}</div>
              <div class="body-text"><ul class="bullets">${exp.description.split('\n').map(l => `<li>${l}</li>`).join('')}</ul></div>
            </div>
          `).join('')}
        </div>
      </div>
    </body>
    </html>
  `;
}

function renderPure(resume: ResumeData) {
  const { personal, experience, education, skills } = resume.formData;
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Source+Sans+Pro:wght@300;400&display=swap');
        ${getCommonStyles(resume)}
        body { font-family: 'Source Sans Pro', sans-serif; }
        .name { font-size: 32px; font-weight: 300; margin: 0; }
        .title { font-size: 13px; margin-top: 4px; color: #333; }
        .contact { font-size: 10px; font-family: monospace; color: #888; letter-spacing: 1px; margin-top: 10px; }
        .section-title { font-size: 11px; font-weight: 400; text-transform: uppercase; letter-spacing: 3px; border: none; margin-top: 30px; margin-bottom: 15px; color: #000; }
        .body-text { font-size: 13px; line-height: 1.7; color: #444; }
        ul { list-style-type: none; }
        li::before { content: '▪ '; font-size: 10px; margin-right: 8px; }
      </style>
    </head>
    <body>
      <div class="resume-page">
        <h1 class="name">${personal.firstName} ${personal.lastName}</h1>
        <div class="title">${personal.title}</div>
        <div class="contact">${personal.email} / ${personal.phone} / ${personal.location}</div>
        <div class="section">
          <div class="section-title">Experience</div>
          ${experience.map(exp => `
            <div class="item">
              <div class="item-header"><strong>${exp.position}</strong></div>
              <div style="font-size: 12px; margin-bottom: 5px;">${exp.company} | ${exp.startDate} – ${exp.endDate}</div>
              <div class="body-text"><ul>${exp.description.split('\n').map(l => `<li>${l}</li>`).join('')}</ul></div>
            </div>
          `).join('')}
        </div>
      </div>
    </body>
    </html>
  `;
}

function renderCompact(resume: ResumeData) {
  const { personal, experience, education, skills } = resume.formData;
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Roboto:wght@400;700&display=swap');
        ${getCommonStyles(resume)}
        body { font-family: 'Roboto', sans-serif; }
        .resume-page { padding: 10mm; }
        .name-title { font-size: 22px; font-weight: bold; margin: 0; }
        .contact { font-size: 10px; margin-top: 2px; }
        .contact span:not(:last-child)::after { content: ' | '; }
        .section-title { font-size: 9px; color: #666; text-transform: uppercase; border: none; margin-top: 10px; margin-bottom: 4px; }
        .body-text { font-size: 11.5px; line-height: 1.4; color: #333; }
        .item { margin-bottom: 6px; }
        .item-header { display: flex; justify-content: space-between; font-weight: bold; }
        .date { font-weight: normal; font-size: 10px; }
        ul { margin-left: 10px; }
        li { margin-bottom: 1px; }
      </style>
    </head>
    <body>
      <div class="resume-page">
        <div class="name-title">${personal.firstName} ${personal.lastName} — ${personal.title}</div>
        <div class="contact">
          <span>${personal.email}</span><span>${personal.phone}</span><span>${personal.location}</span>
        </div>
        <div class="section">
          <div class="section-title">Experience</div>
          ${experience.map(exp => `
            <div class="item">
              <div class="item-header">
                <span>${exp.company}</span>
                <span class="date">${exp.location} | ${exp.startDate} – ${exp.endDate}</span>
              </div>
              <div class="body-text"><strong>${exp.position}</strong></div>
              <div class="body-text"><ul>${exp.description.split('\n').map(l => `<li>${l}</li>`).join('')}</ul></div>
            </div>
          `).join('')}
        </div>
      </div>
    </body>
    </html>
  `;
}

function renderMono(resume: ResumeData) {
  const { personal, experience, education, skills } = resume.formData;
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono&display=swap');
        ${getCommonStyles(resume)}
        body { font-family: 'JetBrains Mono', monospace; }
        .name { font-size: 20px; margin: 0; }
        .title { font-size: 12px; margin-top: 4px; }
        .contact { font-size: 11px; margin-top: 10px; }
        .section-title { font-size: 12px; border: none; margin-top: 20px; }
        .body-text { font-size: 11.5px; line-height: 1.6; }
        ul { list-style-type: none; }
        li::before { content: '> '; }
        .date { float: right; }
      </style>
    </head>
    <body>
      <div class="resume-page">
        <div class="name">${personal.firstName} ${personal.lastName}</div>
        <div class="title">${personal.title}</div>
        <div class="contact">
          email: ${personal.email}<br>
          phone: ${personal.phone}<br>
          loc: ${personal.location}
        </div>
        <div class="section">
          <div class="section-title">## EXPERIENCE</div>
          ${experience.map(exp => `
            <div class="item">
              <div class="item-header">
                <strong>${exp.company}</strong>
                <span class="date">[${exp.startDate} - ${exp.endDate}]</span>
              </div>
              <div>${exp.position}</div>
              <div class="body-text"><ul>${exp.description.split('\n').map(l => `<li>${l}</li>`).join('')}</ul></div>
            </div>
          `).join('')}
        </div>
      </div>
    </body>
    </html>
  `;
}

function renderClassic(resume: ResumeData) {
  const { personal, experience, education, skills } = resume.formData;
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Libre+Baskerville&display=swap');
        ${getCommonStyles(resume)}
        body { font-family: 'Libre Baskerville', serif; text-align: center; }
        .name { font-size: 26px; font-weight: bold; margin: 0; }
        .header-line { height: 1px; background: #000; width: 100px; margin: 10px auto; }
        .contact { font-variant: small-caps; font-size: 11px; margin-bottom: 20px; }
        .section-title { font-variant: small-caps; font-size: 13px; border-top: 1px solid #000; border-bottom: 1px solid #000; padding: 4px 0; margin-top: 20px; }
        .body-text { font-size: 12px; line-height: 1.65; text-align: left; }
        .item { text-align: left; }
        .item-header { display: flex; justify-content: space-between; font-weight: bold; }
        ul { list-style-type: disc; margin-left: 20px; }
      </style>
    </head>
    <body>
      <div class="resume-page">
        <h1 class="name">${personal.firstName} ${personal.lastName}</h1>
        <div class="header-line"></div>
        <div class="contact">${personal.email} • ${personal.phone} • ${personal.location}</div>
        <div class="section">
          <div class="section-title">Experience</div>
          ${experience.map(exp => `
            <div class="item">
              <div class="item-header">
                <span>${exp.company}</span>
                <span>${exp.startDate} – ${exp.endDate}</span>
              </div>
              <div style="font-style: italic;">${exp.position}</div>
              <div class="body-text"><ul>${exp.description.split('\n').map(l => `<li>${l}</li>`).join('')}</ul></div>
            </div>
          `).join('')}
        </div>
      </div>
    </body>
    </html>
  `;
}

function renderMinimalLine(resume: ResumeData) {
  const { personal, experience, education, skills } = resume.formData;
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Nunito+Sans:wght@300;400;700&display=swap');
        ${getCommonStyles(resume)}
        body { font-family: 'Nunito Sans', sans-serif; }
        .name { font-size: 28px; font-weight: 300; margin: 0; }
        .header-line { height: 1px; background: #000; margin: 10px 0; }
        .contact { font-size: 11px; color: #666; }
        .contact span:not(:last-child)::after { content: ' • '; }
        .section-title-row { display: flex; align-items: center; margin-top: 20px; margin-bottom: 10px; }
        .section-line { flex-grow: 1; height: 1px; background: #eee; margin-right: 10px; }
        .section-title { font-size: 10px; text-transform: uppercase; border: none; margin: 0; }
        .body-text { font-size: 12.5px; line-height: 1.6; }
        .item-header { display: flex; justify-content: space-between; }
        .company { font-size: 13px; font-weight: bold; }
        .position { font-size: 12px; font-style: italic; }
      </style>
    </head>
    <body>
      <div class="resume-page">
        <h1 class="name">${personal.firstName} ${personal.lastName}</h1>
        <div class="header-line"></div>
        <div class="contact">
          <span>${personal.email}</span><span>${personal.phone}</span><span>${personal.location}</span>
        </div>
        <div class="section">
          <div class="section-title-row"><div class="section-line"></div><div class="section-title">Experience</div></div>
          ${experience.map(exp => `
            <div class="item">
              <div class="item-header">
                <span class="company">${exp.company}</span>
                <span class="date">${exp.startDate} – ${exp.endDate}</span>
              </div>
              <div class="position">${exp.position}</div>
              <div class="body-text"><ul>${exp.description.split('\n').map(l => `<li>${l}</li>`).join('')}</ul></div>
            </div>
          `).join('')}
        </div>
      </div>
    </body>
    </html>
  `;
}

function renderNotepad(resume: ResumeData) {
  const { personal, experience, education, skills } = resume.formData;
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Caveat&family=PT+Sans&display=swap');
        ${getCommonStyles(resume)}
        body { font-family: 'PT Sans', sans-serif; }
        .name { font-family: 'Caveat', cursive; font-size: 36px; margin: 0; }
        .title { font-size: 13px; margin-top: 4px; }
        .contact { font-size: 11px; margin-top: 8px; }
        .section-title { font-family: 'Caveat', cursive; font-size: 16px; border: none; border-bottom: 1px dashed #000; margin-top: 20px; text-transform: none; }
        .body-text { font-size: 12.5px; line-height: 1.6; }
        ul { list-style-type: none; }
        li::before { content: '○ '; font-size: 11px; margin-right: 8px; }
      </style>
    </head>
    <body>
      <div class="resume-page">
        <h1 class="name">${personal.firstName} ${personal.lastName}</h1>
        <div class="title">${personal.title}</div>
        <div class="contact">${personal.email} | ${personal.phone} | ${personal.location}</div>
        <div class="section">
          <div class="section-title">Experience</div>
          ${experience.map(exp => `
            <div class="item">
              <div class="item-header"><strong>${exp.position}</strong> <span class="date">${exp.startDate} – ${exp.endDate}</span></div>
              <div>${exp.company}</div>
              <div class="body-text"><ul>${exp.description.split('\n').map(l => `<li>${l}</li>`).join('')}</ul></div>
            </div>
          `).join('')}
        </div>
      </div>
    </body>
    </html>
  `;
}
