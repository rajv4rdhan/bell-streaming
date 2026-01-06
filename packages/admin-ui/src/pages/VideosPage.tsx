import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button, Input, Modal, Spinner, videoMetadataApi, formatRelativeTime, PremiumVideoPlayer } from '@bell-streaming/shared-ui';
import type { Video } from '@bell-streaming/shared-ui';

export const VideosPage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const queryClient = useQueryClient();

  const { data: videos, isLoading } = useQuery({
    queryKey: ['videos', searchQuery],
    queryFn: async () => {
      const response = await videoMetadataApi.getAllVideos({
        search: searchQuery || undefined,
      });
      return response.data;
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (videoId: string) => {
      await videoMetadataApi.deleteVideo(videoId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['videos'] });
      setShowDeleteModal(false);
      setSelectedVideo(null);
    },
  });

  const toggleVisibilityMutation = useMutation({
    mutationFn: async ({ videoId, visibility }: { videoId: string; visibility: 'public' | 'private' }) => {
      await videoMetadataApi.setVideoVisibility(videoId, visibility);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['videos'] });
    },
  });

  const handleDeleteClick = (video: Video) => {
    setSelectedVideo(video);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = () => {
    if (selectedVideo) {
      deleteMutation.mutate(selectedVideo._id);
    }
  };

  const handleToggleVisibility = (video: Video) => {
    const newVisibility = video.visibility === 'public' ? 'private' : 'public';
    toggleVisibilityMutation.mutate({ videoId: video._id, visibility: newVisibility });
  };

  return (
    <div className="min-h-screen bg-zinc-50/40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight text-zinc-900">Videos</h1>
            <p className="text-sm text-zinc-500 mt-1">{videos?.total || 0} videos in library</p>
          </div>
          <div className="w-80">
            <Input
              type="search"
              placeholder="Search videos..."
              value={searchQuery}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
              className="border-zinc-200 bg-white focus:border-zinc-400 focus:ring-zinc-400"
            />
          </div>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center h-96">
            <Spinner size="lg" />
          </div>
        ) : (
          <div className="space-y-3">
            {videos?.videos?.map((video: Video) => (
              <div
                key={video._id}
                className="group bg-white border border-zinc-200 rounded-lg hover:border-zinc-300 transition-all duration-200 overflow-hidden hover:shadow-sm"
              >
                <div className="flex gap-4 p-4">
                  <div className="flex-shrink-0 w-48 h-28 relative bg-zinc-100 rounded-md overflow-hidden">
                    {video.thumbnailUrl ? (
                      <img
                        src={video.thumbnailUrl.startsWith('https://d1d410bjpcuiwb.cloudfront.net')
                          ? video.thumbnailUrl
                          : `https://d1d410bjpcuiwb.cloudfront.net/${video.thumbnailUrl.replace(/^\//, '')}`}
                        alt={video.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-zinc-100 flex items-center justify-center">
                        <svg className="w-10 h-10 text-zinc-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        </svg>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0 space-y-3">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-zinc-900 truncate group-hover:text-zinc-700 transition-colors">
                          {video.title}
                        </h3>
                        <p className="text-sm text-zinc-500 line-clamp-1 mt-1">{video.description}</p>
                      </div>
                      <time className="text-xs text-zinc-400 whitespace-nowrap">{formatRelativeTime(video.createdAt || '')}</time>
                    </div>

                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium border ${
                        video.uploadStatus === 'completed'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : video.uploadStatus === 'uploading'
                          ? 'bg-amber-50 text-amber-700 border-amber-200'
                          : video.uploadStatus === 'failed'
                          ? 'bg-red-50 text-red-700 border-red-200'
                          : 'bg-zinc-50 text-zinc-700 border-zinc-200'
                      }`}>
                        {video.uploadStatus}
                      </span>
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium border ${
                        video.thumbnailStatus === 'completed'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : video.thumbnailStatus === 'in_progress'
                          ? 'bg-amber-50 text-amber-700 border-amber-200'
                          : video.thumbnailStatus === 'failed'
                          ? 'bg-red-50 text-red-700 border-red-200'
                          : 'bg-zinc-50 text-zinc-700 border-zinc-200'
                      }`}>
                        Thumbnail
                      </span>
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium border ${
                        video.visibility === 'public'
                          ? 'bg-blue-50 text-blue-700 border-blue-200'
                          : 'bg-zinc-50 text-zinc-700 border-zinc-200'
                      }`}>
                        {video.visibility}
                      </span>
                      {video.tags && video.tags.slice(0, 2).map((tag: string, index: number) => (
                        <span key={index} className="inline-flex items-center px-2 py-0.5 rounded-md text-xs bg-zinc-100 text-zinc-600 border border-zinc-200">
                          {tag}
                        </span>
                      ))}
                      {video.tags && video.tags.length > 2 && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs bg-zinc-100 text-zinc-600 border border-zinc-200">
                          +{video.tags.length - 2}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4 text-xs text-zinc-500">
                        <div className="flex items-center gap-1.5">
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                          <span>{video.views || 0}</span>
                        </div>
                        <span className="font-mono text-zinc-400 truncate max-w-[200px]">{video.s3Key?.slice(-24) || '-'}</span>
                      </div>
                      
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleToggleVisibility(video)}
                          disabled={toggleVisibilityMutation.isPending}
                          className="inline-flex items-center px-3 py-1.5 text-xs font-medium text-zinc-700 bg-white border border-zinc-300 rounded-md hover:bg-zinc-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-zinc-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                          {video.visibility === 'public' ? 'Make Private' : 'Make Public'}
                        </button>
                        <button
                          onClick={() => setSelectedVideo(video)}
                          className="inline-flex items-center px-3 py-1.5 text-xs font-medium text-zinc-700 bg-white border border-zinc-300 rounded-md hover:bg-zinc-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-zinc-500 transition-colors"
                        >
                          View
                        </button>
                        <button
                          onClick={() => handleDeleteClick(video)}
                          className="inline-flex items-center px-3 py-1.5 text-xs font-medium text-red-700 bg-white border border-red-300 rounded-md hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {selectedVideo && !showDeleteModal && (
        <Modal
          isOpen={!!selectedVideo}
          onClose={() => setSelectedVideo(null)}
          title={selectedVideo.title}
          size="xl"
        >
          <div className="space-y-6">
            {selectedVideo.s3Key ? (
              <PremiumVideoPlayer
                url={selectedVideo.s3Key.startsWith('http') 
                  ? selectedVideo.s3Key 
                  : `https://d1d410bjpcuiwb.cloudfront.net/${selectedVideo.s3Key.replace(/^\//, '')}`}
                poster={selectedVideo.thumbnailUrl}
              />
            ) : (
              <div className="aspect-video bg-zinc-100 rounded-lg flex items-center justify-center text-zinc-500">
                <div className="text-center">
                  <svg className="w-16 h-16 mx-auto mb-2 text-zinc-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                  <p className="text-sm">Video not available</p>
                </div>
              </div>
            )}
            
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-semibold text-zinc-700 mb-2">Description</h3>
                <p className="text-zinc-600 text-sm">{selectedVideo.description || 'No description provided'}</p>
              </div>

              {selectedVideo.tags && selectedVideo.tags.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-zinc-700 mb-2">Tags</h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedVideo.tags.map((tag: string, index: number) => (
                      <span key={index} className="px-2.5 py-1 bg-zinc-100 text-zinc-700 rounded-md text-xs border border-zinc-200">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4 p-4 bg-zinc-50 rounded-lg border border-zinc-200">
                <div>
                  <p className="text-xs text-zinc-500 mb-1">Views</p>
                  <p className="font-medium text-zinc-900">{selectedVideo.views || 0}</p>
                </div>
                <div>
                  <p className="text-xs text-zinc-500 mb-1">Upload Status</p>
                  <p className="font-medium text-zinc-900 capitalize">{selectedVideo.uploadStatus}</p>
                </div>
                <div>
                  <p className="text-xs text-zinc-500 mb-1">Thumbnail Status</p>
                  <p className="font-medium text-zinc-900 capitalize">{selectedVideo.thumbnailStatus?.replace('_', ' ')}</p>
                </div>
                <div>
                  <p className="text-xs text-zinc-500 mb-1">Visibility</p>
                  <p className="font-medium text-zinc-900 capitalize">{selectedVideo.visibility}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-xs text-zinc-500 mb-1">Created</p>
                  <p className="font-medium text-zinc-900">{formatRelativeTime(selectedVideo.createdAt || '')}</p>
                </div>
              </div>
            </div>
          </div>
        </Modal>
      )}

      {showDeleteModal && selectedVideo && (
        <Modal
          isOpen={showDeleteModal}
          onClose={() => {
            setShowDeleteModal(false);
            setSelectedVideo(null);
          }}
          title="Delete Video"
        >
          <div className="space-y-4">
            <p className="text-zinc-700 text-sm">
              Are you sure you want to delete <strong className="font-semibold">{selectedVideo.title}</strong>?
              This action cannot be undone.
            </p>
            <div className="flex gap-3 justify-end">
              <Button
                variant="secondary"
                onClick={() => {
                  setShowDeleteModal(false);
                  setSelectedVideo(null);
                }}
                className="border-zinc-300 text-zinc-700 hover:bg-zinc-50"
              >
                Cancel
              </Button>
              <Button
                variant="danger"
                onClick={handleDeleteConfirm}
                loading={deleteMutation.isPending}
              >
                Delete Video
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
