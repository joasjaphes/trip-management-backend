export abstract class BaseAppDTO {
  id: string;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
  deleted?: boolean;
  active?: boolean;
}

export abstract class BaseAppModel {
  id: string;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
  deleted?: boolean;
  active?: boolean;
}
