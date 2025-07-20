# 📚 Books API

A **NestJS** API for managing books, user follows, and comments — built with **Prisma**, **PostgreSQL**, **Redis (optional)**, and **JWT authentication**.  
Implements **Clean Architecture**, **SOLID principles**, and **Swagger** documentation.

##  Features

✅ **Books** — CRUD  
✅ **Comments** — Users can comment on books  
✅ **Follow/Unfollow** — Users can follow other users and see followers/following  
✅ **JWT Auth** — Secure endpoints  
✅ **Pagination** — For books and comments  
✅ **Swagger** — Fully documented API  
✅ **Prisma ORM** — PostgreSQL database  
✅ **Cache ready** — Redis integration for book list caching (optional)


##  Project Structure

src/
├── infrastructure/ # Redis, Guards, interceptors, Prisma
├── modules/ # Auth, User, Book
├── utils/
├── main.ts # Entry point
├── app.module.ts # Root module
├── prisma/ # Prisma schema & migrations



## ⚙️ Requirements

- **Node.js** `>=18.x`
- **PostgreSQL** database
- (Optional) **Redis** for caching



##  Getting Started

### Clone & Install

```bash
git clone https://github.com/OkesiEmmanuel/books-api.git
cd books-api

npm install
2️. Setup Environment Variables
Create a .env file:

env

DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DATABASE"
JWT_SECRET="your-secret-key"
JWT_EXPIRES_IN="3600s"
REDIS_URL="redis://localhost:6379" 
3️. Prisma
Run migrations & generate Prisma client:


npx prisma migrate dev --name init
npx prisma generate
4️. Run Locally
`bash

npm run start:dev
Visit: http://localhost:3000/api for Swagger docs.
`

## API Endpoints
Method	Endpoint	Description
GET	/books	List books (paginated)
GET	/books/:id	Get book by ID
POST	/books	Create a book
PUT	/books/:id	Update a book
DELETE	/books/:id	Delete a book
POST	/books/:id/comments	Comment on a book
GET	/books/:id/comments	Get comments for a book
POST	/users/:id/follow	Follow a user
DELETE	/users/:id/follow	Unfollow a user
GET	/users/:id/followers	Get user's followers
GET	/users/:id/following	Get user's following

All write operations require JWT authentication.

Auth Example
Add Authorization: Bearer <token> header for protected endpoints.

 Swagger
Auto-generated at:
http://localhost:3000/api

 
bash
npm run start:dev	Run in dev mode
npm run build	Build for production
npx prisma migrate dev	Run migrations
npx prisma studio	Browse database


⚖️ License
MIT

👨‍💻 Author
Okesi Emmanuel

Keep it clean. Keep it SOLID.

🔗 Contact
Open an issue or PR for improvements!

yaml



## 📌 **How to use**

 Save this as `README.md` at your project root.  
 Push it to GitHub:  

```bash
git add README.md
git commit -m "docs: add full README"
git push origin main