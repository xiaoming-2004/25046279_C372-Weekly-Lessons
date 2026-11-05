# Feature: Prepare payment details

## 1. User goal

A pet owner wants to review the selected pet service and amount before making payment.

## 2. Scope

The feature prepares payment details using a mock service catalogue.

It returns the service details, amount, currency and payment status in JSON format.

It does not charge money, connect to a payment gateway, create database tables or create EJS pages.

No login is required for this classroom mock endpoint.

## 3. Request

The endpoint uses:

GET /payments/prepare/:serviceId

The service ID is provided in the URL.

The server must use the price from the mock catalogue and must not accept an amount supplied by the client.

## 4. Service catalogue

| Service ID | Service name | Price |
|---|---|---:|
| 1 | Vaccination | 35 |
| 2 | Pet Grooming | 50 |
| 3 | Boarding | 80 |

The service ID and price are numbers. The service name is a string.

## 5. Successful response

A valid service ID returns HTTP 200 with exactly five JSON fields.

Example for service ID 1:

{
  "serviceId": 1,
  "serviceName": "Vaccination",
  "amount": 35,
  "currency": "sgd",
  "status": "READY_FOR_PAYMENT"
}

The serviceId and amount fields are numbers.

The serviceName, currency and status fields are strings.

The currency must be "sgd" and the status must be "READY_FOR_PAYMENT".

## 6. Unsuccessful response

If the requested service ID does not match a service in the mock catalogue, the server returns HTTP 404.

The response contains exactly one JSON field called error. Its value must be the string "Service not found".

{
  "error": "Service not found"
}

Handling other invalid input formats and unexpected server errors is outside the agreed classroom scope.

## 7. Acceptance criteria

- AC1: Service ID 1 returns HTTP 200, Vaccination and amount 35.
- AC2: Service ID 2 returns HTTP 200, Pet Grooming and amount 50.
- AC3: Service ID 3 returns HTTP 200, Boarding and amount 80.
- AC4: Service ID 999 returns HTTP 404 with {"error":"Service not found"}.
- AC5: Every successful response contains exactly five fields with the correct data types, currency "sgd" and status "READY_FOR_PAYMENT".

## 8. Open questions

There are no unresolved questions for the agreed classroom scope.