/*eslint-disable */
// import "core-js/stable";
import "regenerator-runtime/runtime";
// import '@babel/polyfill';

import {displayMap} from './mapBox';
import {login, logout} from './login';
import {updateSettings} from './updateSettings';
import {bookTour} from './stripe';

// DOM ELEMENTS
const mapBox = document.getElementById('map');
const loginForm = document.querySelector('.form--login');
const logOutBtn = document.querySelector('.nav__el--logout')
const userDataForm = document .querySelector('.form-user-data')
const userPasswordForm = document.querySelector('.form-user-settings')
const bookBtn = document.getElementById('book-tour');
// DELEGATION
if(mapBox){

    const locations =JSON.parse( document.getElementById('map').dataset.locations);
    displayMap(locations)
}
if(loginForm){

    loginForm.addEventListener('submit', e =>{
        e.preventDefault();
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        login(email,password);
    });    
}
if(logOutBtn){
    logOutBtn.addEventListener('click', logout)
}

if(userDataForm){

    userDataForm.addEventListener('submit',e =>{
     e.preventDefault();
     const form = new FormData(); // multi-part-form needed to send file to server
     form.append('name',document.getElementById('name').value)
     form.append('email',document.getElementById('email').value)
     form.append('photo',document.getElementById('photo').files[0]) // select just one
     console.log(form)
    //  const name = document.getElementById('name').value;
    //  const email = document.getElementById('email').value;
    //  updateSettings({name,email},'data');
    updateSettings(form,'data');  // without form it will not send to server and its also object
 })
}

if(userPasswordForm){
    userPasswordForm.addEventListener('submit',async e=>{
        e.preventDefault();
        document.querySelector('.btn--save-password').textContent = 'Updating....';
        const passwordCurrent = document.getElementById('password-current').value;
        const password = document.getElementById('password').value;
        const passwordConfirm = document.getElementById('password-confirm').value;
       await updateSettings({passwordCurrent,password,passwordConfirm},'password');
       document.getElementById('password-current').value =''
       document.getElementById('password').value=''
        document.getElementById('password-confirm').value=''
        document.querySelector('.btn--save-password').textContent = 'SAVE PASSWORD';
    })
}

if (bookBtn)
  bookBtn.addEventListener('click', e => {
    e.target.textContent = 'Processing...';
    const { tourId } = e.target.dataset;
    bookTour(tourId);
  });