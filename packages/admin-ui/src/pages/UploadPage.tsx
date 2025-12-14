import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, Button, Input, videoMetadataApi, videoUploadApi } from '@bell-streaming/shared-ui';

type UploadStep = 'metadata' | 'file' | 'presigning' | 'uploading' | 'confirming' | 'success' | 'error';

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

  // Step 1: Create video metadata
  const createMetadataMutation = useMutation({
    mutationFn: async () => {
      const response = await videoMetadataApi.createVideo({
        title,
        description,
        tags: tags.split(',').map(t => t.trim()).filter(Boolean),
        promptForThumbnail: thumbnailPrompt || undefined,
      });
      return response.data;
    },
    onSuccess: (data) => {
      console.log('✅ Metadata created:', data);
      const id = data.video?._id || data._id;
      console.log('🆔 Video ID:', id);
      setVideoId(id);
      setStageStatus(prev => ({ ...prev, metadata: 'complete' }));
      setCurrentStep('file');
      setError('');
    },
    onError: (err: any) => {
      console.error('❌ Metadata creation failed:', err);
      setError(err.response?.data?.message || 'Failed to create video metadata');
      setStageStatus(prev => ({ ...prev, metadata: 'error' }));
      setCurrentStep('error');
    },
  });

  // Step 2: Upload process (presigned URL, upload, confirm)
  const uploadMutation = useMutation({
    mutationFn: async () => {
      console.log('🚀 Upload mutation started');
      console.log('📁 File:', file);
      console.log('🆔 Video ID:', videoId);
      
      if (!file || !videoId) {
        console.error('❌ Missing file or videoId');
        throw new Error('No file or video ID');
      }
      
      try {
        // Stage 1: Get presigned URL
        console.log('🔑 Getting presigned URL...');
        setCurrentStep('presigning');
        const presignedResponse = await videoUploadApi.getPresignedUrl({
          videoId,
          contentType: file.type,
        });
        console.log('✅ Presigned URL response:', presignedResponse.data);
        
        const { presignedUrl: url, s3Key: key } = presignedResponse.data;
        setPresignedUrl(url);
        setS3Key(key);
        setStageStatus(prev => ({ ...prev, presigning: 'complete' }));
        
        // Stage 2: Upload to S3
        console.log('☁️ Uploading to S3...');
        setCurrentStep('uploading');
        await videoUploadApi.uploadToS3(url, file, setUploadProgress);
        console.log('✅ S3 upload complete');
        setStageStatus(prev => ({ ...prev, uploading: 'complete' }));
        
        // Stage 3: Confirm upload
        console.log('✔️ Confirming upload...');
        setCurrentStep('confirming');
        await videoUploadApi.confirmUpload({
          videoId,
          s3Key: key,
        });
        console.log('✅ Upload confirmed');
        setStageStatus(prev => ({ ...prev, confirming: 'complete' }));
        
        return { s3Key: key };
      } catch (error) {
        console.error('💥 Error in upload process:', error);
        throw error;
      }
    },
    onSuccess: () => {
      console.log('🎉 Upload successful!');
      setCurrentStep('success');
      queryClient.invalidateQueries({ queryKey: ['videos'] });
    },
    onError: async (err: any) => {
      console.error('❌ Upload mutation error:', err);
      console.error('Error details:', err.response?.data);
      
      const errorMessage = err.response?.data?.message || err.message || 'Upload failed';
      setError(errorMessage);
      setCurrentStep('error');
      
      // Mark the appropriate stage as error based on current step
      const step = currentStep;
      if (step === 'presigning') {
        setStageStatus(prev => ({ ...prev, presigning: 'error' }));
      } else if (step === 'uploading') {
        setStageStatus(prev => ({ ...prev, uploading: 'error' }));
      } else if (step === 'confirming') {
        setStageStatus(prev => ({ ...prev, confirming: 'error' }));
      }
      
      // Report failed upload
      if (videoId && s3Key) {
        try {
          await videoUploadApi.reportFailedUpload({
            videoId,
            s3Key,
            error: errorMessage,
          });
        } catch (e) {
          console.error('Failed to report upload error:', e);
        }
      }
    },
  });

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const selectedFile = acceptedFiles[0];
    if (!selectedFile) return;

    // Validate file
    if (!selectedFile.type.startsWith('video/')) {
      setError('Please select a valid video file');
      return;
    }

    const maxSize = 1024 * 1024 * 1024; // 1GB
    if (selectedFile.size > maxSize) {
      setError('File size must be less than 1GB');
      return;
    }

    setFile(selectedFile);
    setError('');
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'video/*': ['.mp4', '.webm', '.mov', '.avi', '.mkv'],
    },
    maxFiles: 1,
    disabled: currentStep !== 'file',
  });

  const handleCreateMetadata = (e: React.FormEvent) => {
    e.preventDefault();
    createMetadataMutation.mutate();
  };

  const handleUpload = () => {
    if (!file) {
      setError('Please select a video file');
      return;
    }
    uploadMutation.mutate();
  };

  const resetForm = () => {
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
  };

  const getStatusIcon = (status: 'pending' | 'complete' | 'error') => {
    if (status === 'complete') return '✅';
    if (status === 'error') return '❌';
    return '⏳';
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Upload Video</h1>
      </div>

      {/* Progress Tracker - Show after metadata is created */}
      {(currentStep !== 'metadata' && currentStep !== 'file') && (
        <Card padding="lg">
          <h3 className="text-lg font-semibold mb-4">Upload Progress</h3>
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <span className="text-2xl">{getStatusIcon(stageStatus.metadata)}</span>
              <span className="font-medium">1. Metadata Created</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-2xl">{getStatusIcon(stageStatus.presigning)}</span>
              <span className="font-medium">2. Presigned URL Generated</span>
              {stageStatus.presigning === 'complete' && currentStep === 'presigning' && (
                <span className="text-xs text-gray-500 ml-auto">✓ Ready to upload</span>
              )}
            </div>
            <div className="flex items-center gap-3">
              <span className="text-2xl">{getStatusIcon(stageStatus.uploading)}</span>
              <span className="font-medium">3. Uploading to S3</span>
              {currentStep === 'uploading' && (
                <span className="text-xs text-blue-600 ml-auto">{uploadProgress}%</span>
              )}
            </div>
            <div className="flex items-center gap-3">
              <span className="text-2xl">{getStatusIcon(stageStatus.confirming)}</span>
              <span className="font-medium">4. Confirming Upload</span>
            </div>
          </div>
        </Card>
      )}

      <Card padding="lg">
        {/* Step 1: Metadata Form */}
        {currentStep === 'metadata' && (
          <form onSubmit={handleCreateMetadata} className="space-y-6">
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Step 1: Video Information</h2>
              <p className="text-sm text-gray-600 mb-6">
                Provide details about your video before uploading the file.
              </p>
            </div>

            <Input
              label="Video Title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter video title"
              required
            />

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Enter video description"
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <Input
              label="Tags (comma-separated)"
              type="text"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="tech, tutorial, education"
            />

            <Input
              label="Thumbnail Generation Prompt (optional)"
              type="text"
              value={thumbnailPrompt}
              onChange={(e) => setThumbnailPrompt(e.target.value)}
              placeholder="A modern tech tutorial screenshot"
            />

            <Button
              type="submit"
              variant="primary"
              className="w-full"
              loading={createMetadataMutation.isPending}
            >
              Next: Select Video File
            </Button>
          </form>
        )}

        {/* Step 2: File Selection */}
        {currentStep === 'file' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Step 2: Select Video File</h2>
              <p className="text-sm text-gray-600">
                Video metadata created successfully. Now upload your video file.
              </p>
            </div>

            <div
              {...getRootProps()}
              className={`border-2 border-dashed rounded-lg p-12 text-center cursor-pointer transition-colors ${
                isDragActive
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-300 hover:border-gray-400'
              }`}
            >
              <input {...getInputProps()} />
              {file ? (
                <div>
                  <div className="text-6xl mb-4">✅</div>
                  <p className="text-lg font-medium text-gray-900">{file.name}</p>
                  <p className="text-sm text-gray-500 mt-1">
                    {(file.size / (1024 * 1024)).toFixed(2)} MB
                  </p>
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      setFile(null);
                    }}
                    className="mt-4"
                  >
                    Remove
                  </Button>
                </div>
              ) : (
                <div>
                  <div className="text-6xl mb-4">📹</div>
                  <p className="text-lg font-medium text-gray-900">
                    {isDragActive ? 'Drop video here' : 'Drag & drop video here'}
                  </p>
                  <p className="text-sm text-gray-500 mt-2">
                    or click to browse (MP4, WebM, MOV, AVI, MKV • Max 1GB)
                  </p>
                </div>
              )}
            </div>

            <div className="flex gap-3">
              <Button
                variant="secondary"
                className="flex-1"
                onClick={resetForm}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                className="flex-1"
                onClick={handleUpload}
                disabled={!file}
              >
                Upload Video
              </Button>
            </div>
          </div>
        )}

        {/* Step 3: Presigning */}
        {currentStep === 'presigning' && (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Generating Presigned URL...</h2>
              <p className="text-sm text-gray-600">
                Creating secure upload link to AWS S3
              </p>
            </div>
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600"></div>
            </div>
          </div>
        )}

        {/* Step 4: Uploading */}
        {currentStep === 'uploading' && (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Uploading to S3...</h2>
              <p className="text-sm text-gray-600">
                Please don't close this page while upload is in progress.
              </p>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-sm text-gray-600">
                <span>{file?.name}</span>
                <span>{uploadProgress}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className="bg-blue-600 h-3 rounded-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>

            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600"></div>
            </div>
          </div>
        )}

        {/* Step 5: Confirming */}
        {currentStep === 'confirming' && (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Confirming Upload...</h2>
              <p className="text-sm text-gray-600">
                Verifying upload and updating metadata
              </p>
            </div>
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-green-600"></div>
            </div>
          </div>
        )}

        {/* Step 6: Success */}
        {currentStep === 'success' && (
          <div className="space-y-6 text-center py-8">
            <div className="text-6xl mb-4">🎉</div>
            <h2 className="text-2xl font-semibold text-gray-900">Upload Successful!</h2>
            <p className="text-gray-600">
              Your video has been uploaded successfully and is now being processed.
            </p>
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <p className="text-sm text-green-800">
                <strong>Video ID:</strong> {videoId}
              </p>
            </div>
            <div className="flex gap-3 justify-center">
              <Button
                variant="primary"
                onClick={resetForm}
              >
                Upload Another Video
              </Button>
              <Button
                variant="secondary"
                onClick={() => window.location.href = '/videos'}
              >
                View All Videos
              </Button>
            </div>
          </div>
        )}

        {/* Error State */}
        {currentStep === 'error' && (
          <div className="space-y-6 text-center py-8">
            <div className="text-6xl mb-4">❌</div>
            <h2 className="text-2xl font-semibold text-gray-900">Upload Failed</h2>
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-sm text-red-800">{error}</p>
            </div>
            <div className="flex gap-3 justify-center">
              <Button
                variant="primary"
                onClick={resetForm}
              >
                Try Again
              </Button>
            </div>
          </div>
        )}

        {/* General Error Message */}
        {error && currentStep !== 'error' && (
          <div className="p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}
      </Card>
    </div>
  );
};
