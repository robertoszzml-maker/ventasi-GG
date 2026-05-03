import { FindManyOptions } from 'typeorm';

export type OrderValues = 'ASC' | 'DESC' | 'asc' | 'desc'
export type FindManyOptionsWithSearch<T> = FindManyOptions<T> & { search?: string };
