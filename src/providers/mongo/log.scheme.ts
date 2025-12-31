import { HydratedDocument, SchemaTypes } from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

export type LogDocument = HydratedDocument<Log>;

@Schema({ timestamps: true })
export class Log {
  @Prop({ required: true, type: Date, default: Date.now })
  timestamp: Date;

  @Prop({
    required: true,
    type: String,
    enum: ['DEBUG', 'LOG', 'ERROR', 'FATAL', 'VERBOSE', 'WARN'],
  })
  level: string;

  @Prop({ required: true, type: SchemaTypes.Mixed })
  message: any;

  @Prop({ required: false, type: String })
  context?: string;

  @Prop({ required: false, type: String })
  stack?: string;
}

export const LogSchema = SchemaFactory.createForClass(Log);

LogSchema.index({ timestamp: -1 });
LogSchema.index({ level: 1 });
LogSchema.index({ context: 1 });
