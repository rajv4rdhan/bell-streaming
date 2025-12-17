import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, Button, Input, Modal, Spinner, videoMetadataApi, formatRelativeTime, PremiumVideoPlayer } from '@bell-streaming/shared-ui';
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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-sm font-medium text-slate-500 mb-1">Media Library</h2>
          <p className="text-slate-600">{videos?.total || 0} videos total</p>
        </div>
        <Input
          type="search"
          placeholder="Search videos..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-80"
        />
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center h-96">
          <Spinner size="lg" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {videos?.videos?.map((video: Video) => (
            <div 
              key={video._id} 
              className="bg-white rounded-2xl border border-slate-200 shadow-premium hover:shadow-premium-lg transition-all duration-300 overflow-hidden group"
            >
              <div className="relative">
                {video.thumbnailUrl ? (
                  <img
                    src={video.thumbnailUrl}
                    alt={video.title}
                    className="w-full h-48 object-cover"
                  />
                ) : (
                  <div className="w-full h-48 bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center">
                    <svg className="w-16 h-16 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                  </div>
                )}
                <div className="absolute top-3 right-3 flex gap-2">
                  <span
                    className={`px-2.5 py-1 text-xs font-semibold rounded-lg backdrop-blur-sm ${
                      video.uploadStatus === 'completed'
                        ? 'bg-emerald-500/90 text-white'
                        : video.uploadStatus === 'uploading'
                        ? 'bg-amber-500/90 text-white'
                        : video.uploadStatus === 'failed'
                        ? 'bg-red-500/90 text-white'
                        : 'bg-slate-500/90 text-white'
                    }`}
                  >
                    {video.uploadStatus}
                  </span>
                  <span
                    className={`px-2.5 py-1 text-xs font-semibold rounded-lg backdrop-blur-sm ${
                      video.visibility === 'public'
                        ? 'bg-primary-500/90 text-white'
                        : 'bg-slate-700/90 text-white'
                    }`}
                  >
                    {video.visibility}
                  </span>
                </div>
              </div>

              <div className="p-5">
                <h3 className="font-semibold text-slate-900 mb-2 line-clamp-2 group-hover:text-primary-600 transition-colors">
                  {video.title}
                </h3>
                <p className="text-sm text-slate-600 mb-3 line-clamp-2">
                  {video.description}
                </p>

                {video.tags && video.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {video.tags.slice(0, 3).map((tag, index) => (
                      <span key={index} className="px-2 py-1 text-xs bg-slate-100 text-slate-600 rounded-md font-medium">
                        {tag}
                      </span>
                    ))}
                    {video.tags.length > 3 && (
                      <span className="px-2 py-1 text-xs bg-slate-100 text-slate-600 rounded-md font-medium">
                        +{video.tags.length - 3}
                      </span>
                    )}
                  </div>
                )}

                <div className="flex items-center justify-between text-xs text-slate-500 mb-4">
                  <div className="flex items-center gap-1">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                    <span>{video.views || 0}</span>
                  </div>
                  <span>{formatRelativeTime(video.createdAt || '')}</span>
                </div>

                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => handleToggleVisibility(video)}
                    className="flex-1 !text-xs !py-2"
                    disabled={toggleVisibilityMutation.isPending}
                  >
                    {video.visibility === 'public' ? 'Make Private' : 'Make Public'}
                  </Button>
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => setSelectedVideo(video)}
                    className="!text-xs !py-2"
                  >
                    View
                  </Button>
                  <Button
                    size="sm"
                    variant="danger"
                    onClick={() => handleDeleteClick(video)}
                    className="!text-xs !py-2"
                  >
                    Delete
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

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
                url={`${import.meta.env.VITE_CLOUDFRONT_URL}/${selectedVideo.s3Key}`}
                poster={selectedVideo.thumbnailUrl}
              />
            ) : (
              <div className="aspect-video bg-slate-100 rounded-2xl flex items-center justify-center text-slate-500">
                <div className="text-center">
                  <svg className="w-16 h-16 mx-auto mb-2 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                  <p>Video not available</p>
                </div>
              </div>
            )}
            
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-semibold text-slate-700 mb-2">Description</h3>
                <p className="text-slate-600">{selectedVideo.description || 'No description provided'}</p>
              </div>

              {selectedVideo.tags && selectedVideo.tags.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-slate-700 mb-2">Tags</h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedVideo.tags.map((tag, index) => (
                      <span key={index} className="px-3 py-1 bg-slate-100 text-slate-700 rounded-lg text-sm">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4 p-4 bg-slate-50 rounded-xl">
                <div>
                  <p className="text-xs text-slate-500 mb-1">Views</p>
                  <p className="font-semibold text-slate-900">{selectedVideo.views || 0}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 mb-1">Status</p>
                  <p className="font-semibold text-slate-900 capitalize">{selectedVideo.uploadStatus}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 mb-1">Visibility</p>
                  <p className="font-semibold text-slate-900 capitalize">{selectedVideo.visibility}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 mb-1">Created</p>
                  <p className="font-semibold text-slate-900">{formatRelativeTime(selectedVideo.createdAt || '')}</p>
                </div>
              </div>
            </div>
          </div>
        </Modal>
      )}

      {/* Delete Confirmation Modal */}
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
            <p className="text-gray-700">
              Are you sure you want to delete <strong>{selectedVideo.title}</strong>?
              This action cannot be undone.
            </p>
            <div className="flex gap-3 justify-end">
              <Button
                variant="secondary"
                onClick={() => {
                  setShowDeleteModal(false);
                  setSelectedVideo(null);
                }}
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
