export const paths = {
  home: '/',
  login: '/entrar',
  register: '/cadastro',
  wallet: '/carteira',
  myBids: '/meus-arremates',
  office: '/escritorio',
  lot: (id: string) => `/lotes/${id}`,
} as const;
