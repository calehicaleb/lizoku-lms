import React, { useState, useEffect } from 'react';
import { PageHeader } from '../../components/ui/PageHeader';
import * as api from '../../services/api';
import { StudentTranscript } from '../../types';
import { useAuth } from '../../contexts/AuthContext';
import { Icon } from '../../components/icons';

const MyTranscriptPage: React.FC = () => {
    const { user } = useAuth();
    const [transcript, setTranscript] = useState<StudentTranscript | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user) return;

        const fetchTranscript = async () => {
            try {
                const data = await api.getStudentTranscript(user.id);
                setTranscript(data);
            } catch (error) {
                console.error("Failed to fetch transcript", error);
            } finally {
                setLoading(false);
            }
        };

        fetchTranscript();
    }, [user]);

    if (loading) {
        return <div className="text-center p-8">Loading your transcript...</div>;
    }

    if (!transcript) {
        return (
            <div>
                <PageHeader title="My Transcript" subtitle="Your official academic record." />
                <div className="text-center py-16 px-6 bg-white rounded-lg shadow-sm">
                    <Icon name="ScrollText" className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-lg font-medium text-gray-900">Transcript Not Available</h3>
                    <p className="mt-1 text-sm text-gray-500">We could not find a transcript associated with your account. Please contact an administrator.</p>
                </div>
            </div>
        );
    }
    
    return (
        <div>
            <div className="flex justify-between items-center mb-6 no-print">
                <PageHeader title="My Transcript" subtitle="Your official academic record." />
                <button 
                    onClick={() => window.print()}
                    className="bg-primary text-gray-800 font-bold py-2 px-4 rounded-md hover:bg-primary-dark transition duration-300 flex items-center"
                >
                    <Icon name="FileText" className="h-5 w-5 mr-2" />
                    Print Transcript
                </button>
            </div>
            
            <div className="bg-white p-8 rounded-lg shadow-sm printable-area">
                <header className="text-center border-b pb-4 mb-6">
                    <h1 className="text-3xl font-bold text-gray-800">Lizoku University</h1>
                    <p className="text-lg text-gray-600">Official Academic Transcript</p>
                </header>

                <section className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4 mb-8">
                    <div>
                        <span className="font-bold text-gray-700">Student Name: </span>
                        <span>{transcript.studentName}</span>
                    </div>
                     <div>
                        <span className="font-bold text-gray-700">Student ID: </span>
                        <span>{transcript.studentId}</span>
                    </div>
                    <div className="md:col-span-2">
                        <span className="font-bold text-gray-700">Program: </span>
                        <span>{transcript.programName}</span>
                    </div>
                </section>

                <section className="space-y-8">
                    {transcript.semesters.map(semester => (
                        <div key={semester.semesterName}>
                            <h2 className="text-xl font-bold text-gray-700 bg-gray-100 p-2 rounded-t-md">{semester.semesterName}</h2>
                            <div className="overflow-x-auto">
                                <table className="min-w-full text-sm">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-4 py-2 text-left font-medium text-gray-500">Course Code</th>
                                            <th className="px-4 py-2 text-left font-medium text-gray-500">Course Title</th>
                                            <th className="px-4 py-2 text-center font-medium text-gray-500">Credits</th>
                                            <th className="px-4 py-2 text-center font-medium text-gray-500">Grade</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {semester.courses.map(course => (
                                            <tr key={course.courseCode}>
                                                <td className="px-4 py-3 whitespace-nowrap font-medium text-gray-900">{course.courseCode}</td>
                                                <td className="px-4 py-3 whitespace-nowrap text-gray-600">{course.courseTitle}</td>
                                                <td className="px-4 py-3 whitespace-nowrap text-center text-gray-600">{course.credits.toFixed(1)}</td>
                                                <td className="px-4 py-3 whitespace-nowrap text-center font-bold text-gray-800">{course.grade}</td>
                                            </tr>
                                        ))}
                                        <tr className="bg-gray-50 font-bold">
                                            <td colSpan={2} className="px-4 py-2 text-right">Semester GPA</td>
                                            <td colSpan={2} className="px-4 py-2 text-center">{semester.semesterGpa.toFixed(2)}</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    ))}
                </section>
                
                <section className="mt-8 pt-4 border-t-2 border-gray-800 text-right">
                    <h3 className="text-xl font-bold text-gray-800">
                        Cumulative GPA: {transcript.cumulativeGpa.toFixed(2)}
                    </h3>
                </section>
                
                <footer className="mt-12 text-center text-xs text-gray-500">
                    <p>-- End of Transcript --</p>
                    <p>Issued on: {new Date().toLocaleDateString()}</p>
                </footer>
            </div>
        </div>
    );
};

export default MyTranscriptPage;