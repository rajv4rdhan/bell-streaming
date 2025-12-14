import { useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Spinner } from '@bell-streaming/shared-ui';
import { apiClient } from '@bell-streaming/shared-ui';
import { VideoCard } from '../components/VideoCard';
import type { Video } from '@bell-streaming/shared-ui';

export const SearchPage = () => {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q') || '';

  const { data: results, isLoading } = useQuery({
    queryKey: ['search', query],
    queryFn: async () => {
      const response = await apiClient.get('/videos/search', {
        params: { q: query },
      });
      return response.data;
    },
    enabled: !!query,
  });

  if (!query) {
    return (
      <div className="text-center py-20">
        <div className="text-6xl mb-4">🔍</div>
        <h2 className="text-2xl font-bold mb-2">Search for videos</h2>
        <p className="text-gray-400">Enter a search term in the search box above</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold mb-2">
          Search results for "{query}"
        </h1>
        <p className="text-gray-400">
          {results?.total || 0} results found
        </p>
      </div>

      {results?.data?.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {results.data.map((video: Video) => (
            <VideoCard key={video.id} video={video} />
          ))}
        </div>
      ) : (
        <div className="text-center py-20">
          <div className="text-6xl mb-4">😕</div>
          <h2 className="text-xl font-semibold mb-2">No results found</h2>
          <p className="text-gray-400">
            Try different keywords or check your spelling
          </p>
        </div>
      )}
    </div>
  );
};
