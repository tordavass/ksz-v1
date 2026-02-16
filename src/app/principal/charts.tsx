'use client'

import {
    PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend,
    BarChart, Bar, XAxis, YAxis, CartesianGrid, LabelList
} from 'recharts'

const COLORS = ['#0095c6', '#E0E0E0']; // Primary Blue & Light Grey for clean duo-tone

export function CompletionChart({ rate }: { rate: number }) {
    const data = [
        { name: 'Teljesítve', value: rate },
        { name: 'Hátralévő', value: 100 - rate },
    ];

    return (
        <div className="h-full w-full relative min-h-[150px]">
            <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                    <Pie
                        data={data}
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={70}
                        startAngle={90}
                        endAngle={-270}
                        dataKey="value"
                        stroke="none"
                    >
                        <Cell key="cell-0" fill={COLORS[0]} />
                        <Cell key="cell-1" fill={COLORS[1]} />
                    </Pie>

                </PieChart>
            </ResponsiveContainer>
            {/* Centered Label */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-2xl font-bold text-[var(--kreta-blue)]">{rate.toFixed(0)}%</span>
            </div>
        </div>
    )
}

export function ClassPerformanceChart({ data }: { data: any[] }) {
    // Sort top 5 classes
    const chartData = [...data]
        .sort((a, b) => b.avgHours - a.avgHours)
        .slice(0, 5)
        .map(c => ({
            name: c.name,
            hours: Number(c.avgHours.toFixed(1))
        }))

    return (
        <div className="h-full w-full min-h-[150px]">
            <ResponsiveContainer width="100%" height="100%">
                <BarChart
                    data={chartData}
                    layout="vertical"
                    margin={{ top: 0, right: 10, left: 0, bottom: 0 }}
                    barCategoryGap={10}
                >
                    <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#f0f0f0" />
                    <XAxis type="number" hide />
                    <YAxis
                        dataKey="name"
                        type="category"
                        width={45}
                        tick={{ fill: '#6b7280', fontSize: 11, fontWeight: 500 }}
                        axisLine={false}
                        tickLine={false}
                    />
                    <Tooltip
                        cursor={{ fill: '#f9fafb' }}
                        contentStyle={{
                            backgroundColor: '#fff',
                            border: '1px solid #f0f0f0',
                            borderRadius: '8px',
                            boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
                            fontSize: '11px'
                        }}
                        itemStyle={{ color: 'var(--kreta-blue)', fontWeight: 600 }}
                        formatter={(value: number) => [`${value} óra`, 'Átlag']}
                    />
                    <Bar
                        dataKey="hours"
                        fill="var(--kreta-blue)"
                        radius={[0, 4, 4, 0]}
                        barSize={20}
                    >
                        <LabelList dataKey="hours" position="right" style={{ fill: '#4b5563', fontSize: '10px', fontWeight: 'bold' }} />
                    </Bar>
                </BarChart>
            </ResponsiveContainer>
        </div>
    )
}
