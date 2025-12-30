import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { PrismaModule } from './common/prisma/prisma.module'
import { KafkaModule } from './integrations/kafka/kafka.module'
import { RedisModule } from './integrations/redis/redis.module'
import { AuthModule } from './modules/auth/auth.module'
import { UsersModule } from './modules/users/users.module'
import { StationsModule } from './modules/stations/stations.module'
import { SessionsModule } from './modules/sessions/sessions.module'
import { PaymentsModule } from './modules/payments/payments.module'
import { NotificationsModule } from './modules/notifications/notifications.module'
import { HealthModule } from './modules/health/health.module'

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env', '.env.local'],
    }),
    PrismaModule,
    KafkaModule,
    RedisModule,
    AuthModule,
    UsersModule,
    StationsModule,
    SessionsModule,
    PaymentsModule,
    NotificationsModule,
    HealthModule,
  ],
})
export class AppModule {}
