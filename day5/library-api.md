# Library Books REST API Design

This document outlines the RESTful API endpoints for managing the books resource in a library system.

## API Endpoints

- **List All Books**
  - **Method:** `GET`
  - **Path:** `/api/books`
  - **Description:** Retrieves a list of all available books in the library.
  - **Success Code:** `200 OK`

- **Get a Single Book**
  - **Method:** `GET`
  - **Path:** `/api/books/:id`
  - **Description:** Retrieves details for a specific book by its unique ID.
  - **Success Code:** `200 OK`

- **Create a New Book**
  - **Method:** `POST`
  - **Path:** `/api/books`
  - **Description:** Adds a new book entry to the library catalog.
  - **Request Body Example:**
    ```json
    {
      "title": "The Pragmatic Programmer",
      "author": "Andrew Hunt",
      "publishedYear": 1999,
      "isbn": "978-0201616224"
    }
    ```
  - **Success Code:** `201 Created`

- **Update an Existing Book**
  - **Method:** `PUT`
  - **Path:** `/api/books/:id`
  - **Description:** Updates the full record of an existing book specified by ID.
  - **Request Body Example:**
    ```json
    {
      "title": "The Pragmatic Programmer: 20th Anniversary Edition",
      "author": "Andrew Hunt",
      "publishedYear": 2019,
      "isbn": "978-0135957059"
    }
    ```
  - **Success Code:** `200 OK`

- **Delete a Book**
  - **Method:** `DELETE`
  - **Path:** `/api/books/:id`
  - **Description:** Removes a book record permanently from the library catalog.
  - **Success Code:** `200 OK` (or `204 No Content`)

- **List Books by Author (Query Parameter)**
  - **Method:** `GET`
  - **Path:** `/api/books?author=Andrew+Hunt`
  - **Description:** Retrieves books filtered by author name using a query string.
  - **Success Code:** `200 OK`

---

## Error Handling & Status Codes

- **HTTP 400 Bad Request**
  - **Trigger Condition:** Occurs when the request body or parameters are malformed, invalid, or missing required fields.
  - **Example:** Submitting a `POST /api/books` request without the mandatory `"title"` field in the JSON payload.

- **HTTP 404 Not Found**
  - **Trigger Condition:** Occurs when the requested resource or URL path does not exist in the database.
  - **Example:** Sending a `GET /api/books/99999` request when no book exists with ID `99999`.
