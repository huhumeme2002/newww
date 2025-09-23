# Start development server with environment variables
# This ensures all environment variables are properly loaded

Write-Host "Starting Token Exchange App..." -ForegroundColor Green
Write-Host "Loading environment variables..." -ForegroundColor Yellow

# Set environment variables (backup in case .env.local doesn't load)
$env:DATABASE_URL = "postgresql://neondb_owner:npg_f2mOrgZ1JGWI@ep-ancient-silence-adby4m41-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require"
$env:NEXTAUTH_URL = "http://localhost:3000"
$env:NEXTAUTH_SECRET = "a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6"

Write-Host "Environment variables set!" -ForegroundColor Green
Write-Host "Starting Next.js development server..." -ForegroundColor Yellow

# Start the development server
npm run dev
