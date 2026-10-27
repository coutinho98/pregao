export const paths = {
  home: '/',
  login: '/entrar',
  register: '/cadastro',
  wallet: '/carteira',
  myBids: '/meus-arremates',
  office: '/escritorio',
  lot: (id: string) => `/lotes/${id}`,
  receipt: (token: string) => `/r/${token}`,
  audit: (lotId: string) => `/auditoria/${lotId}`,
} as const;
