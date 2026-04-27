# Explit

A production-oriented MERN stack app for tracking shared group expenses and computing simplified settlement transactions with a greedy max-creditor/max-debtor algorithm.

## Folder Structure

```text
expense-splitter/
  backend/
    src/
      config/              MongoDB connection
      controllers/         Request handlers
      middleware/          JWT auth, group authorization, errors
      models/              Mongoose models
      routes/              Express routers
      services/            Nodemailer integration
      tests/               Jest tests
      utils/               Pure debt simplification utility
  frontend/
    src/
      api/                 Fetch client
      components/          Reusable UI components
      context/             Auth context
      pages/               Login, dashboard, group page
```

## Core Algorithm

`backend/src/utils/debtSimplifier.js` exposes `simplifyDebts(balances)`.

Input:

```js
[
  { userId: "alice", balance: 50 },
  { userId: "bob", balance: -50 }
]
```

Positive balances are creditors. Negative balances are debtors. The utility stores creditors and debtors in binary max-heaps, repeatedly matches the largest debtor with the largest creditor, records the payment, and pushes any remainder back into the appropriate heap. Complexity is `O(n log n)`.

Output:

```js
[{ fromUser: "bob", toUser: "alice", amount: 50 }]
```

## Backend API

All protected endpoints require:

```http
Authorization: Bearer <jwt>
```

### Auth

`POST /api/auth/google`

Body:

```json
{ "credential": "google-id-token-from-frontend" }
```

Returns a JWT and user profile.

`GET /api/auth/me`

Returns the current authenticated user.

### Groups

`GET /api/groups`

Lists groups where the current user is a member.

`POST /api/groups`

```json
{ "name": "Goa Trip" }
```

`GET /api/groups/:groupId`

Returns group details. Requires membership.

`POST /api/groups/:groupId/members`

```json
{ "email": "friend@example.com" }
```

The user must have logged in once before they can be added.

`DELETE /api/groups/:groupId/members/:memberId`

Removes a member from a group.

### Expenses

`GET /api/expenses/group/:groupId`

Lists expenses for a group.

`POST /api/expenses`

```json
{
  "groupId": "groupObjectId",
  "payer": "userObjectId",
  "amount": 1200,
  "splitBetween": ["userObjectId1", "userObjectId2"]
}
```

Creates an equal-split expense and sends email notifications to group members other than the payer when Gmail SMTP is configured.

### Settlements

`GET /api/settlements/group/:groupId`

Returns raw balances, simplified settlement suggestions, and settlement history.

`POST /api/settlements`

```json
{
  "groupId": "groupObjectId",
  "fromUser": "debtorUserObjectId",
  "toUser": "creditorUserObjectId",
  "amount": 600,
  "status": "settled"
}
```

Records a settlement.

`PATCH /api/settlements/:settlementId/group/:groupId/settle`

Marks an existing pending settlement as settled.

## Local Setup

1. Install dependencies:

```bash
npm run install:all
```

2. Create backend env:

```bash
cp backend/.env.example backend/.env
```

Set `MONGO_URI`, `JWT_SECRET`, `GOOGLE_CLIENT_ID`, and Gmail SMTP values. For Gmail, create an app password from your Google account security settings.

3. Create frontend env:

```bash
cp frontend/.env.example frontend/.env
```

Set the same Google OAuth client ID in `VITE_GOOGLE_CLIENT_ID`.

4. Start the backend:

```bash
npm run dev:backend
```

5. Start the frontend in another terminal:

```bash
npm run dev:frontend
```

Frontend: `http://localhost:5173`

Backend health check: `http://localhost:5000/api/health`

## Tests

Run algorithm tests:

```bash
npm test --prefix backend
```

Covered scenarios:

- Simple one debtor and one creditor
- Multiple creditors and debtors
- Zero and sub-cent balances
- Decimal money values

## Deployment Notes

- Backend can deploy to Render using `backend` as the root directory and `npm start`.
- Frontend can deploy to Vercel using `frontend` as the root directory and `npm run build`.
- Use MongoDB Atlas for `MONGO_URI`.
- Configure OAuth authorized JavaScript origins and redirect origins for local and deployed frontend URLs.
