import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, Button, Input, Modal, Spinner, videoMetadataApi, formatRelativeTime } from '@bell-streaming/shared-ui';
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
        <h1 className="text-2xl font-bold text-gray-900">Video Management</h1>
        <Input
          type="search"
          placeholder="Search videos..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-64"
        />
      </div>

      {isLoading ? (
        <Spinner size="lg" className="mt-20" />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {videos?.videos?.map((video: Video) => (
            <Card key={video._id} padding="none" hover>
              <div className="relative">
                {video.thumbnailUrl ? (
                  <img
                    src={video.thumbnailUrl}
                    alt={video.title}
                    className="w-full h-48 object-cover rounded-t-lg"
                  />
                ) : (
                  <div className="w-full h-48 bg-gray-200 rounded-t-lg flex items-center justify-center text-gray-400">
                    No Thumbnail
                  </div>
                )}
                <div className="absolute top-2 right-2 flex gap-2">
                  <span
                    className={`px-2 py-1 text-xs font-semibold rounded ${
                      video.uploadStatus === 'completed'
                        ? 'bg-green-500 text-white'
                        : video.uploadStatus === 'uploading'
                        ? 'bg-yellow-500 text-white'
                        : video.uploadStatus === 'failed'
                        ? 'bg-red-500 text-white'
                        : 'bg-gray-500 text-white'
                    }`}
                  >
                    {video.uploadStatus}
                  </span>
                  <span
                    className={`px-2 py-1 text-xs font-semibold rounded ${
                      video.visibility === 'public'
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-700 text-white'
                    }`}
                  >
                    {video.visibility}
                  </span>
                </div>
              </div>

              <div className="p-4">
                <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">
                  {video.title}
                </h3>
                <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                  {video.description}
                </p>

                {video.tags && video.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-3">
                    {video.tags.map((tag, index) => (
                      <span key={index} className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded">
                        {tag}
                      </span>
                    ))}
                  </div>
                )}

                <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
                  <span>{video.views || 0} views</span>
                  <span>{formatRelativeTime(video.createdAt || '')}</span>
                </div>

                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => handleToggleVisibility(video)}
                    className="flex-1"
                    disabled={toggleVisibilityMutation.isPending}
                  >
                    {video.visibility === 'public' ? '🔒 Private' : '🌐 Public'}
                  </Button>
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => setSelectedVideo(video)}
                  >
                    View
                  </Button>
                  <Button
                    size="sm"
                    variant="danger"
                    onClick={() => handleDeleteClick(video)}
                  >
                    Delete
                  </Button>
                </div>
              </div>
            </Card>
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
          <div className="space-y-4">
            {selectedVideo.videoUrl && (
              <video
                src={selectedVideo.videoUrl}
                poster={selectedVideo.thumbnailUrl}
                controls
                className="w-full rounded-lg"
              />
            )}
            <p className="text-gray-700">{selectedVideo.description}</p>
            {selectedVideo.tags && selectedVideo.tags.length > 0 && (
              <div>
                <span className="font-semibold">Tags:</span>{' '}
                {selectedVideo.tags.join(', ')}
              </div>
            )}
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-semibold">Views:</span> {selectedVideo.views || 0}
              </div>
              <div>
                <span className="font-semibold">Status:</span> {selectedVideo.uploadStatus}
              </div>
              <div>
                <span className="font-semibold">Visibility:</span> {selectedVideo.visibility}
              </div>
              <div>
                <span className="font-semibold">Created:</span>{' '}
                {formatRelativeTime(selectedVideo.createdAt || '')}
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
