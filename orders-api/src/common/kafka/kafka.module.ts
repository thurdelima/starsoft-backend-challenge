import { Global, Module } from '@nestjs/common';
import { Kafka, KafkaConfig } from 'kafkajs';

@Global()
@Module({
  providers: [
    {
      provide: 'KAFKA_PRODUCER',
      useFactory: async () => {
        const config: KafkaConfig = {
          brokers: (process.env.KAFKA_BROKERS || 'localhost:9092').split(','),
          clientId: 'orders-api',
        };
        const kafka = new Kafka(config);
        const producer = kafka.producer();
        await producer.connect();
        return producer;
      },
    },
  ],
  exports: ['KAFKA_PRODUCER'],
})
export class KafkaModule {}
