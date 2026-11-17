# Feature: Prepare payment details

## 1. User goal
Pet owners want to review the service they selected and the amount they will
pay before making a payment. This feature only prepares the payment details.
It does not charge any money.

## 2. Scope
The feature will:
- Accept a service ID in the URL.
- Look the service up in a mock catalogue stored on the server.
- Return the payment details as JSON, with the price taken from the catalogue.

The feature will NOT:
- Charge money or process a payment.
- Connect to a payment gateway.
- Create new database tables.
- Create new pages.
- Require login.
- Accept a price or amount from the client.

## 3. Request
- Method and URL: `GET /payments/prepare/:serviceId`
- Input: `serviceId` in the URL path
- No request body. No login needed.
- The server ignores any client-supplied amount. The price always comes from the catalogue.

## 4. Service catalogue
| ID (number) | Service name (string) | Price (number) |
| --- | --- | --- |
| 1 | Vaccination | 35 |
| 2 | Pet Grooming | 50 |
| 3 | Boarding | 80 |

## 5. Successful response
- HTTP status: 200
- Content type: JSON
- Exactly five fields:

```json
{
  "serviceId": 1,
  "serviceName": "Vaccination",
  "amount": 35,
  "currency": "sgd",
  "status": "READY_FOR_PAYMENT"
}
```

- `serviceId` and `amount` are numbers (35 is a number, not "35.00").
- `serviceName`, `currency`, and `status` are strings.
- `currency` is always exactly `sgd`.
- `status` is always exactly `READY_FOR_PAYMENT`.

## 6. Unsuccessful response
If the service ID does not exist in the catalogue:
- HTTP status: 404
- Body: `{"error":"Service not found"}`

## 7. Acceptance criteria
- AC1: When service ID 1 is requested, return 200 with serviceName "Vaccination" and amount 35.
- AC2: When service ID 2 is requested, return 200 with serviceName "Pet Grooming" and amount 50.
- AC3: When service ID 3 is requested, return 200 with serviceName "Boarding" and amount 80.
- AC4: When service ID 999 is requested, return 404 with `{"error":"Service not found"}`.
- AC5: Any successful response has exactly 5 fields, with the correct types and the fixed values.

## 8. Open questions
- What should happen if the ID is not a number
