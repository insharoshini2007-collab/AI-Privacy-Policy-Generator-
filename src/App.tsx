import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Shield, 
  FileText, 
  Globe, 
  CheckCircle2, 
  AlertCircle, 
  Download, 
  Copy, 
  RefreshCw,
  ChevronRight,
  ChevronLeft,
  Building2,
  Database
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { BusinessProfile, GeneratedPolicy, Jurisdiction } from './types';
import { generateLegalDocument } from './services/gemini';

const STEPS = [
  { id: 'business', title: 'Business Info', icon: Building2 },
  { id: 'data', title: 'Data Practices', icon: Database },
  { id: 'compliance', title: 'Compliance', icon: Globe },
  { id: 'generate', title: 'Generate', icon: FileText },
];

const JURISDICTIONS: { id: Jurisdiction; label: string; desc: string }[] = [
  { id: 'GDPR', label: 'GDPR (Europe)', desc: 'General Data Protection Regulation' },
  { id: 'CCPA', label: 'CCPA (California)', desc: 'California Consumer Privacy Act' },
  { id: 'PIPEDA', label: 'PIPEDA (Canada)', desc: 'Personal Information Protection and Electronic Documents Act' },
  { id: 'LGPD', label: 'LGPD (Brazil)', desc: 'Lei Geral de Proteção de Dados' },
  { id: 'Global', label: 'Global Standard', desc: 'General best practices for international compliance' },
];

export default function App() {
  const [currentStep, setCurrentStep] = useState(0);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedPolicies, setGeneratedPolicies] = useState<GeneratedPolicy[]>([]);
  const [profile, setProfile] = useState<BusinessProfile>({
    companyName: '',
    websiteUrl: '',
    industry: '',
    dataCollected: [],
    dataUsage: [],
    thirdParties: [],
    jurisdictions: [],
    contactEmail: '',
    physicalAddress: '',
  });

  const updateProfile = (updates: Partial<BusinessProfile>) => {
    setProfile(prev => ({ ...prev, ...updates }));
  };

  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      const privacyPolicy = await generateLegalDocument(profile, 'Privacy Policy');
      const termsOfService = await generateLegalDocument(profile, 'Terms of Service');
      setGeneratedPolicies([privacyPolicy, termsOfService]);
      setCurrentStep(3);
    } catch (error) {
      console.error('Generation failed:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const downloadPolicy = (policy: GeneratedPolicy) => {
    const blob = new Blob([policy.content], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${policy.type.replace(' ', '_')}_${policy.jurisdiction}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] text-[#1A1A1A] font-sans selection:bg-blue-100">
      <header className="sticky top-0 z-50 w-full border-b bg-white/80 backdrop-blur-md">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-blue-200">
              <Shield className="w-6 h-6" />
            </div>
            <span className="text-xl font-bold tracking-tight">LexGuard <span className="text-blue-600">AI</span></span>
          </div>
          <div className="hidden md:flex items-center gap-6 text-sm font-medium text-gray-500">
            <a href="#" className="hover:text-blue-600 transition-colors">How it works</a>
            <a href="#" className="hover:text-blue-600 transition-colors">Jurisdictions</a>
            <a href="#" className="hover:text-blue-600 transition-colors">Enterprise</a>
          </div>
          <Button variant="outline" className="rounded-full border-gray-200">
            Sign In
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12 max-w-5xl">
        <div className="mb-12">
          <div className="flex justify-between mb-4">
            {STEPS.map((step, idx) => (
              <div 
                key={step.id}
                className={`flex flex-col items-center gap-2 transition-all duration-300 ${idx <= currentStep ? 'text-blue-600' : 'text-gray-400'}`}
              >
                <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 ${idx <= currentStep ? 'border-blue-600 bg-blue-50' : 'border-gray-200'}`}>
                  <step.icon className="w-5 h-5" />
                </div>
                <span className="text-xs font-semibold uppercase tracking-wider">{step.title}</span>
              </div>
            ))}
          </div>
          <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
            <motion.div 
              className="h-full bg-blue-600"
              initial={{ width: 0 }}
              animate={{ width: `${(currentStep / (STEPS.length - 1)) * 100}%` }}
              transition={{ duration: 0.5, ease: "easeInOut" }}
            />
          </div>
        </div>

        <AnimatePresence mode="wait">
          {currentStep === 0 && (
            <motion.div
              key="step-0"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <Card className="border-none shadow-xl shadow-blue-900/5">
                <CardHeader>
                  <CardTitle className="text-2xl">Business Profile</CardTitle>
                  <CardDescription>Tell us about your company to tailor the legal documents.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="companyName">Company Name</Label>
                      <Input 
                        id="companyName" 
                        placeholder="e.g. Acme Corp" 
                        value={profile.companyName}
                        onChange={(e) => updateProfile({ companyName: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="websiteUrl">Website URL</Label>
                      <Input 
                        id="websiteUrl" 
                        placeholder="https://example.com" 
                        value={profile.websiteUrl}
                        onChange={(e) => updateProfile({ websiteUrl: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="industry">Industry</Label>
                      <Select onValueChange={(v: string) => updateProfile({ industry: v })}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select industry" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="SaaS">SaaS / Software</SelectItem>
                          <SelectItem value="E-commerce">E-commerce</SelectItem>
                          <SelectItem value="Healthcare">Healthcare</SelectItem>
                          <SelectItem value="Finance">Finance</SelectItem>
                          <SelectItem value="Education">Education</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Public Contact Email</Label>
                      <Input 
                        id="email" 
                        type="email" 
                        placeholder="privacy@company.com" 
                        value={profile.contactEmail}
                        onChange={(e) => updateProfile({ contactEmail: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="address">Physical Address</Label>
                    <Textarea 
                      id="address" 
                      placeholder="Full business address for legal notices" 
                      value={profile.physicalAddress}
                      onChange={(e) => updateProfile({ physicalAddress: e.target.value })}
                    />
                  </div>
                </CardContent>
                <CardFooter className="flex justify-end">
                  <Button onClick={() => setCurrentStep(1)} disabled={!profile.companyName}>
                    Next Step <ChevronRight className="ml-2 w-4 h-4" />
                  </Button>
                </CardFooter>
              </Card>
            </motion.div>
          )}

          {currentStep === 1 && (
            <motion.div
              key="step-1"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <Card className="border-none shadow-xl shadow-blue-900/5">
                <CardHeader>
                  <CardTitle className="text-2xl">Data Practices</CardTitle>
                  <CardDescription>Define what data you collect and how it's used.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-8">
                  <div className="space-y-4">
                    <Label>What data do you collect?</Label>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {['Name', 'Email', 'Phone', 'IP Address', 'Location', 'Payment Info', 'Device Info', 'Usage Data'].map(item => (
                        <div 
                          key={item}
                          onClick={() => {
                            const current = profile.dataCollected;
                            updateProfile({ 
                              dataCollected: current.includes(item) 
                                ? current.filter(i => i !== item) 
                                : [...current, item] 
                            });
                          }}
                          className={`p-3 rounded-lg border-2 cursor-pointer transition-all ${profile.dataCollected.includes(item) ? 'border-blue-600 bg-blue-50' : 'border-gray-100 hover:border-gray-200'}`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium">{item}</span>
                            {profile.dataCollected.includes(item) && <CheckCircle2 className="w-4 h-4 text-blue-600" />}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-4">
                    <Label>How do you use this data?</Label>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {['Service Provision', 'Marketing', 'Analytics', 'Personalization', 'Security', 'Compliance'].map(item => (
                        <div 
                          key={item}
                          onClick={() => {
                            const current = profile.dataUsage;
                            updateProfile({ 
                              dataUsage: current.includes(item) 
                                ? current.filter(i => i !== item) 
                                : [...current, item] 
                            });
                          }}
                          className={`p-3 rounded-lg border-2 cursor-pointer transition-all ${profile.dataUsage.includes(item) ? 'border-blue-600 bg-blue-50' : 'border-gray-100 hover:border-gray-200'}`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium">{item}</span>
                            {profile.dataUsage.includes(item) && <CheckCircle2 className="w-4 h-4 text-blue-600" />}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between">
                  <Button variant="ghost" onClick={() => setCurrentStep(0)}>
                    <ChevronLeft className="mr-2 w-4 h-4" /> Back
                  </Button>
                  <Button onClick={() => setCurrentStep(2)} disabled={profile.dataCollected.length === 0}>
                    Next Step <ChevronRight className="ml-2 w-4 h-4" />
                  </Button>
                </CardFooter>
              </Card>
            </motion.div>
          )}

          {currentStep === 2 && (
            <motion.div
              key="step-2"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <Card className="border-none shadow-xl shadow-blue-900/5">
                <CardHeader>
                  <CardTitle className="text-2xl">Jurisdictions & Compliance</CardTitle>
                  <CardDescription>Select the regions where your business operates.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 gap-4">
                    {JURISDICTIONS.map(j => (
                      <div 
                        key={j.id}
                        onClick={() => {
                          const current = profile.jurisdictions;
                          updateProfile({ 
                            jurisdictions: current.includes(j.id) 
                              ? current.filter(i => i !== j.id) 
                              : [...current, j.id] 
                          });
                        }}
                        className={`p-4 rounded-xl border-2 cursor-pointer transition-all flex items-center gap-4 ${profile.jurisdictions.includes(j.id) ? 'border-blue-600 bg-blue-50' : 'border-gray-100 hover:border-gray-200'}`}
                      >
                        <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${profile.jurisdictions.includes(j.id) ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-500'}`}>
                          <Globe className="w-6 h-6" />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-bold">{j.label}</h4>
                          <p className="text-sm text-gray-500">{j.desc}</p>
                        </div>
                        {profile.jurisdictions.includes(j.id) && <CheckCircle2 className="w-6 h-6 text-blue-600" />}
                      </div>
                    ))}
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between">
                  <Button variant="ghost" onClick={() => setCurrentStep(1)}>
                    <ChevronLeft className="mr-2 w-4 h-4" /> Back
                  </Button>
                  <Button 
                    onClick={handleGenerate} 
                    disabled={profile.jurisdictions.length === 0 || isGenerating}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    {isGenerating ? (
                      <>
                        <RefreshCw className="mr-2 w-4 h-4 animate-spin" /> Analyzing & Generating...
                      </>
                    ) : (
                      <>
                        Generate Documents <ChevronRight className="ml-2 w-4 h-4" />
                      </>
                    )}
                  </Button>
                </CardFooter>
              </Card>
            </motion.div>
          )}

          {currentStep === 3 && generatedPolicies.length > 0 && (
            <motion.div
              key="step-3"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="space-y-6"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-3xl font-bold tracking-tight">Your Legal Documents</h2>
                  <p className="text-gray-500">Generated on {new Date().toLocaleDateString()}</p>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => setCurrentStep(0)}>
                    <RefreshCw className="mr-2 w-4 h-4" /> Start Over
                  </Button>
                </div>
              </div>

              <Tabs defaultValue="privacy" className="w-full">
                <TabsList className="grid w-full grid-cols-2 mb-8 bg-white border p-1 rounded-xl h-14">
                  <TabsTrigger value="privacy" className="rounded-lg data-[state=active]:bg-blue-600 data-[state=active]:text-white h-full font-semibold">
                    Privacy Policy
                  </TabsTrigger>
                  <TabsTrigger value="tos" className="rounded-lg data-[state=active]:bg-blue-600 data-[state=active]:text-white h-full font-semibold">
                    Terms of Service
                  </TabsTrigger>
                </TabsList>
                
                <TabsContent value="privacy">
                  <Card className="border-none shadow-2xl shadow-blue-900/10 overflow-hidden">
                    <div className="bg-gray-50 px-6 py-4 border-b flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary" className="bg-blue-100 text-blue-700 hover:bg-blue-100">
                          {generatedPolicies[0].jurisdiction} Compliant
                        </Badge>
                        <span className="text-xs text-gray-400">Last updated: {new Date(generatedPolicies[0].lastUpdated).toLocaleDateString()}</span>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="ghost" size="sm" onClick={() => copyToClipboard(generatedPolicies[0].content)}>
                          <Copy className="w-4 h-4 mr-2" /> Copy
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => downloadPolicy(generatedPolicies[0])}>
                          <Download className="w-4 h-4 mr-2" /> Download
                        </Button>
                      </div>
                    </div>
                    <ScrollArea className="h-[600px] p-8 bg-white">
                      <div className="prose prose-blue max-w-none">
                        <ReactMarkdown>{generatedPolicies[0].content}</ReactMarkdown>
                      </div>
                    </ScrollArea>
                  </Card>
                </TabsContent>

                <TabsContent value="tos">
                  <Card className="border-none shadow-2xl shadow-blue-900/10 overflow-hidden">
                    <div className="bg-gray-50 px-6 py-4 border-b flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary" className="bg-blue-100 text-blue-700 hover:bg-blue-100">
                          Standard Terms
                        </Badge>
                        <span className="text-xs text-gray-400">Last updated: {new Date(generatedPolicies[1].lastUpdated).toLocaleDateString()}</span>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="ghost" size="sm" onClick={() => copyToClipboard(generatedPolicies[1].content)}>
                          <Copy className="w-4 h-4 mr-2" /> Copy
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => downloadPolicy(generatedPolicies[1])}>
                          <Download className="w-4 h-4 mr-2" /> Download
                        </Button>
                      </div>
                    </div>
                    <ScrollArea className="h-[600px] p-8 bg-white">
                      <div className="prose prose-blue max-w-none">
                        <ReactMarkdown>{generatedPolicies[1].content}</ReactMarkdown>
                      </div>
                    </ScrollArea>
                  </Card>
                </TabsContent>
              </Tabs>

              <div className="bg-amber-50 border border-amber-200 rounded-xl p-6 flex gap-4">
                <AlertCircle className="w-6 h-6 text-amber-600 shrink-0" />
                <div>
                  <h4 className="font-bold text-amber-900">Legal Disclaimer</h4>
                  <p className="text-sm text-amber-800 leading-relaxed">
                    LexGuard AI provides generated templates based on AI analysis. These documents do not constitute legal advice. 
                    We strongly recommend having these documents reviewed by a qualified legal professional in your jurisdiction 
                    before implementation.
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <footer className="border-t bg-white py-12 mt-20">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Shield className="w-6 h-6 text-blue-600" />
                <span className="text-xl font-bold">LexGuard AI</span>
              </div>
              <p className="text-sm text-gray-500 leading-relaxed">
                Automating privacy compliance for modern businesses with advanced AI.
              </p>
            </div>
            <div>
              <h5 className="font-bold mb-4">Product</h5>
              <ul className="space-y-2 text-sm text-gray-500">
                <li><a href="#" className="hover:text-blue-600">Privacy Policy Gen</a></li>
                <li><a href="#" className="hover:text-blue-600">Terms of Service</a></li>
                <li><a href="#" className="hover:text-blue-600">Cookie Consent</a></li>
              </ul>
            </div>
            <div>
              <h5 className="font-bold mb-4">Resources</h5>
              <ul className="space-y-2 text-sm text-gray-500">
                <li><a href="#" className="hover:text-blue-600">GDPR Guide</a></li>
                <li><a href="#" className="hover:text-blue-600">CCPA Checklist</a></li>
                <li><a href="#" className="hover:text-blue-600">Legal Blog</a></li>
              </ul>
            </div>
            <div>
              <h5 className="font-bold mb-4">Legal</h5>
              <ul className="space-y-2 text-sm text-gray-500">
                <li><a href="#" className="hover:text-blue-600">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-blue-600">Terms of Use</a></li>
                <li><a href="#" className="hover:text-blue-600">Cookie Policy</a></li>
              </ul>
            </div>
          </div>
          <Separator className="my-8" />
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-gray-400">
            <p>© 2026 LexGuard AI. All rights reserved.</p>
            <div className="flex gap-6">
              <a href="#" className="hover:text-gray-600">Twitter</a>
              <a href="#" className="hover:text-gray-600">LinkedIn</a>
              <a href="#" className="hover:text-gray-600">GitHub</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
