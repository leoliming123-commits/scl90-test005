class SupabaseProxy {
  private apiUrl: string;
  private isDevelopment: boolean;
  private supabaseUrl: string;
  private supabaseKey: string;

  constructor() {
    this.apiUrl = '/api/supabase';
    this.isDevelopment = import.meta.env.DEV;
    this.supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
    this.supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';
  }

  private async request(path: string, options: RequestInit = {}) {
    if (this.isDevelopment) {
      const targetUrl = `${this.supabaseUrl}${path}`;
      const headers: HeadersInit = {
        'apikey': this.supabaseKey,
        'Authorization': `Bearer ${this.supabaseKey}`,
        'Content-Type': 'application/json',
        ...(options.headers as Record<string, string> || {}),
      };

      const response = await fetch(targetUrl, {
        ...options,
        headers,
      });

      const contentRange = response.headers.get('content-range');
      const text = await response.text();

      let data;
      try {
        data = text ? JSON.parse(text) : null;
      } catch (e) {
        data = text;
      }

      return {
        data,
        status: response.status,
        statusText: response.statusText,
        headers: {
          'content-range': contentRange,
        },
      };
    }

    const payload = {
      path,
      method: options.method || 'GET',
      headers: options.headers || {},
      body: options.body,
    };

    const response = await fetch(this.apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const contentRange = response.headers.get('content-range');
    const text = await response.text();

    let data;
    try {
      data = text ? JSON.parse(text) : null;
    } catch (e) {
      data = text;
    }

    return {
      data,
      status: response.status,
      statusText: response.statusText,
      headers: {
        'content-range': contentRange,
      },
    };
  }

  from(table: string) {
    return new SupabaseQueryBuilder(table, this);
  }

  async makeRequest(path: string, options: RequestInit = {}) {
    return this.request(path, options);
  }
}

class SupabaseQueryBuilder {
  private table: string;
  private proxy: SupabaseProxy;
  private queryParams: URLSearchParams;
  private selectFields: string = '*';
  private filters: string[] = [];
  private limitValue?: number;
  private orderByValue?: string;

  constructor(table: string, proxy: SupabaseProxy) {
    this.table = table;
    this.proxy = proxy;
    this.queryParams = new URLSearchParams();
  }

  select(fields: string = '*') {
    this.selectFields = fields;
    return this;
  }

  eq(column: string, value: any) {
    this.filters.push(`${column}=eq.${value}`);
    return this;
  }

  neq(column: string, value: any) {
    this.filters.push(`${column}=neq.${value}`);
    return this;
  }

  gt(column: string, value: any) {
    this.filters.push(`${column}=gt.${value}`);
    return this;
  }

  gte(column: string, value: any) {
    this.filters.push(`${column}=gte.${value}`);
    return this;
  }

  lt(column: string, value: any) {
    this.filters.push(`${column}=lt.${value}`);
    return this;
  }

  lte(column: string, value: any) {
    this.filters.push(`${column}=lte.${value}`);
    return this;
  }

  like(column: string, pattern: string) {
    this.filters.push(`${column}=like.${pattern}`);
    return this;
  }

  ilike(column: string, pattern: string) {
    this.filters.push(`${column}=ilike.${pattern}`);
    return this;
  }

  is(column: string, value: null | boolean) {
    this.filters.push(`${column}=is.${value}`);
    return this;
  }

  in(column: string, values: any[]) {
    this.filters.push(`${column}=in.(${values.join(',')})`);
    return this;
  }

  order(column: string, options?: { ascending?: boolean }) {
    const direction = options?.ascending === false ? 'desc' : 'asc';
    this.orderByValue = `${column}.${direction}`;
    return this;
  }

  limit(count: number) {
    this.limitValue = count;
    return this;
  }

  private buildPath() {
    let path = `/rest/v1/${this.table}?select=${this.selectFields}`;

    this.filters.forEach(filter => {
      const [key, value] = filter.split('=');
      path += `&${key}=${value}`;
    });

    if (this.orderByValue) {
      path += `&order=${this.orderByValue}`;
    }

    if (this.limitValue) {
      path += `&limit=${this.limitValue}`;
    }

    return path;
  }

  async maybeSingle() {
    const path = this.buildPath();
    const headers = {
      'Prefer': 'return=representation',
      'Accept': 'application/vnd.pgrst.object+json',
    };

    try {
      const response = await this.proxy.makeRequest(path, {
        method: 'GET',
        headers,
      });

      if (response.status === 406 || response.status === 404) {
        return { data: null, error: null };
      }

      if (response.status >= 400) {
        return { data: null, error: response.data };
      }

      return { data: response.data, error: null };
    } catch (error) {
      return { data: null, error };
    }
  }

  async single() {
    const result = await this.maybeSingle();
    if (!result.data && !result.error) {
      return { data: null, error: new Error('No rows found') };
    }
    return result;
  }

  async then(resolve: (value: any) => void, reject?: (error: any) => void) {
    const path = this.buildPath();
    const headers = {
      'Prefer': 'return=representation',
    };

    try {
      const response = await this.proxy.makeRequest(path, {
        method: 'GET',
        headers,
      });

      if (response.status >= 400) {
        const error = { data: null, error: response.data, status: response.status };
        if (reject) reject(error);
        return error;
      }

      const result = { data: response.data, error: null, status: response.status };
      resolve(result);
      return result;
    } catch (error) {
      const errorResult = { data: null, error, status: 500 };
      if (reject) reject(errorResult);
      return errorResult;
    }
  }

  async insert(data: any) {
    const path = `/rest/v1/${this.table}`;
    const headers = {
      'Prefer': 'return=representation',
    };

    try {
      const response = await this.proxy.makeRequest(path, {
        method: 'POST',
        headers,
        body: JSON.stringify(data),
      });

      if (response.status >= 400) {
        return { data: null, error: response.data };
      }

      return { data: response.data, error: null };
    } catch (error) {
      return { data: null, error };
    }
  }

  update(data: any) {
    return new SupabaseUpdateBuilder(this.table, this.proxy, data, this.filters);
  }

  delete() {
    return new SupabaseDeleteBuilder(this.table, this.proxy, this.filters);
  }
}

class SupabaseUpdateBuilder {
  private table: string;
  private proxy: SupabaseProxy;
  private data: any;
  private filters: string[] = [];

  constructor(table: string, proxy: SupabaseProxy, data: any, existingFilters: string[] = []) {
    this.table = table;
    this.proxy = proxy;
    this.data = data;
    this.filters = [...existingFilters];
  }

  eq(column: string, value: any) {
    this.filters.push(`${column}=eq.${value}`);
    return this;
  }

  neq(column: string, value: any) {
    this.filters.push(`${column}=neq.${value}`);
    return this;
  }

  private buildPath() {
    let path = `/rest/v1/${this.table}?`;

    this.filters.forEach((filter, index) => {
      const [key, value] = filter.split('=');
      if (index > 0) path += '&';
      path += `${key}=${value}`;
    });

    return path;
  }

  async then(resolve: (value: any) => void, reject?: (error: any) => void) {
    const path = this.buildPath();
    const headers = {
      'Prefer': 'return=representation',
    };

    try {
      const response = await this.proxy.makeRequest(path, {
        method: 'PATCH',
        headers,
        body: JSON.stringify(this.data),
      });

      if (response.status >= 400) {
        const error = { data: null, error: response.data };
        if (reject) reject(error);
        return error;
      }

      const result = { data: response.data, error: null };
      resolve(result);
      return result;
    } catch (error) {
      const errorResult = { data: null, error };
      if (reject) reject(errorResult);
      return errorResult;
    }
  }
}

class SupabaseDeleteBuilder {
  private table: string;
  private proxy: SupabaseProxy;
  private filters: string[] = [];

  constructor(table: string, proxy: SupabaseProxy, existingFilters: string[] = []) {
    this.table = table;
    this.proxy = proxy;
    this.filters = [...existingFilters];
  }

  eq(column: string, value: any) {
    this.filters.push(`${column}=eq.${value}`);
    return this;
  }

  neq(column: string, value: any) {
    this.filters.push(`${column}=neq.${value}`);
    return this;
  }

  private buildPath() {
    let path = `/rest/v1/${this.table}?`;

    this.filters.forEach((filter, index) => {
      const [key, value] = filter.split('=');
      if (index > 0) path += '&';
      path += `${key}=${value}`;
    });

    return path;
  }

  async then(resolve: (value: any) => void, reject?: (error: any) => void) {
    const path = this.buildPath();
    const headers = {
      'Prefer': 'return=representation',
    };

    try {
      const response = await this.proxy.makeRequest(path, {
        method: 'DELETE',
        headers,
      });

      if (response.status >= 400) {
        const error = { data: null, error: response.data };
        if (reject) reject(error);
        return error;
      }

      const result = { data: response.data, error: null };
      resolve(result);
      return result;
    } catch (error) {
      const errorResult = { data: null, error };
      if (reject) reject(errorResult);
      return errorResult;
    }
  }
}

export const supabaseProxy = new SupabaseProxy();
