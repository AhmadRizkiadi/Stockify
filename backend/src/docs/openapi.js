const authErrorResponses = {
  401: {
    description: "Unauthorized",
    content: {
      "application/json": {
        schema: { $ref: "#/components/schemas/ErrorResponse" },
        example: {
          success: false,
          message: "Not authorized, no token",
        },
      },
    },
  },
};

const adminErrorResponses = {
  ...authErrorResponses,
  403: {
    description: "Admin access required",
    content: {
      "application/json": {
        schema: { $ref: "#/components/schemas/ErrorResponse" },
        example: {
          success: false,
          message: "Access denied, admin only",
        },
      },
    },
  },
};

const jsonResponse = (schemaRef, description = "Success") => ({
  description,
  content: {
    "application/json": {
      schema: schemaRef,
    },
  },
});

const errorResponse = (message, description = message) => ({
  description,
  content: {
    "application/json": {
      schema: { $ref: "#/components/schemas/ErrorResponse" },
      example: {
        success: false,
        message,
      },
    },
  },
});

const openApiSpec = {
  openapi: "3.0.3",
  info: {
    title: "Stockify API",
    version: "1.0.0",
    description:
      "REST API documentation for the Stockify inventory management backend.",
  },
  servers: [
    {
      url: "http://localhost:5000",
      description: "Local development server",
    },
  ],
  tags: [
    { name: "Health" },
    { name: "Authentication" },
    { name: "Products" },
    { name: "Categories" },
    { name: "Stock" },
    { name: "Transactions" },
    { name: "Dashboard" },
    { name: "Users" },
  ],
  paths: {
    "/": {
      get: {
        tags: ["Health"],
        summary: "API health message",
        responses: {
          200: {
            description: "API is running",
            content: {
              "text/plain": {
                schema: {
                  type: "string",
                  example: "Stockify API is running...",
                },
              },
            },
          },
        },
      },
    },
    "/api/test-redis": {
      get: {
        tags: ["Health"],
        summary: "Test Redis connectivity",
        responses: {
          200: jsonResponse({
            type: "object",
            properties: {
              success: { type: "boolean", example: true },
              value: { type: "string", example: "stockify" },
            },
          }),
          503: errorResponse("Redis is not connected", "Redis unavailable"),
        },
      },
    },
    "/api/auth/register": {
      post: {
        tags: ["Authentication"],
        summary: "Register a new user",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/RegisterRequest" },
            },
          },
        },
        responses: {
          201: jsonResponse({ $ref: "#/components/schemas/AuthResponse" }),
          400: errorResponse("Name, email, and password are required"),
        },
      },
    },
    "/api/auth/login": {
      post: {
        tags: ["Authentication"],
        summary: "Login user",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/LoginRequest" },
            },
          },
        },
        responses: {
          200: jsonResponse({ $ref: "#/components/schemas/AuthResponse" }),
          400: errorResponse("Email and password are required"),
          401: errorResponse("Invalid email or password"),
        },
      },
    },
    "/api/auth/logout": {
      post: {
        tags: ["Authentication"],
        summary: "Logout current user",
        security: [{ bearerAuth: [] }],
        responses: {
          200: jsonResponse({ $ref: "#/components/schemas/MessageResponse" }),
          400: errorResponse("Token not found"),
          ...authErrorResponses,
        },
      },
    },
    "/api/auth/profile": {
      get: {
        tags: ["Authentication"],
        summary: "Get current user profile",
        security: [{ bearerAuth: [] }],
        responses: {
          200: jsonResponse({
            type: "object",
            properties: {
              success: { type: "boolean", example: true },
              data: { $ref: "#/components/schemas/User" },
            },
          }),
          ...authErrorResponses,
        },
      },
    },
    "/api/products": {
      get: {
        tags: ["Products"],
        summary: "List products",
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "category",
            in: "query",
            schema: { type: "string" },
            description: "Filter by category name",
          },
          {
            name: "lowStock",
            in: "query",
            schema: { type: "string", enum: ["true"] },
            description: "Return products with stock less than minimum stock",
          },
          {
            name: "search",
            in: "query",
            schema: { type: "string" },
            description: "Search by name or SKU",
          },
        ],
        responses: {
          200: jsonResponse({
            type: "object",
            properties: {
              success: { type: "boolean", example: true },
              source: { type: "string", example: "database" },
              data: {
                type: "array",
                items: { $ref: "#/components/schemas/Product" },
              },
            },
          }),
          ...authErrorResponses,
        },
      },
      post: {
        tags: ["Products"],
        summary: "Create product",
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "multipart/form-data": {
              schema: { $ref: "#/components/schemas/ProductFormRequest" },
            },
            "application/json": {
              schema: { $ref: "#/components/schemas/ProductRequest" },
            },
          },
        },
        responses: {
          201: jsonResponse({
            type: "object",
            properties: {
              success: { type: "boolean", example: true },
              message: { type: "string" },
              data: { $ref: "#/components/schemas/Product" },
            },
          }),
          400: errorResponse("Name, SKU, and category are required"),
          ...authErrorResponses,
        },
      },
    },
    "/api/products/{id}": {
      get: {
        tags: ["Products"],
        summary: "Get product by ID",
        security: [{ bearerAuth: [] }],
        parameters: [{ $ref: "#/components/parameters/ObjectId" }],
        responses: {
          200: jsonResponse({
            type: "object",
            properties: {
              success: { type: "boolean", example: true },
              source: { type: "string", example: "database" },
              data: { $ref: "#/components/schemas/Product" },
            },
          }),
          404: errorResponse("Product not found"),
          ...authErrorResponses,
        },
      },
      put: {
        tags: ["Products"],
        summary: "Update product",
        security: [{ bearerAuth: [] }],
        parameters: [{ $ref: "#/components/parameters/ObjectId" }],
        requestBody: {
          required: true,
          content: {
            "multipart/form-data": {
              schema: { $ref: "#/components/schemas/ProductFormRequest" },
            },
            "application/json": {
              schema: { $ref: "#/components/schemas/ProductRequest" },
            },
          },
        },
        responses: {
          200: jsonResponse({
            type: "object",
            properties: {
              success: { type: "boolean", example: true },
              message: { type: "string" },
              data: { $ref: "#/components/schemas/Product" },
            },
          }),
          400: errorResponse("SKU already exists"),
          404: errorResponse("Product not found"),
          ...authErrorResponses,
        },
      },
      delete: {
        tags: ["Products"],
        summary: "Delete product",
        security: [{ bearerAuth: [] }],
        parameters: [{ $ref: "#/components/parameters/ObjectId" }],
        responses: {
          200: jsonResponse({ $ref: "#/components/schemas/MessageResponse" }),
          404: errorResponse("Product not found"),
          ...authErrorResponses,
        },
      },
    },
    "/api/categories": {
      get: {
        tags: ["Categories"],
        summary: "List categories",
        security: [{ bearerAuth: [] }],
        responses: {
          200: jsonResponse({
            type: "object",
            properties: {
              success: { type: "boolean", example: true },
              data: {
                type: "array",
                items: { $ref: "#/components/schemas/Category" },
              },
            },
          }),
          ...authErrorResponses,
        },
      },
      post: {
        tags: ["Categories"],
        summary: "Create category",
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/CategoryRequest" },
            },
          },
        },
        responses: {
          201: jsonResponse({
            type: "object",
            properties: {
              success: { type: "boolean", example: true },
              message: { type: "string" },
              data: { $ref: "#/components/schemas/Category" },
            },
          }),
          400: errorResponse("Category name is required"),
          ...adminErrorResponses,
        },
      },
    },
    "/api/categories/{id}": {
      put: {
        tags: ["Categories"],
        summary: "Update category",
        security: [{ bearerAuth: [] }],
        parameters: [{ $ref: "#/components/parameters/ObjectId" }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/CategoryRequest" },
            },
          },
        },
        responses: {
          200: jsonResponse({
            type: "object",
            properties: {
              success: { type: "boolean", example: true },
              message: { type: "string" },
              data: { $ref: "#/components/schemas/Category" },
            },
          }),
          404: errorResponse("Category not found"),
          ...adminErrorResponses,
        },
      },
      delete: {
        tags: ["Categories"],
        summary: "Delete category",
        security: [{ bearerAuth: [] }],
        parameters: [{ $ref: "#/components/parameters/ObjectId" }],
        responses: {
          200: jsonResponse({ $ref: "#/components/schemas/MessageResponse" }),
          400: errorResponse("Category is used by products and cannot be deleted"),
          404: errorResponse("Category not found"),
          ...adminErrorResponses,
        },
      },
    },
    "/api/stock/in": {
      post: {
        tags: ["Stock"],
        summary: "Record stock in",
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/StockRequest" },
            },
          },
        },
        responses: {
          201: jsonResponse({ $ref: "#/components/schemas/StockResponse" }),
          400: errorResponse("Product and positive quantity are required"),
          404: errorResponse("Product not found"),
          ...authErrorResponses,
        },
      },
    },
    "/api/stock/out": {
      post: {
        tags: ["Stock"],
        summary: "Record stock out",
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/StockRequest" },
            },
          },
        },
        responses: {
          201: jsonResponse({ $ref: "#/components/schemas/StockResponse" }),
          400: errorResponse("Insufficient stock"),
          404: errorResponse("Product not found"),
          ...authErrorResponses,
        },
      },
    },
    "/api/transactions": {
      get: {
        tags: ["Transactions"],
        summary: "List stock transactions",
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "type",
            in: "query",
            schema: { type: "string", enum: ["IN", "OUT"] },
          },
          {
            name: "product",
            in: "query",
            schema: { type: "string" },
            description: "Product object ID",
          },
        ],
        responses: {
          200: jsonResponse({
            type: "object",
            properties: {
              success: { type: "boolean", example: true },
              data: {
                type: "array",
                items: { $ref: "#/components/schemas/StockTransaction" },
              },
            },
          }),
          ...authErrorResponses,
        },
      },
    },
    "/api/dashboard/summary": {
      get: {
        tags: ["Dashboard"],
        summary: "Get inventory dashboard summary",
        security: [{ bearerAuth: [] }],
        responses: {
          200: jsonResponse({
            type: "object",
            properties: {
              success: { type: "boolean", example: true },
              source: { type: "string", example: "database" },
              data: { $ref: "#/components/schemas/DashboardSummary" },
            },
          }),
          ...authErrorResponses,
        },
      },
    },
    "/api/users": {
      get: {
        tags: ["Users"],
        summary: "List users",
        security: [{ bearerAuth: [] }],
        responses: {
          200: jsonResponse({
            type: "object",
            properties: {
              success: { type: "boolean", example: true },
              data: {
                type: "array",
                items: { $ref: "#/components/schemas/User" },
              },
            },
          }),
          ...adminErrorResponses,
        },
      },
    },
    "/api/users/{id}": {
      put: {
        tags: ["Users"],
        summary: "Update user",
        security: [{ bearerAuth: [] }],
        parameters: [{ $ref: "#/components/parameters/ObjectId" }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/UserUpdateRequest" },
            },
          },
        },
        responses: {
          200: jsonResponse({
            type: "object",
            properties: {
              success: { type: "boolean", example: true },
              message: { type: "string" },
              data: { $ref: "#/components/schemas/User" },
            },
          }),
          400: errorResponse("Email already registered"),
          404: errorResponse("User not found"),
          ...adminErrorResponses,
        },
      },
      delete: {
        tags: ["Users"],
        summary: "Delete user",
        security: [{ bearerAuth: [] }],
        parameters: [{ $ref: "#/components/parameters/ObjectId" }],
        responses: {
          200: jsonResponse({ $ref: "#/components/schemas/MessageResponse" }),
          400: errorResponse("You cannot delete your own account"),
          404: errorResponse("User not found"),
          ...adminErrorResponses,
        },
      },
    },
  },
  components: {
    securitySchemes: {
      bearerAuth: {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT",
      },
    },
    parameters: {
      ObjectId: {
        name: "id",
        in: "path",
        required: true,
        schema: { type: "string", example: "665f1c8d9a9b4e0012a34567" },
      },
    },
    schemas: {
      MessageResponse: {
        type: "object",
        properties: {
          success: { type: "boolean", example: true },
          message: { type: "string", example: "Operation success" },
        },
      },
      ErrorResponse: {
        type: "object",
        properties: {
          success: { type: "boolean", example: false },
          message: {
            type: "string",
            example: "Request could not be processed",
          },
        },
      },
      RegisterRequest: {
        type: "object",
        required: ["name", "email", "password"],
        properties: {
          name: { type: "string", example: "Admin Stockify" },
          email: { type: "string", format: "email", example: "admin@mail.com" },
          password: { type: "string", format: "password", example: "secret123" },
          role: { type: "string", enum: ["admin", "staff"], example: "staff" },
        },
      },
      LoginRequest: {
        type: "object",
        required: ["email", "password"],
        properties: {
          email: { type: "string", format: "email", example: "admin@mail.com" },
          password: { type: "string", format: "password", example: "secret123" },
        },
      },
      AuthResponse: {
        type: "object",
        properties: {
          success: { type: "boolean", example: true },
          message: { type: "string", example: "Login success" },
          data: {
            type: "object",
            properties: {
              id: { type: "string", example: "665f1c8d9a9b4e0012a34567" },
              name: { type: "string", example: "Admin Stockify" },
              email: {
                type: "string",
                format: "email",
                example: "admin@mail.com",
              },
              role: { type: "string", enum: ["admin", "staff"] },
              token: { type: "string", example: "jwt.token.value" },
            },
          },
        },
      },
      User: {
        type: "object",
        properties: {
          _id: { type: "string", example: "665f1c8d9a9b4e0012a34567" },
          name: { type: "string", example: "Admin Stockify" },
          email: { type: "string", format: "email", example: "admin@mail.com" },
          role: { type: "string", enum: ["admin", "staff"], example: "admin" },
          createdAt: { type: "string", format: "date-time" },
          updatedAt: { type: "string", format: "date-time" },
        },
      },
      UserUpdateRequest: {
        type: "object",
        properties: {
          name: { type: "string", example: "Staff Updated" },
          email: { type: "string", format: "email", example: "staff@mail.com" },
          password: { type: "string", format: "password", example: "newsecret123" },
          role: { type: "string", enum: ["admin", "staff"], example: "staff" },
        },
      },
      Product: {
        type: "object",
        properties: {
          _id: { type: "string", example: "665f1c8d9a9b4e0012a34567" },
          name: { type: "string", example: "Keyboard Mechanical" },
          sku: { type: "string", example: "KB-001" },
          category: { type: "string", example: "Electronics" },
          stock: { type: "number", example: 25 },
          minimumStock: { type: "number", example: 5 },
          unit: { type: "string", example: "pcs" },
          price: { type: "number", example: 250000 },
          description: { type: "string", example: "Keyboard for office use" },
          imageUrl: { type: "string", example: "https://res.cloudinary.com/..." },
          imagePublicId: { type: "string", example: "stockify/products/abc" },
          createdAt: { type: "string", format: "date-time" },
          updatedAt: { type: "string", format: "date-time" },
        },
      },
      ProductRequest: {
        type: "object",
        required: ["name", "sku", "category"],
        properties: {
          name: { type: "string", example: "Keyboard Mechanical" },
          sku: { type: "string", example: "KB-001" },
          category: { type: "string", example: "Electronics" },
          stock: { type: "number", example: 25 },
          minimumStock: { type: "number", example: 5 },
          unit: { type: "string", example: "pcs" },
          price: { type: "number", example: 250000 },
          description: { type: "string", example: "Keyboard for office use" },
        },
      },
      ProductFormRequest: {
        allOf: [
          { $ref: "#/components/schemas/ProductRequest" },
          {
            type: "object",
            properties: {
              image: {
                type: "string",
                format: "binary",
                description: "Product image file",
              },
            },
          },
        ],
      },
      Category: {
        type: "object",
        properties: {
          _id: { type: "string", example: "665f1c8d9a9b4e0012a34567" },
          name: { type: "string", example: "Electronics" },
          description: { type: "string", example: "Electronic products" },
          createdAt: { type: "string", format: "date-time" },
          updatedAt: { type: "string", format: "date-time" },
        },
      },
      CategoryRequest: {
        type: "object",
        required: ["name"],
        properties: {
          name: { type: "string", example: "Electronics" },
          description: { type: "string", example: "Electronic products" },
        },
      },
      StockRequest: {
        type: "object",
        required: ["product", "quantity"],
        properties: {
          product: { type: "string", example: "665f1c8d9a9b4e0012a34567" },
          quantity: { type: "number", example: 10 },
          note: { type: "string", example: "Initial stock" },
        },
      },
      StockTransaction: {
        type: "object",
        properties: {
          _id: { type: "string", example: "665f1c8d9a9b4e0012a34567" },
          product: { oneOf: [{ type: "string" }, { $ref: "#/components/schemas/Product" }] },
          type: { type: "string", enum: ["IN", "OUT"], example: "IN" },
          quantity: { type: "number", example: 10 },
          note: { type: "string", example: "Initial stock" },
          createdBy: { oneOf: [{ type: "string" }, { $ref: "#/components/schemas/User" }] },
          createdAt: { type: "string", format: "date-time" },
          updatedAt: { type: "string", format: "date-time" },
        },
      },
      StockResponse: {
        type: "object",
        properties: {
          success: { type: "boolean", example: true },
          message: { type: "string", example: "Stock in recorded successfully" },
          data: {
            type: "object",
            properties: {
              product: { $ref: "#/components/schemas/Product" },
              transaction: { $ref: "#/components/schemas/StockTransaction" },
            },
          },
        },
      },
      DashboardSummary: {
        type: "object",
        properties: {
          totalProducts: { type: "number", example: 12 },
          totalCategories: { type: "number", example: 4 },
          totalStock: { type: "number", example: 320 },
          inventoryValue: { type: "number", example: 8500000 },
          lowStockCount: { type: "number", example: 2 },
          lowStockProducts: {
            type: "array",
            items: { $ref: "#/components/schemas/Product" },
          },
          recentTransactions: {
            type: "array",
            items: { $ref: "#/components/schemas/StockTransaction" },
          },
        },
      },
    },
  },
};

export default openApiSpec;
