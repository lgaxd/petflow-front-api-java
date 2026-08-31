# PetFlow — Front-end (React + TypeScript + Tailwind)

Front-end completo para a API PetFlow (Spring Boot), com autenticação JWT,
roteamento por perfil (RBAC), CRUD administrativo e o painel do tutor com
gamificação e resgate de cupons.

## Stack

- React 18 + TypeScript + Vite
- Tailwind CSS
- react-router-dom (rotas públicas/protegidas)
- axios (cliente HTTP central com interceptors)
- lucide-react (ícones)

## Como rodar

```bash
npm install
cp .env.example .env   # ajuste VITE_API_URL se a API não estiver em localhost:8080
npm run dev
```

A aplicação abre em `http://localhost:5173`. Certifique-se de que a API
PetFlow (Spring Boot) está rodando e acessível na URL definida em
`VITE_API_URL` (por padrão `http://localhost:8080`, sem *context-path*).

Usuários de exemplo (dados de seed da API):

| Perfil | E-mail                | Senha       |
| ------ | ---------------------- | ----------- |
| ADMIN  | admin@petflow.com      | Admin@123   |
| TUTOR  | maria@petflow.com      | Tutor@123   |

## Estrutura do projeto

```
src/
  components/
    layout/        # AdminLayout, TutorLayout (shell + navegação)
    common/         # spinner, modais, badges, paginação (reutilizáveis)
    ProtectedRoute.tsx
  contexts/
    AuthContext.tsx   # sessão, token JWT, login/logout
    ToastContext.tsx  # feedback visual de sucesso/erro
  pages/
    Login.tsx
    admin/          # Clínicas, Planos, Cupons (CRUD completo)
    tutor/          # Dashboard, Pets, Eventos de saúde, Assinaturas, Resgate
  routes/
    AppRoutes.tsx   # definição de rotas públicas/protegidas
  services/
    api.ts             # instância axios central + injeção do JWT
    authService.ts
    tutorService.ts
    clinicService.ts
    planService.ts
    couponService.ts
    petService.ts
    healthEventService.ts
    subscriptionService.ts
    redeemService.ts
    gamificationService.ts
  types/
    index.ts        # tipos TS espelhando os DTOs/enums da API Java
```

## Autenticação e RBAC

- O `AuthContext` guarda `{ id, name, email, role }` e o token JWT em
  `localStorage`, injetando `Authorization: Bearer <token>` em toda
  requisição via interceptor do axios (`src/services/api.ts`).
- Um 401 da API limpa a sessão e redireciona para `/login` automaticamente.
- `ProtectedRoute` bloqueia rotas por autenticação e, opcionalmente, por
  `allowedRoles`. Um TUTOR que tenta acessar `/admin/**` (ou um ADMIN que
  tenta acessar `/tutor/**`) é redirecionado ao seu próprio painel.

## Observações sobre a API

- A API não expõe endpoints de listagem para `Species` (espécie do pet) nem
  para `EventType` (tipo de evento de saúde) ou `CouponTemplate`. As telas
  usam os valores dos dados de seed (`V2__Seed_Data.sql`) como opções fixas
  (ex.: espécies 1–4, tipos de evento 1–4) — ajuste esses mapeamentos em
  `Pets.tsx`, `HealthEvents.tsx` e `Coupons.tsx` caso o banco tenha dados
  diferentes.
- Cupons não possuem endpoint de atualização completa (`PUT /coupons/{id}`),
  apenas `PUT /coupons/{id}/status`; por isso a tela de Cupons permite criar,
  trocar o status e excluir.
- A API não expõe um endpoint de listagem de eventos/assinaturas por tutor
  diretamente — as telas do tutor buscam por `petId` para cada pet do tutor
  autenticado e combinam os resultados no front-end.

## Build de produção

```bash
npm run build
npm run preview
```
