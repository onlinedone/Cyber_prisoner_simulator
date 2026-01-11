declare module '*?raw' {
  const content: string;
  export default content;
}
declare module '*?url' {
  const content: string;
  export default content;
}
declare module '*.html' {
  const content: string;
  export default content;
}
declare module '*.md' {
  const content: string;
  export default content;
}
declare module '*.css' {
  const content: unknown;
  export default content;
}
declare module '*.vue' {
  import { DefineComponent } from 'vue';
  const component: DefineComponent;
  export default component;
}

declare const YAML: typeof import('yaml');

declare const z: typeof import('zod');
declare namespace z {
  export type infer<T> = import('zod').infer<T>;
  export type input<T> = import('zod').input<T>;
  export type output<T> = import('zod').output<T>;
}

declare module 'https://testingcf.jsdelivr.net/gh/StageDog/tavern_resource/dist/util/mvu_zod.js' {
<<<<<<< HEAD
  export function registerMvuSchema(schema: z.ZodObject | (() => z.ZodObject)): void;
}

// 适配酒馆助手 log.js 中的类型问题
// 确保 console[level] 可以被正确类型推断为函数类型
declare global {
  interface Console {
    [key: string]: ((...args: any[]) => void) | any;
  }
=======
  export function registerMvuSchema(schema: z.ZodType<Record<string, any>> | (() => z.ZodType<Record<string, any>>)): void;
>>>>>>> 4e2a9fc6b9f5ae825823eb357fffa0d0ea284155
}
