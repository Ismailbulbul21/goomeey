# 🎓 School Finance Management System

A modern, bilingual (Somali/English) web application for managing school students, fees, invoices, and payments using React, Vite, Tailwind CSS, and Supabase.

## ✨ Features

### 🔐 Authentication
- Secure admin login powered by Supabase Auth
- Session management with auto-refresh
- Protected routes

### 👨‍🎓 Student Management
- Add students manually with detailed information
- Bulk import students via CSV file (supports Somali headers)
- Search and filter students
- Track monthly fees and payment status
- Print student lists

### 💰 Fee Management
- Create reusable fee types (Monthly Tuition, Exam Fee, etc.)
- Quick templates for common fees
- Edit and manage fee amounts

### 📄 Invoice Generation
- **Quick Generate**: Create invoices for all active students at once
- **Custom Generate**: Select specific students for invoicing
- Duplicate prevention (same fee + month)
- Real-time status tracking (paid/unpaid)

### 💳 Payment Recording
- Mark invoices as paid with payment details
- Multiple payment methods (Cash, Mobile Money, Bank)
- Automatic invoice status updates
- Payment history tracking

### 📊 Reports & Analytics
- Real-time dashboard with key statistics
- Monthly collection charts
- Payment method distribution
- Filter by month and fee type
- Export reports to CSV
- Print-friendly layouts

### 🌐 Bilingual Interface
All labels displayed in both Somali and English:
- Somali: Magac ardeyga, Waalidka, Lacagta, Bixinta
- English: Student Name, Parent, Fee, Payment

## 🚀 Getting Started

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn
- Supabase account

### Installation

1. **Clone the repository**
   ```bash
   cd goomeyelectronic
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   
   Create a `.env` file in the root directory:
   ```env
   VITE_SUPABASE_URL=https://your-project-id.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key-here
   ```
   
   **For local development**, you can copy the example file:
   ```bash
   cp env.example .env
   ```
   
   Then edit `.env` with your actual Supabase credentials.

4. **Start the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to `http://localhost:5173`

## 📦 Tech Stack

- **Frontend Framework**: React 18
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **Backend**: Supabase (PostgreSQL + Auth)
- **Data Fetching**: TanStack React Query
- **Routing**: React Router v6
- **Forms**: React Hook Form
- **Charts**: Recharts
- **CSV Handling**: PapaParse
- **Notifications**: React Hot Toast
- **Icons**: Lucide React
- **Animations**: Framer Motion

## 📊 Database Schema

### Tables

1. **students**
   - id, student_name, parent_name, parent_phone
   - monthly_fee, months_paid, month_name, status
   - created_at

2. **fees**
   - id, fee_name, amount, description
   - created_at

3. **invoices**
   - id, student_id (FK), fee_id (FK)
   - due_date, amount, status, month_name
   - created_at

4. **payments**
   - id, invoice_id (FK)
   - payment_date, payment_method, amount_paid
   - created_at

### Features
- Foreign key relationships with CASCADE/RESTRICT
- Indexes for performance optimization
- Row Level Security (RLS) enabled
- Automatic trigger to update invoice status on payment
- Views for dashboard statistics

## 🎨 Design System

### Colors
- **Primary Blue**: `#3b82f6` (Tailwind blue-500)
- **Success Green**: `#10b981` (Tailwind green-500)
- **Warning Orange**: `#f59e0b` (Tailwind orange-500)
- **Danger Red**: `#ef4444` (Tailwind red-500)

### Typography
- **Headings**: Font-bold, text-3xl/2xl/xl
- **Body**: Font-medium, text-sm/base
- **Labels**: text-xs with opacity-75 for Somali translations

### Components
- **Rounded corners**: `rounded-xl` (12px) or `rounded-2xl` (16px)
- **Shadows**: `shadow-sm` for cards, `shadow-xl` for modals
- **Spacing**: Consistent `p-4`, `p-6`, `gap-3`, `gap-6`

## 📱 Responsive Design

- **Mobile**: Single column layouts, collapsible sidebar
- **Tablet**: 2-column grids
- **Desktop**: Full sidebar, 3-4 column grids

## 🖨️ Print Functionality

Print-optimized layouts for:
- Student lists
- Invoice reports
- Financial reports

Special print styles:
- White background
- Black text
- Hidden navigation elements (`.no-print`)

## 🔑 Default Credentials

To create an admin account, use Supabase Auth Dashboard or sign up through the app.

## 📖 Usage Guide

### Adding Students
1. Go to **Students** page
2. Click **Add Student**
3. Fill in all required fields
4. Submit

### Importing Students via CSV
1. Prepare CSV with headers: `Magac ardeyga`, `Waalidka`, `N.Waalidka`, `Lacagta`, `Bilaha`
2. Click **Import CSV**
3. Select file and preview
4. Confirm import

### Generating Invoices
**Quick Generation:**
1. Go to **Invoices** page
2. Click **Quick Generate**
3. Select fee type, month, and due date
4. Generate for all active students

**Custom Generation:**
1. Click **Custom Generate**
2. Select fee type and dates
3. Choose specific students
4. Generate invoices

### Recording Payments
1. Go to **Payments** page
2. Find unpaid invoice
3. Click **Mark as Paid**
4. Enter payment date and method
5. Confirm payment

### Viewing Reports
1. Go to **Reports** page
2. Use filters for month/fee type
3. View charts and statistics
4. Export to CSV or print

## 🛠️ Development

### Project Structure
```
src/
├── components/
│   ├── Layout.jsx
│   ├── Sidebar.jsx
│   └── ProtectedRoute.jsx
├── context/
│   └── AuthContext.jsx
├── lib/
│   └── supabaseClient.js
├── pages/
│   ├── Login.jsx
│   ├── Dashboard.jsx
│   ├── Students.jsx
│   ├── Fees.jsx
│   ├── Invoices.jsx
│   ├── Payments.jsx
│   └── Reports.jsx
├── App.jsx
├── main.jsx
└── index.css
```

### Build for Production
```bash
npm run build
```

### Preview Production Build
```bash
npm run preview
```

## 🚀 Deployment

### Deploy to Vercel
1. Push code to GitHub
2. Import project in Vercel
3. Add environment variables
4. Deploy

### Deploy to Netlify
1. Build the project: `npm run build`
2. Deploy the `dist` folder
3. Set environment variables in Netlify dashboard

## 🤝 Contributing

This project is designed for a single school. For customization:
1. Fork the repository
2. Make your changes
3. Test thoroughly
4. Create a pull request

## 📄 License

MIT License - Free to use for educational purposes

## 📧 Support

For issues or questions:
- Check the database connection in `.env.local`
- Verify Supabase project is active
- Check browser console for errors

## 🎯 Roadmap

Future enhancements:
- [ ] SMS notifications for due payments
- [ ] Email receipts
- [ ] Multi-school support
- [ ] Class/Grade grouping
- [ ] Discount management
- [ ] Late payment penalties

---

**Built with ❤️ for schools** | **La Dhisay Jacayl Dugsiyada**
