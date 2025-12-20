import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Icon } from '../components/icons';
import * as api from '../services/api';

const LandingPage: React.FC = () => {
    const navigate = useNavigate();
    const [searchQuery, setSearchQuery] = useState('');
    const [suggestions, setSuggestions] = useState<{ name: string, slug: string, logo: string }[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const searchRef = useRef<HTMLDivElement>(null);
    const [openFaq, setOpenFaq] = useState<number | null>(null);

    // Intersection Observer for scroll animations
    useEffect(() => {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('reveal-active');
                }
            });
        }, { threshold: 0.1 });

        document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
        return () => observer.disconnect();
    }, []);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
                setIsSearching(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleSearch = async (val: string) => {
        setSearchQuery(val);
        if (val.length > 1) {
            const results = await api.findInstitutions(val);
            setSuggestions(results);
            setIsSearching(true);
        } else {
            setSuggestions([]);
            setIsSearching(false);
        }
    };

    const handleSelectInstitution = (slug: string) => {
        navigate('/login', { state: { institution: slug } });
    };

    return (
        <div className="landing-page-root overflow-x-hidden bg-white text-slate-900 font-sans selection:bg-primary/30">
            <style>{`
                .landing-page-root {
                    --primary-color: #FFD700;
                    --primary-dark: #E6C200;
                    --secondary-color: #003366;
                }
                @keyframes float {
                    0% { transform: translateY(0px); }
                    50% { transform: translateY(-20px); }
                    100% { transform: translateY(0px); }
                }
                @keyframes scan {
                    0% { top: 0%; }
                    100% { top: 100%; }
                }
                .animate-float { animation: float 6s ease-in-out infinite; }
                .animate-scan { animation: scan 3s linear infinite; }
                .reveal {
                    opacity: 0;
                    transform: translateY(30px);
                    transition: all 0.8s cubic-bezier(0.4, 0, 0.2, 1);
                }
                .reveal-active {
                    opacity: 1;
                    transform: translateY(0);
                }
            `}</style>
            
            {/* HERO SECTION */}
            <section className="relative pt-24 pb-32 px-6">
                <div className="absolute top-0 right-0 w-[1000px] h-[1000px] bg-primary/10 rounded-full blur-[120px] -mr-[500px] -mt-[500px]"></div>
                <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-blue-50/50 rounded-full blur-[100px] -ml-[300px] -mb-[300px]"></div>

                <div className="max-w-[1440px] mx-auto grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
                    <div className="relative z-10 text-center lg:text-left reveal">
                        <div className="inline-flex items-center gap-2 bg-secondary-light text-blue-900 font-black text-[10px] uppercase tracking-[0.25em] px-5 py-2 rounded-full mb-8 border border-blue-100">
                            <span className="relative flex h-2 w-2">
                              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                              <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
                            </span>
                            Learning, Simplified.
                        </div>
                        <h1 className="text-6xl md:text-[90px] font-black text-slate-900 leading-[0.9] mb-10 tracking-tighter">
                            Your Institution's <br/>
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#003366] to-primary-dark">Modern Campus.</span>
                        </h1>
                        <p className="text-xl md:text-2xl text-slate-500 mb-12 max-w-xl mx-auto lg:mx-0 leading-relaxed font-medium">
                            Launch your branded learning portal in minutes. Lizoku is the refreshingly simple LMS designed for clarity and engagement, not complexity.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-5 justify-center lg:justify-start">
                            <button onClick={() => navigate('/login')} className="bg-slate-900 text-white px-12 py-5 rounded-2xl font-black uppercase tracking-widest text-sm hover:scale-105 transition-all shadow-2xl shadow-slate-300">Try LizokuLMS</button>
                            <Link to="/request-demo" className="bg-white text-slate-900 px-12 py-5 rounded-2xl flex items-center justify-center font-black uppercase tracking-widest text-sm border-2 border-slate-100 hover:bg-slate-50 hover:border-slate-200 transition-all shadow-lg shadow-slate-100">Request a Demo</Link>
                        </div>
                    </div>
                    
                    <div className="relative reveal" style={{ transitionDelay: '200ms' }}>
                        <div className="absolute -z-10 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-primary/5 rounded-full blur-3xl"></div>
                        <div className="bg-slate-900 rounded-[3.5rem] p-5 shadow-[0_60px_100px_rgba(0,51,102,0.15)] transform hover:scale-[1.02] transition-transform duration-700 animate-float">
                             <div className="bg-slate-800 rounded-[3rem] overflow-hidden aspect-video relative group cursor-pointer">
                                <img src="https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1200&q=80" alt="Platform Demo" className="w-full h-full object-cover opacity-60 group-hover:scale-110 transition-transform duration-[2s]" />
                                <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-900/40">
                                    <div className="w-24 h-24 bg-primary rounded-full flex items-center justify-center shadow-2xl transform group-hover:scale-110 transition-all duration-300">
                                        <Icon name="ChevronRight" className="h-12 w-12 text-slate-900 ml-1" />
                                    </div>
                                    <span className="mt-6 text-white font-black uppercase tracking-[0.2em] text-xs">Lizoku LMS Demo Video</span>
                                </div>
                             </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* INSTITUTION FINDER SECTION */}
            <section id="finder" className="py-24 px-6 bg-[#003366] relative overflow-hidden">
                <div className="absolute top-0 right-0 opacity-10 pointer-events-none">
                    <Icon name="Globe" className="h-[500px] w-[500px] text-white" />
                </div>
                <div className="max-w-[1000px] mx-auto text-center text-white relative z-10 reveal">
                    <h2 className="text-4xl md:text-5xl font-black mb-12 tracking-tight">Access Your Institution's Portal</h2>
                    <div className="relative" ref={searchRef}>
                        <div className={`flex items-center bg-white transition-all duration-500 p-2.5 rounded-[2.5rem] shadow-2xl ${isSearching ? 'ring-[12px] ring-white/10' : ''}`}>
                            <Icon name="Search" className="h-7 w-7 text-slate-300 ml-6 mr-3" />
                            <input 
                                type="text"
                                placeholder="Search university or school name..."
                                className="flex-1 bg-transparent border-none outline-none py-5 text-xl font-bold text-slate-800 placeholder:text-slate-300"
                                value={searchQuery}
                                onChange={(e) => handleSearch(e.target.value)}
                            />
                            <button className="bg-primary text-slate-900 font-black px-12 py-5 rounded-full hover:bg-primary-dark transition-all uppercase text-xs tracking-[0.2em] hidden sm:block">
                                Find Now
                            </button>
                        </div>
                        {isSearching && (
                            <div className="absolute top-full left-0 right-0 mt-6 bg-white rounded-[2.5rem] shadow-[0_30px_100px_rgba(0,0,0,0.3)] border border-slate-100 overflow-hidden z-50 text-left animate-in fade-in zoom-in-95 duration-300">
                                {suggestions.length > 0 ? (
                                    <div className="p-4">
                                        {suggestions.map(s => (
                                            <button key={s.slug} onClick={() => handleSelectInstitution(s.slug)} className="w-full flex items-center gap-5 p-6 hover:bg-slate-50 rounded-3xl transition-all group">
                                                <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center overflow-hidden border border-slate-100 group-hover:bg-white transition-colors">
                                                    {s.logo ? <img src={s.logo} alt={s.name} className="w-12 h-12 object-contain" /> : <Icon name="Building2" className="h-8 w-8 text-slate-300" />}
                                                </div>
                                                <div className="flex-1">
                                                    <p className="font-black text-slate-800 text-xl leading-tight group-hover:text-primary-dark transition-colors">{s.name}</p>
                                                    <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mt-1.5">Official Portal Access</p>
                                                </div>
                                                <div className="w-10 h-10 rounded-full border border-slate-100 flex items-center justify-center group-hover:bg-primary group-hover:border-primary transition-all">
                                                    <Icon name="ChevronRight" className="h-5 w-5 text-slate-300 group-hover:text-slate-900" />
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="p-20 text-center text-slate-400 flex flex-col items-center">
                                        <Icon name="Search" className="h-16 w-16 mb-4 opacity-10" />
                                        <p className="text-xl font-bold">No portals found.</p>
                                        <p className="mt-2 text-sm">Try "Nairobi", "Strathmore", or "Demo"</p>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </section>

            {/* SPEED GRADER FEATURE SECTION */}
            <section className="py-40 px-6 bg-[#020617] text-white relative overflow-hidden">
                <div className="max-w-[1440px] mx-auto relative z-10">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
                        <div className="lg:col-span-5 reveal">
                            <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 px-4 py-2 rounded-full mb-8">
                                <Icon name="Zap" className="h-4 w-4 text-primary" />
                                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">Lizoku SpeedGrader™</span>
                            </div>
                            <h2 className="text-5xl md:text-7xl font-black leading-[1] tracking-tight mb-8">
                                Grade a semester <br/>in an afternoon.
                            </h2>
                            <p className="text-xl text-slate-400 mb-12 leading-relaxed">
                                Our intuitive workspace is built for heavy-duty marking. View submissions, apply rubrics, and generate AI-assisted feedback without ever refreshing your browser.
                            </p>
                            
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <h4 className="font-bold text-lg flex items-center gap-2">
                                        <div className="w-2 h-2 bg-primary rounded-full"></div>
                                        Side-by-Side View
                                    </h4>
                                    <p className="text-sm text-slate-500">Read essays while keeping your rubric and feedback tools in immediate reach.</p>
                                </div>
                                <div className="space-y-2">
                                    <h4 className="font-bold text-lg flex items-center gap-2">
                                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                        AI Feedback Co-pilot
                                    </h4>
                                    <p className="text-sm text-slate-500">Generate constructive, rubric-aligned comments with one click to save hours of typing.</p>
                                </div>
                            </div>

                            <button onClick={() => navigate('/login')} className="mt-12 group flex items-center gap-4 bg-white text-slate-900 px-8 py-4 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-primary transition-all">
                                Try the Grader Experience
                                <Icon name="ChevronRight" className="h-5 w-5 group-hover:translate-x-2 transition-transform" />
                            </button>
                        </div>

                        <div className="lg:col-span-7 relative reveal" style={{ transitionDelay: '300ms' }}>
                            <div className="relative bg-slate-900 rounded-[3rem] p-4 shadow-[0_0_100px_rgba(59,130,246,0.3)] border border-slate-800 overflow-hidden">
                                <div className="bg-slate-800 rounded-t-[2.5rem] p-4 flex items-center gap-2 border-b border-slate-700">
                                    <div className="flex gap-1.5">
                                        <div className="w-3 h-3 rounded-full bg-red-500"></div>
                                        <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                                        <div className="w-3 h-3 rounded-full bg-green-500"></div>
                                    </div>
                                    <div className="mx-auto bg-slate-900/50 rounded-lg px-4 py-1.5 text-[10px] text-slate-500 font-mono flex items-center gap-2">
                                        <Icon name="Lock" className="h-3 w-3" />
                                        lizoku.com/instructor/grading/hub
                                    </div>
                                </div>

                                <div className="relative aspect-video bg-slate-950 rounded-b-[2.5rem] overflow-hidden group">
                                    <img 
                                        src="https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=1200&q=80" 
                                        alt="Speed Grader Demonstration" 
                                        className="w-full h-full object-cover opacity-50 transition-transform duration-[5s] group-hover:scale-110"
                                    />
                                    <div className="absolute inset-0 pointer-events-none">
                                        <div className="w-full h-1 bg-primary/20 absolute animate-scan"></div>
                                    </div>
                                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                                        <button className="w-20 h-20 bg-primary text-slate-900 rounded-full flex items-center justify-center shadow-[0_0_50px_rgba(255,215,0,0.5)] transform transition-all hover:scale-110 active:scale-95 group">
                                            <Icon name="ChevronRight" className="h-10 w-10 ml-1" />
                                        </button>
                                        <p className="mt-4 font-black uppercase tracking-[0.3em] text-[10px] text-white">Watch Feature Video</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* PRICING SECTION */}
            <section id="pricing" className="py-32 px-6">
                <div className="max-w-[1440px] mx-auto">
                    <div className="text-center mb-24 reveal">
                        <h2 className="text-5xl md:text-[85px] font-black text-slate-900 mb-8 tracking-tight">Simple, Transparent Pricing.</h2>
                        <p className="text-xl text-slate-500 font-medium">Choose the plan that fits your institution's needs. All plans include a 14-day free trial.</p>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                        <LandingPricingCard 
                            title="Starter"
                            price="5,000"
                            desc="Perfect for small teams and individual instructors getting started."
                            features={["Up to 50 Users", "10 GB Storage", "1,000 AI Credits/month", "Core LMS Features", "Standard Support"]}
                        />
                        <LandingPricingCard 
                            title="Institution"
                            price="20,000"
                            desc="Ideal for most schools and institutions needing more power and support."
                            isPopular
                            features={["Up to 500 Users", "100 GB Storage", "10,000 AI Credits/month", "Advanced Reporting", "Priority Support"]}
                        />
                        <LandingPricingCard 
                            title="Enterprise"
                            price="Custom"
                            desc="For large-scale deployments with custom needs and dedicated infrastructure."
                            features={["Custom User Limits", "Unlimited Storage", "Custom AI Credits", "White-Label Portal", "Custom Domain"]}
                        />
                    </div>
                </div>
            </section>

            {/* FAQ SECTION */}
            <section id="faq" className="py-32 px-6 max-w-[1000px] mx-auto reveal">
                <h2 className="text-5xl md:text-7xl font-black text-center mb-20 tracking-tight">Have Questions? <br/>We Have Answers.</h2>
                <div className="space-y-4">
                    <LandingFaqItem 
                        id={1} 
                        q="Do I need an IT team to use Lizoku?" 
                        a="Absolutely not. Lizoku is a fully managed SaaS platform. We handle all the servers, updates, security, and technical maintenance so your faculty can focus purely on education."
                        open={openFaq === 1}
                        onToggle={() => setOpenFaq(openFaq === 1 ? null : 1)}
                    />
                    <LandingFaqItem 
                        id={2} 
                        q="Can I use my own domain name?" 
                        a="Yes! Enterprise customers can use custom domains (e.g., learn.youruniversity.ac.ke). Starter and Institution plans get a professional subdomain like yourname.lizoku.com with SSL included."
                        open={openFaq === 2}
                        onToggle={() => setOpenFaq(openFaq === 2 ? null : 2)}
                    />
                    <LandingFaqItem 
                        id={3} 
                        q="How secure is my institutional data?" 
                        a="We use enterprise-grade AES-256 encryption for all data at rest and TLS 1.3 for data in transit. Our infrastructure is hosted on ISO-certified Tier-3 data centers for maximum reliability."
                        open={openFaq === 3}
                        onToggle={() => setOpenFaq(openFaq === 3 ? null : 3)}
                    />
                </div>
            </section>

            {/* FINAL CTA / TESTIMONIAL */}
            <section className="py-32 px-6 relative">
                <div className="absolute inset-0 bg-slate-50 skew-y-3 -z-10 origin-right"></div>
                <div className="max-w-[1440px] mx-auto bg-primary rounded-[5rem] p-12 md:p-32 relative overflow-hidden shadow-[0_50px_100px_-20px_rgba(255,215,0,0.3)] reveal">
                    <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-white/10 rounded-full -mr-96 -mt-96 blur-3xl"></div>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-24 items-center relative z-10">
                        <div className="text-center lg:text-left">
                            <h2 className="text-6xl md:text-[90px] font-black text-slate-900 mb-12 leading-[0.9] tracking-tighter">Ready to <br/>Modernize?</h2>
                            <div className="flex flex-col sm:flex-row gap-6 justify-center lg:justify-start">
                                <button onClick={() => navigate('/login')} className="bg-slate-900 text-white px-14 py-6 rounded-3xl font-black uppercase tracking-widest text-sm hover:scale-105 transition-all shadow-2xl active:scale-95">Get Started Free</button>
                                <Link to="/request-demo" className="bg-white/30 text-slate-900 px-14 py-6 rounded-3xl font-black uppercase flex items-center justify-center tracking-widest text-sm hover:bg-white/50 transition-all border border-white/20">Talk to Sales</Link>
                            </div>
                        </div>
                        <div className="bg-white/40 backdrop-blur-3xl p-12 rounded-[4rem] border-2 border-white/50 shadow-2xl">
                             <div className="flex gap-1.5 mb-8 text-slate-900">
                                {[1,2,3,4,5].map(i => <Icon key={i} name="Star" className="h-7 w-7 fill-current" />)}
                             </div>
                             <p className="text-3xl font-black text-slate-900 italic mb-10 leading-tight">
                                "Previously, our downtimes could extend into hours. That doesn't happen with Lizoku. The reliability and speed are unmatched."
                             </p>
                             <div className="flex items-center gap-5">
                                <div className="w-16 h-16 bg-slate-900 rounded-2xl flex items-center justify-center font-black text-2xl text-primary">JK</div>
                                <div>
                                    <p className="font-black text-xl text-slate-900">J. Kamau</p>
                                    <p className="text-xs font-black text-slate-600 uppercase tracking-widest">Head of IT, Premier Digital College</p>
                                </div>
                             </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};

// --- SUB-COMPONENTS ---

const LandingPricingCard: React.FC<{title: string, price: string, desc: string, features: string[], isPopular?: boolean}> = ({ title, price, desc, features, isPopular }) => (
    <div className={`p-12 rounded-[4rem] border-2 transition-all relative ${isPopular ? 'bg-slate-900 text-white border-primary shadow-2xl scale-105 z-10' : 'bg-white text-slate-800 border-slate-100 hover:border-primary/50'}`}>
        {isPopular && (
            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-primary text-slate-900 font-black text-[11px] uppercase tracking-[0.3em] px-8 py-3 rounded-full shadow-2xl">Most Popular</div>
        )}
        <h3 className="text-3xl font-black mb-3">{title}</h3>
        <p className={`text-sm mb-10 font-medium ${isPopular ? 'text-slate-400' : 'text-slate-500'}`}>{desc}</p>
        <div className="mb-12">
            <span className="text-5xl font-black">{price !== 'Custom' ? `Ksh ${price}` : price}</span>
            {price !== 'Custom' && <span className={`text-[11px] font-black uppercase tracking-widest ml-1 ${isPopular ? 'text-slate-400' : 'text-slate-500'}`}> / month</span>}
        </div>
        <ul className="space-y-5 mb-12">
            {features.map(f => (
                <li key={f} className="flex items-center gap-4 text-sm font-bold">
                    <Icon name="CheckCircle" className={`h-6 w-6 flex-shrink-0 ${isPopular ? 'text-primary' : 'text-green-500'}`} />
                    {f}
                </li>
            ))}
        </ul>
        <Link to="/login" className={`w-full py-6 rounded-3xl block text-center font-black uppercase tracking-[0.2em] text-xs transition-all active:scale-95 shadow-xl ${isPopular ? 'bg-primary text-slate-900 hover:bg-white' : 'bg-slate-900 text-white hover:bg-primary hover:text-slate-900'}`}>
            {price === 'Custom' ? 'Contact Sales' : 'Start Trial'}
        </Link>
    </div>
);

const LandingFaqItem: React.FC<{id: number, q: string, a: string, open: boolean, onToggle: () => void}> = ({ q, a, open, onToggle }) => (
    <div className={`border rounded-[2.5rem] transition-all duration-500 overflow-hidden ${open ? 'bg-slate-50 border-primary/50 shadow-xl' : 'bg-white border-slate-100 hover:border-slate-200 shadow-sm'}`}>
        <button onClick={onToggle} className="w-full flex items-center justify-between p-10 text-left outline-none">
            <span className="text-xl font-black text-slate-800 pr-8">{q}</span>
            <div className={`w-12 h-12 rounded-full border flex items-center justify-center transition-all ${open ? 'bg-primary border-primary rotate-180' : 'border-slate-100'}`}>
                <Icon name={open ? "Minimize" : "Maximize"} className={`h-6 w-6 ${open ? 'text-slate-900' : 'text-slate-300'}`} />
            </div>
        </button>
        <div className={`transition-all duration-500 ease-in-out ${open ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'}`}>
            <p className="px-10 pb-10 text-lg text-slate-500 font-medium leading-relaxed max-w-3xl">{a}</p>
        </div>
    </div>
);

export default LandingPage;