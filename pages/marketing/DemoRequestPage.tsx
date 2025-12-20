
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Icon } from '../../components/icons';

const DemoRequestPage: React.FC = () => {
    const [submitted, setSubmitted] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitted(true);
    };

    return (
        <div className="demo-request-page-content">
            <main className="max-w-6xl mx-auto px-6 py-24 grid grid-cols-1 lg:grid-cols-2 gap-24 items-center">
                <div className="reveal">
                    <span className="inline-block py-1 px-3 bg-secondary/10 text-secondary font-black text-[10px] uppercase tracking-widest rounded-md mb-6">Partner with Lizoku</span>
                    <h1 className="text-6xl md:text-8xl font-black tracking-tighter leading-[0.9] mb-8">Modernize Your <br/><span className="text-primary-dark">Campus.</span></h1>
                    <p className="text-xl text-slate-500 mb-10 leading-relaxed font-medium">
                        Discover how Lizoku LMS can streamline your administrative workflows, empower your faculty with AI, and provide a global standard of education.
                    </p>
                </div>

                <div className="bg-white p-10 rounded-[3rem] shadow-2xl border border-slate-100 relative reveal">
                    {submitted ? (
                        <div className="text-center py-20 animate-in zoom-in-95">
                            <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
                                <Icon name="CheckCircle" className="h-10 w-10" />
                            </div>
                            <h2 className="text-3xl font-black mb-4">Request Received!</h2>
                            <p className="text-slate-500 font-medium mb-8">A solution architect will contact you within 24 hours.</p>
                            <Link to="/" className="text-primary-dark font-black uppercase text-xs tracking-widest hover:underline">&larr; Back to Portal</Link>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <h3 className="text-2xl font-black mb-8 tracking-tight">Institutional Request</h3>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1 ml-1">First Name</label>
                                    <input required type="text" className="w-full px-5 py-3 bg-gray-50 rounded-xl border-none font-bold" />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1 ml-1">Last Name</label>
                                    <input required type="text" className="w-full px-5 py-3 bg-gray-50 rounded-xl border-none font-bold" />
                                </div>
                            </div>
                            <div>
                                <label className="block text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1 ml-1">Institutional Email</label>
                                <input required type="email" className="w-full px-5 py-3 bg-gray-50 rounded-xl border-none font-bold" />
                            </div>
                            <button type="submit" className="w-full bg-primary text-slate-900 font-black py-5 rounded-2xl uppercase tracking-widest text-xs shadow-xl shadow-primary/20 hover:bg-primary-dark transition-all active:scale-[0.98]">Request demo tour</button>
                        </form>
                    )}
                </div>
            </main>
        </div>
    );
};

export default DemoRequestPage;
