export interface Store {
  id?: number;
  number: number;
  name: string;
  status: 'ativo' | 'inativo';
  regionId: number;
  selected: boolean;
}
