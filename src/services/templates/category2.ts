import { ResumeData, getCommonStyles } from './types';

export function renderObsidian(resume: ResumeData) {
  const { personal, experience, education, skills } = resume.formData;
  const accent = resume.accent || '#c8392b';
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;800&family=DM+Sans:wght@400;700&display=swap');
        ${getCommonStyles(resume)}
        body { font-family: 'DM Sans', sans-serif; }
        .resume-page { padding: 0; }
        .header { background: #0a0a0a; color: white; padding: 30mm 16mm 20mm 16mm; }
        .name { font-family: 'Syne', sans-serif; font-size: 32px; font-weight: 800; margin: 0; }
        .title { font-size: 14px; color: ${accent}; margin-top: 4px; }
        .contact { font-size: 11px; color: #888; font-family: monospace; margin-top: 10px; }
        .contact span:not(:last-child)::after { content: ' | '; margin: 0 4px; }
        .main-content { padding: 16mm; background: #ffffff; }
        .section-title { font-size: 11px; text-transform: uppercase; color: ${accent}; letter-spacing: .15em; border: none; border-left: 2px solid ${accent}; padding-left: 8px; margin-top: 24px; }
        .body-text { font-size: 13px; color: #333; line-height: 1.6; }
        .skill-tag { display: inline-block; background: ${accent}; color: white; padding: 2px 8px; border-radius: 8px; font-size: 11px; margin-right: 4px; margin-bottom: 4px; }
        .item-header { font-weight: bold; }
        .date { font-size: 11px; color: #666; font-weight: normal; }
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
        <div class="main-content">
          ${experience.length > 0 ? `
            <div class="section">
              <div class="section-title">Experience</div>
              ${experience.map(exp => `
                <div class="item">
                  <div class="item-header">
                    <span>${exp.company}</span>
                    <span class="date">${exp.startDate} – ${exp.endDate}</span>
                  </div>
                  <div style="font-style: italic; font-size: 12px; margin-bottom: 4px;">${exp.position}</div>
                  <div class="body-text">${exp.description ? `<ul>${exp.description.split('\n').map((l: string) => `<li>${l}</li>`).join('')}</ul>` : ''}</div>
                </div>
              `).join('')}
            </div>
          ` : ''}
          ${skills.length > 0 ? `
            <div class="section">
              <div class="section-title">Skills</div>
              <div class="body-text">${skills.map(s => `<span class="skill-tag">${s.name}</span>`).join('')}</div>
            </div>
          ` : ''}
        </div>
      </div>
    </body>
    </html>
  `;
}

export function renderAurora(resume: ResumeData) {
  const { personal, experience, education, skills } = resume.formData;
  const accent = resume.accent || '#c8392b';
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,wght@0,400;1,700&family=DM+Sans:wght@400;700&display=swap');
        ${getCommonStyles(resume)}
        body { font-family: 'DM Sans', sans-serif; }
        .resume-page { padding-top: 0; }
        .top-bar { height: 4px; background: linear-gradient(90deg, ${accent}, transparent); width: 100%; margin-bottom: 16mm; }
        .name { font-family: 'Fraunces', serif; font-size: 30px; font-weight: 700; font-style: italic; margin: 0; }
        .name-line { height: 1px; background: linear-gradient(90deg, ${accent}, transparent); margin: 8px 0; }
        .title { font-size: 13px; color: #666; }
        .contact { font-size: 11px; margin-top: 8px; }
        .contact span:not(:last-child)::after { content: ' ● '; color: ${accent}; margin: 0 6px; font-size: 8px; }
        .section-title-wrap { display: flex; align-items: baseline; border: none; margin-top: 24px; margin-bottom: 12px; }
        .section-title-main { font-family: 'Fraunces', serif; font-size: 14px; font-style: italic; margin-right: 8px; color: #111; }
        .section-title-sub { font-size: 9px; text-transform: uppercase; color: #888; }
        .body-text { font-size: 12.5px; line-height: 1.6; color: #333; }
        .skill-tag { display: inline-block; border-bottom: 2px solid ${accent}; margin-right: 8px; margin-bottom: 4px; font-size: 12px; }
        .item-header { font-weight: bold; }
        .date { font-size: 11px; color: #666; font-weight: normal; }
      </style>
    </head>
    <body>
      <div class="resume-page">
        <div class="top-bar"></div>
        <div class="header">
          <h1 class="name">${personal.firstName} ${personal.lastName}</h1>
          <div class="name-line"></div>
          <div class="title">${personal.title}</div>
          <div class="contact">
            ${personal.email ? `<span>${personal.email}</span>` : ''}
            ${personal.phone ? `<span>${personal.phone}</span>` : ''}
            ${personal.location ? `<span>${personal.location}</span>` : ''}
          </div>
        </div>
        ${experience.length > 0 ? `
          <div class="section">
            <div class="section-title-wrap">
              <span class="section-title-main">Experience</span>
              <span class="section-title-sub">Professional History</span>
            </div>
            ${experience.map(exp => `
              <div class="item">
                <div class="item-header">
                  <span>${exp.company}</span>
                  <span class="date">${exp.startDate} – ${exp.endDate}</span>
                </div>
                <div style="font-style: italic; font-size: 12px; margin-bottom: 4px;">${exp.position}</div>
                <div class="body-text">${exp.description ? `<ul>${exp.description.split('\n').map((l: string) => `<li>${l}</li>`).join('')}</ul>` : ''}</div>
              </div>
            `).join('')}
          </div>
        ` : ''}
        ${skills.length > 0 ? `
          <div class="section">
            <div class="section-title-wrap">
              <span class="section-title-main">Skills</span>
              <span class="section-title-sub">Core Competencies</span>
            </div>
            <div class="body-text">${skills.map(s => `<span class="skill-tag">${s.name}</span>`).join('')}</div>
          </div>
        ` : ''}
      </div>
    </body>
    </html>
  `;
}

export function renderNeon(resume: ResumeData) {
  const { personal, experience, education, skills } = resume.formData;
  const accent = resume.accent || '#c8392b';
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;700&display=swap');
        ${getCommonStyles(resume)}
        body { font-family: 'Space Grotesk', sans-serif; background: #0d0d0d; }
        .resume-page { background: #0d0d0d; color: #ccc; }
        @media print {
          body, .resume-page { background: white !important; color: black !important; }
          .name { color: black !important; }
          .body-text { color: #333 !important; }
          .skill-tag { background: white !important; color: black !important; border-color: #ccc !important; }
        }
        .name { font-size: 34px; font-weight: 800; color: white; margin: 0; }
        .title { font-size: 14px; color: ${accent}; margin-top: 4px; }
        .contact { font-size: 10px; color: #888; font-family: monospace; margin-top: 8px; }
        .contact span:not(:last-child)::after { content: ' | '; margin: 0 4px; }
        .section-title { font-size: 9px; text-transform: uppercase; color: ${accent}; letter-spacing: .2em; border-bottom: 1px solid ${accent}; box-shadow: 0 1px 8px rgba(200,57,43,0.3); margin-top: 24px; margin-bottom: 12px; padding-bottom: 4px; }
        .body-text { font-size: 12.5px; line-height: 1.6; }
        .skill-tag { display: inline-block; background: #1a1a1a; color: ${accent}; border: 1px solid ${accent}; padding: 2px 8px; border-radius: 4px; font-size: 11px; margin-right: 4px; margin-bottom: 4px; }
        .item-header { font-weight: bold; color: white; }
        @media print { .item-header { color: black !important; } }
        .date { font-size: 10px; color: ${accent}; font-family: monospace; font-weight: normal; }
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
            <div class="section-title">Experience</div>
            ${experience.map(exp => `
              <div class="item">
                <div class="item-header">
                  <span>${exp.company}</span>
                  <span class="date">${exp.startDate} – ${exp.endDate}</span>
                </div>
                <div style="font-size: 12px; margin-bottom: 4px; color: #aaa;">${exp.position}</div>
                <div class="body-text">${exp.description ? `<ul>${exp.description.split('\n').map((l: string) => `<li>${l}</li>`).join('')}</ul>` : ''}</div>
              </div>
            `).join('')}
          </div>
        ` : ''}
        ${skills.length > 0 ? `
          <div class="section">
            <div class="section-title">Skills</div>
            <div class="body-text">${skills.map(s => `<span class="skill-tag">${s.name}</span>`).join('')}</div>
          </div>
        ` : ''}
      </div>
    </body>
    </html>
  `;
}

export function renderBlush(resume: ResumeData) {
  const { personal, experience, education, skills } = resume.formData;
  const accent = resume.accent || '#c8392b';
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;1,400&family=Lato:wght@400;700&display=swap');
        ${getCommonStyles(resume)}
        body { font-family: 'Lato', sans-serif; }
        .resume-page { padding: 0; }
        .header { background: #fdf6f0; padding: 20mm 16mm; text-align: center; }
        .name { font-family: 'Playfair Display', serif; font-size: 30px; color: #2d2d2d; margin: 0; }
        .title { font-size: 13px; color: #888; font-style: italic; margin-top: 4px; }
        .contact { font-size: 11px; color: #999; margin-top: 8px; }
        .contact span:not(:last-child)::after { content: ' ♦ '; font-size: 8px; margin: 0 6px; }
        .main-content { padding: 16mm; }
        .section-title { font-family: 'Playfair Display', serif; font-size: 13px; font-style: italic; color: ${accent}; border-bottom: 1px dashed rgba(200,57,43,0.3); margin-top: 20px; margin-bottom: 12px; padding-bottom: 4px; }
        .body-text { font-size: 12.5px; line-height: 1.65; color: #555; }
        .skill-tag { display: inline-block; background: #fde8e4; color: ${accent}; padding: 4px 10px; border-radius: 12px; font-size: 11px; margin-right: 6px; margin-bottom: 6px; }
        .item-header { font-weight: bold; color: #333; }
        .date { font-size: 11px; color: #888; font-weight: normal; }
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
        <div class="main-content">
          ${experience.length > 0 ? `
            <div class="section">
              <div class="section-title">Experience</div>
              ${experience.map(exp => `
                <div class="item">
                  <div class="item-header">
                    <span>${exp.company}</span>
                    <span class="date">${exp.startDate} – ${exp.endDate}</span>
                  </div>
                  <div style="font-style: italic; font-size: 12px; margin-bottom: 4px; color: #666;">${exp.position}</div>
                  <div class="body-text">${exp.description ? `<ul>${exp.description.split('\n').map((l: string) => `<li>${l}</li>`).join('')}</ul>` : ''}</div>
                </div>
              `).join('')}
            </div>
          ` : ''}
          ${skills.length > 0 ? `
            <div class="section">
              <div class="section-title">Skills</div>
              <div class="body-text">${skills.map(s => `<span class="skill-tag">${s.name}</span>`).join('')}</div>
            </div>
          ` : ''}
        </div>
      </div>
    </body>
    </html>
  `;
}

export function renderMetro(resume: ResumeData) {
  const { personal, experience, education, skills } = resume.formData;
  const accent = resume.accent || '#c8392b';
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Barlow:wght@400;600;700&display=swap');
        ${getCommonStyles(resume)}
        body { font-family: 'Barlow', sans-serif; }
        .resume-page { padding: 0; }
        .header { background: ${accent}; color: white; padding: 20mm 16mm; }
        .name { font-size: 30px; font-weight: 700; margin: 0; }
        .title { font-size: 13px; margin-top: 4px; }
        .contact { font-size: 11px; margin-top: 8px; }
        .contact span:not(:last-child)::after { content: ' | '; margin: 0 6px; }
        .main-content { padding: 16mm; }
        .section-title { display: inline-block; background: ${accent}; color: white; font-size: 9px; text-transform: uppercase; padding: 4px 8px; border-radius: 4px; margin-top: 20px; margin-bottom: 12px; border: none; }
        .body-text { font-size: 13px; line-height: 1.6; color: #333; }
        .skill-tag { display: inline-block; border: 2px solid ${accent}; color: ${accent}; padding: 2px 8px; border-radius: 4px; font-size: 11px; font-weight: 600; margin-right: 6px; margin-bottom: 6px; }
        .item-header { font-weight: bold; color: ${accent}; font-size: 13px; }
        .position { font-size: 12px; color: #666; font-weight: 600; margin-bottom: 4px; }
        .date { font-size: 11px; color: #888; font-weight: normal; }
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
        <div class="main-content">
          ${experience.length > 0 ? `
            <div class="section">
              <div class="section-title">Experience</div>
              ${experience.map(exp => `
                <div class="item">
                  <div class="item-header">
                    <span>${exp.company}</span>
                    <span class="date">${exp.startDate} – ${exp.endDate}</span>
                  </div>
                  <div class="position">${exp.position}</div>
                  <div class="body-text">${exp.description ? `<ul>${exp.description.split('\n').map((l: string) => `<li>${l}</li>`).join('')}</ul>` : ''}</div>
                </div>
              `).join('')}
            </div>
          ` : ''}
          ${skills.length > 0 ? `
            <div class="section">
              <div class="section-title">Skills</div>
              <div class="body-text">${skills.map(s => `<span class="skill-tag">${s.name}</span>`).join('')}</div>
            </div>
          ` : ''}
        </div>
      </div>
    </body>
    </html>
  `;
}

export function renderSlate(resume: ResumeData) {
  const { personal, experience, education, skills } = resume.formData;
  const slate = '#2d3748';
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@400;600;700&display=swap');
        ${getCommonStyles(resume)}
        body { font-family: 'IBM Plex Sans', sans-serif; }
        .header { margin-bottom: 24px; border-bottom: 2px solid ${slate}; padding-bottom: 12px; }
        .name { font-size: 28px; font-weight: 700; color: ${slate}; margin: 0; }
        .title { font-size: 13px; color: #718096; margin-top: 4px; }
        .contact { font-size: 11px; color: #718096; margin-top: 8px; }
        .contact span:not(:last-child)::after { content: ' • '; margin: 0 6px; }
        .section-title { font-size: 10px; text-transform: uppercase; color: ${slate}; letter-spacing: .15em; border-bottom: 1px solid ${slate}; margin-top: 20px; margin-bottom: 12px; padding-bottom: 4px; }
        .body-text { font-size: 12.5px; line-height: 1.6; color: #4a5568; }
        .skill-tag { display: inline-block; background: #edf2f7; border: 1px solid ${slate}; color: ${slate}; padding: 2px 8px; border-radius: 12px; font-size: 11px; margin-right: 6px; margin-bottom: 6px; }
        .item-header { font-weight: 600; color: ${slate}; }
        .date { font-size: 11px; color: #718096; font-weight: normal; }
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
            <div class="section-title">Experience</div>
            ${experience.map(exp => `
              <div class="item">
                <div class="item-header">
                  <span>${exp.company}</span>
                  <span class="date">${exp.startDate} – ${exp.endDate}</span>
                </div>
                <div style="font-size: 12px; margin-bottom: 4px; color: #4a5568;">${exp.position}</div>
                <div class="body-text">${exp.description ? `<ul>${exp.description.split('\n').map((l: string) => `<li>${l}</li>`).join('')}</ul>` : ''}</div>
              </div>
            `).join('')}
          </div>
        ` : ''}
        ${skills.length > 0 ? `
          <div class="section">
            <div class="section-title">Skills</div>
            <div class="body-text">${skills.map(s => `<span class="skill-tag">${s.name}</span>`).join('')}</div>
          </div>
        ` : ''}
      </div>
    </body>
    </html>
  `;
}

export function renderHorizon(resume: ResumeData) {
  const { personal, experience, education, skills } = resume.formData;
  const accent = resume.accent || '#c8392b';
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;700&display=swap');
        ${getCommonStyles(resume)}
        body { font-family: 'Outfit', sans-serif; }
        .resume-page { padding: 0; }
        .header { background: linear-gradient(135deg, ${accent}, #800000); color: white; padding: 20mm 16mm; min-height: 110px; }
        .name { font-size: 32px; font-weight: 700; margin: 0; }
        .title { font-size: 14px; color: rgba(255,255,255,0.8); margin-top: 4px; }
        .contact { font-size: 11px; color: rgba(255,255,255,0.7); margin-top: 8px; }
        .contact span:not(:last-child)::after { content: ' | '; margin: 0 6px; }
        .main-content { padding: 16mm; }
        .section-title { font-size: 12px; font-weight: bold; color: ${accent}; border: none; margin-top: 20px; margin-bottom: 12px; display: flex; align-items: center; }
        .section-title::before { content: '●'; font-size: 6px; margin-right: 6px; }
        .body-text { font-size: 13px; line-height: 1.6; color: #444; }
        .skill-tag { display: inline-block; border: 1.5px solid ${accent}; color: #333; padding: 2px 10px; border-radius: 12px; font-size: 11px; margin-right: 6px; margin-bottom: 6px; }
        .item-header { font-weight: bold; color: #111; }
        .date { font-size: 11px; color: #777; font-weight: normal; }
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
        <div class="main-content">
          ${experience.length > 0 ? `
            <div class="section">
              <div class="section-title">Experience</div>
              ${experience.map(exp => `
                <div class="item">
                  <div class="item-header">
                    <span>${exp.company}</span>
                    <span class="date">${exp.startDate} – ${exp.endDate}</span>
                  </div>
                  <div style="font-size: 12px; margin-bottom: 4px; color: #555;">${exp.position}</div>
                  <div class="body-text">${exp.description ? `<ul>${exp.description.split('\n').map((l: string) => `<li>${l}</li>`).join('')}</ul>` : ''}</div>
                </div>
              `).join('')}
            </div>
          ` : ''}
          ${skills.length > 0 ? `
            <div class="section">
              <div class="section-title">Skills</div>
              <div class="body-text">${skills.map(s => `<span class="skill-tag">${s.name}</span>`).join('')}</div>
            </div>
          ` : ''}
        </div>
      </div>
    </body>
    </html>
  `;
}

export function renderIvory(resume: ResumeData) {
  const { personal, experience, education, skills } = resume.formData;
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,600;1,400;1,600&family=Mulish:wght@400;600&display=swap');
        ${getCommonStyles(resume)}
        body { font-family: 'Mulish', sans-serif; }
        .resume-page { background: #fdfbf7; }
        .header { text-align: center; margin-bottom: 24px; }
        .name { font-family: 'Cormorant Garamond', serif; font-size: 34px; font-weight: 600; font-style: italic; color: #1a1a1a; margin: 0; }
        .header-line { height: 0.5px; background: #ccc; width: 60%; margin: 12px auto; }
        .title { font-size: 13px; color: #777; }
        .contact { font-size: 11px; color: #999; margin-top: 8px; }
        .contact span:not(:last-child)::after { content: ' · '; margin: 0 6px; }
        .section-title-wrap { display: flex; align-items: baseline; border: none; margin-top: 24px; margin-bottom: 12px; }
        .section-title-main { font-family: 'Cormorant Garamond', serif; font-size: 16px; font-style: italic; color: #333; margin-right: 8px; }
        .section-title-sub { font-size: 8px; text-transform: uppercase; color: #888; }
        .body-text { font-size: 12.5px; line-height: 1.65; color: #555; }
        .item-header { font-weight: 600; color: #222; }
        .date { font-size: 11px; color: #888; font-weight: normal; }
      </style>
    </head>
    <body>
      <div class="resume-page">
        <div class="header">
          <h1 class="name">${personal.firstName} ${personal.lastName}</h1>
          <div class="header-line"></div>
          <div class="title">${personal.title}</div>
          <div class="contact">
            ${personal.email ? `<span>${personal.email}</span>` : ''}
            ${personal.phone ? `<span>${personal.phone}</span>` : ''}
            ${personal.location ? `<span>${personal.location}</span>` : ''}
          </div>
        </div>
        ${experience.length > 0 ? `
          <div class="section">
            <div class="section-title-wrap">
              <span class="section-title-main">Experience</span>
              <span class="section-title-sub">Professional History</span>
            </div>
            ${experience.map(exp => `
              <div class="item">
                <div class="item-header">
                  <span>${exp.company}</span>
                  <span class="date">${exp.startDate} – ${exp.endDate}</span>
                </div>
                <div style="font-style: italic; font-size: 12px; margin-bottom: 4px; color: #666;">${exp.position}</div>
                <div class="body-text">${exp.description ? `<ul>${exp.description.split('\n').map((l: string) => `<li>${l}</li>`).join('')}</ul>` : ''}</div>
              </div>
            `).join('')}
          </div>
        ` : ''}
        ${skills.length > 0 ? `
          <div class="section">
            <div class="section-title-wrap">
              <span class="section-title-main">Skills</span>
              <span class="section-title-sub">Core Competencies</span>
            </div>
            <div class="body-text" style="font-family: 'Cormorant Garamond', serif; font-style: italic; font-size: 14px;">
              ${skills.map(s => s.name).join(', ')}
            </div>
          </div>
        ` : ''}
      </div>
    </body>
    </html>
  `;
}

export function renderGrid(resume: ResumeData) {
  const { personal, experience, education, skills } = resume.formData;
  const accent = resume.accent || '#c8392b';
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;700&display=swap');
        ${getCommonStyles(resume)}
        body { font-family: 'Space Grotesk', sans-serif; }
        .header { position: relative; padding-left: 12px; margin-bottom: 24px; }
        .header::before { content: ''; position: absolute; left: 0; top: 0; bottom: 0; width: 4px; background: ${accent}; }
        .name { font-size: 28px; font-weight: 700; margin: 0; }
        .title { font-size: 13px; margin-top: 4px; color: #555; }
        .contact { font-size: 11px; margin-top: 8px; color: #777; }
        .contact span:not(:last-child)::after { content: ' | '; margin: 0 6px; }
        .section { position: relative; padding-top: 16px; }
        .section::before { content: ''; position: absolute; top: 0; left: 0; right: 0; border-top: 1px dashed #ccc; }
        .section-title { font-size: 10px; text-transform: uppercase; color: ${accent}; letter-spacing: .15em; border: none; margin-top: 0; margin-bottom: 12px; }
        .body-text { font-size: 12.5px; line-height: 1.6; color: #333; }
        .item-header { font-weight: 700; }
        .date { font-size: 11px; color: #777; font-variant-numeric: tabular-nums; font-weight: normal; }
        .skills-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; font-size: 12px; }
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
            <div class="section-title">Experience</div>
            ${experience.map(exp => `
              <div class="item">
                <div class="item-header">
                  <span>${exp.company}</span>
                  <span class="date">${exp.startDate} – ${exp.endDate}</span>
                </div>
                <div style="font-size: 12px; margin-bottom: 4px; color: #555;">${exp.position}</div>
                <div class="body-text">${exp.description ? `<ul>${exp.description.split('\n').map((l: string) => `<li>${l}</li>`).join('')}</ul>` : ''}</div>
              </div>
            `).join('')}
          </div>
        ` : ''}
        ${skills.length > 0 ? `
          <div class="section">
            <div class="section-title">Skills</div>
            <div class="skills-grid">
              ${skills.map(s => `<div>${s.name}</div>`).join('')}
            </div>
          </div>
        ` : ''}
      </div>
    </body>
    </html>
  `;
}

export function renderStark(resume: ResumeData) {
  const { personal, experience, education, skills } = resume.formData;
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:wght@400;700&display=swap');
        ${getCommonStyles(resume)}
        body { font-family: 'DM Sans', sans-serif; }
        .header { margin-bottom: 30px; }
        .name { font-family: 'Bebas Neue', display; font-size: 52px; color: #000; margin: 0; line-height: 1; }
        .title { font-size: 11px; text-transform: uppercase; letter-spacing: .1em; color: #666; margin-top: 8px; }
        .contact { font-size: 10px; color: #888; margin-top: 8px; }
        .contact span:not(:last-child)::after { content: ' / '; margin: 0 6px; }
        .section-title { font-size: 9px; text-transform: uppercase; letter-spacing: .2em; border-bottom: 2px solid #000; margin-top: 24px; margin-bottom: 12px; padding-bottom: 4px; }
        .body-text { font-size: 12.5px; line-height: 1.55; color: #333; }
        .item-header { font-weight: 700; color: #000; }
        .date { font-size: 10px; color: #666; font-weight: normal; }
        ul { list-style-type: none; }
        li::before { content: '— '; margin-right: 4px; }
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
            <div class="section-title">Experience</div>
            ${experience.map(exp => `
              <div class="item">
                <div class="item-header">
                  <span>${exp.company}</span>
                  <span class="date">${exp.startDate} – ${exp.endDate}</span>
                </div>
                <div style="font-size: 12px; margin-bottom: 4px; color: #555;">${exp.position}</div>
                <div class="body-text">${exp.description ? `<ul>${exp.description.split('\n').map((l: string) => `<li>${l}</li>`).join('')}</ul>` : ''}</div>
              </div>
            `).join('')}
          </div>
        ` : ''}
        ${skills.length > 0 ? `
          <div class="section">
            <div class="section-title">Skills</div>
            <div class="body-text">${skills.map(s => s.name).join(', ')}</div>
          </div>
        ` : ''}
      </div>
    </body>
    </html>
  `;
}
