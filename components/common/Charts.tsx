
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

// --- BAR CHART ---
export const BarChart: React.FC<ChartProps> = ({ data, height = 200 }) => {
    const [hoverIndex, setHoverIndex] = useState<number | null>(null);
    const maxValue = Math.max(...data.map(d => d.value)) || 1;
    
    return (
        <div className="w-full h-full flex flex-col font-sans" style={{ height: `${height}px` }}>
            <div className="flex-1 flex items-end justify-between gap-2 pt-6 pb-2 px-2 relative">
                {/* Y-Axis Grid Lines (Simplified) */}
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

// --- DONUT CHART ---
export const DonutChart: React.FC<ChartProps> = ({ data, height = 200 }) => {
    const total = data.reduce((acc, curr) => acc + curr.value, 0);
    const [hoverIndex, setHoverIndex] = useState<number | null>(null);
    
    let cumulativeAngle = 0;
    const radius = 80;
    const center = 100;
    const thickness = 25; // Donut thickness

    const paths = data.map((point, i) => {
        const percentage = point.value / total;
        const angle = percentage * 360;
        
        // Convert polar to cartesian
        const startAngle = cumulativeAngle;
        const endAngle = cumulativeAngle + angle;
        
        // Large arc flag
        const largeArc = angle > 180 ? 1 : 0;
        
        // Coordinates for outer circle
        const x1 = center + radius * Math.cos(Math.PI * startAngle / 180);
        const y1 = center + radius * Math.sin(Math.PI * startAngle / 180);
        const x2 = center + radius * Math.cos(Math.PI * endAngle / 180);
        const y2 = center + radius * Math.sin(Math.PI * endAngle / 180);
        
        // Coordinates for inner circle
        const innerRadius = radius - thickness;
        const x3 = center + innerRadius * Math.cos(Math.PI * endAngle / 180);
        const y3 = center + innerRadius * Math.sin(Math.PI * endAngle / 180);
        const x4 = center + innerRadius * Math.cos(Math.PI * startAngle / 180);
        const y4 = center + innerRadius * Math.sin(Math.PI * startAngle / 180);

        // SVG Path command
        const d = [
            `M ${x1} ${y1}`, // Move to start of outer arc
            `A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2}`, // Draw outer arc
            `L ${x3} ${y3}`, // Line to end of inner arc
            `A ${innerRadius} ${innerRadius} 0 ${largeArc} 0 ${x4} ${y4}`, // Draw inner arc (reverse direction)
            `Z` // Close path
        ].join(' ');

        cumulativeAngle += angle;
        
        // Default colors if not provided
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
                            key={i}
                            d={p.path}
                            fill={p.color}
                            className="transition-opacity duration-300 cursor-pointer hover:opacity-80"
                            onMouseEnter={() => setHoverIndex(i)}
                            onMouseLeave={() => setHoverIndex(null)}
                            style={{ opacity: hoverIndex !== null && hoverIndex !== i ? 0.4 : 1 }}
                        />
                    ))}
                    {/* Inner Text */}
                    <text x="100" y="100" textAnchor="middle" dy="0.3em" className="fill-gray-700 dark:fill-gray-200 font-bold text-2xl transform rotate-90">
                        {total}
                    </text>
                </svg>
            </div>
            
            {/* Legend */}
            <div className="flex flex-col justify-center space-y-2">
                {paths.map((p, i) => (
                    <div 
                        key={i} 
                        className={`flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300 transition-opacity duration-200 ${hoverIndex !== null && hoverIndex !== i ? 'opacity-40' : 'opacity-100'}`}
                        onMouseEnter={() => setHoverIndex(i)}
                        onMouseLeave={() => setHoverIndex(null)}
                    >
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: p.color }}></div>
                        <span className="font-medium">{p.label}</span>
                        <span className="text-gray-400 text-xs">({Math.round(p.percentage * 100)}%)</span>
                    </div>
                ))}
            </div>
        </div>
    );
};

// --- LINE CHART ---
export const LineChart: React.FC<ChartProps> = ({ data, height = 200 }) => {
    if (data.length < 2) return <div>Not enough data</div>;

    const [hoverPoint, setHoverPoint] = useState<number | null>(null);

    const maxValue = Math.max(...data.map(d => d.value)) * 1.1; // Add 10% padding top
    const points = data.length;
    
    // SVG Dimensions
    const width = 100; // viewBox width units
    const chartHeight = 60; // viewBox height units
    
    // Map data to coordinates
    const coords = data.map((d, i) => ({
        x: (i / (points - 1)) * width,
        y: chartHeight - (d.value / maxValue) * chartHeight
    }));

    // Create Path 'd' attribute
    const pathD = `M ${coords[0].x},${coords[0].y} ` + 
                  coords.slice(1).map(c => `L ${c.x},${c.y}`).join(' ');

    // Area fill path
    const areaD = `${pathD} L ${width},${chartHeight} L 0,${chartHeight} Z`;

    return (
        <div className="w-full h-full flex flex-col" style={{ height: `${height}px` }}>
            <div className="flex-1 relative w-full">
                <svg viewBox={`0 0 ${width} ${chartHeight}`} className="w-full h-full overflow-visible" preserveAspectRatio="none">
                    {/* Defs for Gradient */}
                    <defs>
                        <linearGradient id="lineGradient" x1="0" x2="0" y1="0" y2="1">
                            <stop offset="0%" stopColor="#FFD700" stopOpacity="0.5" />
                            <stop offset="100%" stopColor="#FFD700" stopOpacity="0" />
                        </linearGradient>
                    </defs>
                    
                    {/* Grid Lines */}
                    <line x1="0" y1="0" x2={width} y2="0" stroke="#e5e7eb" strokeWidth="0.5" className="dark:stroke-gray-700" />
                    <line x1="0" y1={chartHeight/2} x2={width} y2={chartHeight/2} stroke="#e5e7eb" strokeWidth="0.5" strokeDasharray="2" className="dark:stroke-gray-700" />
                    <line x1="0" y1={chartHeight} x2={width} y2={chartHeight} stroke="#e5e7eb" strokeWidth="0.5" className="dark:stroke-gray-700" />

                    {/* Area Fill */}
                    <path d={areaD} fill="url(#lineGradient)" />
                    
                    {/* Line */}
                    <path d={pathD} fill="none" stroke="#E6C200" strokeWidth="1.5" vectorEffect="non-scaling-stroke" />
                    
                    {/* Interactive Points */}
                    {coords.map((c, i) => (
                        <g key={i}>
                            <circle 
                                cx={c.x} 
                                cy={c.y} 
                                r="2" 
                                fill="#fff" 
                                stroke="#E6C200" 
                                strokeWidth="1"
                                className="cursor-pointer hover:r-3 transition-all"
                                vectorEffect="non-scaling-stroke"
                                onMouseEnter={() => setHoverPoint(i)}
                                onMouseLeave={() => setHoverPoint(null)}
                            />
                        </g>
                    ))}
                </svg>
                
                {/* Tooltip Overlay */}
                {hoverPoint !== null && (
                    <div 
                        className="absolute bg-gray-800 text-white text-xs py-1 px-2 rounded pointer-events-none transform -translate-x-1/2 -translate-y-full"
                        style={{ 
                            left: `${(hoverPoint / (points - 1)) * 100}%`, 
                            top: `${100 - (data[hoverPoint].value / maxValue) * 100}%`,
                            marginTop: '-8px'
                        }}
                    >
                        {data[hoverPoint].label}: {data[hoverPoint].value}
                    </div>
                )}
            </div>
            
            {/* X-Axis Labels */}
            <div className="flex justify-between mt-2 px-1">
                {data.map((d, i) => (
                    // Show only first, middle, last, or minimal labels if too many points
                    (i === 0 || i === data.length - 1 || i % Math.ceil(data.length/4) === 0) && (
                        <span key={i} className="text-[10px] text-gray-500 dark:text-gray-400">
                            {d.label}
                        </span>
                    )
                ))}
            </div>
        </div>
    );
};
