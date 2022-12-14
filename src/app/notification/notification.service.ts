import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { ConfigService } from '@nestjs/config';
import { Model } from 'mongoose';

import {
  Notification,
  NotificationDocument,
} from 'src/schemas/notification.schema';
import { MAX_LIMIT } from 'src/pipelines/limit.pipe';
import { MIN_OFFSET } from 'src/pipelines/offset.pipe';
import { EnvironmentVariables } from 'src/config';
import { NotificationDto } from './notification.dto';

@Injectable()
export class NotificationService {
  constructor(
    @InjectModel(Notification.name)
    private notificationModel: Model<NotificationDocument>,
    private config: ConfigService<EnvironmentVariables>,
  ) {}

  dbProjection = this.config.get('mongodb.projection', { infer: true });

  async getNotifications({
    filter = {},
    search = '',
    offset = MIN_OFFSET,
    limit = MAX_LIMIT,
  }: {
    filter?: object;
    search?: string;
    offset?: number;
    limit?: number;
  }) {
    const cond = search ? { ...filter, $text: { $search: search } } : filter;
    const notifications = await this.notificationModel
      .find(cond, this.dbProjection)
      .sort({ createdAt: -1 })
      .skip(offset)
      .limit(limit)
      .exec();
    return notifications;
  }

  async newNotification(dapp: NotificationDto) {
    const newNotification = await new this.notificationModel({
      ...dapp,
    }).save();
    return newNotification;
  }
}
