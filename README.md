# تحاليلي (Tahliliy)

منصة متابعة التحاليل الطبية — تربط بين **المرضى** و**الأطباء** و**المختبرات**

Medical Lab Results Tracking Platform connecting **Patients**, **Doctors**, and **Laboratories**.

---

## التقنيات المستخدمة

| الطبقة | التقنية |
|--------|---------|
| الواجهة الأمامية | React 18 · TypeScript · Vite 5 |
| التصميم | Tailwind CSS 3 · shadcn/ui |
| الخلفية | Express.js · Node.js |
| قاعدة البيانات | MySQL |
| المصادقة | JWT · bcrypt |
| رفع الملفات | Multer |

---

## التشغيل المحلي

### المتطلبات

- Node.js 18+
- MySQL 8+

### 1. تجهيز قاعدة البيانات

```bash
# تأكد أن MySQL شغال
brew services start mysql   # macOS

# أنشئ الجداول
cd server
npm install
npm run db:init
```

### 2. تشغيل السيرفر

```bash
cd server
npm run dev
```

السيرفر يشتغل على `http://localhost:3001`

### 3. تشغيل الواجهة

```bash
# من المجلد الرئيسي
npm install
npm run dev
```

التطبيق يشتغل على `http://localhost:8080`

---

## الأدوار والصلاحيات

| الدور | الصلاحيات |
|-------|-----------|
| **مريض** | حجز مواعيد · عرض نتائج التحاليل · قراءة ملاحظات الأطباء |
| **مختبر** | إدارة المواعيد · رفع نتائج التحاليل والملفات |
| **طبيب** | عرض تحاليل المرضى · إضافة ملاحظات طبية |

---

## هيكل المشروع

```
├── src/                    # الواجهة الأمامية (React)
│   ├── components/         # المكونات
│   │   ├── dashboard/      # لوحات التحكم (مريض · طبيب · مختبر)
│   │   └── ui/             # مكونات shadcn/ui
│   ├── hooks/              # useAuth · use-toast
│   ├── lib/                # api.ts · utils.ts
│   └── pages/              # الصفحات (Auth · Dashboard · Index)
│
├── server/                 # الخلفية (Express.js)
│   ├── routes/             # المسارات (auth · appointments · tests · notes · profiles)
│   ├── db.js               # اتصال MySQL
│   ├── auth.js             # JWT middleware
│   ├── db-init.js          # إنشاء الجداول
│   └── index.js            # نقطة الدخول
```

---

## قاعدة البيانات

```
users            → id · email · password_hash · full_name
user_roles       → user_id · role (patient/doctor/lab)
profiles         → user_id · full_name · phone · avatar_url
appointments     → patient_id · lab_id · test_type · appointment_date · status
medical_tests    → patient_id · lab_id · test_name · result_value · file_url · status
test_notes       → test_id · doctor_id · note
```

---

## واجهة الـ API

### المصادقة

| Method | Endpoint | الوصف |
|--------|----------|-------|
| POST | `/api/auth/signup` | إنشاء حساب جديد |
| POST | `/api/auth/signin` | تسجيل الدخول |
| GET | `/api/auth/me` | بيانات المستخدم الحالي |

### المواعيد

| Method | Endpoint | الوصف |
|--------|----------|-------|
| GET | `/api/appointments` | عرض المواعيد (حسب الدور) |
| POST | `/api/appointments` | حجز موعد جديد |
| PATCH | `/api/appointments/:id` | تحديث حالة الموعد |

### التحاليل

| Method | Endpoint | الوصف |
|--------|----------|-------|
| GET | `/api/tests` | عرض التحاليل (حسب الدور) |
| POST | `/api/tests` | رفع نتيجة تحليل (FormData) |

### الملاحظات

| Method | Endpoint | الوصف |
|--------|----------|-------|
| GET | `/api/notes?test_ids=...` | عرض ملاحظات الأطباء |
| POST | `/api/notes` | إضافة ملاحظة طبية |

### الملفات الشخصية

| Method | Endpoint | الوصف |
|--------|----------|-------|
| GET | `/api/profiles/labs` | قائمة المختبرات |
| GET | `/api/profiles/patients` | قائمة المرضى |
| GET | `/api/profiles?user_ids=...` | بيانات مستخدمين محددين |

---

## إعدادات السيرفر

ملف `server/.env`:

```env
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=
DB_NAME=tahliliy
JWT_SECRET=your_secret_here
PORT=3001
```
7. ✅ Replace `useAuth` hook to use JWT from localStorage
8. ✅ Test all three roles end-to-end
9. ✅ Deploy Express backend (e.g., VPS, Railway, Render)

## 8. Running the Express Backend

```bash
cd tahalili-backend
npm install
mysql -u root -p < migrations/001_initial_schema.sql
npm run dev   # ts-node-dev src/index.ts
```

---

## 📝 License

MIT
