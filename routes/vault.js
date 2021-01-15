var express = require('express');
var router = express.Router();
var request = require('request');
var https = require('https');

var PAYPAL_SANDBOX = 'https://api.sandbox.paypal.com';
var PAYPAL_OAUTH_API = `${PAYPAL_SANDBOX}/v1/oauth2/token/`;
var PAYPAL_LIST_VPT = `${PAYPAL_SANDBOX}/v2/vault/payment-tokens`;

router.post('/', function(req, response) {
  var customerid = req.body.customerid;
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
      user: req.body.clientid,
      password: req.body.secret
    },
    form: { grant_type : 'client_credentials'}
  }, function (error, res, body) {

    var result_json = JSON.parse(body)

    var ac_token = result_json.access_token;
    console.log(ac_token);
    var vpt_list;

    getVaultPaymentToken(ac_token,customerid)
    .then((vault_payment_tokens) => {
      vpt_list= vault_payment_tokens;
      console.log(vpt_list);
      return response.send(vpt_list)
    })
  })
});

const getVaultPaymentToken = (access_token,customerid) => {
  return new Promise((resolve, reject) => {
      request({
          method: 'GET',
          uri: PAYPAL_LIST_VPT+"?customer_id="+customerid,
          headers: [
              {
                name: 'content-type',
                value: 'application/json'
              }
          ], 
          auth: { bearer: access_token }
        }, function (error, res, data) {
            if(!error){
              return resolve(data);
            } else{
              return reject(Error("Failed to retrieve client data."));
            }
        })
  });
}

module.exports = router;