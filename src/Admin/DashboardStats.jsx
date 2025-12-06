import React from 'react';
// import {
//   Grid,
//   Card,
//   CardContent,
//   Typography,
//   Box,
//   Chip
// } from '@mui/material';
// import {
//   People as PeopleIcon,
//   Work as WorkIcon,
//   AttachMoney as MoneyIcon,
//   Assessment as AnalyticsIcon,
//   Receipt as TransactionIcon,
//   Report as ReportIcon,
//   TrendingUp as TrendingUpIcon
// } from '@mui/icons-material';

const StatCard = ({ title, value, icon, subtitle, color = 'primary' }) => (
  <Card sx={{ height: '100%' }}>
    <CardContent>
      <Box display="flex" alignItems="center" justifyContent="space-between">
        <Box>
          <Typography color="textSecondary" gutterBottom variant="overline">
            {title}
          </Typography>
          <Typography variant="h4" component="div">
            {value}
          </Typography>
          {subtitle && (
            <Typography variant="body2" color="textSecondary">
              {subtitle}
            </Typography>
          )}
        </Box>
        <Box sx={{ color: `${color}.main` }}>
          {icon}
        </Box>
      </Box>
    </CardContent>
  </Card>
);

const DashboardStats = ({ data }) => {
  if (!data) return null;

  const { stats, recentUsers, recentJobs } = data;

  const statCards = [
    {
      title: 'Total Users',
      value: stats.totalUsers,
      icon: <PeopleIcon fontSize="large" />,
      subtitle: `${stats.userStats?.find(u => u._id === 'client')?.count || 0} clients, ${stats.userStats?.find(u => u._id === 'freelancer')?.count || 0} freelancers`,
      color: 'primary'
    },
    {
      title: 'Total Jobs',
      value: stats.totalJobs,
      icon: <WorkIcon fontSize="large" />,
      subtitle: `${stats.jobStats?.find(j => j._id === 'active')?.count || 0} active`,
      color: 'secondary'
    },
    {
      title: 'Total Revenue',
      value: `$${stats.totalRevenue?.toLocaleString() || 0}`,
      icon: <MoneyIcon fontSize="large" />,
      subtitle: `${stats.totalTransactions} transactions`,
      color: 'success'
    },
    {
      title: 'Active Projects',
      value: stats.totalWorkspaces,
      icon: <AnalyticsIcon fontSize="large" />,
      subtitle: `${stats.totalContracts} contracts`,
      color: 'info'
    },
    {
      title: 'Pending Reports',
      value: stats.totalReports,
      icon: <ReportIcon fontSize="large" />,
      subtitle: 'Need attention',
      color: 'warning'
    },
    {
      title: 'Platform Health',
      value: '99.9%',
      icon: <TrendingUpIcon fontSize="large" />,
      subtitle: 'Uptime',
      color: 'success'
    }
  ];

  return (
    <Box>
      <Grid container spacing={3}>
        {statCards.map((stat, index) => (
          <Grid item xs={12} sm={6} md={4} key={index}>
            <StatCard {...stat} />
          </Grid>
        ))}
      </Grid>

      {/* Recent Activity */}
      <Grid container spacing={3} sx={{ mt: 1 }}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Recent Users
              </Typography>
              {recentUsers?.map((user, index) => (
                <Box key={index} display="flex" justifyContent="space-between" alignItems="center" py={1}>
                  <Box>
                    <Typography variant="body1">
                      {user.name || user.profile?.name}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      {user.email}
                    </Typography>
                  </Box>
                  <Chip 
                    label={user.role} 
                    size="small" 
                    color={user.role === 'admin' ? 'secondary' : 'primary'}
                  />
                </Box>
              ))}
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Recent Jobs
              </Typography>
              {recentJobs?.map((job, index) => (
                <Box key={index} display="flex" justifyContent="space-between" alignItems="center" py={1}>
                  <Box flex={1}>
                    <Typography variant="body1" noWrap>
                      {job.title}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      ${job.budget} • {job.clientId?.name || job.clientId?.companyName}
                    </Typography>
                  </Box>
                  <Chip 
                    label={job.status} 
                    size="small" 
                    color={job.status === 'active' ? 'success' : 'default'}
                  />
                </Box>
              ))}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default DashboardStats;