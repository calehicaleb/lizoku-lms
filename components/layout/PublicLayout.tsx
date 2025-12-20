import React, { useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Icon } from '../icons';

export const PublicLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const location = useLocation();

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
    }, [location.pathname]);

    const isPathActive = (path: string) => location.pathname === path;

    return (
        <div className="min-h-screen bg-white text-slate-900 font-sans selection:bg-primary/30 overflow-x-hidden">
            <style>{`
                .glass {
                    background: rgba(255, 255, 255, 0.8);
                    backdrop-filter: blur(12px);
                    -webkit-backdrop-filter: blur(12px);
                }
                .reveal {
                    opacity: 0;
                    transform: translateY(30px);
                    transition: all 0.8s cubic-bezier(0.4, 0, 0.2, 1);
                }
                .reveal-active {
                    opacity: 1;
                    transform: translateY(0);
                }
                html {
                    scroll-behavior: smooth;
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
                        <Link to="/legal/compliance" className="hover:text-primary transition-colors">Compliance</Link>
                    </div>
                </div>
            </div>

            {/* 2. MAIN NAV */}
            <header className="sticky top-0 z-50 glass border-b border-slate-100 shadow-sm">
                <div className="max-w-[1440px] mx-auto px-6 h-20 flex items-center justify-between">
                    <Link to="/" className="flex items-center gap-2.5 group">
                        <div className="bg-primary p-2 rounded-xl group-hover:rotate-[15deg] transition-all duration-500 shadow-lg shadow-primary/20">
                            <Icon name="GraduationCap" className="h-7 w-7 text-slate-900" />
                        </div>
                        <span className="text-2xl font-black tracking-tighter text-slate-800 flex items-center uppercase">
                            LIZOKU <span className="text-primary-dark ml-1 font-extrabold lowercase">LMS</span>
                        </span>
                    </Link>

                    <nav className="hidden lg:flex items-center gap-10 text-[13px] font-black text-slate-500 uppercase tracking-widest">
                        <Link to="/features" className={`transition-colors relative group ${isPathActive('/features') ? 'text-slate-900' : 'hover:text-slate-900'}`}>
                            Features
                            <span className={`absolute -bottom-1 left-0 h-0.5 bg-primary transition-all ${isPathActive('/features') ? 'w-full' : 'w-0 group-hover:w-full'}`}></span>
                        </Link>
                        <Link to="/solutions" className={`transition-colors relative group ${isPathActive('/solutions') ? 'text-slate-900' : 'hover:text-slate-900'}`}>
                            Solutions
                            <span className={`absolute -bottom-1 left-0 h-0.5 bg-primary transition-all ${isPathActive('/solutions') ? 'w-full' : 'w-0 group-hover:w-full'}`}></span>
                        </Link>
                        <Link to="/pricing" className={`transition-colors relative group ${isPathActive('/pricing') ? 'text-slate-900' : 'hover:text-slate-900'}`}>
                            Pricing
                            <span className={`absolute -bottom-1 left-0 h-0.5 bg-primary transition-all ${isPathActive('/pricing') ? 'w-full' : 'w-0 group-hover:w-full'}`}></span>
                        </Link>
                    </nav>

                    <div className="flex items-center gap-6">
                         <Link to="/request-demo" className={`hidden md:block text-[11px] uppercase tracking-widest font-black transition-colors ${isPathActive('/request-demo') ? 'text-slate-900' : 'text-slate-500 hover:text-slate-900'}`}>Request a Demo</Link>
                         <Link to="/login" className="bg-primary text-slate-900 px-8 py-3.5 rounded-full font-black uppercase text-[11px] tracking-[0.15em] hover:bg-slate-900 hover:text-white transition-all shadow-xl shadow-primary/20 active:scale-95">
                            Get Started
                        </Link>
                    </div>
                </div>
            </header>

            {/* 3. CONTENT AREA */}
            <main className="min-h-[60vh]">{children}</main>

            {/* 4. PREMIUM FOOTER */}
            <footer className="bg-[#020617] text-white pt-32 pb-12 px-6 relative overflow-hidden">
                <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-primary via-blue-500 to-primary opacity-50"></div>
                
                <div className="max-w-[1440px] mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-16 lg:gap-24 relative z-10">
                    <div className="lg:col-span-1">
                        <div className="flex items-center gap-3 mb-8">
                             <div className="bg-primary p-2 rounded-xl">
                                <Icon name="GraduationCap" className="h-6 w-6 text-slate-900" />
                            </div>
                            <span className="text-3xl font-black tracking-tighter text-white uppercase">LIZOKU</span>
                        </div>
                        <p className="text-slate-400 font-medium leading-relaxed mb-10 text-lg">
                            Unlock your potential with our expert-led Learning and Career focused LMS. A Kenyan Innovation.
                        </p>
                        <div className="flex gap-4">
                             <div className="w-12 h-12 rounded-2xl flex items-center justify-center cursor-pointer transition-all hover:-translate-y-1 shadow-sm bg-slate-800 text-slate-400 hover:bg-primary hover:text-slate-900">
                                <Icon name="Globe" className="h-6 w-6" />
                             </div>
                             <div className="w-12 h-12 rounded-2xl flex items-center justify-center cursor-pointer transition-all hover:-translate-y-1 shadow-sm bg-slate-800 text-slate-400 hover:bg-primary hover:text-slate-900">
                                <Icon name="MessageSquare" className="h-6 w-6" />
                             </div>
                             <div className="w-12 h-12 rounded-2xl flex items-center justify-center cursor-pointer transition-all hover:-translate-y-1 shadow-sm bg-slate-800 text-slate-400 hover:bg-primary hover:text-slate-900">
                                <Icon name="Briefcase" className="h-6 w-6" />
                             </div>
                        </div>
                    </div>
                    
                    <div>
                        <h4 className="font-black text-xs uppercase tracking-[0.4em] text-primary mb-10">Institutional Solutions</h4>
                        <ul className="space-y-5 text-slate-300 font-bold text-sm">
                            <li><Link to="/solutions" className="hover:text-primary transition-colors flex items-center gap-2 group">Higher Education</Link></li>
                            <li><Link to="/solutions" className="hover:text-primary transition-colors flex items-center gap-2 group">K-12 Schools</Link></li>
                            <li><Link to="/solutions" className="hover:text-primary transition-colors flex items-center gap-2 group">Corporate Business</Link></li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="font-black text-xs uppercase tracking-[0.4em] text-primary mb-10">Resources & Company</h4>
                        <ul className="space-y-5 text-slate-300 font-bold text-sm">
                            <li><Link to="/legal/compliance" className="hover:text-primary transition-colors">Institutional Compliance</Link></li>
                            <li><Link to="/request-demo" className="hover:text-primary transition-colors">Contact Sales</Link></li>
                            <li><a href="#" className="hover:text-primary transition-colors">Documentation</a></li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="font-black text-xs uppercase tracking-[0.4em] text-primary mb-10">Native Web Platform</h4>
                        <div className="bg-slate-800/50 rounded-[2rem] p-6 border border-slate-700/50">
                             <p className="text-xs text-slate-400 leading-relaxed mb-4">
                                Lizoku is a modern PWA. Access 100% of features on desktop, tablet, or smartphone without an app.
                             </p>
                             <div className="flex flex-wrap gap-3">
                                <div className="flex items-center gap-1.5 text-[10px] font-black text-slate-500 uppercase">
                                    <Icon name="CheckCircle" className="h-3 w-3 text-green-500" /> Fast & Secure
                                </div>
                                <div className="flex items-center gap-1.5 text-[10px] font-black text-slate-500 uppercase">
                                    <Icon name="CheckCircle" className="h-3 w-3 text-green-500" /> Offline Sync
                                </div>
                             </div>
                        </div>
                    </div>
                </div>
                
                <div className="max-w-[1440px] mx-auto mt-32 pt-10 border-t border-slate-800 flex flex-col md:flex-row justify-between items-center gap-8 text-center md:text-left">
                    <p className="text-[11px] font-bold text-slate-400">© 2025 Lizoku Learning Solutions. All Rights Reserved.</p>
                    <div className="flex flex-wrap justify-center gap-10 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                         <Link to="/legal/privacy" className="hover:text-primary transition-colors">Privacy Policy</Link>
                         <Link to="/legal/cookies" className="hover:text-primary transition-colors">Cookie Settings</Link>
                         <Link to="/legal/security" className="hover:text-primary transition-colors">Security Standards</Link>
                    </div>
                </div>
            </footer>
        </div>
    );
};