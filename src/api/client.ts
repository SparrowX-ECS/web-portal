export class ApiClientError extends Error {
  public status?: number;
  public details?: unknown;

  constructor(message: string, status?: number, details?: unknown) {
    super(message);
    this.name = 'ApiClientError';
    this.status = status;
    this.details = details;
  }
}

interface RequestOptions extends RequestInit {
  timeoutMs?: number;
}

export async function request<T>(url: string, options: RequestOptions = {}): Promise<T> {
  const { timeoutMs = 10000, ...fetchOptions } = options;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, {
      ...fetchOptions,
      signal: controller.signal,
      headers: {
        'Accept': 'application/json',
        ...(fetchOptions.body ? { 'Content-Type': 'application/json' } : {}),
        ...fetchOptions.headers,
      },
    });

    // 204 No Content
    if (response.status === 204) {
      return undefined as unknown as T;
    }

    // Try to parse JSON response body
    let data: unknown;
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      try {
        data = await response.json();
      } catch {
        data = null;
      }
    } else {
      data = await response.text();
    }

    if (!response.ok) {
      let errorMessage = `Request failed with status ${response.status}`;

      if (data && typeof data === 'object') {
        const detail = (data as { detail?: unknown }).detail;
        if (typeof detail === 'string') {
          errorMessage = detail;
        } else if (Array.isArray(detail)) {
          // FastAPI 422 validation errors: [{ loc: [...], msg: "..." }]
          const msgs = detail
            .map((item) => {
              if (item && typeof item === 'object' && 'msg' in item) {
                const loc = Array.isArray(item.loc) ? item.loc.join('.') : '';
                return loc ? `${loc}: ${item.msg}` : String(item.msg);
              }
              return JSON.stringify(item);
            })
            .join('; ');
          errorMessage = `Validation error: ${msgs}`;
        }
      } else if (typeof data === 'string' && data.length > 0) {
        errorMessage = data;
      }

      throw new ApiClientError(errorMessage, response.status, data);
    }

    return data as T;
  } catch (err: unknown) {
    if (err instanceof ApiClientError) {
      throw err;
    }

    if (err instanceof Error) {
      if (err.name === 'AbortError') {
        throw new ApiClientError('Request timed out. The service may be unresponsive or slow.', 504);
      }
      throw new ApiClientError(`Network error: ${err.message}. Please check if the service is running.`);
    }

    throw new ApiClientError('An unknown error occurred while communicating with the server.');
  } finally {
    clearTimeout(timeoutId);
  }
}
