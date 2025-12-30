import { Injectable, Logger, OnModuleDestroy } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import Redis from 'ioredis'

@Injectable()
export class RedisService implements OnModuleDestroy {
  private readonly logger = new Logger(RedisService.name)
  private client: Redis | null = null

  constructor(private config: ConfigService) {
    const url = this.config.get<string>('REDIS_URL')
    if (!url) {
      this.logger.warn('REDIS_URL not set; Redis disabled')
      return
    }
    this.client = new Redis(url)
  }

  getClient(): Redis | null {
    return this.client
  }

  async onModuleDestroy() {
    if (this.client) {
      await this.client.quit()
    }
  }
}
