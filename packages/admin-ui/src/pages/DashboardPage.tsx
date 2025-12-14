import { useQuery } from '@tanstack/react-query';
import { Card, Spinner, videoMetadataApi } from '@bell-streaming/shared-ui';

export const DashboardPage = () => {
  const { data: videos, isLoading: videosLoading } = useQuery({
    queryKey: ['dashboard-videos'],
    queryFn: async () => {
      const response = await videoMetadataApi.getAllVideos({ limit: 100 });
      return response.data;
    },
  });

  if (videosLoading) {
    return <Spinner size="lg" className="mt-20" />;
  }

  const totalVideos = videos?.total || 0;
  const totalViews = videos?.videos?.reduce((sum, v) => sum + (v.views || 0), 0) || 0;
  const publicVideos = videos?.videos?.filter(v => v.visibility === 'public').length || 0;
  const completedVideos = videos?.videos?.filter(v => v.uploadStatus === 'completed').length || 0;

  const statCards = [
    { label: 'Total Videos', value: totalVideos, icon: '🎥', color: 'blue' },
    { label: 'Public Videos', value: publicVideos, icon: '🌐', color: 'green' },
    { label: 'Total Views', value: totalViews.toLocaleString(), icon: '👁️', color: 'purple' },
    { label: 'Completed', value: completedVideos, icon: '✅', color: 'orange' },
  ];

  const recentVideos = videos?.videos?.slice(0, 5) || [];
  const popularVideos = [...(videos?.videos || [])]
    .sort((a, b) => (b.views || 0) - (a.views || 0))
    .slice(0, 5);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Dashboard Overview</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat) => (
          <Card key={stat.label} padding="lg" hover>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">{stat.label}</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{stat.value}</p>
              </div>
              <div className="text-5xl">{stat.icon}</div>
            </div>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card padding="lg">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Videos</h3>
          <div className="space-y-3">
            {recentVideos.length > 0 ? (
              recentVideos.map((video) => (
                <div key={video._id} className="flex items-center gap-3 p-3 bg-gray-50 rounded">
                  <div className="w-2 h-2 bg-blue-500 rounded-full" />
                  <div className="flex-1">
                    <p className="text-sm text-gray-900 font-medium">{video.title}</p>
                    <p className="text-xs text-gray-500">{video.uploadStatus} • {video.views || 0} views</p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-500">No videos yet</p>
            )}
          </div>
        </Card>

        <Card padding="lg">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Popular Videos</h3>
          <div className="space-y-3">
            {popularVideos.length > 0 ? (
              popularVideos.map((video) => (
                <div key={video._id} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                  <p className="text-sm text-gray-700 font-medium flex-1 truncate">{video.title}</p>
                  <span className="text-sm text-gray-500 ml-2">{video.views || 0} views</span>
                </div>
              ))
            ) : (
              <p className="text-gray-500">No videos yet</p>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
};
