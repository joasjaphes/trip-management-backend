import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { map, Observable } from 'rxjs';

type CreatedAtRecord = {
  createdAt?: string | Date;
  [key: string]: unknown;
};

function isCreatedAtRecord(value: unknown): value is CreatedAtRecord {
  return (
    !!value &&
    typeof value === 'object' &&
    !Array.isArray(value) &&
    'createdAt' in value
  );
}

function sortByCreatedAtDescending<T>(value: T): T {
  if (Array.isArray(value)) {
    const transformed = value.map((item) => sortByCreatedAtDescending(item));

    if (
      transformed.length > 1 &&
      transformed.every((item) => isCreatedAtRecord(item))
    ) {
      return [...transformed].sort((left, right) => {
        const leftCreatedAt = new Date(left.createdAt ?? 0).getTime();
        const rightCreatedAt = new Date(right.createdAt ?? 0).getTime();
        return rightCreatedAt - leftCreatedAt;
      }) as T;
    }

    return transformed as T;
  }

  if (value && typeof value === 'object') {
    return Object.entries(value as Record<string, unknown>).reduce(
      (accumulator, [key, entry]) => {
        accumulator[key] = sortByCreatedAtDescending(entry);
        return accumulator;
      },
      Array.isArray(value) ? [] : ({} as Record<string, unknown>),
    ) as T;
  }

  return value;
}

@Injectable()
export class SortByCreatedAtInterceptor implements NestInterceptor {
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<unknown> {
    return next.handle().pipe(map((data) => sortByCreatedAtDescending(data)));
  }
}