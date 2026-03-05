import axios, { AxiosInstance } from 'axios';
import { Injectable } from '@nestjs/common';

type DaDataPartySuggestion = {
  value: string;
  data: {
    inn?: string;
    kpp?: string;
    ogrn?: string;
    name?: { full_with_opf?: string; short_with_opf?: string };
    address?: { value?: string };
  };
};

@Injectable()
export class DaDataService {
  private readonly http: AxiosInstance;

  constructor() {
    const token = process.env.DADATA_API_KEY;
    if (!token) throw new Error('DADATA_API_KEY is not set');

    this.http = axios.create({
      baseURL: 'https://suggestions.dadata.ru/suggestions/api/4_1/rs',
      headers: {
        Authorization: `Token ${token}`,
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      timeout: 10_000,
    });
  }

  async findPartyByInn(
    inn: string,
    opts?: { kpp?: string; branchType?: 'MAIN' | 'BRANCH' },
  ) {
    const payload: any = { query: inn };
    if (opts?.kpp) payload.kpp = opts.kpp;
    if (opts?.branchType) payload.branch_type = opts.branchType;

    const res = await this.http.post<{ suggestions: DaDataPartySuggestion[] }>(
      '/findById/party',
      payload,
    );

    return res.data?.suggestions?.[0] ?? null;
  }
}
