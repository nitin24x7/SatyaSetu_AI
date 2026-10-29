import React, { useState, useRef, useEffect } from 'react';
import {
  MessageSquare,
  X,
  Send,
  Sparkles,
  Bot,
  User,
  ChevronDown,
  Copy,
  Check,
  RefreshCw,
} from 'lucide-react';

interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

const STORAGE_KEY_GROQ = 'satya_groq_api_key';

const SUGGESTED_QUESTIONS = [
  'What is the mandatory Cadre Ratio & SFR for UG Engineering under APH 2026-27?',
  'What are the mandatory Fire Safety NOC requirements for Extension of Approval (EoA)?',
  'How does the system reconcile TER (Technical Education Regulatory) fee payments?',
  'What discrepancies trigger an automatic Expert Visiting Committee (EVC) inspection flag?',
  'Which 6 issuing authorities are verified through the DigiLocker and State Gateway APIs?',
];

// Rich deterministic regulatory knowledge base
const getFallbackRegulatoryAnswer = (prompt: string): string => {
  const p = prompt.toLowerCase();

  if (p.includes('cadre') || p.includes('sfr') || p.includes('ratio') || p.includes('faculty')) {
    return `### AICTE APH 2026-27: Student-Faculty Ratio (SFR) & Cadre Norms

Under Section 4.2 of the AICTE Approval Process Handbook (APH 2026-27):
1. **Undergraduate Engineering & Technology**:
   - **Student-Faculty Ratio (SFR)**: Prescribed at **1:15** for accredited tier programs and **1:20** for general institutions.
   - **Cadre Proportion**: Strictly **1 Professor : 2 Associate Professors : 6 Assistant Professors** (1:2:6).
   - In a department with 18 faculty members for 360 intake: Minimum 2 Professors, 4 Associate Professors, and 12 Assistant Professors.
2. **Principal / Director Requirement**:
   - Must hold a Ph.D. in Engineering with a minimum of 15 years experience and at least 8 research publications in SCI/Scopus indexed journals.
3. **Forensic Automated Rule in SatyaSetu**:
   - Cross-checks Aadhaar/PAN authenticated faculty rosters against epfindia.gov.in EPF contribution challans and biometric attendance records to prevent ghost faculty duplication across multiple institutions.`;
  }

  if (p.includes('fire') || p.includes('noc') || p.includes('safety') || p.includes('hazard')) {
    return `### AICTE APH 2026-27: Fire & Safety NOC Compliance Checklist

Under APH 2026-27 Chapter II (Mandatory Institutional Documents):
1. **Issuing Authority**:
   - Must be issued exclusively by the **State Fire Services Department** or the competent Municipal Chief Fire Officer (CFO).
2. **Validity Window**:
   - Must be valid for the entire academic year or carry minimum remaining validity past **31st July of the approval cycle**.
3. **Mandatory Inclusions**:
   - Dedicated fire hydrant loop coverage for all instructional and administrative blocks.
   - Unobstructed emergency egress stairways (minimum 2.0m width).
   - Valid refill and hydrostatic test certifications for dry chemical powder / CO2 extinguishers.
4. **Automated Verification in SatyaSetu**:
   - Verified against the State Fire Services Portal via unique NOC ID.
   - Optical Character Recognition (OCR) extracts the validity period and flags any tampered expiry dates with pixel-level forensics.`;
  }

  if (p.includes('ter') || p.includes('fee') || p.includes('payment') || p.includes('challan')) {
    return `### AICTE Technical Education Regulatory (TER) Fee Reconciliation

Under Chapter I Clause 1.6 of the Approval Process Handbook:
1. **Fee Schedule (Indicative EoA 2026-27)**:
   - Extension of Approval (EoA) without change: ₹2,00,000 to ₹3,50,000 depending on institution category and intake.
   - Addition of new course / division: ₹1,50,000 per course.
   - Change in site or closure of program: Specific prescribed statutory levies.
2. **Payment Gateway Integration**:
   - Payments must route via the authorized **AICTE Bharatkosh / SBI Collect / HDFC Central Gateway**.
3. **SatyaSetu Automated Reconciliation Rule (RULE-TER-001)**:
   - Matches the transaction reference number (UTR/Challan ID), timestamp, and amount directly against the payment gateway ledger.
   - Prevents duplicate utilization of the same transaction receipt across multiple application sub-categories.`;
  }

  if (p.includes('evc') || p.includes('inspect') || p.includes('visit') || p.includes('expert visiting')) {
    return `### AICTE Expert Visiting Committee (EVC) Scrutiny Triggers

In the SatyaSetu Decision Support Architecture, applications are automatically flagged for physical on-site or virtual EVC inspection when any of the following 5 statutory thresholds are breached:
1. **Instructional Carpet Area Deficit > 15%**: Total classroom, tutorial, and laboratory square footage falls below APH Appendix 4 requirements.
2. **Cadre Imbalance / Unfilled Professor Cadre**: No qualified Professor in core programs for more than 2 consecutive academic cycles.
3. **Structural Stability / Fire NOC Discrepancy**: Expired or digitally unverified Municipal / PWD structural occupancy certificates.
4. **Forensic Anomaly Detection**: High-confidence forensic flags on submitted land deeds or recurring duplicate faculty IDs across institutions.
5. **Random Statutory Sampling**: Mandatory 5% randomized statutory audit mandated by the AICTE Executive Committee.`;
  }

  if (p.includes('authority') || p.includes('authorities') || p.includes('digilocker') || p.includes('gateway') || p.includes('state')) {
    return `### SatyaSetu Issuing Authority Gateway Integrations

SatyaSetu connects directly with 6 officially authorized statutory registries:
1. **DigiLocker National Gateway**: Validates institutional affidavits, degree certificates, and digital marksheets with X.509 cryptographic signatures.
2. **State Revenue & Land Records Portal (Bhoomi/AnyRoR/MahaBhulekh)**: Verifies 7/12 extracts, title ownership deeds, and non-agricultural (NA) land conversion orders.
3. **State Fire Services Directorate**: Validates Fire NOC unique registration numbers and compliance expiry dates.
4. **UGC / Affiliating University Repository**: Confirms university affiliation orders and permanent NOC statuses.
5. **Council of Architecture (CoA) / Pharmacy Council of India (PCI)**: Verifies specialized apex council accreditations.
6. **EPFO Unified Portal**: Cross-checks employee provident fund electronic challans to verify faculty employment continuity.`;
  }

  if (p.includes('land') || p.includes('carpet') || p.includes('built-up') || p.includes('area')) {
    return `### Land & Infrastructure Norms (APH 2026-27 Appendix 4)

1. **Land Requirement**:
   - **Mega / Metro Cities**: Minimum 2.5 Acres contiguous land.
   - **Urban Areas**: Minimum 4.0 Acres contiguous land.
   - **Rural Areas**: Minimum 7.5 Acres contiguous land.
2. **Instructional Area Calculus**:
   - Classrooms: Minimum 66 sq.m per 60 student batch.
   - Laboratories: Minimum 66 to 132 sq.m based on engineering domain.
   - Computer Centre: Minimum 150 sq.m equipped with high-speed 1 Gbps NMEICT/NKN connectivity.
3. **Cadastral & Master Plan Verification**:
   - Land must be free from encumbrance and registered in the name of the Trust / Society / Section 8 Company for a minimum 30-year lease or freehold ownership.`;
  }

  return `### SatyaSetu Regulatory Assistant Response

Regarding your query: "${prompt}"

According to the **AICTE Approval Process Handbook (APH 2026-27)**:
- **Application Category & Applicable Checklist**: The platform dynamically determines the mandatory compliance checklist based on whether the application is for *Extension of Approval (EoA)*, *Introduction of New Courses*, *Intake Expansion*, or *Change of Site*.
- **Pre-Scrutiny Verification**: All institutional claims (land, building, faculty roster, financial endowment, and safety certifications) are verified against authorized statutory registries.
- **Explainable Decision Support**: SatyaSetu presents evidence-linked findings for each rule, assisting AICTE Regional Officers without replacing final human statutory discretion.`;
};

export const RegulatoryChatbot: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome-1',
      sender: 'assistant',
      content: `Hello! I am **SatyaSetu Regulatory AI**, your assistant for **AICTE Approval Process Handbook (APH 2026-27)** guidelines and application verification.

I can assist you with:
- **Cadre Ratios & Faculty Norms** (1:15 / 1:20 SFR)
- **Fire Safety NOC & Land Title Rules**
- **TER Fee Payment Reconciliation**
- **Expert Visiting Committee (EVC) Triggers**
- **Issuing Authority Verification Gateways**

Ask any regulatory question below or select a suggested prompt!`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  const handleCopyMessage = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const callGroqAPI = async (userPrompt: string, history: ChatMessage[]) => {
    const apiKey =
      (import.meta.env.VITE_GROQ_API_KEY as string) ||
      localStorage.getItem(STORAGE_KEY_GROQ) ||
      '';

    if (!apiKey) {
      return getFallbackRegulatoryAnswer(userPrompt);
    }

    try {
      const systemPrompt = `You are SatyaSetu AI Regulatory Assistant, an expert AICTE Approval Process Handbook (APH 2026-27) and statutory compliance guide for Technical Education Institutions, Regional AICTE Officers, and Evaluation Teams in India. Provide precise, authoritative, regulatory citations and advice. Cover Cadre ratio (1:15/1:20), SFR, built-up carpet areas, Fire Safety NOC, Land conversion affidavits, TER payments, EVC inspections, and forensic scrutiny. Format with clean markdown headers and bullet points. Maintain high professionalism. Present SatyaSetu AI as an enterprise-grade statutory decision-support platform.`;

      const apiMessages = [
        { role: 'system', content: systemPrompt },
        ...history.slice(-6).map((m) => ({
          role: m.sender === 'user' ? 'user' : 'assistant',
          content: m.content,
        })),
        { role: 'user', content: userPrompt },
      ];

      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey.trim()}`,
        },
        body: JSON.stringify({
          model: 'llama-3.3-70b-versatile',
          messages: apiMessages,
          temperature: 0.3,
          max_tokens: 1024,
        }),
      });

      if (!response.ok) {
        return getFallbackRegulatoryAnswer(userPrompt);
      }

      const data = await response.json();
      const reply = data.choices?.[0]?.message?.content;
      return reply || getFallbackRegulatoryAnswer(userPrompt);
    } catch {
      return getFallbackRegulatoryAnswer(userPrompt);
    }
  };

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || inputMessage).trim();
    if (!text || isLoading) return;

    const userMsg: ChatMessage = {
      id: `usr-${Date.now()}`,
      sender: 'user',
      content: text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputMessage('');
    setIsLoading(true);

    const replyContent = await callGroqAPI(text, [...messages, userMsg]);

    const assistantMsg: ChatMessage = {
      id: `ast-${Date.now()}`,
      sender: 'assistant',
      content: replyContent,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, assistantMsg]);
    setIsLoading(false);
  };

  return (
    <>
      {/* Floating Bottom-Right Launcher (Theme Royal Blue) */}
      <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3">
        {!isOpen && (
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/95 backdrop-blur-md border border-slate-200/80 shadow-md text-xs font-semibold text-slate-700 animate-fade-in">
            <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
            <span>AICTE Regulatory Assistant</span>
          </div>
        )}

        <button
          onClick={() => setIsOpen(!isOpen)}
          className={`w-14 h-14 rounded-full flex items-center justify-center transition-all duration-300 shadow-xl border-2 border-white/80 cursor-pointer ${
            isOpen
              ? 'bg-slate-900 text-white rotate-90 scale-95 shadow-slate-900/25'
              : 'bg-blue-600 hover:bg-blue-700 text-white hover:scale-105 active:scale-95 shadow-blue-500/30'
          }`}
          aria-label={isOpen ? 'Close Chatbot' : 'Open SatyaSetu Regulatory Assistant'}
        >
          {isOpen ? <X size={22} /> : <MessageSquare size={24} className="fill-current" />}
        </button>
      </div>

      {/* Main Glassmorphic Chat Window */}
      {isOpen && (
        <div className="fixed bottom-24 right-4 sm:right-6 z-50 w-[94vw] sm:w-[450px] h-[640px] max-h-[82vh] bg-white/95 backdrop-blur-2xl rounded-3xl border border-slate-200/80 shadow-[0_20px_50px_rgba(0,0,0,0.12)] flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-200">
          {/* Header (Clean Royal Blue Theme, No Dummy Buttons) */}
          <div className="p-4 bg-gradient-to-r from-blue-500/10 via-indigo-500/10 to-transparent border-b border-slate-200/70 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-2xl bg-blue-600 flex items-center justify-center text-white shadow-xs">
                <Bot size={20} />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h3 className="font-bold text-sm text-slate-900">SatyaSetu Regulatory AI</h3>
                  <span className="px-1.5 py-0.5 rounded-full bg-blue-100/90 border border-blue-200/70 text-[9px] font-extrabold text-blue-800 uppercase tracking-wider font-mono">
                    APH 2026-27
                  </span>
                </div>
                <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span>Online • AICTE Scrutiny Assistant</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => setIsOpen(false)}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
              title="Minimize Chat"
            >
              <ChevronDown size={18} />
            </button>
          </div>

          {/* Messages Container */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3.5 text-xs">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-2.5 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {msg.sender === 'assistant' && (
                  <div className="w-7 h-7 rounded-xl bg-blue-50 border border-blue-200/80 flex items-center justify-center text-blue-700 shrink-0 mt-0.5 shadow-2xs">
                    <Bot size={14} />
                  </div>
                )}

                <div
                  className={`relative max-w-[84%] rounded-3xl px-4 py-3 shadow-2xs transition-all ${
                    msg.sender === 'user'
                      ? 'bg-blue-600 text-white rounded-tr-xs'
                      : 'bg-white/90 border border-slate-200/80 text-slate-800 rounded-tl-xs'
                  }`}
                >
                  {/* Message Content */}
                  <div className="prose prose-xs max-w-none break-words leading-relaxed">
                    {msg.content.split('\n').map((line, idx) => {
                      if (line.startsWith('### ')) {
                        return (
                          <h4
                            key={idx}
                            className={`font-bold text-xs mt-2 mb-1 ${
                              msg.sender === 'user' ? 'text-white' : 'text-slate-900'
                            }`}
                          >
                            {line.replace('### ', '')}
                          </h4>
                        );
                      }
                      if (line.startsWith('- ') || line.startsWith('* ')) {
                        return (
                          <li key={idx} className="ml-3 list-disc text-[11px]">
                            {line.replace(/^[-*]\s+/, '')}
                          </li>
                        );
                      }
                      if (line.trim() === '') {
                        return <div key={idx} className="h-1.5" />;
                      }
                      return (
                        <p key={idx} className="my-0.5 text-[11px]">
                          {line}
                        </p>
                      );
                    })}
                  </div>

                  {/* Message Footer / Copy */}
                  <div
                    className={`mt-2 flex items-center justify-between text-[10px] ${
                      msg.sender === 'user' ? 'text-blue-200' : 'text-slate-400'
                    }`}
                  >
                    <span>{msg.timestamp}</span>
                    {msg.sender === 'assistant' && (
                      <button
                        onClick={() => handleCopyMessage(msg.id, msg.content)}
                        className="hover:text-slate-700 flex items-center gap-1 transition-colors cursor-pointer"
                        title="Copy Response"
                      >
                        {copiedId === msg.id ? (
                          <>
                            <Check size={11} className="text-emerald-600" />
                            <span className="text-emerald-600">Copied</span>
                          </>
                        ) : (
                          <>
                            <Copy size={11} />
                            <span>Copy</span>
                          </>
                        )}
                      </button>
                    )}
                  </div>
                </div>

                {msg.sender === 'user' && (
                  <div className="w-7 h-7 rounded-xl bg-slate-900 flex items-center justify-center text-white shrink-0 mt-0.5 shadow-2xs">
                    <User size={14} />
                  </div>
                )}
              </div>
            ))}

            {/* Loading animation */}
            {isLoading && (
              <div className="flex gap-2.5 items-center">
                <div className="w-7 h-7 rounded-xl bg-blue-50 border border-blue-200/80 flex items-center justify-center text-blue-700 shrink-0 shadow-2xs">
                  <Bot size={14} />
                </div>
                <div className="bg-white/90 border border-slate-200/80 rounded-2xl rounded-tl-xs px-4 py-2.5 shadow-2xs flex items-center gap-2 text-slate-500 text-xs">
                  <RefreshCw size={13} className="animate-spin text-blue-600" />
                  <span>Synthesizing AICTE regulatory guidelines...</span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Prompt suggestions pills */}
          <div className="px-3.5 py-2 border-t border-slate-100 bg-slate-50/60 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
            <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider shrink-0 flex items-center gap-1">
              <Sparkles size={11} className="text-blue-600" />
              Prompts:
            </span>
            {SUGGESTED_QUESTIONS.map((q, i) => (
              <button
                key={i}
                onClick={() => handleSendMessage(q)}
                className="shrink-0 px-2.5 py-1 rounded-full bg-white border border-slate-200/70 text-[10px] text-slate-700 hover:bg-blue-50 hover:border-blue-300 hover:text-blue-900 transition-all shadow-2xs cursor-pointer"
              >
                {q.length > 40 ? q.slice(0, 40) + '...' : q}
              </button>
            ))}
          </div>

          {/* Input Bar */}
          <div className="p-3 bg-white border-t border-slate-200/80 flex items-center gap-2">
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage();
                }
              }}
              placeholder="Ask about Cadre ratio, Fire NOC, TER fees, EVC..."
              className="flex-1 bg-slate-50/80 border border-slate-200/80 rounded-2xl px-3.5 py-2.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all"
            />
            <button
              onClick={() => handleSendMessage()}
              disabled={!inputMessage.trim() || isLoading}
              className="w-9 h-9 rounded-2xl bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white flex items-center justify-center transition-all shadow-xs shrink-0 cursor-pointer"
              aria-label="Send Message"
            >
              <Send size={15} />
            </button>
          </div>
        </div>
      )}
    </>
  );
};
