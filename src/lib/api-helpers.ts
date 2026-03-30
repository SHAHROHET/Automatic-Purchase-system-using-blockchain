/**
 * Shared API response helpers for consistent response shapes.
 * All API routes should use these instead of raw NextResponse.json().
 */

import { NextResponse } from 'next/server';

/**
 * Return a success JSON response.
 */
export function successResponse<T>(data: T, status = 200) {
  return NextResponse.json({ data }, { status });
}

/**
 * Return an error JSON response.
 */
export function errorResponse(message: string, status = 500) {
  return NextResponse.json({ error: message }, { status });
}

/**
 * Return a paginated success JSON response.
 */
export function paginatedResponse<T>(
  data: T,
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  }
) {
  return NextResponse.json({ data, pagination });
}
