const express = require('express');
const ejs = require('ejs');
const paypal = require('paypal-rest-sdk');

paypal.configure({
  'mode': 'sandbox', //sandbox or live
  'client_id': 'AZX_IGFYY6JFsWRD6dib-Y60KINzKNZkpca7vRDWK1ZcqcH15S4FvKJQ7RVU9X0QwwduWq8aIeXOJBHC',
  'client_secret': 'EOSmjBy05_DPYYDDooSKQy-eM4CgasPqRxkJ33XzCHcFHq8lsdFEMArrXnwJURJQccRewzqukwC6tF0T'
});


const app = express();

app.set('view engine', 'ejs');

app.get('/', function(req, res){res.render('index')});

app.post('/demo/checkout/api/paypal/payment/create/',function(req,res){
	const create_payment_json = {
    "intent": "sale",
    "payer": {
        "payment_method": "paypal"
    },
    "redirect_urls": {
        "return_url": "http://localhost:3000/success",
        "cancel_url": "http://localhost:3000/cancel"
    },
    "transactions": [{
        "item_list": {
            "items": [{
                "name": "Red Sox Hat",
                "sku": "12345",
                "price": "25",
                "currency": "USD",
                "quantity": 1
            }]
        },
        "amount": {
            "currency": "USD",
            "total": "25.00"
        },
        "description": "Hat for the best team ever"
    }]
   };

	paypal.payment.create(create_payment_json, function (error, payment) {
			  if (error) {
			      throw error;
			  } else {
			      for(let i = 0;i < payment.links.length;i++){
			        if(payment.links[i].rel === 'approval_url'){
			          res.redirect(payment.links[i].href);
			        }
			      }
			  }
    });
});

app.get('/demo/checkout/api/paypal/payment/execute/', (req, res) => {
  const payerId = req.query.PayerID;
  const paymentId = req.query.paymentId;

  const execute_payment_json = {
    "payer_id": payerId,
    "transactions": [{
        "amount": {
            "currency": "USD",
            "total": "25.00"
        }
    }]
  };

  paypal.payment.execute(paymentId, execute_payment_json, function (error, payment) {
    if (error) {
        console.log(error.response);
        throw error;
    } else {
        console.log(JSON.stringify(payment));
        res.send('Success');
       
    }
});
});

app.get('/cancel', (req, res) => res.send('Cancelled'));


app.listen(3000, () => console.log('Server Started'));