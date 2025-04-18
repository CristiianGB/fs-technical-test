import React, { useState, useMemo } from 'react';
import {
    LineChart, BarChart, Bar, Line, XAxis, YAxis, CartesianGrid,
    Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import { format } from 'date-fns';

// Categorías
const RENEWABLES = [
    'Hidráulica', 'Eólica', 'Solar fotovoltaica', 'Solar térmica',
    'Hidroeólica', 'Otras renovables', 'Residuos renovables', 'Generación renovable'
];

const NON_RENEWABLES = [
    'Nuclear', 'Ciclo combinado', 'Carbón', 'Motores diésel',
    'Turbina de gas', 'Turbina de vapor', 'Cogeneración',
    'Residuos no renovables', 'Generación no renovable'
];

const CHART_TYPES = {
    line: 'Líneas 📈',
    bar: 'Barras 📊',
    stacked: 'Apiladas 🧱'
};

export default function BalanceChart({ data }) {
    const isEmpty = !data || data.length === 0;

    // Hooks siempre arriba
    const allSeries = !isEmpty ? Object.keys(data[0].values) : [];
    const [activeSeries, setActiveSeries] = useState(new Set(allSeries));
    const [filter, setFilter] = useState('all');
    const [chartType, setChartType] = useState('line');

    const colors = useMemo(() => {
        const result = {};
        allSeries.forEach((key, i) => {
            const hue = (i * 37) % 360;
            result[key] = `hsl(${hue}, 70%, 45%)`;
        });
        return result;
    }, [allSeries]);

    const filteredSeries = useMemo(() => {
        if (filter === 'renewable') return allSeries.filter(s => RENEWABLES.includes(s));
        if (filter === 'nonrenewable') return allSeries.filter(s => NON_RENEWABLES.includes(s));
        return allSeries;
    }, [filter, allSeries]);

    const chartData = useMemo(() => {
        return data?.map(({ datetime, values }) => {
            const dateObj = /^\d+$/.test(datetime)
                ? new Date(Number(datetime))
                : new Date(datetime);
            const formatted = isNaN(dateObj.getTime())
                ? datetime
                : format(dateObj, 'yyyy-MM-dd');
            const point = { datetime: formatted };
            Object.entries(values).forEach(([key, val]) => {
                point[key] = val;
            });
            return point;
        }) || [];
    }, [data]);

    // Mostrar mensaje después de los hooks
    if (isEmpty) {
        return (
            <div style={{ textAlign: 'center', padding: '2rem', color: '#888' }}>
                <p>🔍 No hay datos disponibles para el rango seleccionado.</p>
            </div>
        );
    }


    const toggleSeries = (key) => {
        setActiveSeries(prev => {
            const updated = new Set(prev);
            updated.has(key) ? updated.delete(key) : updated.add(key);
            return updated;
        });
    };

    const renderChart = () => {
        const commonProps = {
            data: chartData,
            margin: { top: 20, right: 30, left: 0, bottom: 60 },
        };

        const elements = filteredSeries
            .filter(key => activeSeries.has(key))
            .map(key => {
                const props = {
                    dataKey: key,
                    name: data[0].labels[key] || key,
                    stroke: colors[key],
                    fill: colors[key],
                    dot: false,
                    strokeWidth: 2,
                };

                if (chartType === 'line') return <Line {...props} type="monotone" key={key} />;
                if (chartType === 'stacked') return <Bar {...props} key={key} stackId="a" />;
                return <Bar {...props} key={key} />;
            });



        const ChartComponent = chartType === 'line' ? LineChart : BarChart;

        return (
            <ChartComponent {...commonProps}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="datetime" />
                <YAxis />
                <Tooltip
                    formatter={(value) => typeof value === 'number' ? `${value.toFixed(2)} MW` : value}
                />
                <Legend
                    verticalAlign="bottom"
                    height={50}
                    onClick={(e) => toggleSeries(e.dataKey)}
                    wrapperStyle={{ cursor: 'pointer' }}
                />
                {elements}
            </ChartComponent>
        );
    };

    return (
        <div style={{ transition: 'all 0.3s ease-in-out' }}>
            <div style={{
                display: 'flex',
                justifyContent: 'center',
                gap: '1rem',
                marginBottom: '1.5rem',
                flexWrap: 'wrap',
                fontSize: '0.95rem'
            }}>
                <div>
                    <label htmlFor="chartType">Tipo de gráfico:&nbsp;</label>
                    <select
                        id="chartType"
                        value={chartType}
                        onChange={e => setChartType(e.target.value)}
                        style={{ padding: '0.4rem', borderRadius: '6px' }}
                    >
                        {Object.entries(CHART_TYPES).map(([key, label]) => (
                            <option key={key} value={key}>{label}</option>
                        ))}
                    </select>
                </div>
                <div>
                    <label htmlFor="filter">Categoría:&nbsp;</label>
                    <select
                        id="filter"
                        value={filter}
                        onChange={e => setFilter(e.target.value)}
                        style={{ padding: '0.4rem', borderRadius: '6px' }}
                    >
                        <option value="all">Todas</option>
                        <option value="renewable">Renovables 🌱</option>
                        <option value="nonrenewable">No renovables 🔥</option>
                    </select>
                </div>
            </div>

            <ResponsiveContainer width="100%" height={500}>
                {renderChart()}
            </ResponsiveContainer>
        </div>
    );
}
