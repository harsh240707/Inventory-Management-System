
# Inventory and Data Management System

## Project Overview
A RESTful backend application developed using Node.js, Express.js, MongoDB and Mongoose to manage store and warehouse inventory.

## Technologies Used
- Node.js
- Express.js
- MongoDB
- Mongoose
- dotenv
- Postman

## Features
- Create, read, update and delete products.
- Product schema and field-level validation.
- Search and filter products.
- Sorting and pagination.
- Stock restocking and sales.
- Low-stock alert report.
- Category-wise inventory summary using aggregation.
- Centralized error handling.

## Project Structure
- models: Product schema
- routes: Product API endpoints
- middleware: Error handling
- server.js: Main application
- .env: Environment configuration
- screenshots: API testing evidence

## Installation

1. Clone the repository.
2. Install dependencies:

   npm install

3. Create a .env file:

   PORT=5000
   MONGO_URI=mongodb://127.0.0.1:27017/inventoryDB

4. Start MongoDB Server.
5. Run the application:

   npm start

## API Base URL
http://localhost:5000/api/products

## API Operations
- POST /api/products
- GET /api/products
- GET /api/products/:id
- PUT /api/products/:id
- DELETE /api/products/:id
- PATCH /api/products/:id/restock
- PATCH /api/products/:id/sale
- GET /api/products/reports/low-stock
- GET /api/products/reports/category-summary

## Developer
Harsh Yadav
