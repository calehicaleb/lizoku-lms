
import React from 'react';

const PrivacyPolicyPage: React.FC = () => {
    return (
        <div className="max-w-3xl mx-auto py-24 px-6">
            <h1 className="text-4xl font-black mb-4">Privacy Policy</h1>
            <p className="text-sm text-slate-400 mb-12 uppercase tracking-widest font-bold">Effective Date: January 1, 2025</p>

            <div className="prose prose-slate max-w-none font-medium">
                <h2>1. Introduction</h2>
                <p>Lizoku Learning Solutions respects your privacy and is committed to protecting your personal data in compliance with the Laws of Kenya.</p>

                <h2>2. Information We Collect</h2>
                <p>We collect information provided by your institution or by you directly, including:</p>
                <ul>
                    <li>Full Name and Email Address</li>
                    <li>Institutional IDs and Program Details</li>
                </ul>
            </div>
        </div>
    );
};

export default PrivacyPolicyPage;
