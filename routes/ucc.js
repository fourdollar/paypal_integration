var express = require('express');
var router = express.Router();
var request = require('request');
var https = require('https');
// var PAYPAL_CLIENT = 'AUpOTGgcFaHilQ_iBxQ_FItQ7WUuK0qze2ZwSAew3EtTeNkX4GvK1r7hJw3CmueIjXNU7XekZeU6xSL6'; //JP account
// var PAYPAL_SECRET = 'ENrqGeXasnhGgdNXeDVFxaM4iCALA97TzS_vFOcGwmE2a9gYBE4ttGOwdysZ7Hpt_C7B0cD5bvfyoSFz'; //JP account
var PAYPAL_CLIENT = 'AdNQK0bxzQYMSmXPRM371oydWcsdrtOqvnjajX9kJ05-h8hP5gAmH3HHDK1MiQg7IMFN2WKgF0qlV-vj'; //US account
var PAYPAL_SECRET = 'EOC-7vg6E2HX1H0wakW4TQdSqS4R6cLRLBjftAs5y_gHzwXztT-UCwSgiu7N1dBl73SioeWbVRfKSKyo'; //US account

var PAYPAL_SANDBOX = 'https://api.sandbox.paypal.com';

var PAYPAL_OAUTH_API = `${PAYPAL_SANDBOX}/v1/oauth2/token/`;
var PAYPAL_CLIENT_DATA = `${PAYPAL_SANDBOX}/v1/identity/generate-token`;
var PAYPAL_ORDER_API = `${PAYPAL_SANDBOX}/v2/checkout/orders/`;
var PAYPAL_CAPTURE_ORDER_API = `${PAYPAL_SANDBOX}/v2/checkout/orders/$1/capture`

/* GET ucc page. */
router.get('/', function(req, res, next) {
  res.render('ucc', { title: 'ucc' });
});

router.post('/generate-token', function(req, response) {
  request({
    method: 'POST',
    uri: PAYPAL_OAUTH_API,
    headers: [
      {
        name: 'content-type',
        value: 'application/json'
      }
    ],
    auth: {
      user: PAYPAL_CLIENT,
      password: PAYPAL_SECRET
    },
    form: { grant_type : 'client_credentials'}
  }, function (error, res, body) {

    var result_json = JSON.parse(body)

    var ac_token = result_json.access_token;

    var client_data;

    getClientData(ac_token)
    .then((client_data_id) => {
        client_data = client_data_id;
        return createOrder(ac_token)
    }).then((order_data) =>{
        return response.send({client_token: client_data, order_id: order_data})
    });
  })
});

router.post('/create-order', function(req, response) {
  request({
    method: 'POST',
    uri: PAYPAL_OAUTH_API,
    headers: [
      {
        name: 'content-type',
        value: 'application/json'
      }
    ],
    auth: {
      user: PAYPAL_CLIENT,
      password: PAYPAL_SECRET
    },
    form: { grant_type : 'client_credentials'}
  }, function (error, res, body) {

    var result_json = JSON.parse(body)

    var ac_token = result_json.access_token;

    createOrder(ac_token)
    .then((order_data) =>{
        return response.send({order_id: order_data})
    });
  })
});

router.post('/order-capture', function(req, response, next) {
  var order_id = req.body.orderId;
  console.log(order_id);

  request({
    method: 'POST',
    uri: PAYPAL_OAUTH_API,
    headers: [
      {
        name: 'content-type',
        value: 'application/json'
      }
    ],
    auth: {
      user: PAYPAL_CLIENT,
      password: PAYPAL_SECRET
    },
    form: { grant_type : 'client_credentials'}
  }, function (error, res, body) {

    var result_json = JSON.parse(body)

    var ac_token = result_json.access_token;

    captureOrder(ac_token, order_id)
    .then((orderResult) =>{
        return response.send({order_status: orderResult.status,txnID:orderResult.id})
    });
  })
});

const getClientData = (access_token) => {
  return new Promise((resolve, reject) => {
      request({
          method: 'POST',
          uri: PAYPAL_CLIENT_DATA,
          headers: [
              {
                name: 'content-type',
                value: 'application/json'
              }
          ], 
          auth: { bearer: access_token },
          body: {
              customer_id: "testcustomer3"
          },
          json: true
        }, function (error, res, data) {
            if(!error){
              return resolve(data.client_token);
            } else{
              return reject(Error("Failed to retrieve client data."));
            }
        })
  });
}

const createOrder = (access_token) => {
  return new Promise((resolve, reject) => {
      request({
          method: 'POST',
          uri: PAYPAL_ORDER_API,
          headers: [
              {
                name: 'content-type',
                value: 'application/json'
              }
          ], 
          auth: { bearer: access_token },
          body: {
              intent: "CAPTURE",
              payer: {
                  name: {
                      given_name: "Tse",
                      surname: "Sunny"
                  },
                  address: {
                      address_line_1: '123 ABC Street',
                      address_line_2: 'Apt 2',
                      admin_area_2: 'San Jose',
                      admin_area_1: 'CA',
                      postal_code: '95131',
                      country_code: 'US'
                  },
                  email_address: "customer@domain.com",
                  phone: {
                      phone_type: "MOBILE",
                      phone_number: {
                          national_number: "11231242343"
                      }
                  }
              },
              purchase_units: [
                  {
                      amount: {
                          value: '12.34',
                          currency_code: 'USD'
                      },
                      shipping: {
                          name: {
                              full_name: 'Ben test'
                          },
                          address: {
                              address_line_1: '2211 N First Street',
                              address_line_2: 'Building 17',
                              admin_area_2: 'San Jose',
                              admin_area_1: 'CA',
                              postal_code: '95131',
                              country_code: 'US'
                          }
                      },
                  }
              ],
              application_context: {
                shipping_preference:'NO_SHIPPING'
            }
          },
          json: true
        }, function (error, res, data) {
            if(!error){
              return resolve(data.id);
            } else{
              return reject(Error("Failed to retrieve client data."));
            }
        })
  });
}

const captureOrder = (access_token, orderId) => {
  return new Promise((resolve, reject) => {
      request({
          method: 'POST',
          uri: PAYPAL_CAPTURE_ORDER_API.replace('$1', orderId),
          headers: [
              {
                name: 'content-type',
                value: 'application/json'
              }
          ], 
          auth: { bearer: access_token },
          body: {},
          json: true
        }, function (error, res, data) {
            if(!error){
              console.log(JSON.stringify(data));
              return resolve(data);
            } else{
              return reject(Error("Failed to retrieve client data."));
            }
        })
  });
}

module.exports = router;