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
    return <Spinner size="lg" className="mt-20" />;
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Views Over Time */}
        <Card padding="lg">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Views Over Time</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={analytics?.viewsOverTime || []}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="views" stroke="#3b82f6" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </Card>

        {/* Videos Uploaded */}
        <Card padding="lg">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Videos Uploaded</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={analytics?.uploadsOverTime || []}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="uploads" fill="#10b981" />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        {/* Top Videos */}
        <Card padding="lg">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Performing Videos</h3>
          <div className="space-y-3">
            {analytics?.topVideos?.map((video: any, index: number) => (
              <div key={video.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded">
                <div className="text-lg font-bold text-gray-400 w-8">#{index + 1}</div>
                <div className="flex-1">
                  <p className="font-medium text-gray-900">{video.title}</p>
                  <p className="text-sm text-gray-500">{video.views} views</p>
                </div>
              </div>
            )) || <p className="text-gray-500">No data available</p>}
          </div>
        </Card>

        {/* User Activity */}
        <Card padding="lg">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">User Activity</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center p-3 bg-blue-50 rounded">
              <span className="text-gray-700">Active Users (24h)</span>
              <span className="text-2xl font-bold text-blue-600">
                {analytics?.activeUsers24h || 0}
              </span>
            </div>
            <div className="flex justify-between items-center p-3 bg-green-50 rounded">
              <span className="text-gray-700">New Users (7d)</span>
              <span className="text-2xl font-bold text-green-600">
                {analytics?.newUsers7d || 0}
              </span>
            </div>
            <div className="flex justify-between items-center p-3 bg-purple-50 rounded">
              <span className="text-gray-700">Total Engagement</span>
              <span className="text-2xl font-bold text-purple-600">
                {analytics?.totalEngagement || 0}
              </span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};
