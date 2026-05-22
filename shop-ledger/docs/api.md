# Shop Ledger API

Base URL: `/api`

All routes (except `/healthz`, `/auth/register`, `/auth/login`) require an `Authorization: Bearer <token>` header obtained from `/auth/login` or `/auth/register`.

## Health
| Method | Path           | Description                  |
| ------ | -------------- | ---------------------------- |
| GET    | `/healthz`     | Liveness check.              |

## Auth
| Method | Path              | Description                          |
| ------ | ----------------- | ------------------------------------ |
| POST   | `/auth/register`  | Create a new shop owner account.     |
| POST   | `/auth/login`     | Exchange credentials for a JWT.      |
| GET    | `/auth/me`        | Get the current authenticated user.  |
| POST   | `/auth/logout`    | Stateless logout.                    |

Request body for `register` and `login`:
```json
{ "email": "you@example.com", "password": "min-8-chars", "firstName": "Raju", "lastName": "Sharma" }
```
Response:
```json
{ "token": "eyJhbGc...", "user": { "id": "...", "email": "...", "firstName": "...", "lastName": null, "createdAt": "..." } }
```

## Categories
| Method | Path                  | Description                |
| ------ | --------------------- | -------------------------- |
| GET    | `/categories`         | List categories.           |
| POST   | `/categories`         | Create a category.         |
| PATCH  | `/categories/:id`     | Update a category.         |
| DELETE | `/categories/:id`     | Delete a category.         |

Body: `{ "name": "Vegetables", "color": "#81B29A" }`

## Sales
| Method | Path                | Query                  | Description           |
| ------ | ------------------- | ---------------------- | --------------------- |
| GET    | `/sales`            | `?from=&to=`           | List sales.           |
| POST   | `/sales`            |                        | Create a sale.        |
| PATCH  | `/sales/:id`        |                        | Update a sale.        |
| DELETE | `/sales/:id`        |                        | Delete a sale.        |

Body: `{ "amount": 250.00, "note": "Evening rush", "date": "2026-04-29" }`

## Expenses
| Method | Path                 | Query                       | Description           |
| ------ | -------------------- | --------------------------- | --------------------- |
| GET    | `/expenses`          | `?categoryId=&from=&to=`    | List expenses.        |
| POST   | `/expenses`          |                             | Create an expense.    |
| PATCH  | `/expenses/:id`      |                             | Update an expense.    |
| DELETE | `/expenses/:id`      |                             | Delete an expense.    |

Body: `{ "amount": 60.00, "categoryId": 2, "note": "Onions", "date": "2026-04-29" }`

## Investments
| Method | Path                   | Query           | Description           |
| ------ | ---------------------- | --------------- | --------------------- |
| GET    | `/investments`         | `?from=&to=`    | List investments.     |
| POST   | `/investments`         |                 | Create an investment. |
| PATCH  | `/investments/:id`     |                 | Update an investment. |
| DELETE | `/investments/:id`     |                 | Delete an investment. |

Body: `{ "amount": 1500.00, "note": "New kadhai", "date": "2026-04-29" }`

## Settings
| Method | Path        | Description           |
| ------ | ----------- | --------------------- |
| GET    | `/settings` | Get shop settings.    |
| PATCH  | `/settings` | Update shop settings. |

Body: `{ "shopName": "Raju Chaat Corner", "currency": "INR", "currencySymbol": "₹" }`

## Dashboard
| Method | Path                            | Description                                |
| ------ | ------------------------------- | ------------------------------------------ |
| GET    | `/dashboard/summary`            | Today + this-month rollups.                |
| GET    | `/dashboard/expense-breakdown`  | Expenses grouped by category.              |
| GET    | `/dashboard/insights`           | Best day, top expense, average profit, etc.|
| GET    | `/dashboard/recent-activity`    | Latest sales/expenses/investments mixed.   |

## Reports
| Method | Path                | Query                          | Description                        |
| ------ | ------------------- | ------------------------------ | ---------------------------------- |
| GET    | `/reports/period`   | `?period=daily\|monthly\|yearly` | Bucketed financial summary.        |

Response:
```json
{
  "period": "daily",
  "from": "2026-03-31",
  "to": "2026-04-29",
  "buckets": [
    { "key": "2026-04-29", "label": "Apr 29", "date": "2026-04-29", "sales": 0, "expenses": 0, "investments": 0, "profit": 0 }
  ]
}
```

## Errors
All errors return:
```json
{ "error": "Human-readable message", "details": { "...": "optional" } }
```
With these status codes: `400` validation, `401` auth, `403` forbidden, `404` not found, `409` conflict, `500` server.
