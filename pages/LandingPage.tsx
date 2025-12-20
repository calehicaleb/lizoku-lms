
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
        <div className="min-h-screen bg-white text-slate-900 font-sans selection:bg-primary/30 overflow-x-hidden landing-page-root">
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
                .glass {
                    background: rgba(255, 255, 255, 0.8);
                    backdrop-filter: blur(12px);
                    -webkit-backdrop-filter: blur(12px);
                }
                .blue-glow {
                    box-shadow: 0 0 50px -10px rgba(59, 130, 246, 0.5);
                }
            `}</style>
            
            {/* 1. UTILITY NAV (Narrow Blue) */}
            <div className="bg-[#003366] text-white py-2.5 px-6 relative z-[60]">
                <div className="max-w-[1440px] mx-auto flex justify-between items-center text-[10px] font-bold uppercase tracking-[0.2em]">
                    <div className="flex gap-8 items-center">
                        <a href="mailto:support@lizoku.com" className="flex items-center gap-2 hover:text-primary transition-colors">
                            <Icon name="MessageSquare" className="h-3.5 w-3.5" /> support@lizoku.com
                        </a>
                        <span className="flex items-center gap-1.5 opacity-80 cursor-pointer hover:opacity-100 transition-opacity">
                            <Icon name="Globe" className="h-3.5 w-3.5" /> EN
                        </span>
                    </div>
                    <div className="hidden sm:flex gap-8 items-center">
                        <Link to="/login" className="hover:text-primary transition-colors">Login</Link>
                        <button onClick={() => window.scrollTo({ top: 800, behavior: 'smooth' })} className="hover:text-primary transition-colors">Find Your Institution</button>
                        <a href="#contact" className="hover:text-primary transition-colors">Contact</a>
                    </div>
                </div>
            </div>

            {/* 2. MAIN NAV */}
            <header className="sticky top-0 z-50 glass border-b border-slate-100 shadow-sm">
                <div className="max-w-[1440px] mx-auto px-6 h-20 flex items-center justify-between">
                    <div className="flex items-center gap-2.5 group cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
                        <div className="bg-primary p-2 rounded-xl group-hover:rotate-[15deg] transition-all duration-500 shadow-lg shadow-primary/20">
                            <Icon name="GraduationCap" className="h-7 w-7 text-slate-900" />
                        </div>
                        <span className="text-2xl font-black tracking-tighter text-slate-800 flex items-center uppercase">
                            LIZOKU <span className="text-primary-dark ml-1 font-extrabold lowercase">LMS</span>
                        </span>
                    </div>

                    <nav className="hidden lg:flex items-center gap-10 text-[13px] font-black text-slate-500 uppercase tracking-widest">
                        <a href="#features" className="hover:text-slate-900 transition-colors relative group">
                            Features
                            <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary transition-all group-hover:w-full"></span>
                        </a>
                        <a href="#solutions" className="hover:text-slate-900 transition-colors relative group">
                            Solutions
                            <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary transition-all group-hover:w-full"></span>
                        </a>
                        <a href="#pricing" className="hover:text-slate-900 transition-colors relative group">
                            Pricing
                            <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary transition-all group-hover:w-full"></span>
                        </a>
                    </nav>

                    <div className="flex items-center gap-6">
                         <button onClick={() => navigate('/login')} className="hidden md:block text-slate-500 font-black text-[11px] uppercase tracking-widest hover:text-slate-900 transition-colors">Request a Demo</button>
                         <Link to="/login" className="bg-primary text-slate-900 px-8 py-3.5 rounded-full font-black uppercase text-[11px] tracking-[0.15em] hover:bg-slate-900 hover:text-white transition-all shadow-xl shadow-primary/20 active:scale-95">
                            Get Started
                        </Link>
                    </div>
                </div>
            </header>

            {/* 3. HERO SECTION */}
            <section className="relative pt-24 pb-32 px-6 overflow-hidden">
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
                            <button className="bg-white text-slate-900 px-12 py-5 rounded-2xl font-black uppercase tracking-widest text-sm border-2 border-slate-100 hover:bg-slate-50 hover:border-slate-200 transition-all shadow-lg shadow-slate-100">Request a Demo</button>
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

            {/* 4. INSTITUTION FINDER SECTION */}
            <section className="py-24 px-6 bg-[#003366] relative overflow-hidden">
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

            {/* 5. FEATURE ITEM LIST SECTION */}
            <section className="py-32 px-6 max-w-[1440px] mx-auto grid grid-cols-1 lg:grid-cols-2 gap-24 items-center">
                <div className="order-2 lg:order-1 relative reveal">
                    <div className="absolute -inset-4 bg-primary/20 rounded-[4rem] blur-2xl rotate-3"></div>
                    <img src="https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=1000&q=80" alt="Modern Learning" className="relative rounded-[3.5rem] shadow-2xl border-4 border-white" />
                    <div className="absolute -bottom-8 -right-8 bg-white p-8 rounded-[2.5rem] shadow-2xl border border-slate-50 max-w-xs animate-float">
                        <div className="flex gap-1 mb-4 text-primary-dark">
                            {[1,2,3,4,5].map(i => <Icon key={i} name="Star" className="h-5 w-5 fill-current" />)}
                        </div>
                        <p className="text-sm font-bold text-slate-800 leading-relaxed italic">"Transitioning to Lizoku was the best decision for our faculty. The interface is remarkably intuitive."</p>
                        <p className="mt-4 text-[10px] font-black uppercase text-slate-400 tracking-widest">— Registrar, Heritage School</p>
                    </div>
                </div>
                <div className="order-1 lg:order-2 reveal" style={{ transitionDelay: '300ms' }}>
                    <h2 className="text-5xl md:text-7xl font-black text-slate-900 mb-10 leading-[1] tracking-tight">Tired of Outdated, <br/><span className="text-slate-400">Clunky Systems?</span></h2>
                    <p className="text-xl text-slate-500 leading-relaxed mb-12">
                        Your faculty's time is valuable. Don't waste it on software that requires a semester of training just to operate. Move to a platform that feels as intuitive as the apps you use every day.
                    </p>
                    <div className="space-y-8">
                        <FeatureItem icon="Zap" title="Increased Productivity" text="Spend time on teaching, not settings. Lizoku automates administrative overhead." />
                        <FeatureItem icon="Eye" title="Total Accessibility" text="Cloud-native means 100% uptime and accessibility from any device, anywhere in Kenya." />
                        <FeatureItem icon="BarChart" title="Interactive Analytics" text="Real-time regional and classroom insights delivered in high-fidelity dashboards." />
                    </div>
                </div>
            </section>

            {/* 6. FEATURES GRID */}
            <section id="features" className="py-32 px-6 bg-slate-50 relative overflow-hidden">
                <div className="max-w-[1440px] mx-auto">
                    <div className="text-center max-w-3xl mx-auto mb-24 reveal">
                        <span className="text-primary-dark font-black text-[11px] uppercase tracking-[0.4em] mb-4 block">Engineered for Excellence</span>
                        <h2 className="text-5xl md:text-7xl font-black text-slate-900 mb-8 tracking-tight">Powerful Features, <br/>Simple Interface</h2>
                        <p className="text-xl text-slate-500 font-medium">Our platform is packed with tools that are powerful for admins, yet intuitive for everyone.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                        <SmallFeatureCard 
                            icon="Wrench"
                            title="Intuitive Course Builder"
                            text="AI-powered tools help you generate module suggestions, lesson content, and quizzes in minutes, not hours."
                            delay="100ms"
                        />
                         <SmallFeatureCard 
                            icon="Zap"
                            title="Instant Setup"
                            text="Launch your branded learning portal in minutes. We handle all the migration and technical details."
                            delay="200ms"
                        />
                         <SmallFeatureCard 
                            icon="Globe"
                            title="Your Domain"
                            text="Use your own subdomain with SSL security handled by us for a professional, trustworthy presence."
                            delay="300ms"
                        />
                         <SmallFeatureCard 
                            icon="PieChart"
                            title="Advanced Reporting"
                            text="Monitor student progress, regional trends, and course effectiveness with powerful visual analytics."
                            delay="400ms"
                        />
                    </div>
                </div>
            </section>

            {/* SPEED GRADER FEATURE SECTION */}
            <section className="py-40 px-6 bg-[#020617] text-white relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
                    <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-blue-600 rounded-full blur-[150px]"></div>
                    <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-primary rounded-full blur-[150px]"></div>
                </div>

                <div className="max-w-[1440px] mx-auto relative z-10">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
                        {/* Copy Content */}
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

                        {/* Immersive Video/Mockup Area */}
                        <div className="lg:col-span-7 relative reveal" style={{ transitionDelay: '300ms' }}>
                            <div className="relative bg-slate-900 rounded-[3rem] p-4 shadow-[0_0_100px_rgba(59,130,246,0.3)] border border-slate-800 overflow-hidden">
                                {/* Simulated Browser UI */}
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

                                {/* Video Area */}
                                <div className="relative aspect-video bg-slate-950 rounded-b-[2.5rem] overflow-hidden group">
                                    <img 
                                        src="https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=1200&q=80" 
                                        alt="Speed Grader Demonstration" 
                                        className="w-full h-full object-cover opacity-50 transition-transform duration-[5s] group-hover:scale-110"
                                    />
                                    
                                    {/* Scanline Animation Overlay */}
                                    <div className="absolute inset-0 pointer-events-none">
                                        <div className="w-full h-1 bg-primary/20 absolute animate-scan"></div>
                                    </div>

                                    {/* Play Button Overlay */}
                                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                                        <button className="w-20 h-20 bg-primary text-slate-900 rounded-full flex items-center justify-center shadow-[0_0_50px_rgba(255,215,0,0.5)] transform transition-all hover:scale-110 active:scale-95 group">
                                            <Icon name="ChevronRight" className="h-10 w-10 ml-1" />
                                        </button>
                                        <p className="mt-4 font-black uppercase tracking-[0.3em] text-[10px] text-white">Watch Feature Video</p>
                                    </div>

                                    {/* Floating UI Tags */}
                                    <div className="absolute top-8 right-8 animate-float">
                                        <div className="bg-blue-600/90 backdrop-blur px-4 py-2 rounded-xl text-[10px] font-black flex items-center gap-2 border border-white/10 shadow-2xl">
                                            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                                            AI-ASSISTANT ACTIVE
                                        </div>
                                    </div>
                                    <div className="absolute bottom-8 left-8 animate-float" style={{ animationDelay: '-3s' }}>
                                        <div className="bg-slate-900/90 backdrop-blur px-4 py-2 rounded-xl text-[10px] font-black flex items-center gap-2 border border-white/10 shadow-2xl">
                                            <Icon name="ClipboardCheck" className="h-3 w-3 text-primary" />
                                            INTERACTIVE RUBRIC LOADED
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* 7. PRICING SECTION */}
            <section id="pricing" className="py-32 px-6">
                <div className="max-w-[1440px] mx-auto">
                    <div className="text-center mb-24 reveal">
                        <h2 className="text-5xl md:text-[85px] font-black text-slate-900 mb-8 tracking-tight">Simple, Transparent Pricing.</h2>
                        <p className="text-xl text-slate-500 font-medium">Choose the plan that fits your institution's needs. All plans include a 14-day free trial.</p>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                        <PricingCard 
                            title="Starter"
                            price="5,000"
                            desc="Perfect for small teams and individual instructors getting started."
                            features={["Up to 50 Users", "10 GB Storage", "1,000 AI Credits/month", "Core LMS Features", "Standard Support"]}
                            delay="100ms"
                        />
                        <PricingCard 
                            title="Institution"
                            price="20,000"
                            desc="Ideal for most schools and institutions needing more power and support."
                            isPopular
                            features={["Up to 500 Users", "100 GB Storage", "10,000 AI Credits/month", "Advanced Reporting", "Priority Support", "All features from Starter"]}
                            delay="200ms"
                        />
                        <PricingCard 
                            title="Enterprise"
                            price="Custom"
                            desc="For large-scale deployments with custom needs and dedicated infrastructure."
                            features={["Custom User Limits", "Unlimited Storage", "Custom AI Credits", "White-Label Portal", "Custom Domain", "Plugin Marketplace"]}
                            delay="300ms"
                        />
                    </div>
                </div>
            </section>

            {/* 8. COMPLIANCE SECTION */}
            <section className="py-32 px-6 bg-slate-900 text-white relative">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary to-blue-500"></div>
                <div className="max-w-[1440px] mx-auto">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-24 items-center">
                        <div className="reveal">
                            <h2 className="text-5xl md:text-6xl font-black mb-10 tracking-tight">Built with Trust and <br/><span className="text-primary">Compliance</span> at its Core.</h2>
                            <p className="text-xl text-slate-400 leading-relaxed mb-12">
                                We are committed to protecting your data and adhering to local regulations. Our platform is designed to meet the highest standards of data privacy for Kenyan educational institutions.
                            </p>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="p-8 bg-slate-800/50 rounded-[2.5rem] border border-slate-700 hover:bg-slate-800 transition-colors group">
                                    <Icon name="Shield" className="h-12 w-12 text-primary mb-6 transform group-hover:scale-110 transition-transform" />
                                    <h4 className="font-black text-xl mb-3">Data Protection Act</h4>
                                    <p className="text-sm text-slate-400 leading-relaxed">Full adherence to KDPA 2019 principles for lawful data processing and storage.</p>
                                </div>
                                <div className="p-8 bg-slate-800/50 rounded-[2.5rem] border border-slate-700 hover:bg-slate-800 transition-colors group">
                                    <Icon name="BadgeCheck" className="h-12 w-12 text-primary mb-6 transform group-hover:scale-110 transition-transform" />
                                    <h4 className="font-black text-xl mb-3">Ministry Standards</h4>
                                    <p className="text-sm text-slate-400 leading-relaxed">Platform architecture aligned with Ministry of Education e-learning guidelines.</p>
                                </div>
                            </div>
                        </div>
                        <div className="bg-slate-800/30 p-12 rounded-[4rem] border-2 border-slate-700/50 reveal" style={{ transitionDelay: '200ms' }}>
                             <div className="flex items-center gap-8 mb-10">
                                <div className="w-20 h-20 bg-primary/20 rounded-3xl flex items-center justify-center shadow-2xl">
                                    <Icon name="Lock" className="h-10 w-10 text-primary" />
                                </div>
                                <div>
                                    <h4 className="text-2xl font-black">Registered Data Processor</h4>
                                    <p className="text-slate-400 font-bold uppercase tracking-widest text-xs mt-1">Official ODPC Registration Active</p>
                                </div>
                             </div>
                             <div className="space-y-6">
                                <div className="flex justify-between items-end">
                                    <span className="text-sm font-bold text-slate-400 uppercase tracking-widest">Platform Security Status</span>
                                    <span className="text-lg font-black text-primary">Certified</span>
                                </div>
                                <div className="w-full h-3 bg-slate-700 rounded-full overflow-hidden">
                                    <div className="bg-primary h-full w-[100%] shadow-[0_0_20px_rgba(255,215,0,0.4)]"></div>
                                </div>
                                <p className="text-xs font-bold text-slate-500 uppercase tracking-widest text-center">Annual Security Audit: 100% Passed</p>
                             </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* 9. FAQ SECTION */}
            <section className="py-32 px-6 max-w-[1000px] mx-auto reveal">
                <h2 className="text-5xl md:text-7xl font-black text-center mb-20 tracking-tight">Have Questions? <br/>We Have Answers.</h2>
                <div className="space-y-4">
                    <FaqItem 
                        id={1} 
                        q="Do I need an IT team to use Lizoku?" 
                        a="Absolutely not. Lizoku is a fully managed SaaS platform. We handle all the servers, updates, security, and technical maintenance so your faculty can focus purely on education."
                        open={openFaq === 1}
                        onToggle={() => setOpenFaq(openFaq === 1 ? null : 1)}
                    />
                    <FaqItem 
                        id={2} 
                        q="Can I use my own domain name?" 
                        a="Yes! Enterprise customers can use custom domains (e.g., learn.youruniversity.ac.ke). Starter and Institution plans get a professional subdomain like yourname.lizoku.com with SSL included."
                        open={openFaq === 2}
                        onToggle={() => setOpenFaq(openFaq === 2 ? null : 2)}
                    />
                    <FaqItem 
                        id={3} 
                        q="How secure is my institutional data?" 
                        a="We use enterprise-grade AES-256 encryption for all data at rest and TLS 1.3 for data in transit. Our infrastructure is hosted on ISO-certified Tier-3 data centers for maximum reliability."
                        open={openFaq === 3}
                        onToggle={() => setOpenFaq(openFaq === 3 ? null : 3)}
                    />
                </div>
            </section>

            {/* 10. FINAL CTA / TESTIMONIAL */}
            <section className="py-32 px-6 relative">
                <div className="absolute inset-0 bg-slate-50 skew-y-3 -z-10 origin-right"></div>
                <div className="max-w-[1440px] mx-auto bg-primary rounded-[5rem] p-12 md:p-32 relative overflow-hidden shadow-[0_50px_100px_-20px_rgba(255,215,0,0.3)] reveal">
                    <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-white/10 rounded-full -mr-96 -mt-96 blur-3xl"></div>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-24 items-center relative z-10">
                        <div className="text-center lg:text-left">
                            <h2 className="text-6xl md:text-[90px] font-black text-slate-900 mb-12 leading-[0.9] tracking-tighter">Ready to <br/>Modernize?</h2>
                            <div className="flex flex-col sm:flex-row gap-6 justify-center lg:justify-start">
                                <button onClick={() => navigate('/login')} className="bg-slate-900 text-white px-14 py-6 rounded-3xl font-black uppercase tracking-widest text-sm hover:scale-105 transition-all shadow-2xl active:scale-95">Get Started Free</button>
                                <button className="bg-white/30 text-slate-900 px-14 py-6 rounded-3xl font-black uppercase tracking-widest text-sm hover:bg-white/50 transition-all border border-white/20">Talk to Sales</button>
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

            {/* 11. EXTENDED PREMIUM FOOTER */}
            <footer id="contact" className="bg-[#020617] text-white pt-32 pb-12 px-6 relative overflow-hidden">
                {/* Decorative background for footer */}
                <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-primary via-blue-500 to-primary opacity-50"></div>
                
                <div className="max-w-[1440px] mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-16 lg:gap-24 relative z-10 reveal">
                    <div className="lg:col-span-1">
                        <div className="flex items-center gap-3 mb-8">
                             <div className="bg-primary p-2 rounded-xl">
                                <Icon name="GraduationCap" className="h-6 w-6 text-slate-900" />
                            </div>
                            <span className="text-3xl font-black tracking-tighter text-white">LIZOKU</span>
                        </div>
                        <p className="text-slate-400 font-medium leading-relaxed mb-10 text-lg">
                            Unlock your potential with our expert-led Learning and Career focused LMS. A Kenyan Innovation designed for global standard education.
                        </p>
                        <div className="flex gap-4">
                             <FooterSocial icon="Globe" dark />
                             <FooterSocial icon="MessageSquare" dark />
                             <FooterSocial icon="Briefcase" dark />
                        </div>
                    </div>
                    
                    <div>
                        <h4 className="font-black text-xs uppercase tracking-[0.4em] text-primary mb-10">Institutional Solutions</h4>
                        <ul className="space-y-5 text-slate-300 font-bold text-sm">
                            <li><a href="#" className="hover:text-primary transition-colors flex items-center gap-2 group"><Icon name="ChevronRight" className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-all" /> Higher Education</a></li>
                            <li><a href="#" className="hover:text-primary transition-colors flex items-center gap-2 group"><Icon name="ChevronRight" className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-all" /> K-12 Schools</a></li>
                            <li><a href="#" className="hover:text-primary transition-colors flex items-center gap-2 group"><Icon name="ChevronRight" className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-all" /> Corporate Business</a></li>
                            <li><a href="#" className="hover:text-primary transition-colors flex items-center gap-2 group"><Icon name="ChevronRight" className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-all" /> Vocational Training</a></li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="font-black text-xs uppercase tracking-[0.4em] text-primary mb-10">Resources & Company</h4>
                        <ul className="space-y-5 text-slate-300 font-bold text-sm">
                            <li><a href="#" className="hover:text-primary transition-colors flex items-center gap-2 group"><Icon name="ChevronRight" className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-all" /> About Lizoku</a></li>
                            <li><a href="#" className="hover:text-primary transition-colors flex items-center gap-2 group"><Icon name="ChevronRight" className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-all" /> Contact Sales</a></li>
                            <li><a href="#" className="hover:text-primary transition-colors flex items-center gap-2 group"><Icon name="ChevronRight" className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-all" /> Documentation</a></li>
                            <li><a href="#" className="hover:text-primary transition-colors flex items-center gap-2 group"><Icon name="ChevronRight" className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-all" /> Help Center</a></li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="font-black text-xs uppercase tracking-[0.4em] text-primary mb-10">The Native Web Experience</h4>
                        <div className="bg-slate-800/50 rounded-[2rem] p-6 border border-slate-700/50">
                             <div className="flex items-center gap-4 mb-4">
                                <div className="w-10 h-10 bg-primary/20 rounded-xl flex items-center justify-center">
                                    <Icon name="Globe" className="h-5 w-5 text-primary" />
                                </div>
                                <span className="font-black text-sm uppercase tracking-widest text-slate-200">Zero-Install Learning</span>
                             </div>
                             <p className="text-xs text-slate-400 leading-relaxed mb-4">
                                Lizoku is a modern Progressive Web Platform. Access 100% of features on desktop, tablet, or smartphone without downloading a single app.
                             </p>
                             <div className="flex flex-wrap gap-3">
                                <div className="flex items-center gap-1.5 text-[10px] font-black text-slate-500 uppercase">
                                    <Icon name="CheckCircle" className="h-3 w-3 text-green-500" /> All Browsers
                                </div>
                                <div className="flex items-center gap-1.5 text-[10px] font-black text-slate-500 uppercase">
                                    <Icon name="CheckCircle" className="h-3 w-3 text-green-500" /> Fast, Secure, Reliable
                                </div>
                             </div>
                        </div>
                    </div>
                </div>
                
                <div className="max-w-[1440px] mx-auto mt-32 pt-10 border-t border-slate-800 flex flex-col md:flex-row justify-between items-center gap-8 text-center md:text-left">
                    <div className="flex flex-col gap-2">
                        <p className="text-xs font-black text-slate-500 uppercase tracking-[0.3em]">Built for the future of education</p>
                        <p className="text-[11px] font-bold text-slate-400">© 2025 Lizoku Learning Solutions. A Kenyan Innovation. All Rights Reserved.</p>
                    </div>
                    <div className="flex flex-wrap justify-center gap-10 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                         <a href="#" className="hover:text-primary transition-colors">Privacy Policy</a>
                         <a href="#" className="hover:text-primary transition-colors">Cookie Settings</a>
                         <a href="#" className="hover:text-primary transition-colors">Security Standards</a>
                    </div>
                </div>
            </footer>
        </div>
    );
};

// --- SUB-COMPONENTS ---

const FeatureItem: React.FC<{icon: any, title: string, text: string}> = ({ icon, title, text }) => (
    <div className="flex gap-8 group">
        <div className="flex-shrink-0 w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center group-hover:bg-primary group-hover:scale-110 transition-all duration-500 shadow-sm">
            <Icon name={icon} className="h-8 w-8 text-primary-dark group-hover:text-slate-900 transition-colors" />
        </div>
        <div>
            <h4 className="text-2xl font-black text-slate-800 mb-2">{title}</h4>
            <p className="text-slate-500 font-medium leading-relaxed">{text}</p>
        </div>
    </div>
);

const SmallFeatureCard: React.FC<{icon: any, title: string, text: string, delay?: string}> = ({ icon, title, text, delay }) => (
    <div className="bg-white p-10 rounded-[3rem] shadow-xl shadow-slate-200/50 border border-white hover:border-primary/40 transition-all hover:-translate-y-3 group reveal" style={{ transitionDelay: delay }}>
        <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mb-8 group-hover:bg-primary transition-all duration-500 transform group-hover:rotate-[10deg]">
            <Icon name={icon} className="h-8 w-8 text-primary-dark group-hover:text-slate-900 transition-colors" />
        </div>
        <h3 className="text-2xl font-black text-slate-800 mb-4 leading-tight">{title}</h3>
        <p className="text-slate-500 text-sm font-medium leading-relaxed mb-8">{text}</p>
        <button className="text-[11px] font-black uppercase tracking-[0.2em] text-primary-dark hover:text-slate-900 flex items-center gap-2 transition-colors">
            Explore <Icon name="ChevronRight" className="h-4 w-4" />
        </button>
    </div>
);

const PricingCard: React.FC<{title: string, price: string, desc: string, features: string[], isPopular?: boolean, delay?: string}> = ({ title, price, desc, features, isPopular, delay }) => (
    <div className={`p-12 rounded-[4rem] border-2 transition-all relative reveal ${isPopular ? 'bg-slate-900 text-white border-primary shadow-[0_40px_80px_-15px_rgba(255,215,0,0.3)] scale-105 z-10' : 'bg-white text-slate-800 border-slate-100 hover:border-primary/50'}`} style={{ transitionDelay: delay }}>
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
        <button className={`w-full py-6 rounded-3xl font-black uppercase tracking-[0.2em] text-xs transition-all active:scale-95 shadow-xl ${isPopular ? 'bg-primary text-slate-900 hover:bg-white' : 'bg-slate-900 text-white hover:bg-primary hover:text-slate-900'}`}>
            {price === 'Custom' ? 'Contact Sales' : 'Start Trial'}
        </button>
    </div>
);

const FaqItem: React.FC<{id: number, q: string, a: string, open: boolean, onToggle: () => void}> = ({ q, a, open, onToggle }) => (
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

const FooterSocial: React.FC<{icon: any, dark?: boolean}> = ({ icon, dark }) => (
    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center cursor-pointer transition-all hover:-translate-y-1 shadow-sm ${
        dark 
            ? 'bg-slate-800 text-slate-400 hover:bg-primary hover:text-slate-900' 
            : 'bg-slate-50 text-slate-400 hover:bg-primary hover:text-slate-900'
    }`}>
        <Icon name={icon} className="h-6 w-6" />
    </div>
);

export default LandingPage;
