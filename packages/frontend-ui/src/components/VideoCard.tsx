import React from 'react';
import { Link } from 'react-router-dom';
import { formatNumber } from '@bell-streaming/shared-ui';
import type { Video } from '@bell-streaming/shared-ui';

interface VideoCardProps {
  video: Video;
}

export const VideoCard: React.FC<VideoCardProps> = ({ video }) => {
  return (
    <Link to={`/watch/${video._id || video.id}`} className="group">
      <div className="mb-3 relative">
        {video.thumbnailUrl ? (
          <img
            src={video.thumbnailUrl}
            alt={video.title}
            className="w-full aspect-video object-cover rounded-lg group-hover:rounded-none transition-all"
          />
        ) : (
          <div className="w-full aspect-video bg-gray-700 rounded-lg flex items-center justify-center text-gray-400">
            No Thumbnail
          </div>
        )}
      </div>
      
      <div className="flex gap-3">
        <div className="flex-1">
          <h3 className="font-semibold line-clamp-2 group-hover:text-blue-400 transition-colors mb-1">
            {video.title}
          </h3>
          <p className="text-sm text-gray-400">{video.createdBy || 'Unknown'}</p>
          <div className="flex items-center gap-2 text-sm text-gray-400">
            <span>{formatNumber(video.views || 0)} views</span>
          </div>
        </div>
      </div>
    </Link>
  );
};
