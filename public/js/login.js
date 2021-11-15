// es6 2015
import axios from 'axios';
import {showAlert} from './alerts'
export const login = async(email,password)=>{
    try {
        const res = await axios({
            method:'POST',
            url:'http://127.0.0.1:3000/api/v1/users/login',
            data:{
                email,
                password
            }
        })
        if(res.data.status==='success'){
            showAlert('success','Logged In successfully!')
            
            window.setTimeout(()=>{
                location.assign('/')
            },1500)
        }
    } catch (error) {
        showAlert('error',error.response.data.message)
    }
    
}


export const logout = async () => {
    try {
        const res = await axios({
            method:'GET',
            url:'http://127.0.0.1:3000/api/v1/users/logout',
        });
        if(res.data.status = 'success') location.reload(true) ;// this will force server to reload not client cache
    } catch (error) {
        console.log(err.response.message)
        showAlert('error','error! logged out please')
    }
}

// document.querySelector('.form').addEventListener('submit', e =>{
//     e.preventDefault();

//     const email = document.getElementById('email').value;
//     const password = document.getElementById('password').value;
//     login(email,password)
// })

// module concept for front end