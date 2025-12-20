
import React from 'react';
import { Icon } from '../../components/icons';

const DataProtectionPage: React.FC = () => {
    return (
        <div className="max-w-4xl mx-auto py-24 px-6">
            <div className="inline-flex items-center gap-2 bg-primary/10 text-primary-dark font-black text-[10px] uppercase tracking-widest px-4 py-1.5 rounded-full mb-6 border border-primary/20">
                Compliance Standard: KDPA 2019
            </div>
            <h1 className="text-5xl md:text-6xl font-black text-slate-900 mb-8 tracking-tight leading-[1]">
                Kenyan Data Protection <br/>& Residency.
            </h1>
            
            <div className="prose prose-lg max-w-none">
                <p className="text-xl text-slate-500 leading-relaxed mb-12 font-medium">
                    At Lizoku, we recognize that data is the lifeblood of educational institutions. Our commitment to the Kenya Data Protection Act (2019) ensures that your faculty and students learn in a secure environment.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 not-prose mb-16">
                    <div className="bg-gray-50 p-8 rounded-3xl border border-slate-100 shadow-sm">
                        <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center mb-6">
                            <Icon name="MapPin" className="h-6 w-6 text-blue-600" />
                        </div>
                        <h3 className="text-2xl font-black mb-4">Local Residency</h3>
                        <p className="text-slate-500 text-sm leading-relaxed font-medium">
                            We utilize Tier-3 data centers located within Kenyan jurisdiction for total data sovereignty.
                        </p>
                    </div>
                    <div className="bg-gray-50 p-8 rounded-3xl border border-slate-100 shadow-sm">
                        <div className="w-12 h-12 bg-green-50 rounded-2xl flex items-center justify-center mb-6">
                            <Icon name="Lock" className="h-6 w-6 text-green-600" />
                        </div>
                        <h3 className="text-2xl font-black mb-4">ODPC Ready</h3>
                        <p className="text-slate-500 text-sm leading-relaxed font-medium">
                            Lizoku is registered with the Office of the Data Protection Commissioner (ODPC) as a Data Processor.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DataProtectionPage;
