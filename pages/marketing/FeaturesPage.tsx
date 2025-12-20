
import React from 'react';
import { Icon } from '../../components/icons';

const FeaturesPage: React.FC = () => {
    return (
        <div className="features-page-content">
            <section className="px-6 py-24 reveal">
                <div className="max-w-4xl mx-auto text-center">
                    <span className="inline-block py-1.5 px-4 bg-primary/10 text-primary-dark font-black text-[10px] uppercase tracking-widest rounded-full mb-6">Engineered for Excellence</span>
                    <h1 className="text-6xl md:text-8xl font-black tracking-tighter leading-[0.9] mb-8">The Platform for <br/><span className="text-primary-dark">Modern Learning.</span></h1>
                    <p className="text-xl text-slate-500 max-w-2xl mx-auto leading-relaxed font-medium">
                        Lizoku isn't just an LMS. It's a suite of intelligently designed tools built to empower instructors and engage students.
                    </p>
                </div>
            </section>

            <section className="max-w-7xl mx-auto px-6 mb-32 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
                <FeatureCard 
                    icon="Sparkles"
                    title="AI Course Co-pilot"
                    desc="Generate complete module outlines, lesson content, and quizzes in seconds using Gemini 3 Pro."
                />
                <FeatureCard 
                    icon="BarChart2"
                    title="Advanced Analytics"
                    desc="Track institutional health with real-time geospatial heatmaps and departmental ROI tracking."
                />
                <FeatureCard 
                    icon="Zap"
                    title="Lizoku SpeedGrader™"
                    desc="Mark thousands of essays in record time with side-by-side rubric integration."
                />
            </section>
        </div>
    );
};

const FeatureCard: React.FC<{icon: any, title: string, desc: string}> = ({ icon, title, desc }) => (
    <div className="p-8 bg-gray-50 rounded-[3rem] border border-transparent hover:border-primary/50 transition-all group reveal">
        <div className="w-14 h-14 bg-white rounded-2xl shadow-sm flex items-center justify-center mb-8 group-hover:bg-primary group-hover:rotate-12 transition-all">
            <Icon name={icon} className="h-7 w-7 text-primary-dark group-hover:text-slate-900" />
        </div>
        <h3 className="text-2xl font-black mb-4">{title}</h3>
        <p className="text-slate-500 leading-relaxed font-medium">{desc}</p>
    </div>
);

export default FeaturesPage;
