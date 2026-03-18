export interface ResumeData {
  template: string;
  accent: string;
  font: string;
  hiddenSections: string[];
  sectionOrder: string[];
  autoAlign?: boolean;
  formData: {
    personal: {
      firstName: string;
      lastName: string;
      email: string;
      phone: string;
      location: string;
      website: string;
      title: string;
      summary: string;
      photo?: string;
    };
    experience: any[];
    education: any[];
    skills: any[];
    projects: any[];
    awards: any[];
    languages: any[];
  };
}

export function getCommonStyles(resume: ResumeData) {
  return `
    * { box-sizing: border-box; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    body { margin: 0; padding: 0; background: #f0f0f0; font-family: ${resume.font || 'Inter'}, sans-serif; }
    .resume-page {
      width: 210mm;
      min-height: 297mm;
      background: white;
      padding: 14mm 16mm;
      box-sizing: border-box;
      font-size: 12.5px;
      line-height: 1.55;
      overflow: hidden;
      margin: 10mm auto;
      box-shadow: 0 0 10px rgba(0,0,0,0.1);
      position: relative;
      ${resume.autoAlign ? `
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      ` : ''}
    }
    @media print {
      @page {
        margin: 0;
        size: A4;
      }
      body { background: white; }
      .resume-page { 
        width: 210mm;
        height: 297mm;
        min-height: 297mm;
        box-shadow: none !important;
        margin: 0 !important;
        padding: 14mm 16mm !important;
        ${resume.autoAlign ? `
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        ` : ''}
      }
    }
    ul { padding: 0; margin: 0; list-style-position: inside; }
    li { margin-bottom: 4px; }
    .section { 
      margin-bottom: 18px; 
      ${resume.autoAlign ? 'margin-top: auto; margin-bottom: auto;' : ''}
    }
    .section-title { font-weight: bold; text-transform: uppercase; border-bottom: 1px solid #000; margin-bottom: 8px; }
    .item { margin-bottom: 12px; }
    .item-header { display: flex; justify-content: space-between; align-items: baseline; }
    .date { font-size: 0.9em; color: #666; }
  `;
}
