import { compare } from 'compare-versions';
import { toDotPath } from 'zod/v4/core';

export function assignInplace<T>(destination: T[], new_array: T[]): T[] {
  destination.length = 0;
  destination.push(...new_array);
  return destination;
}

export function chunkBy<T>(array: T[], predicate: (lhs: T, rhs: T) => boolean): T[][] {
  if (array.length === 0) {
    return [];
  }

  const chunks: T[][] = [[array[0]]];
  for (const [lhs, rhs] of _.zip(_.dropRight(array), _.drop(array))) {
    if (predicate(lhs!, rhs!)) {
      chunks[chunks.length - 1].push(rhs!);
    } else {
      chunks.push([rhs!]);
    }
  }
  return chunks;
}

export function regexFromString(input: string): RegExp | null {
  if (!input) {
    return null;
  }
  try {
    const match = input.match(/\/(.+)\/([a-z]*)/i);
    if (!match) {
      return new RegExp(_.escapeRegExp(input), 'i');
    }
    if (match[2] && !/^(?!.*?(.).*?\1)[gmixXsuUAJ]+$/.test(match[3])) {
      return new RegExp(input, 'i');
    }
    let flags = match[2] ?? '';
    _.pull(flags, 'g');
    if (flags.indexOf('i') === -1) {
      flags = flags + 'i';
    }
    return new RegExp(match[1], flags);
  } catch {
    return null;
  }
}

export function uuidv4(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

export async function checkMinimumVersion(expected: string, title: string) {
  if (compare(await getTavernHelperVersion(), expected, '<')) {
    toastr.error(`'${title}' 需要酒馆助手版本 >= '${expected}'`, '版本不兼容');
  }
}

export function prettifyErrorWithInput(error: z.ZodError) {
  return _([...error.issues])
    .sortBy(issue => issue.path?.length ?? 0)
    .flatMap(issue => {
      const lines = [`✖ ${issue.message}`];
      if (issue.path?.length) {
        lines.push(`  → 路径: ${toDotPath(issue.path)}`);
      }
      if (issue.input !== undefined) {
        lines.push(`  → 输入: ${JSON.stringify(issue.input)}`);
      }
      return lines;
    })
    .join('\n');
}

/**
 * 安全地发送调试日志到本地调试服务器
 * 只在本地开发环境中发送，避免在生产环境中触发 CORS 错误
 */
export function sendDebugLog(data: {
  location?: string;
  message?: string;
  data?: any;
  timestamp?: number;
  sessionId?: string;
  runId?: string;
  hypothesisId?: string;
}): void {
  try {
    // 检测是否是本地开发环境
    // 如果当前页面是 localhost 或 127.0.0.1，则允许发送调试日志
    const isLocalDev =
      typeof window !== 'undefined' &&
      window.location &&
      (window.location.hostname === 'localhost' ||
        window.location.hostname === '127.0.0.1' ||
        window.location.hostname.startsWith('192.168.') ||
        window.location.hostname.startsWith('10.') ||
        window.location.hostname.startsWith('172.'));

    // 只在本地开发环境中发送调试日志
    if (!isLocalDev) {
      return;
    }

    // 异步发送，不阻塞主线程，忽略错误
    fetch('http://127.0.0.1:7242/ingest/55a7313b-5b61-43ef-bdc3-1a322b93db66', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...data,
        timestamp: data.timestamp ?? Date.now(),
      }),
    }).catch(() => {
      // 静默失败，不输出错误
    });
  } catch (e) {
    // 静默失败，不输出错误
  }
}
