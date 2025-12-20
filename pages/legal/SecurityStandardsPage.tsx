
import React from 'react';
import { Icon } from '../../components/icons';

const SecurityStandardsPage: React.FC = () => {
    return (
        <div className="max-w-5xl mx-auto py-24 px-6">
            <div className="text-center mb-20">
                <div className="inline-flex items-center gap-2 bg-primary/10 text-primary font-black text-[10px] uppercase tracking-[0.4em] px-6 py-2 rounded-full mb-8 border border-primary/20">
                    Fortress Architecture
                </div>
                <h1 className="text-6xl md:text-8xl font-black mb-8 tracking-tighter leading-[0.9]">Bank-Grade <br/>Security.</h1>
                <p className="text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed font-medium">
                    Encryption isn't a feature; it's our foundation. Lizoku utilizes industry-standard security protocols to ensure 100% data integrity.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
                <div className="p-8 bg-white border border-slate-100 rounded-3xl shadow-sm">
                    <Icon name="Lock" className="h-10 w-10 text-primary mb-6" />
                    <h3 className="text-xl font-black mb-3 text-slate-900">AES-256</h3>
                    <p className="text-sm text-slate-500 leading-relaxed font-medium">Military-grade encryption used for all data at rest within our databases.</p>
                </div>
                <div className="p-8 bg-white border border-slate-100 rounded-3xl shadow-sm">
                    <Icon name="Globe" className="h-10 w-10 text-primary mb-6" />
                    <h3 className="text-xl font-black mb-3 text-slate-900">TLS 1.3</h3>
                    <p className="text-sm text-slate-500 leading-relaxed font-medium">Data in transit is protected via TLS 1.3, preventing snooping and breaches.</p>
                </div>
                <div className="p-8 bg-white border border-slate-100 rounded-3xl shadow-sm">
                    <Icon name="Users" className="h-10 w-10 text-primary mb-6" />
                    <h3 className="text-xl font-black mb-3 text-slate-900">RBAC</h3>
                    <p className="text-sm text-slate-500 leading-relaxed font-medium">Granular Role-Based Access Control ensures data visibility is strictly authorized.</p>
                </div>
            </div>
        </div>
    );
};

export default SecurityStandardsPage;
