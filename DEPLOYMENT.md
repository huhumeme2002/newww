# 🚀 Deployment Guide

## Vercel Deployment

### 1. Environment Variables

Set these in Vercel Dashboard → Project → Settings → Environment Variables:

```env
DATABASE_URL
postgresql://neondb_owner:npg_67BPVAIWZEDg@ep-wispy-fog-adt9noug-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require

NEXTAUTH_SECRET
your-super-secret-jwt-key-change-this-in-production

NEXTAUTH_URL
https://your-app-name.vercel.app
```

### 2. Deploy Steps

1. **Connect Repository**
   ```bash
   # Push to GitHub/GitLab
   git add .
   git commit -m "Ready for deployment"
   git push origin main
   ```

2. **Import to Vercel**
   - Go to https://vercel.com/new
   - Import your repository
   - Vercel will auto-detect Next.js

3. **Configure Environment Variables**
   - Add the 3 environment variables above
   - Make sure to set them for Production, Preview, and Development

4. **Deploy**
   - Click "Deploy"
   - Vercel will build and deploy automatically

### 3. Post-Deployment

- ✅ Database is already setup (Neon PostgreSQL)
- ✅ Schema is synced with existing data  
- ✅ 130 users ready to use
- ✅ 106 VIP keys available
- ✅ Security headers configured

### 4. Testing Production

After deployment, test these URLs:

- `https://your-app.vercel.app` - Landing page
- `https://your-app.vercel.app/auth/login` - Login
- `https://your-app.vercel.app/auth/register` - Register
- `https://your-app.vercel.app/dashboard` - Dashboard (after login)
- `https://your-app.vercel.app/admin` - Admin panel (admin role only)

### 5. Admin Access

To get admin access, you can:

1. **Use existing admin user** from the database
2. **Or manually update a user** in Neon database:
   ```sql
   UPDATE users SET role = 'ADMIN' WHERE email = 'your-email@example.com';
   ```

### 6. Monitoring

- **Vercel Dashboard**: Monitor deployments and performance
- **Neon Dashboard**: Monitor database usage and queries
- **Application Logs**: Check Vercel function logs for issues

## 🎯 Success Checklist

- [ ] Environment variables set in Vercel
- [ ] Repository connected and deployed
- [ ] Landing page loads correctly
- [ ] User registration works
- [ ] User login works  
- [ ] Dashboard displays user stats
- [ ] Token exchange functionality works
- [ ] VIP key redemption works
- [ ] Admin panel accessible (for admin users)

## 🔧 Troubleshooting

### Database Connection Issues
```bash
# Test locally first
npm run dev
# Check at http://localhost:3000
```

### Environment Variable Issues
- Ensure no trailing spaces in Vercel env vars
- Check that DATABASE_URL includes `?sslmode=require`
- Verify NEXTAUTH_URL matches your Vercel domain

### Build Issues
```bash
# Test build locally
npm run build
npm run start
```

## 📞 Support

If you encounter issues:
1. Check Vercel build logs
2. Check Neon database connectivity  
3. Verify environment variables
4. Test locally first

---

**🎉 Your Token Exchange app is ready for production!**
