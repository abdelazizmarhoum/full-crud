import { Request, Response, NextFunction } from 'express';
import { Model, Document } from 'mongoose';

export type HookFn<T = any> = (data: T, req: Request) => Promise<T> | T;
export type AfterHookFn<T = any> = (doc: T, req: Request) => Promise<void> | void;

export interface CrudOptions<T = any> {
    hooks?: {
        beforeCreate?: HookFn<Partial<T>>;
        afterCreate?: AfterHookFn<T>;
        beforeUpdate?: HookFn<Partial<T>>;
    };
    pagination?: {
        defaultLimit?: number;
        maxLimit?: number;
    };
    middleware?: {
        getAll?: Array<(req: Request, res: Response, next: NextFunction) => void>;
        getById?: Array<(req: Request, res: Response, next: NextFunction) => void>;
        create?: Array<(req: Request, res: Response, next: NextFunction) => void>;
        update?: Array<(req: Request, res: Response, next: NextFunction) => void>;
        delete?: Array<(req: Request, res: Response, next: NextFunction) => void>;
    };
    operations?: Array<'getAll' | 'getById' | 'create' | 'update' | 'delete'>;
}

export interface FullCrudBuilder<T = any> {
    // Chainable setters
    beforeCreate(fn: HookFn<Partial<T>>): FullCrudBuilder<T>;
    afterCreate(fn: AfterHookFn<T>): FullCrudBuilder<T>;
    beforeUpdate(fn: HookFn<Partial<T>>): FullCrudBuilder<T>;
    pagination(opts: { defaultLimit?: number; maxLimit?: number }): FullCrudBuilder<T>;
    middleware(method: keyof CrudController, mws: Array<(req: Request, res: Response, next: NextFunction) => void>): FullCrudBuilder<T>;
    only(list: Array<keyof CrudController>): FullCrudBuilder<T>;

    // Controller methods
    getAll: (req: Request, res: Response) => Promise<void>;
    getById: (req: Request, res: Response) => Promise<void>;
    create: (req: Request, res: Response) => Promise<void>;
    update: (req: Request, res: Response) => Promise<void>;
    delete: (req: Request, res: Response) => Promise<void>;
}

export interface CrudController {
    getAll: (req: Request, res: Response) => Promise<void>;
    getById: (req: Request, res: Response) => Promise<void>;
    create: (req: Request, res: Response) => Promise<void>;
    update: (req: Request, res: Response) => Promise<void>;
    delete: (req: Request, res: Response) => Promise<void>;
}

export function makeCrud<T extends Document>(
    mongooseModel: Model<T>,
    options?: CrudOptions<T>
): FullCrudBuilder<T>;

export function mountCrud<T extends Document>(
    app: any,
    routePath: string,
    mongooseModel: Model<T>,
    options?: CrudOptions<T>
): FullCrudBuilder<T>;

export function autowire(
    app: any,
    modelsDir: string,
    options?: { prefix?: string } & CrudOptions
): void;

export function handleError(res: Response, error: any): void;
