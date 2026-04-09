export type Jurisdiction = 'GDPR' | 'CCPA' | 'PIPEDA' | 'LGPD' | 'Global';

export interface BusinessProfile {
  companyName: string;
  websiteUrl: string;
  industry: string;
  dataCollected: string[];
  dataUsage: string[];
  thirdParties: string[];
  jurisdictions: Jurisdiction[];
  contactEmail: string;
  physicalAddress: string;
}

export interface GeneratedPolicy {
  type: 'Privacy Policy' | 'Terms of Service';
  content: string;
  jurisdiction: Jurisdiction;
  lastUpdated: string;
}
