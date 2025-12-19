
import React, { useState, useEffect, useRef } from 'react';
import { ContentItem } from '../../types';
import { Icon } from '../icons';

interface ScormPlayerProps {
    item: ContentItem;
}

interface ScormLog {
    timestamp: string;
    action: string;
    details: string;
    type: 'info' | 'success' | 'error';
}

export const ScormPlayer: React.FC<ScormPlayerProps> = ({ item }) => {
    const [logs, setLogs] = useState<ScormLog[]>([]);
    const [status, setStatus] = useState<'incomplete' | 'completed' | 'passed' | 'failed'>('incomplete');
    const [score, setScore] = useState(0);
    const [location, setLocation] = useState('slide_1');
    const [showDebug, setShowDebug] = useState(false);

    const log = (action: string, details: string, type: 'info' | 'success' | 'error' = 'info') => {
        setLogs(prev => [{
            timestamp: new Date().toLocaleTimeString(),
            action,
            details,
            type
        }, ...prev]);
    };

    useEffect(() => {
        // Simulate Initialize
        log('LMSInitialize', '""', 'info');
        log('LMSGetValue', 'cmi.core.student_name', 'info');
        log('LMSGetValue', 'cmi.suspend_data', 'info');
    }, []);

    // Simulation Actions
    const handleNextSlide = () => {
        const nextSlide = `slide_${parseInt(location.split('_')[1]) + 1}`;
        setLocation(nextSlide);
        log('LMSSetValue', `cmi.core.lesson_location = "${nextSlide}"`, 'info');
        log('LMSCommit', '""', 'success');
    };

    const handleComplete = () => {
        setStatus('completed');
        log('LMSSetValue', 'cmi.core.lesson_status = "completed"', 'success');
        log('LMSCommit', '""', 'success');
        log('LMSFinish', '""', 'info');
    };

    const handlePass = () => {
        const newScore = 85;
        setScore(newScore);
        setStatus('passed');
        log('LMSSetValue', `cmi.core.score.raw = "${newScore}"`, 'info');
        log('LMSSetValue', 'cmi.core.lesson_status = "passed"', 'success');
        log('LMSCommit', '""', 'success');
    };

    const handleFail = () => {
        const newScore = 45;
        setScore(newScore);
        setStatus('failed');
        log('LMSSetValue', `cmi.core.score.raw = "${newScore}"`, 'error');
        log('LMSSetValue', 'cmi.core.lesson_status = "failed"', 'info');
        log('LMSCommit', '""', 'success');
    };

    return (
        <div className="flex flex-col h-full border dark:border-gray-700 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-900">
            {/* Player Header */}
            <div className="bg-white dark:bg-gray-800 p-4 border-b dark:border-gray-700 flex justify-between items-center">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-md">
                        <Icon name="Package" className="h-6 w-6 text-orange-600 dark:text-orange-400" />
                    </div>
                    <div>
                        <h2 className="text-lg font-bold text-gray-800 dark:text-gray-100">{item.title}</h2>
                        <p className="text-xs text-gray-500 dark:text-gray-400">SCORM {item.scormDetails?.version || '1.2'}</p>
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    <div className="text-right">
                        <p className="text-xs text-gray-500 dark:text-gray-400">Status</p>
                        <span className={`text-sm font-bold uppercase ${
                            status === 'passed' || status === 'completed' ? 'text-green-600' :
                            status === 'failed' ? 'text-red-600' : 'text-yellow-600'
                        }`}>{status}</span>
                    </div>
                    <div className="text-right">
                        <p className="text-xs text-gray-500 dark:text-gray-400">Score</p>
                        <span className="text-sm font-bold text-gray-800 dark:text-gray-200">{score}%</span>
                    </div>
                    <button 
                        onClick={() => setShowDebug(!showDebug)} 
                        className={`p-2 rounded-md transition-colors ${showDebug ? 'bg-primary text-gray-800' : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300'}`}
                        title="Toggle Debug Console"
                    >
                        <Icon name="Code" className="h-5 w-5" />
                    </button>
                </div>
            </div>

            <div className="flex-1 flex overflow-hidden">
                {/* Simulated Content Area (Iframe Placeholder) */}
                <div className="flex-1 flex flex-col items-center justify-center p-8 bg-white dark:bg-gray-800 m-4 rounded-lg shadow-sm border dark:border-gray-700 relative">
                    
                    <div className="absolute top-4 left-4 text-xs font-mono text-gray-400">
                        Lesson Location: {location}
                    </div>

                    <div className="text-center max-w-md">
                        <Icon name="Presentation" className="h-24 w-24 text-gray-300 dark:text-gray-600 mx-auto mb-6" />
                        <h3 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-2">Course Content Simulation</h3>
                        <p className="text-gray-600 dark:text-gray-400 mb-8">
                            In a real environment, the SCORM package content (HTML5/Flash) would run here. 
                            Use the controls below to simulate student interactions and trigger LMS API calls.
                        </p>
                        
                        <div className="grid grid-cols-2 gap-4">
                            <button onClick={handleNextSlide} className="px-4 py-2 bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 rounded-md font-medium hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-colors">
                                Next Slide
                            </button>
                            <button onClick={handleComplete} className="px-4 py-2 bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300 rounded-md font-medium hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">
                                Complete Only
                            </button>
                            <button onClick={handlePass} className="px-4 py-2 bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300 rounded-md font-medium hover:bg-green-200 dark:hover:bg-green-900/50 transition-colors">
                                Pass Quiz (85%)
                            </button>
                            <button onClick={handleFail} className="px-4 py-2 bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300 rounded-md font-medium hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors">
                                Fail Quiz (45%)
                            </button>
                        </div>
                    </div>
                </div>

                {/* Debug Console */}
                {showDebug && (
                    <div className="w-80 bg-gray-900 text-green-400 font-mono text-xs flex flex-col border-l border-gray-700">
                        <div className="p-2 border-b border-gray-700 font-bold bg-black/20 flex justify-between items-center">
                            <span>SCORM API Log</span>
                            <button onClick={() => setLogs([])} className="text-gray-500 hover:text-white"><Icon name="X" className="h-3 w-3" /></button>
                        </div>
                        <div className="flex-1 overflow-y-auto p-2 space-y-1">
                            {logs.map((log, i) => (
                                <div key={i} className="mb-2">
                                    <span className="text-gray-500">[{log.timestamp}]</span> 
                                    <span className={log.type === 'success' ? 'text-green-300' : log.type === 'error' ? 'text-red-400' : 'text-blue-300'}> {log.action}</span>
                                    <br/>
                                    <span className="text-gray-400 pl-4">{log.details}</span>
                                </div>
                            ))}
                            {logs.length === 0 && <span className="text-gray-600 italic">Waiting for API calls...</span>}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
