# Service Booking Feature Specification

## Overview
This feature adds a pet service booking experience to the PetCare MVC application. It allows a signed-in customer to browse the active service catalogue, select a pet and date, create a booking, and view only their own booking history. The feature must integrate with the existing session-based authentication flow and the MySQL schema extension defined in `db-lesson08-extension.sql` without disturbing existing users, pets, journal entries, or unrelated application data.

## Scope
The feature covers:
- viewing available services
- creating a booking tied to a valid pet and service
- validating booking input before recording anything
- recording the service price at booking time
- creating a corresponding payment record as a pending payment
- showing booking history filtered to the current logged-in owner

The feature does not include:
- destructive database reset scripts
- changing the login or admin flows
- broad changes to unrelated journal, pet, or payment features

## Business Rules
1. Only authenticated users can access the services and booking pages.
2. The service list must display only active services (`is_active = 1`).
3. Services should be sorted by service name for predictable presentation.
4. The booking form must require a valid pet, a valid service, and a real future booking date.
5. `service_bookings` stores the booked price at the time of booking, not a later runtime price.
6. `payments` must be created with the same amount as the booking and remain in a pending state until the payment flow is handled elsewhere.
7. Booking history must be owner-scoped and must not expose other customers' records.
8. If validation fails or a pet/service is invalid, the user must be redirected back to the service page with an error flash message.

## Acceptance Criteria
AC1: Signed-in users can open the service catalogue page and see all active services.

AC2: The catalogue shows only usable services and orders them consistently by name.

AC3: A signed-in user can submit a booking using a valid pet, selected service, and booking date.

AC4: Invalid or missing pet/service/date data is rejected and the user is returned to the service page with a clear error message.

AC5: Past dates are rejected and a valid date must be today or later.

AC6: A booking record is created together with a payment record in one database transaction, and the booked amount is taken from the service's stored price.

AC7: The booking history page displays only the current owner's bookings and includes service, pet, booked price, booking status, and payment status.

AC8: The flow integrates cleanly with the app's session and navigation pattern and does not break unrelated features.

## User Journey
1. User signs in.
2. User opens the Services page.
3. User selects a pet, selects a service, and chooses a booking date.
4. App validates the data.
5. App inserts a service booking and a pending payment record.
6. User is redirected to their Bookings page.
7. User can review their booking history and payment status.

## Data Contract
The extension script creates the following tables:
- `services`
- `service_bookings`
- `payments`

Required relationships:
- `service_bookings.pet_id` references `pets.id`
- `service_bookings.service_id` references `services.id`
- `payments.booking_id` references `service_bookings.id`

Important constraint:
- the provided extension script is additive; it must preserve all existing Lesson 06 data and must not drop tables or reset data.

## Non-functional Requirements
- Keep the existing CommonJS MVC structure.
- Reuse the existing `req.session.user` auth flow.
- Use flash messages for validation and success states.
- Use the database price, not client-provided price values.
- Preserve unrelated routes, controllers, models, and templates.
