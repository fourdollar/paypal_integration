$(function() {

  paypal.Buttons({
    createOrder: function(data, actions) {
      // This function sets up the details of the transaction, including the amount and line item details.
      return actions.order.create({
        purchase_units: [{
          amount: {
            value: '0.01'
          }
        }]
      });
    },
    onApprove: function(data, actions) {
      // This function captures the funds from the transaction.
      return actions.order.capture().then(function(details) {
        // This function shows a transaction success message to your buyer.
        alert('Transaction completed by ' + details.payer.name.given_name);
      });
    }
  }).render('#paypal-button-container');

  paypal.Buttons({
    createOrder: function(data, actions) {
      var amount = parseInt($("#amount1").val());
      return fetch('/my-server/create-paypal-transaction', {
        method: 'post',
        headers: {
          'content-type': 'application/json'
        },
        body:JSON.stringify({
          "amount":amount
        })
      }).then(function(res) {
        return res.json();
      }).then(function(data) {
        console.log(data);
        return data.orderID; // Use the same key name for order ID on the client and server
      });
    },
    onApprove: function(data, actions) {
      return fetch('/my-server/capture-paypal-transaction', {
        method: 'post',
        headers: {
          'content-type': 'application/json'
        },
        body: JSON.stringify({
          orderID: data.orderID
        })
      }).then(function(res) {
        return res.json();
      }).then(function(details) {
        console.log("===================details==================");
        console.log(details);
        $('.result').text("aaaa");
        $('.result').text(JSON.stringify(details))
      })
    }
  }).render('#paypal-button-callfromserver');

  //subscription button
  //client
  /*paypal.Buttons({
    createSubscription: function(data, actions) {
      return actions.subscription.create({  
        'plan_id': 'P-67044631TC987272HL4L64NY' 
      }); 
    },
    onApprove: function(data, actions) {
      alert('You have successfully created subscription ' + data.subscriptionID);
    }
  }).render('#paypal-button-subscription');
  */
  //server
  paypal.Buttons({
    createSubscription: function(data, actions) {
      return fetch('/my-server/create-paypal-subscription', {
        method: 'post',
        headers: {
          'content-type': 'application/json'
        },
        body:JSON.stringify({
          "plan_id":'P-67044631TC987272HL4L64NY'
        })
      }).then(function(res) {
        return res.json();
      }).then(function(data) {
        console.log(data);
        return data.subscriptionID;
      });
    },
    onApprove: function(data, actions) {
      //alert('You have successfully created subscription ' + data.subscriptionID);
      $('.result').text(JSON.stringify(data));
    }
  }).render('#paypal-button-subscription');

  //rt
  paypal.Buttons({
    createBillingAgreement: function(data, actions) {
      return fetch('/my-server/create-paypal-billing-agreement-token', {
        method: 'post',
        headers: {
          'content-type': 'application/json'
        }
      }).then(function(res) {
        return res.json();
      }).then(function(data) {
        console.log("return data.token_id="+data.token_id);
        return data.token_id; // Use the same key name for order ID on the client and server
      });
    },
    onApprove: function(data, actions) {
      console.log("data.token_id="+JSON.stringify(data));
      return fetch('/my-server/create-paypal-billing-agreement', {
        method: 'post',
        headers: {
          'content-type': 'application/json'
        },
        body: JSON.stringify({
          token_id: data.billingToken
        })
      }).then(function(res) {
        return res.json();
      }).then(function(details) {
        console.log("===================details==================");
        console.log(details);      
        $('.result').text(JSON.stringify(details))
      })
    }
  }).render('#paypal-button-rt');

  $("#doRT").click(function(){
    var billingId = $("#BillingId").val();
    var billingAmount = $("#BillingAmount").val();
    console.log(billingId);
    fetch('/my-server/doRT', {
      method: 'post',
      headers: {
        'content-type': 'application/json'
      },
      body: JSON.stringify({
        billingId:billingId,
        billingAmount:billingAmount
      })
    })
    .then(res => {
      console.log(res);
      return res;
  })
  .then(res => res.text())
  .then(json => {
    console.log(json)
    alert("成功扣款："+json)
    $("#BillingAmount").val("");
  })
  .catch(err => console.error(err));
  })
});
