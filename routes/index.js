var express = require('express');
var router = express.Router();
var request = require('request');
var https = require('https');
var CLIENT = 'AUpOTGgcFaHilQ_iBxQ_FItQ7WUuK0qze2ZwSAew3EtTeNkX4GvK1r7hJw3CmueIjXNU7XekZeU6xSL6'; //JP account
var SECRET = 'ENrqGeXasnhGgdNXeDVFxaM4iCALA97TzS_vFOcGwmE2a9gYBE4ttGOwdysZ7Hpt_C7B0cD5bvfyoSFz'; //JP account
// var CLIENT = 'AafvpoXnbhN0Eeklv0p0su4oUdPdiYT7_pa4v-X-ckWoCChlnC9CMdmqWCfny3EffsezUk9GI4rZLXPC'; //AU account
// var SECRET = 'AafvpoXnbhN0Eeklv0p0su4oUdPdiYT7_pa4v-X-ckWoCChlnC9CMdmqWCfny3EffsezUk9GI4rZLXPC'; //AU account
var PAYPAL_API = 'https://api.sandbox.paypal.com';

/* create order */
router.post('/my-server/create-paypal-transaction', function(req, res) {
    var amount = req.body.amount;
    console.log(req.body.amount);
    request.post(PAYPAL_API + '/v2/checkout/orders/', {
      auth: {
        user: CLIENT,
        pass: SECRET
      },
      body: {
        intent: 'CAPTURE',
        purchase_units: [{
          amount: {
            currency_code: 'USD',
            value: amount
          }
        }]
      },
      json: true
    }, function (err, response) {
      if (err) {
        console.log(err);
        return res.status(500);
      }
      console.log("======response信息======");
      console.log(response.body);
      res.status(200).send({
        orderID: response.body.id
      });
    });
});

/* capture order */
router.post('/my-server/capture-paypal-transaction', function(req, res) {
  var orderID = req.body.orderID;
  request.post(PAYPAL_API + '/v2/checkout/orders/' + orderID + '/capture', {
    auth: {
      user: CLIENT,
      pass: SECRET
    },
    headers: {
      "Content-Type": "application/json"
    }
  }, function (err, response) {
    if (err) {
      console.log(err);
      return res.status(500);
    }
    console.log("======response信息======");
    console.log(response.body);
    res.status(200).send({
      orderID: response.body
    });
  });
});

//create subscription
router.post('/my-server/create-paypal-subscription', function(req, res) { 
  console.log(req.body.plan_id);
  request.post(PAYPAL_API + '/v1/billing/subscriptions/', {
    auth: {
      user: CLIENT,
      pass: SECRET
    },
    body: {
      plan_id: req.body.plan_id    
    },
    json: true
  }, function (err, response) {
    if (err) {
      console.log(err);
      return res.status(500);
    }
    console.log("======response信息======");
    console.log(response.body);
    res.status(200).send({
      subscriptionID: response.body.id
    });
  });
});

//creat billing-agreement-token
router.post('/my-server/create-paypal-billing-agreement-token', function(req, res) {
  
  request.post(PAYPAL_API + '/v1/billing-agreements/agreement-tokens/', {
    auth: {
      user: CLIENT,
      pass: SECRET
    },
    body: {
      "description": "Billing Agreement",
      "payer":
      {
      "payment_method": "PAYPAL"
      },
      "plan":
      {
      "type": "MERCHANT_INITIATED_BILLING",
      "merchant_preferences":
      {
        "return_url": "https://example.com/return",
        "cancel_url": "https://example.com/cancel",
        "notify_url": "https://example.com/notify",
        "accepted_pymt_type": "INSTANT"
      }
      }
    },
    json: true
  }, function (err, response) {
    if (err) {
      console.log(err);
      return res.status(500);
    }
    console.log("======create-paypal-billing-agreement-token response信息======");
    console.log(response.body);
    res.status(200).send({
      token_id: response.body.token_id
    });
  });
});

router.post('/my-server/create-paypal-billing-agreement', function(req, res) { 
  console.log("req.body.token_id="+JSON.stringify(req.body));
  request.post(PAYPAL_API + '/v1/billing-agreements/agreements/', {
    auth: {
      user: CLIENT,
      pass: SECRET
    },
    body: {
      "token_id": req.body.token_id
    },
    json: true
  }, function (err, response) {
    if (err) {
      console.log(err);
      return res.status(500);
    }
    console.log("======create-paypal-billing-agreement response信息======");
    console.log(response.body);

    res.status(200).send({
     billing_agreement_id: response.body.id
    });
  });
});

router.post('/my-server/doRT', function(req, res) {

  //payment
  request.post(PAYPAL_API + '/v1/payments/payment/', {
    auth: {
      user: CLIENT,
      pass: SECRET
    },
    body: {
      "intent": "sale",
      "payer":
      {
      "payment_method": "PAYPAL",
      "funding_instruments": [
      {
        "billing":
        {
        "billing_agreement_id": req.body.billingId
        }
      }]
      },
      "transactions": [
      {
      "amount":
      {
        "currency": "USD",
        "total": req.body.billingAmount
      },
      "description": "Payment transaction.",
      "custom": "Payment custom field.",
      "note_to_payee": "Note to payee field.",
      "item_list":
      {
        "items": [
        {
        "sku": "skuitemNo1",
        "name": "ItemNo1",
        "description": "The item description.",
        "quantity": "1",
        "price": req.body.billingAmount,
        "currency": "USD",
        "tax": "0",
        "url": "https://example.com/"
        }]
      }
      }],
      "redirect_urls":
      {
      "return_url": "https://example.com/return",
      "cancel_url": "https://example.com/cancel"
      }
    },
    json: true
  }, function (err, response) {
    if (err) {
      console.log(err);
      return res.status(500);
    }
    console.log("======create-paypal-payment response信息======");
    console.log(JSON.stringify(response.body));
    res.status(200).send({
      transactionID: response.body.transactions[0].related_resources[0].sale.id
    });
  });
});

module.exports = router;

