export class DataListResponse<T> {
  data: T[];
  total: number;
  totalPages: number;

  constructor(data: T[], total: number, totalPages: number) {
    this.data = data;
    this.total = total;
    this.totalPages = totalPages;
  }
}
