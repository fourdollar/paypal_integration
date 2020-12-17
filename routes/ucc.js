var express = require('express');
var router = express.Router();
var request = require('request');
var https = require('https');
// var CLIENT = 'AUpOTGgcFaHilQ_iBxQ_FItQ7WUuK0qze2ZwSAew3EtTeNkX4GvK1r7hJw3CmueIjXNU7XekZeU6xSL6'; //JP account
// var SECRET = 'ENrqGeXasnhGgdNXeDVFxaM4iCALA97TzS_vFOcGwmE2a9gYBE4ttGOwdysZ7Hpt_C7B0cD5bvfyoSFz'; //JP account
var CLIENT = 'AdNQK0bxzQYMSmXPRM371oydWcsdrtOqvnjajX9kJ05-h8hP5gAmH3HHDK1MiQg7IMFN2WKgF0qlV-vj'; //US account
var SECRET = 'EOC-7vg6E2HX1H0wakW4TQdSqS4R6cLRLBjftAs5y_gHzwXztT-UCwSgiu7N1dBl73SioeWbVRfKSKyo'; //US account
// var CLIENT = 'Aeds3rnvcy8k_u4o69PTsWP3SJt2pDC3X3rUH-1tnHAt8u20O5V1Wtt_IGucAfnR-HpsZLTo9nm3QZPP'; //shared test account
// var SECRET = 'EOSftZ4nUBw63FXFpojSX2Yb_kCnEO6NTeARL9y0wnr0AwAm6fqF3BOmy_leAi2lHkoeAG0eTIlDaZdf'; //shared test account

var PAYPAL_API = 'https://api.sandbox.paypal.com';
var VAULT_PAYPAL_API = "https://api-m.sandbox.paypal.com";

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('ucc', { title: 'ucc' });
});


router.post('/create-token', function(req, res) {
  // var amount = req.body.amount;
  // console.log(req.body.amount);
  request.post(VAULT_PAYPAL_API + '/v1/identity/generate-token', {
    auth: {
      user: CLIENT,
      pass: SECRET
    },
    body: {
      "customer_id": "customer_1232"
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
      token: response.body.client_token
    });
  });
});

module.exports = router;