# Prompt cho Cursor: Thiết kế Web App Quản lý Token/Request với Neon Database

## Mô tả dự án
Tạo một web application hoàn chỉnh cho phép người dùng đổi request thành token, tương tự như hệ thống Cursor AI Pro. Web app cần được thiết kế để deploy lên Vercel và tích hợp với Neon PostgreSQL database.

## Yêu cầu chức năng chính

### 1. Hệ thống Authentication
- Đăng ký/đăng nhập người dùng với email + password
- JWT authentication với refresh token
- Role-based access (user, admin)
- Password hashing với bcrypt
- Session management

### 2. Dashboard người dùng
- Hiển thị số request hiện tại
- Lịch sử giao dịch đổi request → token
- Thống kê sử dụng token
- Profile management

### 3. Chức năng đổi Request thành Token
- Form nhập số lượng request muốn đổi
- Validation số request khả dụng
- Tạo token với format: `TOK-[RANDOM32CHARS]`
- Trừ request từ tài khoản user
- Lưu transaction log
- Hiển thị token được tạo (chỉ hiện 1 lần)

### 4. Admin Panel
- Quản lý users (view, edit, delete, ban/unban)
- Tạo VIP keys để user đổi lấy requests
- Thống kê tổng quan (users, requests, tokens)
- Quản lý keys và tokens
- Logs và monitoring

### 5. Hệ thống VIP Keys
- Admin có thể tạo keys với định dạng: `VIP-XXXXXX-XXXXXX`
- User nhập key để nhận requests
- Keys có thể có expiry date
- Tracking key usage

## Stack công nghệ yêu cầu

### Frontend
- **Next.js 14** với App Router
- **TypeScript** cho type safety
- **Tailwind CSS** + **shadcn/ui** cho UI components
- **React Hook Form** + **Zod** cho form validation
- **Tanstack Query** cho data fetching
- **Framer Motion** cho animations

### Backend
- **Next.js API Routes** (serverless)
- **Prisma ORM** cho database operations
- **NextAuth.js** cho authentication
- **Zod** cho API validation
- **Rate limiting** với upstash redis

### Database
- **Neon PostgreSQL** (serverless postgres)
- Migrate từ JSON files hiện tại sang PostgreSQL schema

## Database Schema (Prisma)

```prisma
// User model
model User {
  id          Int      @id @default(autoincrement())
  username    String   @unique
  email       String   @unique
  passwordHash String  @map("password_hash")
  requests    Int      @default(0)
  role        Role     @default(USER)
  isActive    Boolean  @default(true) @map("is_active")
  lastLogin   DateTime? @map("last_login")
  expiryTime  DateTime? @map("expiry_time")
  isExpired   Boolean  @default(false) @map("is_expired")
  createdAt   DateTime @default(now()) @map("created_at")
  updatedAt   DateTime @updatedAt @map("updated_at")

  // Relations
  tokens      GeneratedToken[]
  keyUsages   Key[] @relation("KeyUsedBy")
  tokenUsages TokenUsageLog[]
  transactions RequestTransaction[]

  @@map("users")
}

// Generated tokens
model GeneratedToken {
  id           Int      @id @default(autoincrement())
  userId       Int      @map("user_id")
  tokenValue   String   @unique @map("token_value")
  requestsCost Int      @map("requests_cost")
  isActive     Boolean  @default(true) @map("is_active")
  lastUsedAt   DateTime? @map("last_used_at")
  usageCount   Int      @default(0) @map("usage_count")
  createdAt    DateTime @default(now()) @map("created_at")

  user User @relation(fields: [userId], references: [id])

  @@map("generated_tokens")
}

// VIP Keys
model Key {
  id          Int      @id @default(autoincrement())
  keyValue    String   @unique @map("key_value")
  requests    Int
  isUsed      Boolean  @default(false) @map("is_used")
  usedBy      Int?     @map("used_by")
  usedAt      DateTime? @map("used_at")
  expiresAt   DateTime? @map("expires_at")
  isExpired   Boolean  @default(false) @map("is_expired")
  description String?
  keyType     KeyType  @default(REGULAR) @map("key_type")
  createdAt   DateTime @default(now()) @map("created_at")

  user User? @relation("KeyUsedBy", fields: [usedBy], references: [id])

  @@map("keys")
}

// Token usage logs
model TokenUsageLog {
  id         Int      @id @default(autoincrement())
  tokenValue String   @map("token_value")
  usedBy     Int      @map("used_by")
  usedAt     DateTime @map("used_at")
  ipAddress  String   @map("ip_address")

  user User @relation(fields: [usedBy], references: [id])

  @@map("token_usage_log")
}

// Request transactions
model RequestTransaction {
  id          Int      @id @default(autoincrement())
  userId      Int      @map("user_id")
  type        TransactionType
  amount      Int
  description String?
  createdAt   DateTime @default(now()) @map("created_at")

  user User @relation(fields: [userId], references: [id])

  @@map("request_transactions")
}

enum Role {
  USER
  ADMIN
}

enum KeyType {
  REGULAR
  CUSTOM
}

enum TransactionType {
  REQUEST_TO_TOKEN
  KEY_REDEEM
  ADMIN_ADJUSTMENT
}
```

## UI/UX Requirements

### Design System
- Modern, clean interface với dark/light mode
- Responsive design (mobile-first)
- Loading states và error handling
- Toast notifications cho actions
- Skeleton loading cho data fetching

### Key Pages
1. **Landing Page** - Marketing page giới thiệu service
2. **Auth Pages** - Login/Register với social auth options
3. **Dashboard** - Overview với stats cards
4. **Exchange Page** - Main feature để đổi request → token
5. **Keys Page** - Redeem VIP keys
6. **History Page** - Transaction history với filtering
7. **Profile Page** - User settings
8. **Admin Panel** - Complete admin interface

### Exchange Page Design
```tsx
// Main exchange interface
- Input field: Số request muốn đổi
- Display: Request hiện tại, rate đổi (1:1)
- Preview: Token sẽ nhận được
- Button: "Đổi Request thành Token"
- Result modal: Hiển thị token (copy button)
```

## Technical Requirements

### Security
- Rate limiting cho API endpoints
- Input validation với Zod
- SQL injection prevention (Prisma)
- XSS protection
- CSRF tokens
- Secure headers với next.config.js

### Performance
- Server-side rendering với Next.js
- Database connection pooling
- Caching với Redis (upstash)
- Image optimization
- Bundle optimization

### Deployment (Vercel)
- Environment variables setup
- Automatic deployments từ Git
- Preview deployments
- Analytics tracking

## File Structure
```
├── app/
│   ├── (auth)/
│   │   ├── login/
│   │   └── register/
│   ├── (dashboard)/
│   │   ├── dashboard/
│   │   ├── exchange/
│   │   ├── keys/
│   │   ├── history/
│   │   └── profile/
│   ├── admin/
│   ├── api/
│   │   ├── auth/
│   │   ├── tokens/
│   │   ├── keys/
│   │   └── users/
│   └── globals.css
├── components/
│   ├── ui/ (shadcn components)
│   ├── auth/
│   ├── dashboard/
│   └── admin/
├── lib/
│   ├── prisma.ts
│   ├── auth.ts
│   ├── validations/
│   └── utils.ts
├── prisma/
│   ├── schema.prisma
│   └── migrations/
└── types/
```

## Migration Strategy
1. Tạo PostgreSQL database trên Neon
2. Setup Prisma schema
3. Viết migration script để import từ JSON files
4. Validate data integrity sau migration

## Environment Variables
```env
# Database
DATABASE_URL="postgresql://..."

# Auth
NEXTAUTH_SECRET="..."
NEXTAUTH_URL="..."

# External services (optional)
UPSTASH_REDIS_URL="..."
```

## Additional Features

### Dashboard Analytics
- Biểu đồ thống kê request/token theo thời gian
- Top users dashboard (admin)
- Revenue tracking (nếu có monetization)
- Real-time notifications

### API Features
- RESTful API với proper HTTP status codes
- API rate limiting per user
- API documentation với Swagger/OpenAPI
- Webhook support cho external integrations

### Mobile Responsiveness
- PWA support với service workers
- Mobile-optimized UI/UX
- Touch-friendly interactions
- Offline capability (limited)

## Quality Assurance

### Testing
- Unit tests với Jest
- Integration tests cho API routes
- E2E tests với Playwright
- Type checking với TypeScript

### Monitoring
- Error tracking với Sentry
- Performance monitoring
- Database query optimization
- Uptime monitoring

## Deployment Checklist

### Pre-deployment
- [ ] Environment variables configured
- [ ] Database migrations run
- [ ] SSL certificates setup
- [ ] Security headers configured
- [ ] Performance optimizations applied

### Post-deployment
- [ ] Health checks implemented
- [ ] Monitoring alerts setup
- [ ] Backup strategy in place
- [ ] Documentation updated
- [ ] User training materials created

## Future Enhancements

### Phase 2 Features
- Multi-language support (i18n)
- Advanced analytics dashboard
- Subscription/billing system
- API marketplace
- Third-party integrations

### Scalability Considerations
- Microservices architecture transition
- CDN integration
- Database sharding strategy
- Horizontal scaling plan

## Deliverables
1. Complete Next.js application với production-ready code
2. Prisma schema và database migrations
3. Data migration scripts từ JSON sang PostgreSQL
4. Comprehensive API documentation
5. Deployment configuration files
6. User manual và admin guide
7. Technical documentation
8. Security audit checklist

## Success Criteria
- 🎯 **Performance**: Page load time < 2s
- 🔒 **Security**: Pass security audit checklist
- 📱 **Responsive**: Works flawlessly on all devices
- ⚡ **Reliability**: 99.9% uptime target
- 🚀 **Scalable**: Handle 10,000+ concurrent users
- 🎨 **UX**: Intuitive interface với minimal learning curve

---

**Note**: Tạo một ứng dụng hoàn chỉnh, production-ready với UI đẹp mắt, secure và scalable. Focus vào user experience, performance và maintainability. Code phải clean, well-documented và follow best practices.
