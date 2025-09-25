import { Global, Module } from '@nestjs/common';
import { Client } from '@elastic/elasticsearch';

@Global()
@Module({
  providers: [
    {
      provide: 'ELASTIC_CLIENT',
      useFactory: async () => {
        const node = process.env.ELASTICSEARCH_NODE || 'http://localhost:9200';
        const client = new Client({ node });
        return client;
      },
    },
  ],
  exports: ['ELASTIC_CLIENT'],
})
export class ElasticsearchModule {}
