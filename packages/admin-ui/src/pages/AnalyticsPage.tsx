import { useQuery } from '@tanstack/react-query';
import { Card, Spinner } from '@bell-streaming/shared-ui';
import { apiClient } from '@bell-streaming/shared-ui';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export const AnalyticsPage = () => {
  const { data: analytics, isLoading } = useQuery({
    queryKey: ['analytics'],
    queryFn: async () => {
      const response = await apiClient.get('/admin/analytics');
      return response.data;
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-sm font-medium text-slate-500 mb-1">Performance Insights</h2>
        <p className="text-slate-600">Track your platform's key metrics</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Views Over Time */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-premium">
          <h3 className="text-lg font-semibold text-slate-900 mb-6">Views Over Time</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={analytics?.viewsOverTime || []}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="date" stroke="#64748b" style={{ fontSize: '12px' }} />
              <YAxis stroke="#64748b" style={{ fontSize: '12px' }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'white',
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                }}
              />
              <Legend />
              <Line type="monotone" dataKey="views" stroke="#0ea5e9" strokeWidth={3} dot={{ fill: '#0ea5e9', r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Videos Uploaded */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-premium">
          <h3 className="text-lg font-semibold text-slate-900 mb-6">Videos Uploaded</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={analytics?.uploadsOverTime || []}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="date" stroke="#64748b" style={{ fontSize: '12px' }} />
              <YAxis stroke="#64748b" style={{ fontSize: '12px' }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'white',
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                }}
              />
              <Legend />
              <Bar dataKey="uploads" fill="#10b981" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Top Videos */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-premium">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-slate-900">Top Performing Videos</h3>
            <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
          </div>
          <div className="space-y-3">
            {analytics?.topVideos?.map((video: any, index: number) => (
              <div key={video.id} className="flex items-center gap-4 p-3 rounded-xl hover:bg-slate-50 transition-colors group">
                <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center text-white font-semibold text-sm">
                  {index + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-slate-900 truncate group-hover:text-primary-600 transition-colors">{video.title}</p>
                  <p className="text-sm text-slate-500">{video.views.toLocaleString()} views</p>
                </div>
              </div>
            )) || (
              <div className="text-center py-12">
                <svg className="w-12 h-12 mx-auto text-slate-300 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
                <p className="text-slate-500 text-sm">No data available</p>
              </div>
            )}
          </div>
        </div>

        {/* User Activity */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-premium">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-slate-900">User Activity</h3>
            <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
          </div>
          <div className="space-y-4">
            <div className="flex justify-between items-center p-4 rounded-xl bg-gradient-to-r from-blue-50 to-blue-100/50 border border-blue-200">
              <span className="text-sm font-medium text-slate-700">Active Users (24h)</span>
              <span className="text-2xl font-bold text-blue-600">
                {analytics?.activeUsers24h || 0}
              </span>
            </div>
            <div className="flex justify-between items-center p-4 rounded-xl bg-gradient-to-r from-emerald-50 to-emerald-100/50 border border-emerald-200">
              <span className="text-sm font-medium text-slate-700">New Users (7d)</span>
              <span className="text-2xl font-bold text-emerald-600">
                {analytics?.newUsers7d || 0}
              </span>
            </div>
            <div className="flex justify-between items-center p-4 rounded-xl bg-gradient-to-r from-violet-50 to-violet-100/50 border border-violet-200">
              <span className="text-sm font-medium text-slate-700">Total Engagement</span>
              <span className="text-2xl font-bold text-violet-600">
                {analytics?.totalEngagement || 0}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
