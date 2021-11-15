/* eslint-disable */
import axios  from 'axios';

import {showAlert} from './alerts';

export const bookTour = async tourId =>{
    try {       
        const stripe= Stripe('pk_test_51JviWjK64WAPsiWiW6VaoDxpiMuMhASttBqE5x8c847AQL0IdNPu8XbFvxjo34o27qGnf0cabdXmfJ4gLVjWeBVd005UZbpuAW');
        // 1) Get Checkout session from API
        const session = await axios(`http://127.0.0.1:3000/api/v1/bookings/checkout-session/${tourId}`)
        
    
        // 2) Display checkout form or create form and charge the credit card
 await stripe.redirectToCheckout({
    sessionId: session.data.session.id
})
console.log(test)

      
    } catch (error) {
        showAlert('error',error)
    }
 
 
}