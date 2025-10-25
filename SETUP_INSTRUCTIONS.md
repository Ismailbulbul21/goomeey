# 🚀 Quick Setup Instructions

## Step 1: Create Environment File

Create a file named `.env.local` in the root directory with the following content:

```env
VITE_SUPABASE_URL=https://dotjwzfbofdfjpfaniuy.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRvdGp3emZib2ZkZmpwZmFuaXV5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjEyMjY4NDQsImV4cCI6MjA3NjgwMjg0NH0.KIQ2DbeJEnqfH6gCvRYS-1O_9OtqAMzSM824qEHjO6U
```

⚠️ **Important**: The `.env.local` file is in `.gitignore` and won't be committed to git for security.

## Step 2: Create Admin Account

You need to create an admin account to access the system:

### Option A: Using Supabase Dashboard
1. Go to https://supabase.com/dashboard
2. Select your project: **School Finance Management**
3. Navigate to **Authentication** → **Users**
4. Click **Add User**
5. Enter email and password
6. Click **Create User**

### Option B: Using the App (If Email is Configured)
1. Temporarily modify `src/pages/Login.jsx` to add a signup button
2. Create your admin account
3. Remove the signup button for security

## Step 3: Run the Application

```bash
# Make sure you're in the project directory
cd goomeyelectronic

# Start the development server
npm run dev
```

The app will open at: **http://localhost:5173**

## Step 4: Login

1. Open http://localhost:5173
2. You'll see the login page
3. Enter your admin email and password
4. Click **Login / Gal**

## Step 5: Start Using the System

### Add Your First Student
1. Go to **Students** (Ardayda)
2. Click **Add Student**
3. Fill in the form:
   - Magac ardeyga (Student Name)
   - Waalidka (Parent Name)
   - N.Waalidka (Parent Phone)
   - Lacagta bil kasta (Monthly Fee)
4. Click **Add Student**

### Create Your First Invoice
1. Go to **Invoices** (Biilasha)
2. Click **Quick Generate**
3. Select **Monthly Tuition**
4. Enter the month (e.g., "March 2025")
5. Set due date
6. Click **Generate All**

### Record Your First Payment
1. Go to **Payments** (Bixinta)
2. Find an unpaid invoice
3. Click **Mark as Paid**
4. Select payment method (Cash/Mobile Money/Bank)
5. Confirm payment

## 📊 Database is Already Set Up!

The Supabase database has been fully configured with:
- ✅ 4 tables (students, fees, invoices, payments)
- ✅ Foreign key relationships
- ✅ Row Level Security policies
- ✅ Automatic triggers
- ✅ 5 default fee types pre-loaded

## 🎉 You're All Set!

Your School Finance Management System is ready to use. Explore all features:
- **Dashboard**: View statistics
- **Students**: Manage student records
- **Fees**: Configure fee types
- **Invoices**: Generate bills
- **Payments**: Record payments
- **Reports**: View analytics and export data

## 🆘 Troubleshooting

### "Missing Supabase environment variables" Error
- Make sure `.env.local` file exists in the root directory
- Restart the dev server after creating the file

### Can't Login
- Verify admin account was created in Supabase
- Check email and password are correct
- Check browser console for errors

### Database Connection Issues
- Verify the Supabase project is active
- Check the URL and anon key are correct in `.env.local`

---

**Need Help?** Check the console for detailed error messages or review the main README.md












