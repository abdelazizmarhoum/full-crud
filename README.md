# 🚀 full-crud

[![npm version](https://img.shields.io/npm/v/full-crud.svg?style=flat-square)](https://www.npmjs.com/package/full-crud)
[![license](https://img.shields.io/npm/l/full-crud.svg?style=flat-square)](https://github.com/yourusername/full-crud/blob/master/LICENSE)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg?style=flat-square)](http://makeapullrequest.com)

**The ultimate "Bolierplate Annihilator" for Mongoose & Express.**  
Generate production-ready CRUD APIs with **one single line of code**.

---

## 🌟 The Philosophy
Stop copy-pasting the same 50 lines of CRUD logic for every model in your project. `full-crud` provides a high-level factory that understands your Mongoose models and builds the Express routes, handlers, pagination, and filtering for you—automatically.

- **Zero-Boilerplate**: Autowire your entire `models/` folder in one second.
- **Fluent API**: Chain hooks and configuration in a beautiful "one-liner" style.
- **Production Ready**: Built-in total items count, standardized error handling, and field selection.

---

## 📦 Installation

```bash
npm install full-crud
```
*Requires `express` and `mongoose` as peer dependencies.*

---

## 🔥 Feature 1: The "Magic" Autowire
The fastest way to backend existence. Point `full-crud` to your models folder and watch your API come to life.

```javascript
const { autowire } = require('full-crud');
const express = require('express');

const app = express();
app.use(express.json());

// 🪄 This one line creates /api/users, /api/products, /api/orders...
autowire(app, './models'); 

app.listen(3000, () => console.log('API is alive!'));
```

---

## � Feature 2: Manual Mounting
Need more control? Mount specific models to specific paths in one line.

```javascript
const { mountCrud } = require('full-crud');
const Client = require('./models/Client');

// Registers GET, POST, PUT, DELETE /api/clients instantly
mountCrud(app, '/api/clients', Client);
```

---

## � Feature 3: Chainable Builder API
Even advanced logic stays as a "one-liner". Our fluent builder lets you inject hooks and middleware without breaking the flow.

```javascript
const { makeCrud } = require('full-crud');

const userController = makeCrud(User)
  .beforeCreate(async (data) => {
    data.password = await hash(data.password);
    return data;
  })
  .afterCreate(sendWelcomeEmail)
  .pagination({ defaultLimit: 20 })
  .only(['getAll', 'getById']); // Restrict operations
```

---

## 🔍 Smart API Features
Your generated API is automatically supercharged with:

| Query Param | Action | Example |
|---|---|---|
| `?page=x` | Pagination | `/api/users?page=2` |
| `?limit=x` | Custom Page Size | `/api/users?limit=50` |
| `?sort=field` | Sorting | `/api/users?sort=-createdAt` |
| `?fields=a,b` | Field Selection | `/api/users?fields=name,email` |
| `?name=John` | Filtering | Any model field works as a filter! |

---

## 🛠️ API Reference

### `autowire(app, folderPath, options)`
Registers all Mongoose models in a directory as pluralized routes.
- `prefix`: URL prefix (default: `/api`)
- `logging`: Show the route table in terminal (default: `true`)

### `mountCrud(app, path, Model, options)`
Registers all CRUD routes for a single model at a specific path.

### `makeCrud(Model)`
Returns the fluent builder to create a standalone controller.

---

## ⚖️ License
MIT © [MARHOUM Abdelaziz](https://github.com/abdelazizmarhoum)
