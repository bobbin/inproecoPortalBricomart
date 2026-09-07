import React, { useState, useContext, useEffect  } from "react";
import { Link, Redirect, useParams } from "react-router-dom";
import { Auth } from "aws-amplify";
import Cookies from 'js-cookie';

import { GlobalDispatchContext } from "../../../context/GlobalContext";

import { API_INPRONET } from "../../../components/constants";


const Login = ({ history }) => {
  // context
  const dispatch = useContext(GlobalDispatchContext);
  const [userLoggedIn, setUserLoggedIn] = useState();
  const { action } = useParams();
  const [username, setUsername] = useState();
  const [password, setPassword] = useState();
  const [userInvalid, setUserInvalid] = useState();
  const [recordarPassword, setRecordarPassword] = useState();

  const onChangeUsername = (e) => {
    setUsername(e.target.value);
  };

  const onChangePassword = (e) => {
    setPassword(e.target.value);
  };

  const onSubmit = (e) => {
    e.preventDefault();
    window.location.replace('https://pingsso-lm-qa.inpronet.es/simplesaml2/auth.php');
    // const docData = new FormData();
    // docData.append("auth", "true");
    // docData.append("username", username);
    // docData.append("password", password);
    // const requestOptions = {
    //   method: "POST",
    //   body: docData,
    // };
    // fetch(`${API_INPRONET}/auth.php`, requestOptions)
    //   .then((response) => response.text())
    //   .then((user) => {
    //     user = JSON.parse(user);   
    //       if (
    //         user.rolDesc == "CLIENTE_CENTRO" ||
    //         user.rolDesc == "CLIENTE_CORPORATIVO" ||
    //         user.rolDesc == "CLIENTE_ZONA"
    //       ){
    //         dispatch({
    //           type: "SET_LOGIN",
    //           payload: { token: user.mail, user: user },
    //         });
    //         dispatch({ type: "SET_ALLOWED", payload: { isAllowed: true } });
    //         history.push("/crm/servicios");
    //       }
            
    //      else {
    //       setUserInvalid(true)
    //       history.push("/login");
    //     }
    //   })
    //   .catch((err) => {
    //     console.log(err);
    //     if (err) {
    //       setUserInvalid(true);
    //     }
    //   });
  };

  const onBackHome = (e) => {
    e.preventDefault();
    history.push("/login");
  }
  const toggleForgottenPassword = () => {
    setRecordarPassword(!recordarPassword)
  }

  useEffect(() => {

    if(Cookies.get('login')){   
      const userLogged = JSON.parse(decodeURIComponent(Cookies.get('login')));     
      if (
        userLogged.rolDesc == "CLIENTE_CENTRO" ||
        userLogged.rolDesc == "CLIENTE_CORPORATIVO" ||
        userLogged.rolDesc == "CLIENTE_ZONA" ||
        userLogged.rolDesc == "ES-LM-ROLE-INPRONET-FLUORADOS"
      ){
        dispatch({
          type: "SET_LOGIN",
          payload: { token: userLogged.mail, user: userLogged },
        });
        setUserLoggedIn(true);
        dispatch({ type: "SET_ALLOWED", payload: { isAllowed: true } });
        history.push("/crm/servicios");
      }
    }
  }, [])
  


return (
    <>
    {{userLoggedIn} ? (
    <div class="home">
      <img class="img" src="/nuevaIlustracion.png" />

      <div class="login">

        <img src="/circulo bienvenida.png" />
        {(action == "error") ? (
            <>
            <p class="input">Error. Este usuario no está autorizado</p>
            <form class="form">

            <button class="button-login" onClick={onBackHome}> 
                VOLVER
            </button>
            </form>
            </>
        ):(
            <><p class="title-login">BIENVENIDO</p>
            
            <form class="form">

            <button class="button-login" onClick={onSubmit}> 
                ENTRAR
            </button>
            </form>
            </>
        )}
      </div>
    </div>):''}
    </>
  );
};
export default Login;
