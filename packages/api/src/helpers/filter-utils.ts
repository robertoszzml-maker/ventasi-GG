/* eslint-disable no-prototype-builtins */

import { ILike, In, Between, SelectQueryBuilder } from 'typeorm';

/**
 * Intenta parsear un string JSON, retorna el valor original si falla
 */
function tryParseJSON(value: any): any {
    if (typeof value === 'string' && (value.startsWith('{') || value.startsWith('['))) {
        try {
            return JSON.parse(value);
        } catch {
            return value;
        }
    }
    return value;
}

export function transformToGenericFilters(filters: { [key: string]: any }) {
    const transformedFilters: { [key: string]: any } = {};

    for (const key in filters) {
        if (filters.hasOwnProperty(key)) {
            let value = filters[key];

            // Intentar parsear si es un string JSON
            value = tryParseJSON(value);

            const parts = key.split('.');
            let current = transformedFilters;

            for (let i = 0; i < parts.length; i++) {
                const part = parts[i];

                if (i === parts.length - 1) {
                    if (typeof value === 'object' && value !== null && 'from' in value && 'to' in value) {
                        // Si es un objeto con from y to, usar BETWEEN
                        const from = value.from || Number.MIN_SAFE_INTEGER;
                        const to = value.to || Number.MAX_SAFE_INTEGER;
                        current[part] = Between(from, to);
                    } else if (Array.isArray(value)) {
                        // Si es array, usar IN
                        current[part] = In(value);
                    } else if (typeof value === 'string') {
                        current[part] = ILike(`%${value}%`);
                    } else {
                        current[part] = value;
                    }
                } else {
                    current[part] = current[part] || {};
                    current = current[part];
                }
            }
        }
    }

    return transformedFilters;
}


export function transformToGenericFiltersAndOrderQueryBuilder(where, order, queryBuilder, modelName) {
    Object.keys(where).forEach((key) => {
        let value = where[key];

        // Intentar parsear si es un string JSON
        value = tryParseJSON(value);

        if (typeof value === 'object' && value !== null && 'from' in value && 'to' in value) {
            // Si es un objeto con from y to, usar BETWEEN
            const from = value.from || Number.MIN_SAFE_INTEGER;
            const to = value.to || Number.MAX_SAFE_INTEGER;
            queryBuilder.andWhere(`${modelName}.${key} BETWEEN :${key}_from AND :${key}_to`, {
                [`${key}_from`]: from,
                [`${key}_to`]: to,
            });
        } else if (Array.isArray(value)) {
            // Si es array, usar IN
            queryBuilder.andWhere(`${modelName}.${key} IN (:...${key})`, {
                [key]: value,
            });
        } else {
            queryBuilder.andWhere(`LOWER(${modelName}.${key}) LIKE :${key}`, { [key]: `%${value.toLowerCase()}%` });
        }
    });
    Object.keys(order).forEach((key) => {
        queryBuilder.addOrderBy(`${modelName}.${key}`, order[key].toUpperCase() as 'ASC' | 'DESC');
    });
}

export function transformCustomFilterQueryBuilder(where, queryBuilder, field, key, value) {
    queryBuilder.andWhere(
        `LOWER(TRIM(${field}.${key})) LIKE LOWER(TRIM(:${key}))`, // Se agrega TRIM para eliminar espacios
        { [key]: `%${value}%` } // Se utiliza el valor del filtro y se le coloca el '%'
    );
    delete where[field]; // Se elimina el campo del filtro para no pasarlo nuevamente en el WHERE
}


export function buildWhereAndOrderQuery<T>(
    qb: SelectQueryBuilder<T>,
    conditions: any,
    alias = 'presupuesto'
) {
    const { where = {}, order = {}, take, skip } = conditions;

    // WHERE
    Object.entries(where).forEach(([key, value]) => {
        // Intentar parsear si es un string JSON
        value = tryParseJSON(value);

        if (key.includes('.')) {
            const [relation, field] = key.split('.');
            if (typeof value === 'object' && value !== null && 'from' in value && 'to' in value) {
                // Si es un objeto con from y to, usar BETWEEN
                const from = value.from || Number.MIN_SAFE_INTEGER;
                const to = value.to || Number.MAX_SAFE_INTEGER;
                qb.andWhere(`${relation}.${field} BETWEEN :${key}_from AND :${key}_to`, {
                    [`${key}_from`]: from,
                    [`${key}_to`]: to,
                });
            } else if (Array.isArray(value)) {
                // Si es array, usar IN
                qb.andWhere(`${relation}.${field} IN (:...${key})`, {
                    [key]: value,
                });
            } else {
                const searchValue = typeof value === 'string' ? value.toLowerCase() : value;
                qb.andWhere(`LOWER(${relation}.${field}) LIKE :${key}`, {
                    [key]: `%${searchValue}%`,
                });
            }
        } else if (typeof value === 'object' && value !== null && 'from' in value && 'to' in value) {
            // Si es un objeto con from y to, usar BETWEEN
            const from = value.from || Number.MIN_SAFE_INTEGER;
            const to = value.to || Number.MAX_SAFE_INTEGER;
            qb.andWhere(`${alias}.${key} BETWEEN :${key}_from AND :${key}_to`, {
                [`${key}_from`]: from,
                [`${key}_to`]: to,
            });
        } else if (Array.isArray(value)) {
            // Si es array, usar IN
            qb.andWhere(`${alias}.${key} IN (:...${key})`, {
                [key]: value,
            });
        } else if (typeof value === 'string') {
            qb.andWhere(`LOWER(${alias}.${key}) LIKE :${key}`, {
                [key]: `%${value.toLowerCase()}%`,
            });
        } else {
            qb.andWhere(`${alias}.${key} = :${key}`, { [key]: value });
        }
    });

    // ORDER
    Object.entries(order).forEach(([key, dir]) => {
        const direction = (dir as string).toUpperCase() === 'DESC' ? 'DESC' : 'ASC';
        if (key.includes('.')) {
            const [relation, field] = key.split('.');
            qb.addOrderBy(`${relation}.${field}`, direction);
        } else {
            qb.addOrderBy(`${alias}.${key}`, direction);
        }
    });

    if (take) qb.take(Number(take));
    if (skip) qb.skip(Number(skip));
}

