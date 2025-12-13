#!/bin/bash
# Load environment variables from .env if it exists
if [ -f .env ]; then
  export $(grep -v '^#' .env | xargs)
fi

echo "🚀 Deploying House of EdTech..."

# ───────────────────────────────────────────────
# 1. Check required env variables
# ───────────────────────────────────────────────
if [ -z "$DATABASE_URL" ]; then
  echo "❌ DATABASE_URL is not set. Deployment aborted."
  exit 1
fi

if [ -z "$JWT_SECRET" ]; then
  echo "❌ JWT_SECRET is not set. Deployment aborted."
  exit 1
fi

# ───────────────────────────────────────────────
# 2. Build the project
# ───────────────────────────────────────────────
echo "📦 Building Next.js..."
npm run build || { echo "❌ Build failed"; exit 1; }

# ───────────────────────────────────────────────
# 3. Run Prisma migrations on production DB
# ───────────────────────────────────────────────
echo "📚 Running Prisma migrations..."
npx prisma migrate deploy || { echo "❌ Prisma migration failed"; exit 1; }

# ───────────────────────────────────────────────
# 4. Push Prisma schema (safely)
# ───────────────────────────────────────────────
echo "🔄 Syncing Prisma schema..."
npx prisma db push || echo "⚠️ Schema push failed (may be normal if using migrations only)"

# ───────────────────────────────────────────────
# 5. Deploy to Vercel
# ───────────────────────────────────────────────
if command -v vercel >/dev/null 2>&1 ; then
  echo "🌐 Deploying to Vercel..."
  vercel --prod || { echo "❌ Vercel deploy failed"; exit 1; }
else
  echo "⚠️ vercel CLI not installed. Install with:"
  echo "    npm i -g vercel"
fi

echo "🎉 Deployment complete!"
