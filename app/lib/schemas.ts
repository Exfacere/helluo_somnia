import { z } from 'zod';

// Portfolio schemas
export const portfolioItemSchema = z.object({
    title: z.string().min(1, 'Title is required').max(200),
    category: z.string().min(1, 'Category is required').max(50),
    url: z.string().url('Invalid URL'),
    public_id: z.string().optional(),
});

export const portfolioPatchSchema = z.object({
    index: z.number().int().min(0, 'Invalid index'),
    title: z.string().min(1, 'Title is required').max(200),
});

// Category schemas
export const categorySchema = z.object({
    id: z.string().regex(/^[a-z0-9_-]+$/, 'ID must be lowercase with no spaces (use - or _)'),
    name: z.string().min(1, 'Name is required').max(100),
});

export const categoryPatchSchema = z.object({
    id: z.string().min(1, 'ID is required'),
    name: z.string().min(1).max(100).optional(),
    order: z.number().int().min(1).optional(),
});

// Exhibition schemas
export const exhibitionSchema = z.object({
    title: z.string().min(1, 'Title is required').max(200),
    location: z.string().min(1, 'Location is required').max(200),
    city: z.string().min(1, 'City is required').max(100),
    startDate: z.string().min(1, 'Start date is required'),
    endDate: z.string().optional(),
    description: z.string().max(1000).optional(),
    image: z.string().url().optional(),
    public_id: z.string().optional(),
});

export const exhibitionPatchSchema = exhibitionSchema.partial().extend({
    id: z.string().min(1, 'ID is required'),
});

// Auth schema
export const authSchema = z.object({
    password: z.string().min(1, 'Password is required'),
});

// Carnet schemas
export const carnetPatchSchema = z.object({
    id: z.string().min(1, 'ID is required'),
    title: z.string().min(1).max(200).optional(),
});
