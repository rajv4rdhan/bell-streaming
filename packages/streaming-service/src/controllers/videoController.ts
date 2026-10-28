import { Request, Response, NextFunction } from 'express';
import axios from 'axios';

const videoMetadataServiceUrl = process.env.VIDEO_METADATA_SERVICE_URL;

if (!videoMetadataServiceUrl) {
    throw new Error("VIDEO_METADATA_SERVICE_URL is not defined in the environment variables.");
}

export const getAllVideos = async (req: Request, res: Response, next: NextFunction) => {
    try {
        // Forward the request to the video-metadata-service
        const response = await axios.get(`${videoMetadataServiceUrl}/api/admin/videos/public`);
        res.status(response.status).json(response.data);
    } catch (error) {
        if (axios.isAxiosError(error) && error.response) {
            return res.status(error.response.status).json(error.response.data);
        }
        return next(error);
    }
};

export const getVideoById = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { videoId } = req.params;
        // Forward the request to the video-metadata-service
        const response = await axios.get(`${videoMetadataServiceUrl}/api/admin/videos/${videoId}/public`);

        return res.json(response.data);

    } catch (error) {
        if (axios.isAxiosError(error) && error.response) {
            return res.status(error.response.status).json(error.response.data);
        }
        return next(error);
    }
};
