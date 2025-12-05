// LinkedIn integration service
// Supports manual data input and structured parsing

export interface LinkedInProfile {
  name?: string;
  headline?: string;
  summary?: string;
  experience?: Array<{
    title: string;
    company: string;
    duration?: string;
    description?: string;
  }>;
  education?: Array<{
    school: string;
    degree?: string;
    field?: string;
    duration?: string;
  }>;
  skills?: string[];
  certifications?: Array<{
    name: string;
    issuer?: string;
    date?: string;
  }>;
}

export class LinkedInService {
  /**
   * Extract LinkedIn profile data from URL or manual input
   * Since LinkedIn has strict anti-scraping measures, this supports:
   * 1. Manual JSON input from user
   * 2. Placeholder for future API integration
   */
  async extractProfileData(linkedInUrl: string, manualData?: LinkedInProfile): Promise<Array<{
    text: string;
    source: string;
    url?: string;
    metadata?: Record<string, any>;
  }>> {
    const chunks: Array<{
      text: string;
      source: string;
      url?: string;
      metadata?: Record<string, any>;
    }> = [];

    // If manual data is provided, parse and return it
    if (manualData) {
      return this.parseLinkedInProfile(manualData, linkedInUrl);
    }

    // Return a structured prompt for manual data entry
    chunks.push({
      text: `LinkedIn Profile URL: ${linkedInUrl}\n\nTo include LinkedIn data in the candidate's profile, please provide the profile information manually through the candidate edit page, or use a LinkedIn data export.`,
      source: 'linkedin',
      url: linkedInUrl,
      metadata: {
        url: linkedInUrl,
        extracted: false,
        requiresManualInput: true,
        instructions: 'Navigate to LinkedIn profile, copy visible information, and paste into candidate profile notes.',
      },
    });

    return chunks;
  }

  /**
   * Parse a structured LinkedIn profile into chunks
   */
  private parseLinkedInProfile(profile: LinkedInProfile, url?: string): Array<{
    text: string;
    source: string;
    url?: string;
    metadata?: Record<string, any>;
  }> {
    const chunks: Array<{
      text: string;
      source: string;
      url?: string;
      metadata?: Record<string, any>;
    }> = [];

    // Header section
    if (profile.name || profile.headline) {
      let headerText = '';
      if (profile.name) headerText += `Name: ${profile.name}\n`;
      if (profile.headline) headerText += `Headline: ${profile.headline}\n`;
      
      chunks.push({
        text: headerText.trim(),
        source: 'linkedin',
        url,
        metadata: { section: 'header', extracted: true },
      });
    }

    // Summary section
    if (profile.summary) {
      chunks.push({
        text: `Professional Summary:\n${profile.summary}`,
        source: 'linkedin',
        url,
        metadata: { section: 'summary', extracted: true },
      });
    }

    // Experience section
    if (profile.experience && profile.experience.length > 0) {
      profile.experience.forEach((exp, index) => {
        let expText = `Experience: ${exp.title} at ${exp.company}`;
        if (exp.duration) expText += `\nDuration: ${exp.duration}`;
        if (exp.description) expText += `\nDescription: ${exp.description}`;

        chunks.push({
          text: expText,
          source: 'linkedin',
          url,
          metadata: { section: 'experience', index, extracted: true },
        });
      });
    }

    // Education section
    if (profile.education && profile.education.length > 0) {
      profile.education.forEach((edu, index) => {
        let eduText = `Education: ${edu.school}`;
        if (edu.degree) eduText += `\nDegree: ${edu.degree}`;
        if (edu.field) eduText += `\nField: ${edu.field}`;
        if (edu.duration) eduText += `\nDuration: ${edu.duration}`;

        chunks.push({
          text: eduText,
          source: 'linkedin',
          url,
          metadata: { section: 'education', index, extracted: true },
        });
      });
    }

    // Skills section
    if (profile.skills && profile.skills.length > 0) {
      chunks.push({
        text: `Skills: ${profile.skills.join(', ')}`,
        source: 'linkedin',
        url,
        metadata: { section: 'skills', extracted: true },
      });
    }

    // Certifications section
    if (profile.certifications && profile.certifications.length > 0) {
      profile.certifications.forEach((cert, index) => {
        let certText = `Certification: ${cert.name}`;
        if (cert.issuer) certText += `\nIssuer: ${cert.issuer}`;
        if (cert.date) certText += `\nDate: ${cert.date}`;

        chunks.push({
          text: certText,
          source: 'linkedin',
          url,
          metadata: { section: 'certification', index, extracted: true },
        });
      });
    }

    return chunks;
  }

  /**
   * Parse manually provided LinkedIn data (JSON or text)
   */
  parseLinkedInData(data: string | Record<string, any>): Array<{
    text: string;
    source: string;
    metadata?: Record<string, any>;
  }> {
    const chunks: Array<{
      text: string;
      source: string;
      metadata?: Record<string, any>;
    }> = [];

    let parsed: Record<string, any>;
    
    if (typeof data === 'string') {
      try {
        parsed = JSON.parse(data);
      } catch {
        // Treat as plain text
        chunks.push({
          text: data,
          source: 'linkedin',
          metadata: { format: 'text' },
        });
        return chunks;
      }
    } else {
      parsed = data;
    }

    // Extract sections
    if (parsed.summary || parsed.about) {
      chunks.push({
        text: `About:\n${parsed.summary || parsed.about}`,
        source: 'linkedin',
        metadata: { section: 'about' },
      });
    }

    if (parsed.experience && Array.isArray(parsed.experience)) {
      parsed.experience.forEach((exp: any, index: number) => {
        let text = `Experience ${index + 1}:\n`;
        text += `Title: ${exp.title || 'N/A'}\n`;
        text += `Company: ${exp.company || 'N/A'}\n`;
        if (exp.duration) text += `Duration: ${exp.duration}\n`;
        if (exp.description) text += `Description: ${exp.description}\n`;

        chunks.push({
          text,
          source: 'linkedin',
          metadata: { section: 'experience', index },
        });
      });
    }

    if (parsed.education && Array.isArray(parsed.education)) {
      parsed.education.forEach((edu: any, index: number) => {
        let text = `Education ${index + 1}:\n`;
        text += `School: ${edu.school || 'N/A'}\n`;
        text += `Degree: ${edu.degree || 'N/A'}\n`;
        if (edu.field) text += `Field: ${edu.field}\n`;
        if (edu.duration) text += `Duration: ${edu.duration}\n`;

        chunks.push({
          text,
          source: 'linkedin',
          metadata: { section: 'education', index },
        });
      });
    }

    if (parsed.skills && Array.isArray(parsed.skills)) {
      chunks.push({
        text: `Skills: ${parsed.skills.join(', ')}`,
        source: 'linkedin',
        metadata: { section: 'skills' },
      });
    }

    return chunks;
  }
}

export const linkedInService = new LinkedInService();

