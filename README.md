# Restoration Estimator Pro

/skill:skill-creator # Restoration Industry Domain Rules:

1. Volumetric Sizing:

   - Volume (CF) = Length × Width × Ceiling Height

   - Air Movers = 1 per affected wall + 1 per 50-70 SF wet floor

   - LGR Dehumidifier Pints/Day = Volume / Factor (Class 1=100, Class 2=40, Class 3=30, Class 4=30)

2. Legal Sign-off Requirements:

   - Work Authorization (EWA) requires client signature, timestamp, and IP reference.

   - Direction to Pay (DOP) requires Carrier Name, Claim Number, and explicit carrier billing assignment.

3. Architecture:

   - Never implement login screens or authentication barriers unless explicitly instructed.

   - Maintain client-side shared state between Estimator view and Client view.

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/bd099924-6c54-4b79-8a95-23ce6bbf54a2).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```

## Deploy to Cloudflare Workers

Build the application before deploying so Wrangler can find the generated Worker and
static assets configured in `wrangler.json`:

```sh
npm run build
npx wrangler deploy
```
