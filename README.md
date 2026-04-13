# 📚 Read Journey

A book reading tracker app that helps you manage your personal library, track reading progress, and discover new books.

## 🔗 Links

- **Live Demo:** [read-journey.vercel.app](#) *(deploy sonrası güncellenecek)*
- **Backend API:** [readjourney.b.goit.study/api-docs](https://readjourney.b.goit.study/api-docs)
- **GitHub:** [github.com/cucuhead/read-journey](https://github.com/cucuhead/read-journey)

## 🚀 Features

- 📖 Register & Login with JWT authentication
- 🔍 Browse and search recommended books
- 📚 Build your personal library
- ▶️ Track reading sessions (start/stop by page number)
- 📊 View reading statistics and diary
- 📱 Fully responsive (mobile, tablet, desktop)

## 🛠 Tech Stack

- **React 18** + **Vite**
- **Redux Toolkit** — global state management
- **React Router v6** — client-side routing
- **Axios** — HTTP requests
- **react-hook-form** + **Yup** — form validation
- **CSS Modules** — scoped styling

## 📦 Installation

```bash
# Clone the repo
git clone https://github.com/cucuhead/read-journey.git

# Navigate to project
cd read-journey

# Install dependencies
npm install

# Start development server
npm run dev
```

## 📁 Project Structure

src/
├── api/          # Axios instance & API calls
├── assets/       # Icons, images
├── components/   # Shared & layout components
├── hooks/        # Custom hooks
├── pages/        # Page components
├── redux/        # Store, slices
├── router/       # App routing
└── schemas/      # Yup validation schemas

## 📱 Responsive Breakpoints

| Device  | Breakpoint |
|---------|-----------|
| Mobile  | 375px+    |
| Tablet  | 768px+    |
| Desktop | 1440px+   |

## 👤 Author

**Burcu Budak** — [github.com/cucuhead](https://github.com/cucuhead)