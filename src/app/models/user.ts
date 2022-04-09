export interface User {
  name: string;
  email: string;
  login: string;
  senha: string;
  acesso: 'padrao' | 'adm';
  status: 'ativo' | 'inativo';
  id?: number;
}
