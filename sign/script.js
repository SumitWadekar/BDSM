const userinfo = () => {
    username = document.getElementById("user").children[0].value;
    password = document.getElementById("pass").children[0].value;
    rem = document.getElementById("remember_me");
    console.log(username,password, rem
        .checked
    );
    const validuser = ["@",'.com'];
    const valid = (validuser.every(validchar  => username.includes(validchar)) && password.length >= 8);
    if  (!valid) {
        alert("Why are U doing No Daddy behaviour. Input a valid usename or password otherwise your dad will never come back an your mom will go with hum too");
        document.getElementById("user").children[0].value ='';
        document.getElementById("pass").children[0].value='';
        document.getElementById("remember_me").checked = false;
    }
    return [username,password,rem]
}

const newuserinfo = () => {
    let username = document.getElementById("user").value;
    let pass =  document.getElementById("password").value;
    if(pass!==document.getElementById("confirm").value){
        alert('The  password you entered does not match the confirm password you entered. Please try again.');
        document.getElementById("password").value = '';
        document.getElementById("user").value='';
        document.getElementById("confirm").value='';
        return null;
    }
    let address = document.getElementById('address').value;
    console.log(username,pass,address);
    return [username,pass,address];
}

const enable = () => {
    let val = document.getElementById("remember_me").checked;
    if(val){
        document.getElementById("remember_me").checked= false;
    }
    else{
        document.getElementById("remember_me").checked = true;
    }
}