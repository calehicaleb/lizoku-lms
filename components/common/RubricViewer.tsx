import React from 'react';
import { Rubric } from '../../types';
import { Icon } from '../icons';

interface RubricViewerProps {
    rubric: Rubric;
}

export const RubricViewer: React.FC<RubricViewerProps> = ({ rubric }) => {
    // Sort levels from highest points to lowest for a logical display
    const sortedLevels = [...rubric.levels].sort((a, b) => b.points - a.points);
    const totalPoints = rubric.criteria.reduce((acc, crit) => acc + crit.points, 0);

    return (
        <div className="border dark:border-gray-700 rounded-lg overflow-hidden">
            <header className="bg-gray-50 dark:bg-gray-700/50 p-4 border-b dark:border-gray-700 flex justify-between items-center">
                <div>
                    <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100">{rubric.title}</h3>
                </div>
                <div className="font-bold text-gray-700 dark:text-gray-200">
                    Total Points: {totalPoints}
                </div>
            </header>
            <div className="overflow-x-auto">
                <table className="min-w-full text-sm border-collapse">
                    <thead>
                        <tr className="bg-gray-100 dark:bg-gray-700/50">
                            <th className="p-2 border dark:border-gray-600 font-medium text-left text-gray-700 dark:text-gray-300 w-1/3">Criteria</th>
                            {sortedLevels.map(level => (
                                <th key={level.id} className="p-2 border dark:border-gray-600 font-medium text-center text-gray-700 dark:text-gray-300">
                                    {level.name}
                                    <span className="block font-normal text-xs text-gray-500 dark:text-gray-400">({level.points} pts)</span>
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {rubric.criteria.map(criterion => (
                            <tr key={criterion.id} className="border-t dark:border-gray-600 bg-white dark:bg-gray-800">
                                <td className="p-3 border dark:border-gray-600 align-top">
                                    <div className="flex items-start gap-2 font-bold text-gray-800 dark:text-gray-200">
                                        <span>{criterion.description}</span>
                                    </div>
                                    {criterion.longDescription && (
                                        <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">{criterion.longDescription}</p>
                                    )}
                                    <p className="text-xs font-bold text-gray-500 dark:text-gray-400 mt-2">({criterion.points} points)</p>
                                </td>
                                {sortedLevels.map(level => (
                                    <td key={level.id} className="p-3 border dark:border-gray-600 align-top text-gray-600 dark:text-gray-300">
                                        {criterion.levelDescriptions?.[level.id] || ''}
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};
