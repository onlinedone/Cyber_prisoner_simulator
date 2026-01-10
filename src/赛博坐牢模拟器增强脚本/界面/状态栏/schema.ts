import { z } from 'zod';

export const Schema = z.object({
  状态: z.object({
    姓名: z.string().default('未设定'),
    年龄: z.number().default(0),
    罪名: z.string().default('未设定'),
    健康: z.coerce
      .number()
      .transform(v => Math.max(0, Math.min(100, v)))
      .default(75),
    精神: z.coerce
      .number()
      .transform(v => Math.max(0, Math.min(100, v)))
      .default(70),
    力量: z.coerce
      .number()
      .transform(v => Math.max(0, Math.min(100, v)))
      .default(65),
    智力: z.coerce
      .number()
      .transform(v => Math.max(0, Math.min(100, v)))
      .default(70),
    在押天数: z.number().default(0),
    当前阶段: z.string().default('刑事拘留'),
    监室类型: z.string().default('过渡监室'),
  }),

  外貌: z.object({
    身高: z.number().default(0),
    体重: z.number().default(0),
    发型: z.string().default('未设定'),
    身体状况: z.string().default('未设定'),
  }),

  穿着: z.object({
    上衣: z.string().default('未设定'),
    裤子: z.string().default('未设定'),
    内衣: z.string().default('未设定'),
    内裤: z.string().default('未设定'),
    袜子: z.string().default('未设定'),
    鞋子: z.string().default('未设定'),
    戒具: z.string().default('无'),
    洁净度: z.string().default('整洁'),
  }),

  心理: z.object({
    当前任务: z.string().default('无'),
    内心想法: z.string().default('无'),
    最大担忧: z.string().default('无'),
  }),

  回合: z.object({
    当前回合: z.number().default(0),
    叙事节奏: z.enum(['慢速', '正常', '快速']).default('正常'),
    节奏倍数: z.number().default(0.5), // 默认半天，即0.5天
  }),
});

export type Schema = z.output<typeof Schema>;
