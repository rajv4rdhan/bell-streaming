import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, Button, Input, videoMetadataApi, videoUploadApi } from '@bell-streaming/shared-ui';

type UploadStep = 'metadata' | 'presigning' | 'file' | 'uploading' | 'confirming' | 'success' | 'error';

interface StageStatus {
  metadata: 'pending' | 'complete' | 'error';
  presigning: 'pending' | 'complete' | 'error';
  uploading: 'pending' | 'complete' | 'error';
  confirming: 'pending' | 'complete' | 'error';
}

export const UploadPage = () => {
  const queryClient = useQueryClient();
  
  // Form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [tags, setTags] = useState('');
  const [thumbnailPrompt, setThumbnailPrompt] = useState('');
  const [file, setFile] = useState<File | null>(null);
  
  // Upload state
  const [currentStep, setCurrentStep] = useState<UploadStep>('metadata');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState('');
  const [videoId, setVideoId] = useState('');
  const [s3Key, setS3Key] = useState('');
  const [presignedUrl, setPresignedUrl] = useState('');
  
  // Stage tracking
  const [stageStatus, setStageStatus] = useState<StageStatus>({
    metadata: 'pending',
    presigning: 'pending',
    uploading: 'pending',
    confirming: 'pending',
  });

  const resetState = () => {
    setTitle('');
    setDescription('');
    setTags('');
    setThumbnailPrompt('');
    setFile(null);
    setCurrentStep('metadata');
    setUploadProgress(0);
    setError('');
    setVideoId('');
    setS3Key('');
    setPresignedUrl('');
    setStageStatus({
      metadata: 'pending',
      presigning: 'pending',
      uploading: 'pending',
      confirming: 'pending',
    });
    queryClient.invalidateQueries({ queryKey: ['videos'] });
  };

  // Step 1: Create video metadata
  const createMetadataMutation = useMutation({
    mutationFn: () => videoMetadataApi.createVideo({
      title,
      description,
      tags: tags.split(',').map(t => t.trim()).filter(Boolean),
      promptForThumbnail: thumbnailPrompt || undefined,
    }),
    onSuccess: (response) => {
      const id = response.data.video._id;
      setVideoId(id);
      setStageStatus(prev => ({ ...prev, metadata: 'complete' }));
      setCurrentStep('file');
      setError('');
    },
    onError: (err: any) => {
      setError(err.response?.data?.message || 'Failed to create video metadata');
      setStageStatus(prev => ({ ...prev, metadata: 'error' }));
      setCurrentStep('error');
    },
  });

  // Step 2: Get presigned URL
  const getPresignedUrlMutation = useMutation({
    mutationFn: ({ videoId, contentType }: { videoId: string; contentType: string }) => 
      videoUploadApi.getPresignedUrl({ videoId, contentType }),
    onSuccess: (response) => {
      const { presignedUrl: url, s3Key: key } = response.data;
      setPresignedUrl(url);
      setS3Key(key);
      setStageStatus(prev => ({ ...prev, presigning: 'complete' }));
      // Automatically start the upload after getting the presigned URL
      if (file && videoId) {
        uploadFileMutation.mutate({ file, presignedUrl: url, s3Key: key, videoId });
      }
    },
    onError: (err: any) => {
      setError(err.response?.data?.message || 'Failed to generate upload URL');
      setStageStatus(prev => ({ ...prev, presigning: 'error' }));
      setCurrentStep('error');
    },
  });

  // Step 3 & 4: Upload to S3 and confirm
  const uploadFileMutation = useMutation({
    mutationFn: async ({ file: selectedFile, presignedUrl: url, s3Key: key, videoId: vId }: { file: File; presignedUrl: string; s3Key: string; videoId: string }) => {
      if (!url) throw new Error('Presigned URL is not available');

      // Stage 3: Upload to S3
      setCurrentStep('uploading');
      setStageStatus(prev => ({ ...prev, uploading: 'pending' }));
      await videoUploadApi.uploadToS3(url, selectedFile, setUploadProgress);
      setStageStatus(prev => ({ ...prev, uploading: 'complete' }));

      // Stage 4: Confirm upload
      setCurrentStep('confirming');
      setStageStatus(prev => ({ ...prev, confirming: 'pending' }));
      await videoUploadApi.confirmUpload({ videoId: vId, s3Key: key });
      setStageStatus(prev => ({ ...prev, confirming: 'complete' }));
    },
    onSuccess: () => {
      setCurrentStep('success');
    },
    onError: (err: any) => {
      const errorMessage = err.response?.data?.message || err.message || 'Upload failed';
      setError(errorMessage);
      setCurrentStep('error');
      setStageStatus(prev => ({ ...prev, uploading: 'error', confirming: 'error' }));
      if (videoId && s3Key) videoUploadApi.reportFailedUpload({ videoId, s3Key, error: errorMessage });
    },
  });

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const selectedFile = acceptedFiles[0];
    if (!selectedFile) return;

    if (!selectedFile.type.startsWith('video/')) {
      setError('Please select a valid video file.');
      return;
    }
    const maxSize = 1024 * 1024 * 1024; // 1GB
    if (selectedFile.size > maxSize) {
      setError('File size must be less than 1GB.');
      return;
    }

    setFile(selectedFile);
    setError('');
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'video/*': ['.mp4', '.webm', '.mov'] },
    maxFiles: 1,
    disabled: currentStep !== 'file',
  });

  const handleCreateMetadata = (e: React.FormEvent) => {
    e.preventDefault();
    createMetadataMutation.mutate();
  };

  const handleUpload = () => {
    if (!file) {
      setError('Please select a file to upload.');
      return;
    }
    if (!videoId) {
      setError('Video ID is missing. Please try again.');
      return;
    }
    // Generate presigned URL with the actual file's content type
    setCurrentStep('presigning');
    setStageStatus(prev => ({ ...prev, presigning: 'pending' }));
    getPresignedUrlMutation.mutate({ videoId, contentType: file.type });
  };

  const isProcessing = createMetadataMutation.isPending || getPresignedUrlMutation.isPending || uploadFileMutation.isPending;

  const getStageIndicator = (stage: keyof StageStatus) => {
    const isCurrent = 
      (stage === 'metadata' && currentStep === 'metadata') ||
      (stage === 'presigning' && currentStep === 'presigning') ||
      (stage === 'uploading' && currentStep === 'uploading') ||
      (stage === 'confirming' && currentStep === 'confirming');

    if (stageStatus[stage] === 'complete') return '✅';
    if (stageStatus[stage] === 'error') return '❌';
    if (isProcessing && isCurrent) return '⏳';
    return '⚪';
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Upload New Video</h1>

      {currentStep !== 'success' && (
        <div className="flex items-center space-x-4 mb-6">
          <div className="flex items-center space-x-2">
            <span className="text-lg">{getStageIndicator('metadata')}</span>
            <span>Metadata</span>
          </div>
          <span>&rarr;</span>
          <div className="flex items-center space-x-2">
            <span className="text-lg">{getStageIndicator('presigning')}</span>
            <span>Preparing</span>
          </div>
          <span>&rarr;</span>
          <div className="flex items-center space-x-2">
            <span className="text-lg">{getStageIndicator('uploading')}</span>
            <span>Uploading</span>
          </div>
          <span>&rarr;</span>
          <div className="flex items-center space-x-2">
            <span className="text-lg">{getStageIndicator('confirming')}</span>
            <span>Confirming</span>
          </div>
        </div>
      )}

      {error && (
        <Card className="mb-6 bg-red-100 border-red-500 text-red-700">
          <p className="font-bold">Error</p>
          <p>{error}</p>
        </Card>
      )}

      {currentStep === 'metadata' && (
        <Card>
          <form onSubmit={handleCreateMetadata}>
            <div className="space-y-4">
              <Input
                label="Video Title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., My Awesome Video"
                required
              />
              <Input
                label="Description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="A short summary of the video content"
                required
              />
              <Input
                label="Tags (comma-separated)"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                placeholder="e.g., tech, tutorial, javascript"
              />
              <Input
                label="Thumbnail Prompt (Optional)"
                value={thumbnailPrompt}
                onChange={(e) => setThumbnailPrompt(e.target.value)}
                placeholder="e.g., A futuristic cityscape at sunset"
              />
            </div>
            <div className="mt-6">
              <Button
                type="submit"
                loading={createMetadataMutation.isPending}
                disabled={createMetadataMutation.isPending}
              >
                Next: Prepare Upload
              </Button>
            </div>
          </form>
        </Card>
      )}

      {currentStep === 'presigning' && (
        <Card className="text-center">
          <p className="text-lg font-semibold">⏳ Preparing secure upload...</p>
        </Card>
      )}

      {currentStep === 'file' && (
        <Card>
          <div
            {...getRootProps()}
            className={`p-10 border-2 border-dashed rounded-lg text-center cursor-pointer
              ${isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300'}`}
          >
            <input {...getInputProps()} />
            {file ? (
              <p className="font-semibold">{file.name}</p>
            ) : isDragActive ? (
              <p>Drop the video file here ...</p>
            ) : (
              <p>Drag 'n' drop a video file here, or click to select file</p>
            )}
          </div>
          {file && (
            <div className="mt-6">
              <Button onClick={handleUpload} loading={uploadFileMutation.isPending} disabled={uploadFileMutation.isPending}>
                Upload Video
              </Button>
            </div>
          )}
        </Card>
      )}

      {(currentStep === 'uploading' || currentStep === 'confirming') && (
        <Card>
          <div className="text-center">
            <p className="text-lg font-semibold mb-2">
              {currentStep === 'uploading' && 'Uploading video...'}
              {currentStep === 'confirming' && 'Finalizing upload...'}
            </p>
            {currentStep === 'uploading' && (
              <div className="w-full bg-gray-200 rounded-full h-4">
                <div
                  className="bg-blue-500 h-4 rounded-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                ></div>
              </div>
            )}
            <p className="mt-2 text-gray-600">{file?.name}</p>
          </div>
        </Card>
      )}

      {currentStep === 'success' && (
        <Card className="text-center bg-green-50">
          <h2 className="text-2xl font-bold text-green-700 mb-2">Upload Successful!</h2>
          <p>Your video has been uploaded and is now processing.</p>
          <div className="mt-4">
            <Button onClick={resetState}>Upload Another Video</Button>
          </div>
        </Card>
      )}

      {currentStep === 'error' && (
         <Card className="text-center">
           <h2 className="text-2xl font-bold text-red-700 mb-2">Upload Failed</h2>
           <p className="mb-4">{error}</p>
           <Button onClick={resetState}>Try Again</Button>
         </Card>
      )}
    </div>
  );
};
