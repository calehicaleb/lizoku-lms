
import React from 'react';

const ComplianceStandardsPage: React.FC = () => {
    return (
        <div className="max-w-4xl mx-auto py-24 px-6">
            <div className="inline-flex items-center gap-2 bg-secondary text-white font-black text-[10px] uppercase tracking-widest px-4 py-1.5 rounded-full mb-6 border border-secondary/20">
                Academic Technical Standards
            </div>
            <h1 className="text-5xl md:text-6xl font-black text-slate-900 mb-8 tracking-tight leading-[1]">
                Interoperability <br/>& Ministry Alignment.
            </h1>
            
            <div className="prose prose-lg max-w-none">
                <p className="text-xl text-slate-500 leading-relaxed mb-12 font-medium">
                    Education shouldn't be siloed. Lizoku is built on global standards for learning content delivery, ensuring legacy courseware works perfectly.
                </p>

                <div className="space-y-12 mb-16">
                    <div className="border-l-4 border-primary pl-8 py-2">
                        <h3 className="text-2xl font-black mb-2">SCORM 1.2 & 2004 Support</h3>
                        <p className="text-slate-600 font-medium">
                            Import content from any compliant authoring tool. Our runtime handles state, score, and completion tracking.
                        </p>
                    </div>
                </div>

                <h2 className="text-3xl font-black mt-16 mb-6">Technical Specs</h2>
                <div className="bg-gray-50 rounded-3xl border border-slate-100 overflow-hidden shadow-sm not-prose">
                    <table className="w-full text-sm">
                        <thead className="bg-gray-100">
                            <tr>
                                <th className="px-6 py-4 text-left font-black uppercase text-[10px] tracking-widest text-slate-500">Feature</th>
                                <th className="px-6 py-4 text-left font-black uppercase text-[10px] tracking-widest text-slate-500">Lizoku Specification</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            <tr>
                                <td className="px-6 py-4 font-bold">LMS Interoperability</td>
                                <td className="px-6 py-4 text-slate-500 font-medium">SCORM 1.2, 2004, LTI 1.3</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default ComplianceStandardsPage;
