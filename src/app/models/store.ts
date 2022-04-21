export interface Store {
  id?: number;
  number: string;
  name: string;
  status: 'ativo' | 'inativo';
  regionId: number;
  selected: boolean;
}
