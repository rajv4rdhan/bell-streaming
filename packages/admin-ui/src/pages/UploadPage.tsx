import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Button, Input, videoMetadataApi, videoUploadApi } from '@bell-streaming/shared-ui';

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
    onSuccess: (response: any) => {
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
    onSuccess: (response: any) => {
      const { presignedUrl: url, s3Key: key } = response.data;
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

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h2 className="text-sm font-medium text-slate-500 mb-1">Upload Manager</h2>
        <p className="text-slate-600">Share new content with your audience</p>
      </div>

      {currentStep !== 'success' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-premium p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                stageStatus.metadata === 'complete' ? 'bg-emerald-100 text-emerald-600' :
                currentStep === 'metadata' ? 'bg-primary-100 text-primary-600' :
                'bg-slate-100 text-slate-400'
              }`}>
                {stageStatus.metadata === 'complete' ? (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  <span className="font-semibold">1</span>
                )}
              </div>
              <span className="text-sm font-medium text-slate-700">Metadata</span>
            </div>
            <svg className="w-4 h-4 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                stageStatus.presigning === 'complete' ? 'bg-emerald-100 text-emerald-600' :
                currentStep === 'presigning' ? 'bg-primary-100 text-primary-600' :
                'bg-slate-100 text-slate-400'
              }`}>
                {stageStatus.presigning === 'complete' ? (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  <span className="font-semibold">2</span>
                )}
              </div>
              <span className="text-sm font-medium text-slate-700">Prepare</span>
            </div>
            <svg className="w-4 h-4 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                stageStatus.uploading === 'complete' ? 'bg-emerald-100 text-emerald-600' :
                currentStep === 'uploading' ? 'bg-primary-100 text-primary-600' :
                'bg-slate-100 text-slate-400'
              }`}>
                {stageStatus.uploading === 'complete' ? (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  <span className="font-semibold">3</span>
                )}
              </div>
              <span className="text-sm font-medium text-slate-700">Upload</span>
            </div>
            <svg className="w-4 h-4 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                stageStatus.confirming === 'complete' ? 'bg-emerald-100 text-emerald-600' :
                currentStep === 'confirming' ? 'bg-primary-100 text-primary-600' :
                'bg-slate-100 text-slate-400'
              }`}>
                {stageStatus.confirming === 'complete' ? (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  <span className="font-semibold">4</span>
                )}
              </div>
              <span className="text-sm font-medium text-slate-700">Confirm</span>
            </div>
          </div>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-4">
          <div className="flex items-start gap-3">
            <svg className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <p className="font-semibold text-red-900">Upload Error</p>
              <p className="text-sm text-red-700 mt-1">{error}</p>
            </div>
          </div>
        </div>
      )}

      {currentStep === 'metadata' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-premium p-8">
          <h3 className="text-lg font-semibold text-slate-900 mb-6">Video Details</h3>
          <form onSubmit={handleCreateMetadata} className="space-y-5">
            <Input
              label="Video Title"
              value={title}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTitle(e.target.value)}
              placeholder="e.g., My Awesome Video"
              required
            />
            <Input
              label="Description"
              value={description}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setDescription(e.target.value)}
              placeholder="A short summary of the video content"
              required
            />
            <Input
              label="Tags (comma-separated)"
              value={tags}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTags(e.target.value)}
              placeholder="e.g., tech, tutorial, javascript"
            />
            <Input
              label="Thumbnail Prompt (Optional)"
              value={thumbnailPrompt}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setThumbnailPrompt(e.target.value)}
              placeholder="e.g., A futuristic cityscape at sunset"
            />
            <Button
              type="submit"
              className="w-full !bg-slate-900 hover:!bg-slate-800 !py-3 !rounded-xl !font-medium"
              loading={createMetadataMutation.isPending}
              disabled={createMetadataMutation.isPending}
            >
              Continue to Upload
            </Button>
          </form>
        </div>
      )}

      {currentStep === 'presigning' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-premium p-12 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary-100 mb-4">
            <svg className="w-8 h-8 text-primary-600 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </div>
          <p className="text-lg font-semibold text-slate-900">Preparing secure upload...</p>
          <p className="text-sm text-slate-500 mt-2">Please wait while we set up your upload</p>
        </div>
      )}

      {currentStep === 'file' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-premium p-8">
          <h3 className="text-lg font-semibold text-slate-900 mb-6">Select Video File</h3>
          <div
            {...getRootProps()}
            className={`p-12 border-2 border-dashed rounded-2xl text-center cursor-pointer transition-all ${
              isDragActive 
                ? 'border-primary-500 bg-primary-50' 
                : 'border-slate-300 hover:border-slate-400 hover:bg-slate-50'
            }`}
          >
            <input {...getInputProps()} />
            {file ? (
              <div className="flex items-center justify-center gap-3">
                <svg className="w-12 h-12 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                <div className="text-left">
                  <p className="font-semibold text-slate-900">{file.name}</p>
                  <p className="text-sm text-slate-500">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                </div>
              </div>
            ) : (
              <div>
                <svg className="w-16 h-16 mx-auto text-slate-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
                <p className="text-lg font-medium text-slate-900 mb-2">
                  {isDragActive ? 'Drop your video here' : 'Drag & drop your video'}
                </p>
                <p className="text-sm text-slate-500">or click to browse (MP4, WebM, MOV - Max 1GB)</p>
              </div>
            )}
          </div>
          {file && (
            <Button 
              onClick={handleUpload} 
              className="w-full mt-6 !bg-slate-900 hover:!bg-slate-800 !py-3 !rounded-xl !font-medium"
              loading={uploadFileMutation.isPending} 
              disabled={uploadFileMutation.isPending}
            >
              Start Upload
            </Button>
          )}
        </div>
      )}

      {(currentStep === 'uploading' || currentStep === 'confirming') && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-premium p-8">
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary-100 mb-4">
              <svg className="w-8 h-8 text-primary-600 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
            </div>
            <p className="text-lg font-semibold text-slate-900 mb-2">
              {currentStep === 'uploading' ? 'Uploading your video...' : 'Finalizing upload...'}
            </p>
            <p className="text-sm text-slate-500">{file?.name}</p>
          </div>
          {currentStep === 'uploading' && (
            <div>
              <div className="flex items-center justify-between text-sm text-slate-600 mb-2">
                <span>Progress</span>
                <span className="font-semibold">{uploadProgress}%</span>
              </div>
              <div className="w-full bg-slate-200 rounded-full h-3 overflow-hidden">
                <div
                  className="bg-gradient-to-r from-primary-500 to-primary-600 h-3 rounded-full transition-all duration-300 ease-out"
                  style={{ width: `${uploadProgress}%` }}
                ></div>
              </div>
            </div>
          )}
        </div>
      )}

      {currentStep === 'success' && (
        <div className="bg-white rounded-2xl border border-emerald-200 shadow-premium p-12 text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-emerald-100 mb-4">
            <svg className="w-10 h-10 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Upload Successful!</h2>
          <p className="text-slate-600 mb-6">Your video has been uploaded and is now processing.</p>
          <Button 
            onClick={resetState}
            className="!bg-slate-900 hover:!bg-slate-800 !py-3 !px-8 !rounded-xl !font-medium"
          >
            Upload Another Video
          </Button>
        </div>
      )}

      {currentStep === 'error' && (
        <div className="bg-white rounded-2xl border border-red-200 shadow-premium p-12 text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-red-100 mb-4">
            <svg className="w-10 h-10 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Upload Failed</h2>
          <p className="text-slate-600 mb-6">{error}</p>
          <Button 
            onClick={resetState}
            className="!bg-slate-900 hover:!bg-slate-800 !py-3 !px-8 !rounded-xl !font-medium"
          >
            Try Again
          </Button>
        </div>
      )}
    </div>
  );
};
