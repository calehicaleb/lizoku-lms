
import React from 'react';
import { Link } from 'react-router-dom';
import { Icon } from '../../components/icons';

const PricingPage: React.FC = () => {
    return (
        <div className="pricing-page-content py-24">
            <div className="max-w-7xl mx-auto px-6">
                <div className="text-center mb-24 reveal">
                    <h1 className="text-6xl md:text-[85px] font-black tracking-tighter mb-6 leading-[0.9]">Simple, Honest <br/>Pricing.</h1>
                    <p className="text-xl text-slate-500 max-w-2xl mx-auto font-medium">No hidden fees. No setup costs. Just a powerful platform built for institutional growth.</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 mb-32">
                    <PricePlan 
                        title="Starter"
                        price="5,000"
                        desc="Ideal for vocational instructors and specialized training programs."
                        features={["Up to 50 Users", "AI Content Tools", "Standard Formats"]}
                    />
                    <PricePlan 
                        popular
                        title="Institution"
                        price="20,000"
                        desc="Comprehensive features for small-to-medium universities and schools."
                        features={["Up to 500 Users", "Full AI Suite", "Advanced Reporting"]}
                    />
                    <PricePlan 
                        title="Enterprise"
                        price="Custom"
                        desc="Dedicated infrastructure and custom integrations for large institutions."
                        features={["Unlimited Users", "API Access", "Custom Domain"]}
                    />
                </div>
            </div>
        </div>
    );
};

const PricePlan: React.FC<{title: string, price: string, desc: string, features: string[], popular?: boolean}> = ({ title, price, desc, features, popular }) => (
    <div className={`p-12 rounded-[4rem] border-2 transition-all relative reveal ${popular ? 'bg-slate-900 text-white border-primary shadow-2xl scale-105 z-10' : 'bg-white text-slate-800 border-slate-100 hover:border-primary'}`}>
        {popular && <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-primary text-slate-900 font-black text-[10px] uppercase tracking-widest px-8 py-3 rounded-full">Most Popular</div>}
        <h3 className="text-3xl font-black mb-2">{title}</h3>
        <p className={`text-sm mb-10 font-medium ${popular ? 'text-slate-400' : 'text-slate-500'}`}>{desc}</p>
        <div className="mb-12">
            <span className="text-5xl font-black">{price === 'Custom' ? price : `Ksh ${price}`}</span>
            {price !== 'Custom' && <span className="text-[10px] font-black uppercase ml-1 opacity-50">/month</span>}
        </div>
        <ul className="space-y-4 mb-12">
            {features.map(f => (
                <li key={f} className="flex items-center gap-3 text-sm font-bold">
                    <Icon name="CheckCircle" className={`h-5 w-5 ${popular ? 'text-primary' : 'text-green-500'}`} /> {f}
                </li>
            ))}
        </ul>
        <Link to="/login" className={`w-full py-5 rounded-2xl flex items-center justify-center font-black uppercase tracking-widest text-xs transition-all ${popular ? 'bg-primary text-slate-900' : 'bg-slate-900 text-white'}`}>Get Started</Link>
    </div>
);

export default PricingPage;
