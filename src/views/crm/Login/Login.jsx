import React, {useState, useContext, useEffect} from "react";
import { Link, Redirect } from 'react-router-dom';
import { Auth } from 'aws-amplify';
import Cookies from 'js-cookie';
import {
    Button, Modal, ModalHeader, ModalBody, ModalFooter,
    Container, Row, Col, Label, FormGroup, Input, Form, FormText
} from 'reactstrap';

import { GlobalDispatchContext } from "../../../context/GlobalContext";
import { API_INPRONET } from "../../../components/constants";

const Login = (props) => {
  const dispatch = useContext(GlobalDispatchContext);
    const [username, setUsername] = useState()
    const [password, setPassword] = useState()
    const [userInvalid, setUserInvalid] = useState()
    const [passwordType, setPasswordType] = useState("password");
    const [userTooManyAttempts, setUserTooManyAttempts] = useState(false);

    const onChangeUsername = (e) => {
      setUsername(e.target.value)
    }

    const onChangePassword = (e) => {
      setPassword(e.target.value)
    }
    const togglePassword =()=>{
      if(passwordType==="password")
      {
       setPasswordType("text")
       return;
      }
      setPasswordType("password")
  }
    const onSubmit = (e) => {
        e.preventDefault()
        
        const docData = new FormData();
        docData.append("auth", "true")
        docData.append("username", username)
        docData.append("password", password)              
        const requestOptions = {
          method: 'POST',
          body: docData
        };
        fetch(`${API_INPRONET}/auth.php`, requestOptions)
        //Auth.signIn(username, password)
          .then(response => response.text())
          .then(user => {
            user = JSON.parse(user)
            if(user != "ERRORUSER_PASS" && 
              (user.rolDesc === "LEROY_INSTALACIONES_CENTRO" ||
              user.rolDesc === "LEROY_INSTALACIONES_CORPORATIVO" ||
              user.rolDesc === "INPROECO" ||
              user.rolDesc === "LEROY_INSTALACIONES_ZONA")
            ) {
              dispatch(
                { type: "SET_ALLOWED", payload: { isAllowed: true } }); 
              dispatch({
                type: "SET_LOGIN",
                payload: { token: user.mail, user: user },
              });
              if(user.rolDesc == "INPROECO" || user.rolDesc === "LEROY_INSTALACIONES_CENTRO") props.history.push("/crm/nueva-venta");
              else props.history.push("/crm/registro-ventas");           
            } else {
              setUserInvalid(true)

              props.history.push("/login");
            }
          })
          .catch(err => {
              console.log(err)
              if(err){
                setUserInvalid(true)
              }
        })
    }

    // La cookie "login" la deja el SSO en el dominio .inpronet.es. Si trae un rol
    // válido se entra directo, sin pasar por el formulario de usuario/contraseña.
    useEffect(() => {
      const loginCookie = Cookies.get('login')
      if (!loginCookie) return

      let userLogged = null
      try {
        userLogged = JSON.parse(loginCookie)
      } catch (e) {
        try {
          userLogged = JSON.parse(decodeURIComponent(loginCookie))
        } catch (e2) {
          console.log("Cookie de login no válida", e2)
          return
        }
      }

      if (!userLogged) return
      if (userLogged.rolDesc !== "LEROY_INSTALACIONES_CENTRO" &&
          userLogged.rolDesc !== "LEROY_INSTALACIONES_CORPORATIVO" &&
          userLogged.rolDesc !== "LEROY_INSTALACIONES_ZONA" &&
          userLogged.rolDesc !== "INPROECO") return

      dispatch(
        { type: "SET_ALLOWED", payload: { isAllowed: true } });
      dispatch({
        type: "SET_LOGIN",
        payload: { token: userLogged.mail, user: userLogged },
      });

      if(userLogged.rolDesc == "INPROECO" || userLogged.rolDesc === "LEROY_INSTALACIONES_CENTRO") props.history.push("/crm/nueva-venta");
      else props.history.push("/crm/registro-ventas");
    }, [])

    return (
      <div className="home">
      <img className="img" src="/ilustracion-login.png" />

      <div className="login">

        <img src="/circulo bienvenida.png" />
        <p className="title-login">BIENVENIDO</p>

        <form className="form">
        {userTooManyAttempts ? (<p style={{ color: 'red' }}>Demasiados intentos fallidos seguidos, por favor espere 3 minutos antes de volver a intentarlo.</p>) : (<></>)}

          <div>
            <input className="input" placeholder="Usuario" type="text" id="username" name="username" onChange={onChangeUsername} />
          </div>

          <div>
          <input className="input" placeholder="Contraseña" type={passwordType} id="password" name="password" onChange={onChangePassword}/>
            <i className="oi oi-eye" id="togglePassword" onMouseEnter={togglePassword} onMouseLeave={togglePassword} style={{marginLeft: "-30px", cursor: "pointer"}}></i>

          </div>
          {/* <div className="contraseña">
            Recordar mi contraseña
            <input type="checkbox" className="input-checkbox" />
          </div> */}
          {userInvalid ? (
            <p>El usuario o la contraseña son incorrectos.</p>
          ) : null}          <button className="button-login" onClick={onSubmit}>
            ENTRAR
          </button>
        </form>

        <Link className="regis-login" to="/forgotten-password">
            ¿Has olvidado tu contraseña?
        </Link>
      </div>
    </div>
      
    )
}

export default Login