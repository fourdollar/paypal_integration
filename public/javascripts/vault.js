$(function() {
  $("#get-vault").click(function(){
    var clientid = $("#clientid").val();
    var secret = $("#secret").val();
    var customerid = $("#customerid").val();
    console.log("clientid: "+clientid+", secret: "+secret+", customerid: "+customerid);
    fetch('/vault', {
      method: 'post',
      headers: {
        'content-type': 'application/json'
      },
      body: JSON.stringify({
        clientid,
        secret,
        customerid
      })
    })
    .then(res => res.json())
    .then(json => {
      console.log(json)
      var vpt = json.payment_tokens;
      var vaulted_tb = "";
      for (let i = 0; i < vpt.length; i++) {
        var element = vpt[i];
        if (element.source.paypal) {
          vaulted_tb += "<tr>";
          vaulted_tb +=     "<td><i class='fa fa-cc-paypal'></i></td>"
          vaulted_tb +=     "<td>" + element.source.paypal.payer.email_address + "</td>"
          vaulted_tb +=     "<td>" + element.id + "</td>"
          vaulted_tb += "</tr>";
        } else {
          vaulted_tb += "<tr>";
          switch (element.source.card.brand) {
            case "MASTERCARD":
              vaulted_tb +=     "<td><i class='fa fa-cc-mastercard'></i></td>"
              break;
            case "VISA":
              vaulted_tb +=     "<td><i class='fa fa-cc-visa'></i></td>"
              break;
            case "JCB":
              vaulted_tb +=     "<td><i class='fa fa-cc-jcb'></i></td>"
              break;
            case "AMEX":
              vaulted_tb +=     "<td><i class='fa fa-cc-amex'></i></td>"
              break;
            default:
              vaulted_tb +=     "<td><i class='fa-credit-card'></i></td>"
              break;
          }
          vaulted_tb +=     "<td>" + element.source.card.last_digits + "</td>"
          vaulted_tb +=     "<td>" + element.id + "</td>"
          vaulted_tb += "</tr>";
        }
      }
      $("#vaulted_tbdata").html(vaulted_tb);
    })
    .catch(err => console.error(err));
  })
})