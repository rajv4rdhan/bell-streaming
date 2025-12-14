import { useQuery } from '@tanstack/react-query';
import { Spinner, streamingApi } from '@bell-streaming/shared-ui';
import { VideoCard } from '../components/VideoCard';
import type { Video } from '@bell-streaming/shared-ui';

export const HomePage = () => {
  const { data: videos, isLoading } = useQuery({
    queryKey: ['videos'],
    queryFn: async () => {
      const response = await streamingApi.getPublicVideos();
      return response.data;
    },
  });

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-8 md:p-12">
        <h1 className="text-3xl md:text-5xl font-bold mb-4">Welcome to Bell Streaming</h1>
        <p className="text-lg md:text-xl text-gray-100 max-w-2xl">
          Discover and watch amazing video content from creators around the world.
        </p>
      </section>

      {/* Trending Videos */}
      <section>
        <h2 className="text-2xl font-bold mb-6">Trending Now</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {videos?.videos?.slice(0, 8).map((video: Video) => (
            <VideoCard key={video._id} video={video} />
          ))}
        </div>
      </section>

      {/* Recent Uploads */}
      <section>
        <h2 className="text-2xl font-bold mb-6">Recent Uploads</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {videos?.videos?.slice(8, 16).map((video: Video) => (
            <VideoCard key={video._id} video={video} />
          ))}
        </div>
      </section>

      {/* Popular Categories */}
      <section>
        <h2 className="text-2xl font-bold mb-6">Browse by Category</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {['Music', 'Gaming', 'Education', 'Entertainment', 'Sports', 'Technology', 'Cooking', 'Travel'].map(
            (category) => (
              <div
                key={category}
                className="bg-[#272727] hover:bg-[#3f3f3f] p-6 rounded-lg text-center cursor-pointer transition-colors"
              >
                <div className="text-3xl mb-2">🎯</div>
                <h3 className="font-semibold">{category}</h3>
              </div>
            )
          )}
        </div>
      </section>
    </div>
  );
};
