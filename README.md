# senda-web

Frontend de **Senda** (Next.js 16, React 19, TypeScript, Tailwind CSS 4, shadcn/ui). Hace de BFF: el navegador
solo habla con este servidor, que guarda la sesión en cookies httpOnly y reenvía a `senda-api`. Detalle de
arquitectura y convenciones en [CLAUDE.md](CLAUDE.md).

## Desarrollo

```bash
cp .env.example .env.local   # BACKEND_URL de senda-api
npm install
npm run dev                  # http://localhost:3000
```

`senda-api` tiene que estar corriendo (ver su README).

## Scripts

| Comando | Qué hace |
| --- | --- |
| `npm run lint` | ESLint |
| `npm run lint:unused` | Archivos, exportaciones y dependencias sin uso (knip) |
| `npm run test` | Pruebas unitarias y de componentes (Vitest) |
| `npm run test:e2e` | Flujos principales con Playwright y axe (requiere Docker) |
| `npm run build` | Build de producción |

Las pruebas E2E levantan su propio entorno aislado: un LLM simulado, `senda-api` con la base `senda_e2e`
(se recrea en cada corrida) y este frontend compilado, en puertos distintos a los de desarrollo.

## Despliegue

Imagen: `docker build -t senda-web .` (Node 24, salida `standalone`, sin privilegios, puerto 3000).

| Variable | Qué es |
| --- | --- |
| `BACKEND_URL` | URL **interna** de senda-api (el navegador nunca la ve) |

Se sirve detrás de HTTPS: en producción las cookies de sesión son `Secure` y la app envía HSTS, CSP y el
resto de cabeceras de seguridad (`next.config.ts`). El BFF rechaza peticiones que cambian datos desde otro
origen. La app no se indexa en buscadores (`noindex` y `robots.txt`).
