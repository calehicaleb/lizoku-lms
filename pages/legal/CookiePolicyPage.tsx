
import React from 'react';

const CookiePolicyPage: React.FC = () => {
    return (
        <div className="max-w-3xl mx-auto py-24 px-6">
            <h1 className="text-4xl font-black mb-4">Cookie Policy</h1>
            <p className="text-slate-500 mb-12 font-medium">How we use local storage to provide a seamless learning experience.</p>

            <div className="prose prose-slate max-w-none font-medium">
                <p>Lizoku uses "cookies" and similar local storage technologies (like SessionStorage) to ensure our platform functions efficiently.</p>
                <h3>1. Essential Cookies</h3>
                <p>These are necessary for authentication sessions and security CSRF tokens.</p>
                <h3>2. Functional Cookies</h3>
                <p>These remember preferences like Dark Mode and sidebar states.</p>
            </div>
        </div>
    );
};

export default CookiePolicyPage;
