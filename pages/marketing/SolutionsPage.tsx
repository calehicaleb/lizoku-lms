
import React from 'react';
import { Icon } from '../../components/icons';

const SolutionsPage: React.FC = () => {
    return (
        <div className="solutions-page-content pb-24">
            <section className="py-24 px-6 reveal">
                <div className="max-w-5xl mx-auto text-center">
                    <h1 className="text-6xl md:text-8xl font-black tracking-tighter mb-8 leading-[0.9]">Sector-Focused <br/><span className="text-primary-dark">Education.</span></h1>
                    <p className="text-xl text-slate-500 max-w-3xl mx-auto font-medium">
                        One platform, infinite possibilities. Lizoku is modularly designed for different learning environments.
                    </p>
                </div>
            </section>

            <div className="max-w-7xl mx-auto px-6 space-y-32">
                <SolutionRow 
                    reversed
                    image="https://images.unsplash.com/photo-1541339907198-e08759dfc3f0?auto=format&fit=crop&w=800&q=80"
                    icon="Building2"
                    title="Higher Education"
                    tagline="For Universities & Colleges"
                    desc="Manage complex multi-semester sessions, academic transcripts, and institutional compliance with local data residency laws."
                    features={["Official Transcripts", "SCORM Support", "Blended Learning"]}
                />

                <SolutionRow 
                    image="https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&w=800&q=80"
                    icon="Users"
                    title="K-12 & Private Schools"
                    tagline="For Primary & Secondary"
                    desc="Safe and engaging for busy teachers. Automated attendance, simple quiz builders, and parent-ready progress reports."
                    features={["Gamified Badges", "Simple Auth", "Safety Filter"]}
                />
            </div>
        </div>
    );
};

const SolutionRow: React.FC<{reversed?: boolean, image: string, icon: any, title: string, tagline: string, desc: string, features: string[]}> = ({ reversed, image, icon, title, tagline, desc, features }) => (
    <div className={`grid grid-cols-1 lg:grid-cols-2 gap-16 items-center reveal ${reversed ? 'lg:flex-row-reverse' : ''}`}>
        <div className={reversed ? 'lg:order-2' : 'lg:order-1'}>
            <img src={image} alt={title} className="rounded-[3rem] shadow-2xl border-4 border-white" />
        </div>
        <div className={reversed ? 'lg:order-1' : 'lg:order-2'}>
            <div className="flex items-center gap-3 mb-4">
                <Icon name={icon} className="h-6 w-6 text-primary-dark" />
                <span className="text-sm font-black uppercase tracking-widest text-primary-dark">{tagline}</span>
            </div>
            <h2 className="text-5xl font-black mb-6 tracking-tight">{title}</h2>
            <p className="text-xl text-slate-500 mb-10 leading-relaxed font-medium">{desc}</p>
            <div className="grid grid-cols-2 gap-4">
                {features.map(f => (
                    <div key={f} className="flex items-center gap-2 text-sm font-bold text-slate-700">
                        <Icon name="CheckCircle" className="h-5 w-5 text-green-500" /> {f}
                    </div>
                ))}
            </div>
        </div>
    </div>
);

export default SolutionsPage;
