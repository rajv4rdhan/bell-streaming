import { Kafka, Producer } from 'kafkajs';
import { config } from '../config';

interface VideoUploadedMessage {
  event: 'video.uploaded';
  videoId: string;
  s3Key: string;
  userId?: string;
  size?: number;
  contentType?: string;
  uploadedAt: string;
}

class KafkaService {
  private kafka: Kafka;
  private producer: Producer | null = null;

  constructor() {
    this.kafka = new Kafka({
      clientId: config.kafka.clientId,
      brokers: config.kafka.brokers,
    });
  }

  private async getProducer(): Promise<Producer> {
    if (!this.producer) {
      this.producer = this.kafka.producer();
      await this.producer.connect();
    }
    return this.producer;
  }

  async publishVideoUploaded(
    message: Omit<VideoUploadedMessage, 'event' | 'uploadedAt'>
  ): Promise<void> {
    try {
      const producer = await this.getProducer();
      const payload: VideoUploadedMessage = {
        ...message,
        event: 'video.uploaded',
        uploadedAt: new Date().toISOString(),
      };

      await producer.send({
        topic: config.kafka.topic,
        messages: [{ key: message.videoId, value: JSON.stringify(payload) }],
      });

      console.log('[Kafka] Published video.uploaded event:', payload.videoId);
    } catch (error) {
      console.error('[Kafka] Failed to publish video.uploaded event:', error);
      throw new Error('Failed to publish upload event to Kafka');
    }
  }

  async disconnect(): Promise<void> {
    if (this.producer) {
      await this.producer.disconnect();
      this.producer = null;
    }
  }
}

export const kafkaService = new KafkaService();
