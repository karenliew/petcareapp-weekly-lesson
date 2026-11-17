# Service Booking Implementation Specification

## Goal
Implement the service booking feature in the existing Express MVC app using the provided database extension and the current session-auth pattern. The implementation must be limited to the service-booking flow and must preserve unrelated features.

## Source Review
Before coding, review the following artifacts:
- `db-lesson08-extension.sql`
- `views/services.ejs`
- `views/bookings.ejs`
- `app.js`
- `routes/*`
- current controller/model patterns for pets, journals, and admin flows

## Required Files to Create or Update
### Create / update route files
- `routes/serviceRoutes.js`
- `routes/bookingRoutes.js`

### Create / update controller files
- `controllers/serviceController.js`
- `controllers/bookingController.js`

### Create / update model files
- `models/serviceModel.js`
- `models/serviceBookingModel.js`

### Update app bootstrap
- `app.js` to mount the new service and booking routes

### Update view files
- `views/services.ejs`
- `views/bookings.ejs`
- `views/partials/navbar.ejs`

### Add verification coverage
- `tests/service-booking.test.js`

## MVC Connection Plan
### Routes
- `GET /services` -> `serviceController.listServices`
- `POST /services/book` -> `serviceController.createBooking`
- `GET /bookings` -> `bookingController.listBookings`

These routes should follow the same auth protection pattern as the rest of the app (`isLoggedIn` middleware).

### Controller responsibilities
#### `serviceController.js`
- ensure a signed-in session exists
- load the current user's pets
- load active services
- validate the selected pet, selected service, and booking date
- call the service-booking model to create the booking and payment record
- redirect with flash messages on success or failure

#### `bookingController.js`
- ensure signed-in user access
- load bookings associated with the logged-in user
- pass booking and payment details into the `bookings` EJS template

### Model responsibilities
#### `serviceModel.js`
- query only active services
- sort records by service name
- expose the service lookup used during booking validation

#### `serviceBookingModel.js`
- validate positive integer IDs and real date strings
- reject past dates
- verify the pet belongs to the logged-in user
- verify the selected service is active and available
- create the booking and payment in a single transaction using the service price
- return the booking/payment IDs on success and `null` on validation failure

## EJS Locals and Template Behavior
### `services.ejs`
Required locals:
- `pets`
- `services`
- `selectedPetId`
- `today`
- `messages`
- `errors`
- `session`

Required UI behaviors:
- show a service card/list with active services only
- allow each service to be booked using a pet and date
- show flash success and error messages
- redirect invalid bookings back to `/services`

### `bookings.ejs`
Required locals:
- `bookings`
- `messages`
- `errors`

Required UI behaviors:
- show the current user’s bookings only
- display pet name, service name, booked price, booking status, and payment status
- show an empty-state when no bookings exist

### `navbar.ejs`
- add navigation links for `Services` and `Bookings` for logged-in users
- keep the existing navigation pattern intact for unrelated sections

## Setup and Database Requirements
1. Run the additive schema from `db-lesson08-extension.sql` once in MySQL Workbench against the project database.
2. Use the existing database connection object and CommonJS pattern already used by the app.
3. Do not re-run any full reset script that drops tables.
4. Confirm the existence of the `services`, `service_bookings`, and `payments` tables before testing the booking flow.

## Conflicts and Risks to Watch
- The project already has a `services` directory under the app root; do not confuse it with the catalogue tables or route logic.
- Route naming must not conflict with journal or payment endpoints.
- Session auth must remain the only gate for unauthenticated access.
- The application should not trust client-submitted pricing; it must use the database service price.
- Existing user and pet records must remain untouched; no destructive data changes.

## Verification Plan for AC1–AC8
### AC1
- Log in as a valid user.
- Navigate to `/services`.
- Verify page loads and shows service cards.

### AC2
- Confirm only active services appear.
- Confirm they are sorted by service name.

### AC3
- Select a valid pet and booking date.
- Submit a booking.
- Verify redirect to `/bookings` and success message.

### AC4
- Submit missing or invalid values.
- Verify redirect to `/services` and error flash message.

### AC5
- Try a past date.
- Verify booking is rejected.

### AC6
- Check the database after a successful booking.
- Confirm a row exists in `service_bookings` and a corresponding row exists in `payments`.
- Confirm `booked_price` equals the service price from `services`.

### AC7
- Create bookings for multiple users/pets if available.
- Verify the booking history page and query restrict results to the current session user only.

### AC8
- Check that login, journal, pet, and payment-related features continue to work after the new route registration and navbar updates.

## Regression Test Recommendations
Run focused checks to confirm there are no regressions in:
- login and logout
- pet creation and listing
- journal creation and display
- admin features
- payment prepare contract

Recommended test coverage:
- invalid date rejected
- service unavailable rejected
- pet owned by another user rejected
- success path redirects to bookings
- missing user session redirects to login
- owner-only booking query returns only the current user's bookings

## Implementation Notes
- Use `req.session.user.id` for ownership checks.
- Keep validation in one place and keep the controller logic readable.
- Follow the app’s current callback-based DB usage conventions.
- Prefer transaction-scoped creation for booking + payment record insertion.
- Keep flash messaging consistent with the rest of the application.
