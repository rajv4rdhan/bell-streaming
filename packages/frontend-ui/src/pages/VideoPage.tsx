import React, { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Spinner, PremiumVideoPlayer, Button, streamingApi, formatNumber, formatRelativeTime } from '@bell-streaming/shared-ui';
import { VideoCard } from '../components/VideoCard';
import type { Video } from '@bell-streaming/shared-ui';

export const VideoPage = () => {
  const { videoId } = useParams<{ videoId: string }>();
  const queryClient = useQueryClient();

  const { data: video, isLoading } = useQuery({
    queryKey: ['video', videoId],
    queryFn: async () => {
      const response = await streamingApi.getVideoById(videoId!);
      return response.data;
    },
    enabled: !!videoId,
  });

  const { data: relatedVideos } = useQuery({
    queryKey: ['related-videos', videoId],
    queryFn: async () => {
      const response = await streamingApi.getPublicVideos({ limit: 10 });
      return response.data;
    },
    enabled: !!videoId,
  });

  const viewMutation = useMutation({
    mutationFn: async () => {
      await streamingApi.recordView(videoId!);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['video', videoId] });
    },
  });

  // Track view on mount
  useEffect(() => {
    if (videoId) {
      viewMutation.mutate();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [videoId]);

  if (isLoading || !video) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Main Video Section */}
      <div className="lg:col-span-2 space-y-4">
        {/* Video Player */}
        <div className="rounded-lg overflow-hidden">
          {video.s3Key ? (
            <PremiumVideoPlayer
              url={`${import.meta.env.VITE_CLOUDFRONT_URL}/${video.s3Key}`}
              poster={video.thumbnailUrl}
            />
          ) : (
            <div className="aspect-video bg-black rounded-lg flex items-center justify-center text-gray-400">
              <div className="text-center">
                <svg className="w-16 h-16 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                <p>Video not available</p>
              </div>
            </div>
          )}
        </div>

        {/* Video Info */}
        <div className="space-y-4">
          <h1 className="text-2xl font-bold">{video.title}</h1>
          
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-4 text-gray-400">
              <span>{formatNumber(video.views)} views</span>
              <span>•</span>
              <span>{formatRelativeTime(video.uploadedAt)}</span>
            </div>
            
            <div className="flex gap-2">
              <Button variant="secondary" size="sm">
                👍 Like
              </Button>
              <Button variant="secondary" size="sm">
                💾 Save
              </Button>
              <Button variant="secondary" size="sm">
                🔗 Share
              </Button>
            </div>
          </div>

          {/* Channel Info */}
          <div className="flex items-center justify-between bg-[#272727] p-4 rounded-lg">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center text-xl font-bold">
                {video.createdBy?.[0]?.toUpperCase() || 'U'}
              </div>
              <div>
                <h3 className="font-semibold">{video.createdBy || 'Unknown'}</h3>
                <p className="text-sm text-gray-400">Creator</p>
              </div>
            </div>
            <Button variant="primary">Subscribe</Button>
          </div>

          {/* Description */}
          <div className="bg-[#272727] p-4 rounded-lg">
            <h3 className="font-semibold mb-2">Description</h3>
            <p className="text-gray-300 whitespace-pre-wrap">{video.description}</p>
          </div>
        </div>
      </div>

      {/* Related Videos Sidebar */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold">Related Videos</h2>
        <div className="space-y-4">
          {relatedVideos?.videos?.map((relatedVideo: Video) => (
            <div key={relatedVideo._id} className="flex gap-3">
              <VideoCard video={relatedVideo} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
