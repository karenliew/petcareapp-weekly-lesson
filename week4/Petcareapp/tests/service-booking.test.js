const assert = require('node:assert/strict');

const paymentController = require('../controllers/paymentController');
const serviceControllerPath = require.resolve('../controllers/serviceController');
const serviceBookingModelPath = require.resolve('../models/serviceBookingModel');

function createRes() {
  return {
    redirectCalled: null,
    statusCode: null,
    jsonArgs: null,
    status(code) {
      this.statusCode = code;
      return this;
    },
    redirect(url) {
      this.redirectCalled = url;
      return this;
    },
    render(view, data) {
      this.renderArgs = { view, data };
      return this;
    },
    json(data) {
      this.jsonArgs = data;
      return this;
    },
    send(data) {
      this.jsonArgs = data;
      return this;
    }
  };
}

function withMockedModule(modulePath, exportsValue, callback) {
  const original = require.cache[modulePath];
  require.cache[modulePath] = {
    id: modulePath,
    filename: modulePath,
    loaded: true,
    exports: exportsValue
  };

  try {
    callback();
  } finally {
    if (original) {
      require.cache[modulePath] = original;
    } else {
      delete require.cache[modulePath];
    }
  }
}

function testPreparePaymentContract() {
  const req = { params: { serviceId: '1' } };
  const res = createRes();

  paymentController.preparePayment(req, res);

  assert.equal(res.jsonArgs.serviceId, 1);
  assert.equal(res.jsonArgs.serviceName, 'Vaccination');
  assert.equal(res.jsonArgs.amount, 35);
  assert.equal(res.jsonArgs.currency, 'sgd');
  assert.equal(res.jsonArgs.status, 'READY_FOR_PAYMENT');
  assert.equal(Object.keys(res.jsonArgs).length, 5);
}

function testSuccessfulBookingRedirect() {
  const mockServiceBookingModel = {
    createPendingBooking(ownerId, petId, serviceId, bookingDate, callback) {
      assert.equal(ownerId, 99);
      assert.equal(petId, 7);
      assert.equal(serviceId, 1);
      assert.equal(bookingDate, '2026-11-30');
      callback(null, { bookingId: 12, paymentId: 42 });
    }
  };

  withMockedModule(serviceBookingModelPath, mockServiceBookingModel, () => {
    delete require.cache[serviceControllerPath];
    const serviceController = require('../controllers/serviceController');

    const flashMessages = {};
    const req = {
      session: { user: { id: 99 } },
      body: { petId: '7', serviceId: '1', bookingDate: '2026-11-30' },
      flash(type, message) {
        flashMessages[type] = message;
      }
    };
    const res = createRes();

    serviceController.createBooking(req, res);

    assert.equal(res.redirectCalled, '/bookings');
    assert.equal(flashMessages.success, 'Booking created. Payment is pending; no payment has been processed.');
  });
}

function testInvalidBookingDateRejected() {
  const mockServiceBookingModel = {
    createPendingBooking() {
      throw new Error('should not be called');
    }
  };

  withMockedModule(serviceBookingModelPath, mockServiceBookingModel, () => {
    delete require.cache[serviceControllerPath];
    const serviceController = require('../controllers/serviceController');

    const flashMessages = {};
    const req = {
      session: { user: { id: 99 } },
      body: { petId: '7', serviceId: '1', bookingDate: '2026-10-31' },
      flash(type, message) {
        flashMessages[type] = message;
      }
    };
    const res = createRes();

    serviceController.createBooking(req, res);

    assert.equal(res.redirectCalled, '/services');
    assert.equal(flashMessages.error, 'Choose a pet, service, and valid booking date.');
  });
}

testPreparePaymentContract();
testSuccessfulBookingRedirect();
testInvalidBookingDateRejected();
console.log('Service booking tests passed.');
