# eSumbong Backend API

This is the backend API for the **eSumbong** project.  
It is built using **Node.js**, **Express**, **Prisma**, and **SQLite (development)**.

This guide will help you install, configure, and run the backend locally.  
It also includes the proper Git workflow for contributors.

---

# 📦 Prerequisites

Before running the backend, install:

- **Node.js (LTS recommended)**  
  👉 https://nodejs.org/en/download/
- **Git**  
  👉 https://git-scm.com/downloads

---

# 🚀 Getting Started

## 1️⃣ Clone the Repository

```bash
git clone https://github.com/mmanrus/esumbong_backend.git
cd esumbong_backend
```

## 2️⃣ Install Dependencies
```bash
npm install
```

## This installs all backend dependencies, including Prisma.

# 🔐 Environment Setup
Before running the backend, you must create a .env file.

## 3️⃣ Create a .env File

Create a file named .env in the backend root:
```.env
DATABASE_URL="file:./dev.db"
JWT_SECRET=your_access_token_secret_here
REFRESH_SECRET=your_refresh_token_secret_here
```

## 🗄 Prisma Setup
4️⃣ Generate Prisma Client

## After creating .env and installing dependencies, run:
```bash
npx prisma generate
```

## If you need to run database migrations: SKIP if no changes
```bash
npx prisma migrate dev
```
▶️ Run the Server

## Start the backend in development mode:
```bash
npm run dev
```

## The backend will run at:
```bash
http://localhost:3005
```
## 🧑‍💻 Git Workflow (For Contributors)

Follow this workflow whenever you work on the backend.

## 1. Pull the latest main branch
```bash
git checkout main
git pull origin main
```
## 2. Create a new feature branch
```bash
git checkout -b feature/your-feature-name
```

Example:
```bash
git checkout -b feature/add-user-routes
```
3. Make changes → Stage → Commit
```bash
git add .
git commit -m "Implemented user routes or <your message here>"
```
4. Rebase with the latest main (keeps history clean)
```bash
git pull --rebase origin main
```
5. Push your feature branch
```bash
git push -u origin feature/your-feature-name
```
6. Open a Pull Request

Go to your GitHub repo → Pull Requests → New Pull Request
Compare your branch → Submit PR into main.

📁 Project Structure (Sample)
```bash
/src
  /controllers
  /routes
  /middlewares
  /services
  /prisma
  server.ts
.env
package.json
.gitignore
```

🛠 Technologies Used

Node.js + Express

Prisma ORM

SQLite (development)

JWT Authentication
