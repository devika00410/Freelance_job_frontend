
import React, { useState, useEffect, useMemo } from 'react';
import { 
  FaChartBar, 
  FaFileContract, 
  FaProjectDiagram, 
  FaMoneyBillWave, 
  FaArrowUp, 
  FaArrowDown,
  FaDownload,
  FaSync,
  FaBell,
  FaUserCircle
} from 'react-icons/fa';
import { Line, Bar, Pie } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, BarElement, ArcElement, Tooltip, Legend, TimeScale } from 'chart.js';
import 'chartjs-adapter-date-fns';
import { useAuth } from '../Context/AuthContext';
import {
    fetchOverview,
    fetchJobTrends,
    fetchFinancial,
    fetchProposalStats,
    fetchProjectPerformance
} from '../Service/apiAnalytics';
import * as XLSX from 'xlsx';
import './ClientAnalyticsPage.css';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, ArcElement, Tooltip, Legend, TimeScale);

const TIME_PERIODS = {
    DAILY: { label: 'Today', months: 1 },
    WEEKLY: { label: 'This Week', months: 1 },
    MONTHLY: { label: 'This Month', months: 6 },
    QUARTERLY: { label: 'Quarter', months: 9 },
    YEARLY: { label: 'Year', months: 12 }
};

const MetricCard = ({ icon, label, value, trend, trendLabel, subtitle }) => (
    <div className="metric-card">
        <div className="metric-icon">{icon}</div>
        <div className="metric-value">{value}</div>
        <div className="metric-label">{label}</div>
        {trend !== undefined && (
            <div className={`metric-trend ${trend >= 0 ? 'trend-up' : 'trend-down'}`}>
                {trend >= 0 ? <FaArrowUp /> : <FaArrowDown />}
                <span>{Math.abs(trend)}% {trendLabel}</span>
            </div>
        )}
        {subtitle && <div className="metric-subtitle">{subtitle}</div>}
    </div>
);

export default function ClientAnalyticsPage() {
    const { token, user } = useAuth();
    const [period, setPeriod] = useState('MONTHLY');
    const [loading, setLoading] = useState(true);
    const [overview, setOverview] = useState(null);
    const [jobTrends, setJobTrends] = useState(null);
    const [financial, setFinancial] = useState(null);
    const [proposalStats, setProposalStats] = useState(null);
    const [projectPerf, setProjectPerf] = useState(null);
    const [error, setError] = useState(null);
    const [lastUpdated, setLastUpdated] = useState(new Date());

    const monthsForPeriod = TIME_PERIODS[period].months;

    // Fetch all analytics data
    useEffect(() => {
        if (!token) return;
        
        let cancelled = false;
        setLoading(true);
        setError(null);

        Promise.all([
            fetchOverview(token),
            fetchJobTrends(token, { months: monthsForPeriod }),
            fetchFinancial(token, { months: monthsForPeriod }),
            fetchProposalStats(token),
            fetchProjectPerformance(token)
        ])
            .then(([ovr, jt, fin, ps, pp]) => {
                if (cancelled) return;
                setOverview(ovr.data.overview || ovr.data);
                setJobTrends(jt.data.trends || jt.data);
                setFinancial(fin.data.financials || fin.data);
                setProposalStats(ps.data.proposals || ps.data);
                setProjectPerf(pp.data.performance || pp.data);
                setLastUpdated(new Date());
            })
            .catch((err) => {
                console.error('Analytics fetch error', err);
                setError(err.response?.data?.message || err.message || 'Failed to load analytics');
            })
            .finally(() => {
                if (!cancelled) setLoading(false);
            });

        return () => {
            cancelled = true;
        };
    }, [token, monthsForPeriod, period]);

    // Export to Excel functionality
    const exportToExcel = () => {
        try {
            const workbook = XLSX.utils.book_new();
            
            // Overview Data
            const overviewData = [
                ['Metric', 'Value', 'Trend'],
                ['Total Projects', overview?.quickStats?.totalJobs || 0, `${overview?.quickStats?.jobGrowth || 0}%`],
                ['Active Projects', overview?.quickStats?.activeProjects || 0, 'N/A'],
                ['Total Spent', `$${overview?.financials?.totalAmount || 0}`, `${overview?.quickStats?.spendingGrowth || 0}%`],
                ['Active Contracts', overview?.quickStats?.totalContracts || 0, 'N/A']
            ];
            
            const overviewSheet = XLSX.utils.aoa_to_sheet(overviewData);
            XLSX.utils.book_append_sheet(workbook, overviewSheet, 'Overview');

            // Financial Data
            if (financial?.projectCosts) {
                const financialData = financial.projectCosts.map(p => ({
                    'Project': p.title || p._id || 'Unnamed',
                    'Amount Spent': p.totalPaid || p.totalSpent || 0,
                    'Status': p.status || 'N/A'
                }));
                const financialSheet = XLSX.utils.json_to_sheet(financialData);
                XLSX.utils.book_append_sheet(workbook, financialSheet, 'Financials');
            }

            // Performance Data
            if (projectPerf?.freelancerPerformance) {
                const perfData = projectPerf.freelancerPerformance.map(f => ({
                    'Freelancer': f.freelancerName,
                    'Completion Rate': `${Math.round((f.completionRate || 0) * 100)}%`,
                    'Projects': f.projectCount || 0
                }));
                const perfSheet = XLSX.utils.json_to_sheet(perfData);
                XLSX.utils.book_append_sheet(workbook, perfSheet, 'Performance');
            }

            // Generate filename with timestamp
            const timestamp = new Date().toISOString().split('T')[0];
            const fileName = `Analytics_Export_${timestamp}.xlsx`;
            
            XLSX.writeFile(workbook, fileName);
            
            // Show success message (you could add a toast notification here)
            alert(`✅ Analytics exported successfully as ${fileName}`);
            
        } catch (err) {
            console.error('Export error:', err);
            alert('Failed to export analytics. Please try again.');
        }
    };

    // Refresh data function
    const refreshData = () => {
        setLoading(true);
        setError(null);
        
        fetchOverview(token)
            .then(res => {
                setOverview(res.data.overview || res.data);
                setLastUpdated(new Date());
            })
            .catch(err => {
                setError('Failed to refresh data');
                console.error('Refresh error:', err);
            })
            .finally(() => {
                setLoading(false);
            });
    };

    // Chart data preparation
    const lineChartData = useMemo(() => {
        if (!overview?.trends?.monthlyJobs && !jobTrends?.monthlyJobs) return null;

        const monthly = jobTrends?.monthlyJobs || overview?.trends?.monthlyJobs;
        const labels = [];
        const dataPoints = [];

        monthly.forEach((item) => {
            if (item._id && item._id.year && item._id.month) {
                const dt = new Date(item._id.year, item._id.month - 1, 1);
                labels.push(dt);
                dataPoints.push(item.count || item.total || 0);
            } else if (item.date) {
                labels.push(new Date(item.date));
                dataPoints.push(item.value || item.total || 0);
            }
        });

        return {
            labels,
            datasets: [
                {
                    label: 'Job Activity',
                    data: dataPoints,
                    fill: true,
                    backgroundColor: 'rgba(135, 206, 235, 0.1)',
                    borderColor: 'rgba(30, 144, 255, 0.8)',
                    tension: 0.4,
                    borderWidth: 3,
                    pointRadius: 4,
                    pointBackgroundColor: '#1E90FF'
                }
            ]
        };
    }, [overview, jobTrends]);

    const pieChartData = useMemo(() => {
        const cats = overview?.distributions?.categories || jobTrends?.categoryDistribution;
        if (!cats) return null;
        
        const labels = cats.map(c => c._id || c.label);
        const data = cats.map(c => c.count || c.value || 0);
        
        const colors = [
            'rgba(135, 206, 235, 0.8)',
            'rgba(30, 144, 255, 0.8)',
            'rgba(70, 130, 180, 0.8)',
            'rgba(100, 149, 237, 0.8)',
            'rgba(135, 206, 250, 0.8)'
        ];

        return {
            labels,
            datasets: [{
                data,
                backgroundColor: colors,
                borderWidth: 2,
                borderColor: '#ffffff'
            }]
        };
    }, [overview, jobTrends]);

    const barChartData = useMemo(() => {
        const p = overview?.trends?.proposalMetrics || proposalStats?.conversion;
        if (!p) return null;

        if (Array.isArray(p)) {
            const statusMap = {};
            p.forEach(item => {
                const key = item._id || item.status;
                statusMap[key] = item.count || item.total || 0;
            });
            
            const labels = Object.keys(statusMap);
            const data = labels.map(l => statusMap[l]);
            
            return {
                labels,
                datasets: [{
                    label: 'Proposals',
                    data,
                    backgroundColor: 'rgba(135, 206, 235, 0.7)',
                    borderColor: 'rgba(30, 144, 255, 0.9)',
                    borderWidth: 2,
                    borderRadius: 8
                }]
            };
        }
        
        return null;
    }, [overview, proposalStats]);

    // Calculate quick stats
    const quickStats = useMemo(() => {
        const qs = overview?.quickStats;
        if (!qs) return null;
        
        return {
            totalProjects: qs.totalJobs || 0,
            activeProjects: qs.activeProjects || 0,
            totalSpent: qs.totalSpent || (overview?.financials?.totalAmount || 0),
            pendingProposals: qs.totalProposals || 0,
            acceptanceRate: qs.acceptanceRate || 0,
            activeContracts: qs.totalContracts || 0
        };
    }, [overview]);

    return (
        <div className="dashboard-container">
            {/* Top Navigation Bar */}
            <nav className="dashboard-navbar">
                <div className="nav-brand">
                    <FaChartBar size={28} color="#1E90FF" />
                    <h1>Analytics Dashboard</h1>
                </div>
                
                <div className="nav-controls">
                    <div className="period-selector">
                        {Object.keys(TIME_PERIODS).map(tp => (
                            <button
                                key={tp}
                                className={`period-btn ${period === tp ? 'active' : ''}`}
                                onClick={() => setPeriod(tp)}
                            >
                                {TIME_PERIODS[tp].label}
                            </button>
                        ))}
                    </div>
                    
                    <button 
                        className="export-btn"
                        onClick={exportToExcel}
                        disabled={loading}
                    >
                        <FaDownload />
                        Export to Excel
                    </button>
                    
                    <button 
                        onClick={refreshData}
                        className="period-btn"
                        disabled={loading}
                    >
                        <FaSync className={loading ? 'spin' : ''} />
                    </button>
                    
                    <div className="realtime-indicator">
                        <span className="pulse-dot"></span>
                        Real-time
                    </div>
                </div>
            </nav>

            {/* Main Content */}
            <div className="dashboard-content">
                <div className="page-header">
                    <h2>Client Analytics Overview</h2>
                    <div className="page-subtitle">
                        Last updated: {lastUpdated.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                        {user?.name && ` • Welcome back, ${user.name}`}
                    </div>
                </div>

                {/* Stats Grid */}
                <div className="stats-grid">
                    <MetricCard
                        icon={<FaProjectDiagram />}
                        label="Total Projects"
                        value={quickStats?.totalProjects ?? '...'}
                        trend={overview?.quickStats?.jobGrowth ?? 0}
                        trendLabel="growth"
                    />
                    
                    <MetricCard
                        icon={<FaProjectDiagram />}
                        label="Active Projects"
                        value={quickStats?.activeProjects ?? '...'}
                        subtitle="Currently in progress"
                    />
                    
                    <MetricCard
                        icon={<FaMoneyBillWave />}
                        label="Total Spent"
                        value={`$${(quickStats?.totalSpent || 0).toLocaleString()}`}
                        trend={overview?.quickStats?.spendingGrowth ?? 0}
                        trendLabel="increase"
                    />
                    
                    <MetricCard
                        icon={<FaFileContract />}
                        label="Active Contracts"
                        value={quickStats?.activeContracts ?? '...'}
                        subtitle="Active agreements"
                    />
                </div>

                <div className="dashboard-grid">
                    {/* Left Column */}
                    <div className="main-content">
                        {/* Line Chart Card */}
                        <div className="content-card">
                            <div className="card-title">
                                <div>
                                    <h3>Job Activity Trends</h3>
                                    <div className="card-subtitle">
                                        Showing {TIME_PERIODS[period].label} data • Click and drag to zoom
                                    </div>
                                </div>
                                <div className="realtime-indicator">
                                    <span className="pulse-dot"></span>
                                    Live
                                </div>
                            </div>
                            
                            <div className="chart-container">
                                {loading ? (
                                    <div className="loading-state">
                                        <div className="loading-spinner"></div>
                                        Loading chart...
                                    </div>
                                ) : lineChartData ? (
                                    <Line
                                        data={lineChartData}
                                        options={{
                                            responsive: true,
                                            maintainAspectRatio: false,
                                            plugins: {
                                                legend: { display: false },
                                                tooltip: {
                                                    mode: 'index',
                                                    intersect: false
                                                }
                                            },
                                            scales: {
                                                x: {
                                                    type: 'time',
                                                    time: {
                                                        unit: period === 'YEARLY' ? 'month' : 'day'
                                                    },
                                                    grid: {
                                                        color: 'rgba(135, 206, 235, 0.1)'
                                                    }
                                                },
                                                y: {
                                                    beginAtZero: true,
                                                    grid: {
                                                        color: 'rgba(135, 206, 235, 0.1)'
                                                    }
                                                }
                                            }
                                        }}
                                    />
                                ) : (
                                    <div className="empty-state">
                                        <FaChartBar />
                                        <p>No trend data available</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Proposal Conversion Card */}
                        <div className="content-card">
                            <div className="card-title">
                                <h3>Proposal Conversion</h3>
                                <div className="card-subtitle">
                                    Submitted vs Accepted vs Rejected
                                </div>
                            </div>
                            
                            <div className="chart-container">
                                {loading ? (
                                    <div className="loading-state">
                                        <div className="loading-spinner"></div>
                                        Loading data...
                                    </div>
                                ) : barChartData ? (
                                    <Bar
                                        data={barChartData}
                                        options={{
                                            responsive: true,
                                            maintainAspectRatio: false,
                                            plugins: {
                                                legend: { display: false }
                                            },
                                            scales: {
                                                y: {
                                                    beginAtZero: true,
                                                    grid: {
                                                        color: 'rgba(135, 206, 235, 0.1)'
                                                    }
                                                },
                                                x: {
                                                    grid: {
                                                        display: false
                                                    }
                                                }
                                            }
                                        }}
                                    />
                                ) : (
                                    <div className="empty-state">
                                        <FaFileContract />
                                        <p>No proposal data available</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Right Sidebar */}
                    <div className="sidebar">
                        {/* Category Distribution Card */}
                        <div className="sidebar-card">
                            <div className="card-title">
                                <h3>Category Distribution</h3>
                            </div>
                            
                            <div className="small-chart">
                                {loading ? (
                                    <div className="loading-state">
                                        <div className="loading-spinner"></div>
                                    </div>
                                ) : pieChartData ? (
                                    <Pie
                                        data={pieChartData}
                                        options={{
                                            responsive: true,
                                            maintainAspectRatio: false,
                                            plugins: {
                                                legend: {
                                                    position: 'bottom',
                                                    labels: {
                                                        padding: 20,
                                                        usePointStyle: true
                                                    }
                                                }
                                            }
                                        }}
                                    />
                                ) : (
                                    <div className="empty-state">
                                        <p>No category data</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Financial Snapshot Card */}
                        <div className="sidebar-card">
                            <div className="card-title">
                                <h3>Financial Snapshot</h3>
                                <span className="status-badge badge-success">
                                    Active
                                </span>
                            </div>
                            
                            <div>
                                {loading ? (
                                    <div className="loading-state">
                                        <div className="loading-spinner"></div>
                                    </div>
                                ) : financial ? (
                                    <>
                                        <div className="data-item">
                                            <span className="item-name">Total Spent</span>
                                            <span className="item-value">
                                                ${Number(
                                                    overview?.financials?.totalAmount || 0
                                                ).toLocaleString()}
                                            </span>
                                        </div>
                                        
                                        <div className="data-item">
                                            <span className="item-name">Transactions</span>
                                            <span className="item-value">
                                                {overview?.financials?.transactionCount || 0}
                                            </span>
                                        </div>
                                        
                                        <div className="card-subtitle" style={{marginTop: '1rem'}}>
                                            Top Projects by Cost
                                        </div>
                                        
                                        <ul className="data-list">
                                            {(financial?.projectCosts || []).slice(0, 3).map((p, idx) => (
                                                <li key={idx} className="data-item">
                                                    <span className="item-name">
                                                        {p.title || p._id || 'Unnamed'}
                                                    </span>
                                                    <span className="item-value">
                                                        ${(p.totalPaid || 0).toLocaleString()}
                                                    </span>
                                                </li>
                                            ))}
                                        </ul>
                                    </>
                                ) : (
                                    <div className="empty-state">
                                        <p>No financial data</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Performance Metrics Card */}
                        <div className="sidebar-card">
                            <div className="card-title">
                                <h3>Performance Metrics</h3>
                            </div>
                            
                            <div>
                                {loading ? (
                                    <div className="loading-state">
                                        <div className="loading-spinner"></div>
                                    </div>
                                ) : projectPerf ? (
                                    <>
                                        <div className="card-subtitle">
                                            Milestone Completion
                                        </div>
                                        
                                        <ul className="data-list">
                                            {(projectPerf.milestonePerformance || []).map((m, idx) => (
                                                <li key={idx} className="data-item">
                                                    <span className="item-name">{m._id}</span>
                                                    <span className="status-badge badge-info">
                                                        {m.count} completed
                                                    </span>
                                                </li>
                                            ))}
                                        </ul>
                                        
                                        <div className="card-subtitle" style={{marginTop: '1rem'}}>
                                            Top Performing Freelancers
                                        </div>
                                        
                                        <ul className="data-list">
                                            {(projectPerf.freelancerPerformance || []).slice(0, 3).map((f, idx) => (
                                                <li key={idx} className="data-item">
                                                    <span className="item-name">{f.freelancerName}</span>
                                                    <span className="item-value">
                                                        {Math.round((f.completionRate || 0) * 100)}%
                                                    </span>
                                                </li>
                                            ))}
                                        </ul>
                                    </>
                                ) : (
                                    <div className="empty-state">
                                        <p>No performance data</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Error Display */}
                {error && (
                    <div className="error-alert">
                        <FaBell />
                        <div>
                            <strong>Error loading analytics:</strong> {error}
                            <div style={{fontSize: '0.9rem', marginTop: '4px'}}>
                                Please try refreshing the page or contact support.
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}