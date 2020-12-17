$(function() {
  var CLIENT = 'AafvpoXnbhN0Eeklv0p0su4oUdPdiYT7_pa4v-X-ckWoCChlnC9CMdmqWCfny3EffsezUk9GI4rZLXPC'; //AU account

  fetch('/ucc/create-token', {
    method: 'post',
    headers: {
      'content-type': 'application/json'
    }
  }).then(function(res) {
    return res.json();
  }).then(function(data) {
    console.log(data.token);
    var script = $('<script src="https://paypal.com/sdk/js?client-id='+CLIENT+'" data-client-token="'+data.token+'"></script>');   //创建script标签
    $('body').append(script);  
    paypal.Buttons({
      createOrder: function(data, actions) {
        return actions.order.create({
          purchase_units: [{
            amount: {
              value: '0.01'
            }
          }]
        });
      },
      onApprove: function(data, actions) {
        return actions.order.capture().then(function(details) {
          alert('Transaction completed by ' + details.payer.name.given_name);
        });
      }
    }).render('#paypal-button-container'); 
    return data.token; // Use the same key name for order ID on the client and server
  });
})