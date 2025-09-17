# Token Exchange App

Hệ thống quản lý và đổi request thành token được xây dựng bằng Next.js 14, TypeScript, và PostgreSQL.

## 🚀 Tính năng

- **Authentication**: Đăng ký/đăng nhập với JWT
- **Exchange System**: Đổi request thành token (tỷ lệ 1:1)
- **VIP Keys**: Hệ thống key để nhận requests miễn phí
- **Admin Panel**: Quản lý users, keys, tokens và thống kê
- **Dashboard**: Giao diện người dùng với thống kê chi tiết
- **Security**: Rate limiting, validation, và bảo mật đa lớp
- **Responsive**: Tương thích với mobile và desktop

## 🛠️ Tech Stack

### Frontend
- **Next.js 14** với App Router
- **TypeScript** cho type safety
- **Tailwind CSS** + **shadcn/ui** cho UI
- **React Hook Form** + **Zod** cho validation
- **Framer Motion** cho animations
- **TanStack Query** cho data fetching

### Backend
- **Next.js API Routes** (serverless)
- **Prisma ORM** cho database
- **NextAuth.js** cho authentication
- **Neon PostgreSQL** (serverless)

## 📦 Installation

1. **Clone repository**
```bash
git clone <repository-url>
cd databaseaivannang
```

2. **Install dependencies**
```bash
npm install
```

3. **Setup environment variables**
```bash
cp .env.example .env.local
```

Cập nhật các biến môi trường:
```env
# Database
DATABASE_URL="postgresql://..."

# Auth
NEXTAUTH_SECRET="your-secret-key"
NEXTAUTH_URL="http://localhost:3000"
```

4. **Setup database**
```bash
# Generate Prisma client
npm run db:generate

# Push schema to database
npm run db:push

# Optional: Open database browser
npm run db:studio
```

5. **Run development server**
```bash
npm run dev
```

Ứng dụng sẽ chạy tại `http://localhost:3000`

## 🔄 Data Migration

Nếu bạn có dữ liệu từ các JSON files hiện tại, bạn có thể migrate chúng vào PostgreSQL:

1. **Đặt các JSON files vào thư mục root:**
   - `users.json`
   - `keys.json`
   - `generated_tokens.json`
   - `token_usage_log.json`
   - `request_transactions.json`

2. **Chạy migration:**
```bash
npm run migrate:json
```

Script sẽ tự động:
- Kiểm tra các file JSON
- Import dữ liệu vào PostgreSQL
- Validate tính toàn vẹn dữ liệu
- Báo cáo kết quả migration

## 📁 Project Structure

```
├── app/                    # Next.js App Router
│   ├── (auth)/            # Auth pages (login, register)
│   ├── (dashboard)/       # Protected dashboard pages
│   ├── admin/             # Admin panel
│   ├── api/               # API routes
│   └── globals.css        # Global styles
├── components/            # React components
│   ├── ui/                # shadcn/ui components
│   ├── dashboard/         # Dashboard components
│   └── admin/             # Admin components
├── lib/                   # Utility functions
│   ├── auth.ts            # NextAuth configuration
│   ├── prisma.ts          # Database client
│   ├── utils.ts           # Helper functions
│   └── validations/       # Zod schemas
├── prisma/                # Database
│   ├── schema.prisma      # Database schema
│   └── migration.ts       # JSON migration script
└── types/                 # TypeScript types
```

## 🔐 Authentication

Hệ thống sử dụng NextAuth.js với credential provider:

- **Registration**: Tạo tài khoản với username, email, password
- **Login**: Đăng nhập với email/password
- **JWT**: Session management với refresh tokens
- **Roles**: USER và ADMIN roles
- **Protection**: Route protection cho dashboard và admin

## 💱 Exchange System

### User Flow
1. User đăng nhập vào dashboard
2. Vào trang "Đổi Token"
3. Nhập số request muốn đổi
4. Hệ thống tạo token với format `TOK-[32CHARS]`
5. Token hiển thị 1 lần duy nhất

### VIP Keys
- Admin tạo keys với format `VIP-XXXXXX-XXXXXX`
- User nhập key để nhận requests
- Keys có thể có expiry date
- Track usage và history

## 🛡️ Security Features

- **Rate Limiting**: Giới hạn requests per user
- **Input Validation**: Zod validation cho tất cả inputs
- **SQL Injection Prevention**: Prisma ORM
- **XSS Protection**: Sanitization và CSP headers
- **Password Hashing**: bcrypt với salt rounds
- **CSRF Protection**: Built-in Next.js protection

## 🎨 UI/UX

- **Dark/Light Mode**: Theme switching
- **Responsive Design**: Mobile-first approach
- **Loading States**: Skeleton loading và spinners
- **Error Handling**: User-friendly error messages
- **Toast Notifications**: Real-time feedback
- **Modern Design**: Clean và professional interface

## 🚀 Deployment

### Vercel (Recommended)

1. **Connect to Vercel**
   - Import project từ GitHub
   - Configure environment variables

2. **Database Setup**
   - Setup Neon PostgreSQL hoặc Supabase
   - Update DATABASE_URL

3. **Environment Variables Setup**
   
   **Cách 1: Qua Vercel Dashboard**
   - Vào [vercel.com/dashboard](https://vercel.com/dashboard)
   - Chọn project → Settings → Environment Variables
   - Thêm các biến sau:
     ```
     DATABASE_URL = postgresql://username:password@host:port/database
     NEXTAUTH_SECRET = your-secret-key-here
     NEXTAUTH_URL = https://your-domain.vercel.app
     ```

   **Cách 2: Qua Vercel CLI**
   ```bash
   # Cài đặt Vercel CLI
   npm i -g vercel
   
   # Đăng nhập
   vercel login
   
   # Thêm environment variables
   vercel env add DATABASE_URL
   vercel env add NEXTAUTH_SECRET
   vercel env add NEXTAUTH_URL
   
   # Deploy
   vercel --prod
   ```

4. **Deploy**
   - Automatic deployments từ Git
   - Preview deployments cho PRs

### Environment Variables for Production
```env
DATABASE_URL="postgresql://username:password@host:port/database"
NEXTAUTH_SECRET="your-production-secret-key"
NEXTAUTH_URL="https://your-domain.vercel.app"
```

### Troubleshooting Vercel Deployment

**Lỗi: "Environment Variable DATABASE_URL references Secret which does not exist"**
- Đảm bảo đã thêm DATABASE_URL trong Vercel Environment Variables
- Redeploy sau khi thêm biến môi trường

**Lỗi: "Database connection failed"**
- Kiểm tra DATABASE_URL format
- Đảm bảo database server đang chạy
- Test connection local trước khi deploy

## 📊 Admin Features

Admin panel bao gồm:

- **User Management**: View, edit, ban/unban users
- **Key Management**: Tạo và quản lý VIP keys
- **Token Overview**: Thống kê tokens đã tạo
- **Analytics**: Charts và metrics
- **System Settings**: Cấu hình hệ thống

## 🔧 Development

### Available Scripts

```bash
# Development
npm run dev              # Start development server
npm run build           # Build for production
npm run start           # Start production server

# Database
npm run db:generate     # Generate Prisma client
npm run db:push         # Push schema to database
npm run db:migrate      # Run database migrations
npm run db:studio       # Open Prisma Studio

# Migration
npm run migrate:json    # Migrate JSON data to PostgreSQL
npm run migrate:json-direct  # Direct migration script

# Quality
npm run lint            # Run ESLint
npm run type-check      # TypeScript check
```

### Database Schema

Xem `prisma/schema.prisma` để hiểu data model:

- **Users**: Authentication và user data
- **GeneratedTokens**: Tokens được tạo từ requests
- **Keys**: VIP keys cho free requests
- **TokenUsageLog**: Logs sử dụng tokens
- **RequestTransactions**: History tất cả transactions

## 🐛 Troubleshooting

### Common Issues

1. **Database Connection Error**
   ```bash
   # Check DATABASE_URL
   # Ensure database is running
   npm run db:generate
   ```

2. **Migration Fails**
   ```bash
   # Check JSON file format
   # Ensure foreign key constraints
   # Run with direct script for more details
   npm run migrate:json-direct
   ```

3. **Build Errors**
   ```bash
   # Clear Next.js cache
   rm -rf .next
   npm run build
   ```

## 📚 API Documentation

### Authentication Endpoints
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login (NextAuth)
- `POST /api/auth/change-password` - Change password

### Exchange Endpoints
- `POST /api/exchange` - Exchange requests for tokens
- `POST /api/keys/redeem` - Redeem VIP keys

### Admin Endpoints
- `GET /api/admin/users` - List users
- `POST /api/admin/keys` - Create VIP keys
- `GET /api/admin/stats` - System statistics

## 🤝 Contributing

1. Fork repository
2. Create feature branch
3. Make changes
4. Add tests
5. Submit pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

Nếu bạn gặp vấn đề:

1. Check README này
2. Xem Issues trên GitHub
3. Tạo issue mới với chi tiết lỗi
4. Include logs và steps to reproduce

---

**Built with ❤️ using Next.js 14, TypeScript, and PostgreSQL**
