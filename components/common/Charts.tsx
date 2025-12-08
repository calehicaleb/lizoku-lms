
import React, { useState } from 'react';

interface ChartPoint {
    label: string;
    value: number;
    color?: string;
}

interface ChartProps {
    data: ChartPoint[];
    height?: number;
    title?: string;
}

// --- BAR CHART (Simple) ---
export const BarChart: React.FC<ChartProps> = ({ data, height = 200 }) => {
    const [hoverIndex, setHoverIndex] = useState<number | null>(null);
    const maxValue = Math.max(...data.map(d => d.value)) || 1;
    
    return (
        <div className="w-full h-full flex flex-col font-sans" style={{ height: `${height}px` }}>
            <div className="flex-1 flex items-end justify-between gap-2 pt-6 pb-2 px-2 relative">
                {/* Y-Axis Grid Lines */}
                <div className="absolute inset-0 flex flex-col justify-between pointer-events-none px-2 pb-8 pt-6">
                    <div className="border-t border-gray-200 dark:border-gray-700 w-full h-0"></div>
                    <div className="border-t border-gray-200 dark:border-gray-700 w-full h-0 border-dashed opacity-50"></div>
                    <div className="border-t border-gray-200 dark:border-gray-700 w-full h-0"></div>
                </div>

                {data.map((point, i) => {
                    const percentage = (point.value / maxValue) * 100;
                    return (
                        <div 
                            key={i} 
                            className="flex-1 flex flex-col justify-end items-center group relative h-full z-10"
                            onMouseEnter={() => setHoverIndex(i)}
                            onMouseLeave={() => setHoverIndex(null)}
                        >
                            {/* Tooltip */}
                            <div className={`absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs py-1 px-2 rounded opacity-0 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-20 ${hoverIndex === i ? 'opacity-100' : ''}`}>
                                {point.label}: {point.value}
                            </div>
                            
                            {/* Bar */}
                            <div 
                                className="w-full max-w-[40px] bg-primary rounded-t-sm transition-all duration-500 ease-out hover:bg-primary-dark opacity-80 hover:opacity-100"
                                style={{ height: `${percentage}%` }}
                            ></div>
                        </div>
                    );
                })}
            </div>
            {/* X-Axis Labels */}
            <div className="flex justify-between px-2 h-6">
                {data.map((point, i) => (
                    <div key={i} className="flex-1 text-center text-[10px] text-gray-500 dark:text-gray-400 truncate px-1">
                        {point.label}
                    </div>
                ))}
            </div>
        </div>
    );
};

// --- GROUPED BAR CHART (Comparison) ---
interface GroupedBarData {
    label: string;
    value1: number; // e.g., Allocated
    value2: number; // e.g., Spent
    color1?: string;
    color2?: string;
}

export const GroupedBarChart: React.FC<{ data: GroupedBarData[], height?: number, label1: string, label2: string }> = ({ data, height = 250, label1, label2 }) => {
    const [hoverIndex, setHoverIndex] = useState<number | null>(null);
    const maxValue = Math.max(...data.map(d => Math.max(d.value1, d.value2))) * 1.1 || 1;

    return (
        <div className="w-full h-full flex flex-col font-sans" style={{ height: `${height}px` }}>
            <div className="flex justify-end gap-4 text-xs mb-2">
                <div className="flex items-center"><div className="w-3 h-3 bg-gray-300 dark:bg-gray-600 mr-1 rounded-sm"></div> {label1}</div>
                <div className="flex items-center"><div className="w-3 h-3 bg-primary mr-1 rounded-sm"></div> {label2}</div>
            </div>
            <div className="flex-1 flex items-end justify-between gap-4 pt-4 pb-2 px-2 relative border-l border-b border-gray-200 dark:border-gray-700">
                 {/* Grid Lines */}
                 <div className="absolute inset-0 flex flex-col justify-between pointer-events-none px-2 pb-0 pt-4 opacity-30">
                    <div className="border-t border-gray-400 w-full h-0"></div>
                    <div className="border-t border-gray-400 w-full h-0"></div>
                    <div className="border-t border-gray-400 w-full h-0"></div>
                </div>

                {data.map((point, i) => {
                    const h1 = (point.value1 / maxValue) * 100;
                    const h2 = (point.value2 / maxValue) * 100;
                    return (
                        <div 
                            key={i} 
                            className="flex-1 flex justify-center items-end h-full gap-1 group relative z-10"
                            onMouseEnter={() => setHoverIndex(i)}
                            onMouseLeave={() => setHoverIndex(null)}
                        >
                             {/* Tooltip */}
                             <div className={`absolute -top-10 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs py-1 px-2 rounded opacity-0 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-30 shadow-lg ${hoverIndex === i ? 'opacity-100' : ''}`}>
                                <strong>{point.label}</strong><br/>
                                {label1}: {point.value1.toLocaleString()}<br/>
                                {label2}: {point.value2.toLocaleString()}
                            </div>

                            {/* Bar 1 */}
                            <div className="w-3 sm:w-6 bg-gray-300 dark:bg-gray-600 rounded-t-sm transition-all duration-300" style={{ height: `${h1}%` }}></div>
                            {/* Bar 2 */}
                            <div className="w-3 sm:w-6 bg-primary rounded-t-sm transition-all duration-300" style={{ height: `${h2}%` }}></div>
                        </div>
                    );
                })}
            </div>
             <div className="flex justify-between px-2 mt-2">
                {data.map((point, i) => (
                    <div key={i} className="flex-1 text-center text-[10px] text-gray-500 dark:text-gray-400 truncate px-1">
                        {point.label}
                    </div>
                ))}
            </div>
        </div>
    );
};

// --- MULTI-LINE CHART ---
interface MultiLineData {
    labels: string[];
    datasets: {
        label: string;
        data: number[];
        color: string;
    }[];
}

export const MultiLineChart: React.FC<{ data: MultiLineData, height?: number }> = ({ data, height = 250 }) => {
    const [hoverIndex, setHoverIndex] = useState<number | null>(null);
    
    // Flatten data to find max value
    const allValues = data.datasets.flatMap(d => d.data);
    const maxValue = Math.max(...allValues) * 1.1 || 1;
    const points = data.labels.length;
    
    // SVG Dimensions
    const width = 100;
    const chartHeight = 60;

    return (
        <div className="w-full h-full flex flex-col" style={{ height: `${height}px` }}>
            <div className="flex justify-end gap-4 text-xs mb-2">
                {data.datasets.map((ds, i) => (
                    <div key={i} className="flex items-center">
                        <div className="w-3 h-1 mr-1" style={{ backgroundColor: ds.color }}></div>
                        {ds.label}
                    </div>
                ))}
            </div>
            
            <div className="flex-1 relative w-full">
                <svg viewBox={`0 0 ${width} ${chartHeight}`} className="w-full h-full overflow-visible" preserveAspectRatio="none">
                    {/* Grid Lines */}
                    <line x1="0" y1="0" x2={width} y2="0" stroke="#e5e7eb" strokeWidth="0.5" className="dark:stroke-gray-700" />
                    <line x1="0" y1={chartHeight/2} x2={width} y2={chartHeight/2} stroke="#e5e7eb" strokeWidth="0.5" strokeDasharray="2" className="dark:stroke-gray-700" />
                    <line x1="0" y1={chartHeight} x2={width} y2={chartHeight} stroke="#e5e7eb" strokeWidth="0.5" className="dark:stroke-gray-700" />

                    {/* Lines */}
                    {data.datasets.map((dataset, dsIndex) => {
                        const coords = dataset.data.map((val, i) => ({
                            x: (i / (points - 1)) * width,
                            y: chartHeight - (val / maxValue) * chartHeight
                        }));
                        
                        // Create Smooth Bezier Curve
                        let d = `M ${coords[0].x},${coords[0].y}`;
                        for (let i = 0; i < coords.length - 1; i++) {
                            const x_mid = (coords[i].x + coords[i + 1].x) / 2;
                            const y_mid = (coords[i].y + coords[i + 1].y) / 2;
                            const cp_x1 = (x_mid + coords[i].x) / 2;
                            const cp_x2 = (x_mid + coords[i + 1].x) / 2;
                            d += ` Q ${cp_x1},${coords[i].y} ${x_mid},${y_mid}`;
                            d += ` T ${coords[i + 1].x},${coords[i + 1].y}`;
                        }

                        return (
                            <g key={dsIndex}>
                                <path d={d} fill="none" stroke={dataset.color} strokeWidth="1.5" vectorEffect="non-scaling-stroke" />
                                {coords.map((c, i) => (
                                    <circle 
                                        key={i}
                                        cx={c.x} 
                                        cy={c.y} 
                                        r="2" 
                                        fill={dataset.color} 
                                        strokeWidth="0"
                                        className="cursor-pointer transition-all hover:r-3"
                                        vectorEffect="non-scaling-stroke"
                                        onMouseEnter={() => setHoverIndex(i)}
                                        onMouseLeave={() => setHoverIndex(null)}
                                    />
                                ))}
                            </g>
                        );
                    })}
                    
                    {/* Hover Line */}
                    {hoverIndex !== null && (
                        <line 
                            x1={(hoverIndex / (points - 1)) * width} 
                            y1="0" 
                            x2={(hoverIndex / (points - 1)) * width} 
                            y2={chartHeight} 
                            stroke="#9ca3af" 
                            strokeWidth="0.5" 
                            strokeDasharray="2"
                        />
                    )}
                </svg>

                {/* Tooltip */}
                {hoverIndex !== null && (
                    <div 
                        className="absolute bg-gray-900/90 text-white text-xs p-2 rounded shadow-lg pointer-events-none transform -translate-x-1/2 z-50"
                        style={{ 
                            left: `${(hoverIndex / (points - 1)) * 100}%`, 
                            top: '0' 
                        }}
                    >
                        <p className="font-bold border-b border-gray-700 pb-1 mb-1">{data.labels[hoverIndex]}</p>
                        {data.datasets.map((ds, i) => (
                            <div key={i} className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: ds.color }}></div>
                                <span>{ds.label}: {ds.data[hoverIndex].toLocaleString()}</span>
                            </div>
                        ))}
                    </div>
                )}
            </div>
            
            {/* X-Axis */}
            <div className="flex justify-between mt-2 px-1">
                {data.labels.map((l, i) => (
                    <span key={i} className="text-[10px] text-gray-500 dark:text-gray-400">{l}</span>
                ))}
            </div>
        </div>
    );
};

// --- DONUT CHART (Reused) ---
export const DonutChart: React.FC<ChartProps> = ({ data, height = 200 }) => {
    const total = data.reduce((acc, curr) => acc + curr.value, 0);
    const [hoverIndex, setHoverIndex] = useState<number | null>(null);
    
    let cumulativeAngle = 0;
    const radius = 80;
    const center = 100;
    const thickness = 25;

    const paths = data.map((point, i) => {
        const percentage = point.value / total;
        const angle = percentage * 360;
        const startAngle = cumulativeAngle;
        const endAngle = cumulativeAngle + angle;
        const largeArc = angle > 180 ? 1 : 0;
        
        const x1 = center + radius * Math.cos(Math.PI * startAngle / 180);
        const y1 = center + radius * Math.sin(Math.PI * startAngle / 180);
        const x2 = center + radius * Math.cos(Math.PI * endAngle / 180);
        const y2 = center + radius * Math.sin(Math.PI * endAngle / 180);
        
        const innerRadius = radius - thickness;
        const x3 = center + innerRadius * Math.cos(Math.PI * endAngle / 180);
        const y3 = center + innerRadius * Math.sin(Math.PI * endAngle / 180);
        const x4 = center + innerRadius * Math.cos(Math.PI * startAngle / 180);
        const y4 = center + innerRadius * Math.sin(Math.PI * startAngle / 180);

        const d = [
            `M ${x1} ${y1}`, `A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2}`,
            `L ${x3} ${y3}`, `A ${innerRadius} ${innerRadius} 0 ${largeArc} 0 ${x4} ${y4}`, `Z`
        ].join(' ');

        cumulativeAngle += angle;
        const colors = ['#FFD700', '#5B8FB9', '#8BA9C7', '#E6C200', '#1F2937'];
        const color = point.color || colors[i % colors.length];

        return { path: d, color, ...point, percentage };
    });

    return (
        <div className="flex flex-col sm:flex-row items-center justify-center gap-8 h-full">
            <div className="relative" style={{ width: `${height}px`, height: `${height}px` }}>
                <svg viewBox="0 0 200 200" className="w-full h-full transform -rotate-90">
                    {paths.map((p, i) => (
                        <path 
                            key={i} d={p.path} fill={p.color}
                            className="transition-opacity duration-300 cursor-pointer hover:opacity-80"
                            onMouseEnter={() => setHoverIndex(i)} onMouseLeave={() => setHoverIndex(null)}
                            style={{ opacity: hoverIndex !== null && hoverIndex !== i ? 0.4 : 1 }}
                        />
                    ))}
                    <text x="100" y="100" textAnchor="middle" dy="0.3em" className="fill-gray-700 dark:fill-gray-200 font-bold text-2xl transform rotate-90">{total}</text>
                </svg>
            </div>
            <div className="flex flex-col justify-center space-y-2">
                {paths.map((p, i) => (
                    <div key={i} className={`flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300 transition-opacity duration-200 ${hoverIndex !== null && hoverIndex !== i ? 'opacity-40' : 'opacity-100'}`} onMouseEnter={() => setHoverIndex(i)} onMouseLeave={() => setHoverIndex(null)}>
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: p.color }}></div>
                        <span className="font-medium">{p.label}</span>
                        <span className="text-gray-400 text-xs">({Math.round(p.percentage * 100)}%)</span>
                    </div>
                ))}
            </div>
        </div>
    );
};

// --- LINE CHART (Simple - Kept for compatibility if needed elsewhere) ---
export const LineChart: React.FC<ChartProps> = ({ data, height = 200 }) => {
    // Wrapper for MultiLine to support legacy props
    const multiLineData = {
        labels: data.map(d => d.label),
        datasets: [{ label: 'Value', data: data.map(d => d.value), color: '#FFD700' }]
    };
    return <MultiLineChart data={multiLineData} height={height} />;
};
