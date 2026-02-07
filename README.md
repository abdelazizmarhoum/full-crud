# full-crud

## Automated CRUD API Generator for Express and Mongoose

`full-crud` is a high-level utility that eliminates repetitive CRUD controller boilerplate in Express.js applications using Mongoose. Generate complete, production-ready REST APIs with pagination, filtering, and field selection in a single line of code.

---

## Table of Contents

- [Installation](#installation)
- [Quick Start](#quick-start)
- [Features](#features)
- [API Reference](#api-reference)
- [Configuration Options](#configuration-options)
- [Error Handling](#error-handling)
- [License](#license)

---

## Installation

```bash
npm install full-crud
```

**Peer Dependencies:**
- `express` ^4.18.0
- `mongoose` ^7.0.0

---

## Quick Start

### 1. Automatic Model Registration (Autowire)

Register all Mongoose models in a directory as REST endpoints automatically:

```javascript
const express = require('express');
const mongoose = require('mongoose');
const { autowire } = require('full-crud');

const app = express();
app.use(express.json());

// Connect to your MongoDB database
mongoose.connect('mongodb://localhost:27017/myapp');

// Automatically creates CRUD endpoints for all models in ./models
// Example: User model -> GET /api/users, POST /api/users, etc.
autowire(app, './models');

app.listen(3000, () => console.log('Server running on port 3000'));
```

### 2. Manual Model Mounting

Mount specific models to custom paths with additional configuration:

```javascript
const { mountCrud } = require('full-crud');
const User = require('./models/User');

// Register User model at /api/users
mountCrud(app, '/api/users', User, {
  pagination: { defaultLimit: 25, maxLimit: 100 }
});
```

### 3. Standalone Controller Builder

Create reusable controller instances with a fluent API:

```javascript
const { makeCrud } = require('full-crud');
const User = require('./models/User');

// Create a fully configured controller
const userController = makeCrud(User)
  .pagination({ defaultLimit: 50 })
  .beforeCreate(async (data) => {
    // Hash password before saving
    if (data.password) {
      data.password = await bcrypt.hash(data.password, 10);
    }
    return data;
  });

// Use in your Express routes
app.get('/api/users', userController.getAll);
app.post('/api/users', userController.create);
```

---

## Features

### Automated CRUD Operations
- **GET** `/resource` - Retrieve all resources with pagination & filtering
- **GET** `/resource/:id` - Retrieve single resource by ID
- **POST** `/resource` - Create new resource
- **PUT** `/resource/:id` - Update existing resource
- **DELETE** `/resource/:id` - Delete resource

### Built-in Query Parameters
All list endpoints (`GET /resource`) support the following query parameters:

| Parameter | Description | Example |
|-----------|-------------|---------|
| `page` | Page number for pagination | `?page=2` |
| `limit` | Items per page | `?limit=50` |
| `sort` | Sort by field (prefix with `-` for descending) | `?sort=-createdAt` |
| `fields` | Select specific fields | `?fields=name,email,createdAt` |
| `[field]` | Filter by any model field | `?status=active&category=electronics` |

### Automatic Response Format
All responses follow a consistent format:

```javascript
// Success response (GET ALL)
{
  "success": true,
  "count": 20,
  "pagination": {
    "page": 1,
    "limit": 20,
    "totalPages": 5,
    "totalItems": 100
  },
  "data": [ /* array of resources */ ]
}

// Success response (GET BY ID / CREATE)
{
  "success": true,
  "data": { /* resource data */ }
}
```

---

## API Reference

### `autowire(app, modelsPath, options)`
Automatically registers CRUD routes for all Mongoose models in a directory.

**Options:**
- `prefix` (String): URL prefix (default: `/api`)
- `logging` (Boolean): Enable route table logging in terminal (default: `true`)

### `mountCrud(app, path, Model, options)`
Mounts CRUD operations for a single model at a specified path.

### `makeCrud(Model, options)`
Creates a CRUD controller instance with a fluent API for method chaining.

---

## Configuration Options

### Fluent API Methods
```javascript
const controller = makeCrud(User)
  .pagination({ defaultLimit: 30, maxLimit: 100 }) // Configure pagination
  .only(['getAll', 'getById', 'create'])           // Enable only specific operations
  .middleware('create', [auth, validateUser])      // Add middleware per operation
  .beforeCreate(async (data, req) => data)         // Add pre-save hook
  .afterCreate(async (doc, req) => {})             // Add post-save hook
  .beforeUpdate(async (data, req) => data);        // Add pre-update hook
```

---

## Error Handling

`full-crud` provides comprehensive error handling for Mongoose validation, cast errors (invalid IDs), and duplicate entries:

```javascript
// Error response
{
  "success": false,
  "error": "Validation Error",
  "details": "User validation failed: email: Path `email` is required."
}
```

---

## License

MIT © [MARHOUM Abdelaziz](https://github.com/abdelazizmarhoum)
