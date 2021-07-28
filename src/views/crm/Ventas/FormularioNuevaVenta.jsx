import React, { useState, useEffect, useCallback, useContext } from 'react'
import { Col, Row, Form, FormGroup, Label, Input,  Button } from "reactstrap";
import Dropzone from "react-dropzone";
import moment from "moment";

// context
import { GlobalStateContext } from "../../../context/GlobalContext";

//graphql
import { client, getLastId, getProvincias, getMunicipiosByProvincia, getCentros, insertVentaBricomart, getCentroName, getZonaByCentro, getZonaName, getDocumentPath, updateDocumentsPath } from '../../../components/graphql';

// constants
import { API_INPRONET } from '../../../components/constants';

// components
import VentaSuccessModal from '../../../components/common/Modals/VentaSuccessModal';
import VentaErrorDocumentoModal from '../../../components/common/Modals/VentaErrorDocumentoModal';

const FormularioNuevaVenta = ({history}) => {

    const { user } = useContext(GlobalStateContext);  
    const { centroId } = user;

    const [provincias, setProvincias] = useState();
    const [localidades, setLocalidades] = useState();
    const [centros, setCentros] = useState();
    const [datosForm, setDatosForm] = useState({});
    const [nifInvalido, setNifInvalido] = useState();
    const [almacen, setAlmacen] = useState(false);
    const [fecha, setFecha] = useState(false);

    // MODALES
    const [ventaSuccess, setVentaSuccess] = useState(false);
    const [ventaErrorDocument, setVentaErrorDocument] = useState(false)

    const toggleVentaSuccess = () => {
        setVentaSuccess(!ventaSuccess)
    }

    const toggleVentaErrorDocument = () => {
        setVentaErrorDocument(!ventaErrorDocument)
    }

     // ESTADOS PARA DOCUMENTOS - B para el Parte B
     const [fileNames, setFileNames] = useState([]);
     const [newFiles, setNewFiles] = useState([]);
     const [uploadFiles, setUploadFiles] = useState([]);
     const [fileNamesB, setFileNamesB] = useState([]);
     const [newFilesB, setNewFilesB] = useState([]);
     const [uploadFilesB, setUploadFilesB] = useState([]);

    const onDropA = useCallback((acceptedFiles) => {
        setNewFiles(newFiles.concat(acceptedFiles));
        let newFileNames = [];
        acceptedFiles.forEach((file) => {
          newFileNames.push({
            NOMBRE: file.name,
            RUTA: "",
            TIPO_DOCUMENTO_ID: "",
            IS_NEW: true,
          });
        });
        const files = fileNames.concat(newFileNames);
        setFileNames(files);
        setUploadFiles(acceptedFiles); 
      });

      const onDropB = useCallback((acceptedFiles) => {
        setNewFilesB(newFilesB.concat(acceptedFiles));
        let newFileNames = [];
        acceptedFiles.forEach((file) => {
          newFileNames.push({
            NOMBRE: file.name,
            RUTA: "",
            TIPO_DOCUMENTO_ID: "",
            IS_NEW: true,
          });
        });
        const files = fileNamesB.concat(newFileNames);
        setFileNamesB(files);
        setUploadFilesB(acceptedFiles);
      });

    const saveDocuments = async (files=[], fileNames=[], tipoName) => {
      if(files.length>0 && fileNames.length>0) {
          let fileDataFiltered = []
            const filterred = fileNames.filter(file => {
              return files[0].name === file.NOMBRE
            })
            if(filterred.length>0) fileDataFiltered = filterred;

          const docData = new FormData();
          docData.append("accion", "subirDocumentoBricomart")
          docData.append("tipoName", tipoName)
          docData.append('documento', files[0])
                              
          const requestOptions = {
            method: 'POST',
            body: docData
          };

          const postDocument = await fetch(`${API_INPRONET}/core/controller/BricomartController.php`, requestOptions)
          const resPostDocument = await postDocument.text() 
          return resPostDocument
      }
    }

    const quitarDocumentoA = (name) => {
    setNewFiles(newFiles.filter((item) => item.name !== name.NOMBRE));
    setFileNames(fileNames.filter((item) => item !== name));
    };

    const quitarDocumentoB = (name) => {
        setNewFilesB(newFilesB.filter((item) => item.name !== name.NOMBRE));
        setFileNamesB(fileNamesB.filter((item) => item !== name));
    };

    // COGER VALORES INPUTS
    /* const onChangeNif = (e) => {
        let cif = e.target.value   
        let validChars = 'TRWAGMYFPDXBNJZSQVHLCKET';
        let nifRexp = /^[0-9]{8}[TRWAGMYFPDXBNJZSQVHLCKET]{1}$/i;
        let nieRexp = /^[XYZ]{1}[0-9]{7}[TRWAGMYFPDXBNJZSQVHLCKET]{1}$/i;
        let str = cif.toString().toUpperCase();

        if (!nifRexp.test(str) && !nieRexp.test(str)) {
            setNifInvalido(true);
            }

        let nie = str
            .replace(/^[X]/, '0')
            .replace(/^[Y]/, '1')
            .replace(/^[Z]/, '2');

        let letter = str.substr(-1);
        let charIndex = parseInt(nie.substr(0, 8)) % 23;

        if (validChars.charAt(charIndex) === letter || cif === ""){
            setNifInvalido(false);
            setDatosForm({...datosForm, nif: e.target.value})
        } else {
            setNifInvalido(true);
            
        }

    } */
    /* const onChangeNif = (e) => {
        let cif = e.target.value   
        let DNI_REGEX = /^(\d{8})([A-Z])$/;
        let CIF_REGEX = /^([ABCDEFGHJKLMNPQRSUVW])(\d{7})([0-9A-J])$/;
        
        cif = cif.toUpperCase();
        if ( cif.match( DNI_REGEX ) ) {
            setNifInvalido(false);
            setDatosForm({...datosForm, nif: e.target.value})
        let numero, lett, letra;
        let expresion_regular_dni = /^[XYZ]?\d{5,8}[A-Z]$/;
        
            if(expresion_regular_dni.test(cif) === true){
                numero = cif.substr(0,cif.length-1);
                numero = numero.replace('X', 0);
                numero = numero.replace('Y', 1);
                numero = numero.replace('Z', 2);
                lett = cif.substr(cif.length-1, 1);
                numero = numero % 23;
                letra = 'TRWAGMYFPDXBNJZSQVHLCKET';
                letra = letra.substring(numero, numero+1);
                if (letra != lett) {
                    //Dni erroneo, la letra del NIF no se corresponde
                    return false;
                    
                }else{
                    //Dni correcto
                    console.log(e.target.value);
                    setDatosForm({...datosForm, nif: e.target.value})
                    return true;
                }

            }else{
                //Dni erroneo, formato no válido
                return false;
            }
        }
        else if ( cif.match( CIF_REGEX )) {     
            let temp = cif
            if (!/^[A-Za-z0-9]{9}$/.test(temp)){
                
                return false
            }  else if (!/^[ABCDEFGHKLMNPQS]/.test(temp)){   
                return false
            } 
            else{
                setNifInvalido(false)
                setDatosForm({...datosForm, nif: e.target.value})
                return true;
            } 
        } 
        else if (cif == ''){

            setNifInvalido(false)

        } else{
            setNifInvalido(true)
            return false
        }
    } */

    const onChangeNif = (e) => {
        let cif = e.target.value 

        if (cif.length == 9 || cif == '') {
            setNifInvalido(false)
            setDatosForm({...datosForm, nif: e.target.value})
            return true;
            
        } else {
            setNifInvalido(true)
        }
    }

    const onChangeFullName = (e) => {
        setDatosForm({...datosForm, nombre: e.target.value})
    }

    const onChangeApellido1 = (e) => {
        setDatosForm({...datosForm, apellido1: e.target.value})
    }

    const onChangeApellido2 = (e) => {
        setDatosForm({...datosForm, apellido2: e.target.value})
    }

    const onChangeRazonSocial = (e) => {
        setDatosForm({...datosForm, razon_social: e.target.value})
    }

    const onChangeTipoVia = (e) => {
        setDatosForm({...datosForm, tipo_via: e.target.value})
    }

    const onChangeNombreVia = (e) => {
        setDatosForm({...datosForm, nombre_via: e.target.value})
    }

    const onChangeNumero = (e) => {
        setDatosForm({...datosForm, numero: e.target.value})
    }

    const onChangePiso = (e) => {
        setDatosForm({...datosForm, piso: e.target.value})
    }

    const onChangePuerta = (e) => {
        setDatosForm({...datosForm, puerta: e.target.value})
    }

    const onChangeCodigoPostal = (e) => {
        setDatosForm({...datosForm, codigo_postal: e.target.value})
    }

    const onChangeNumeroSerie = (e) => {
        setDatosForm({...datosForm, numero_serie: e.target.value})
    }

    const onChangeCantidad = (e) => {
        setDatosForm({...datosForm, cantidad: e.target.value})
    }

    const onChangeFechaVenta = (e) => {
        const dateFormatted = moment(e.target.value).format("DD/MM/YYYY");
        setDatosForm({...datosForm, fecha_venta: dateFormatted});
        setFecha(true);
    }

    const onChangeMarca = (e) => {
        setDatosForm({...datosForm, marca: e.target.value})
    }

    const onChangeModelo = (e) => {
        setDatosForm({...datosForm, modelo: e.target.value})
    }

    const onChangeReferencia = (e) => {
        setDatosForm({...datosForm, referencia: e.target.value})
    }

    const onChangeTipoGas = (e) => {
        setDatosForm({...datosForm, tipo_gas: e.target.value})
    }

     const fetchProvincias = useCallback(() => {
        client
            .query({
                query: getProvincias,
            })
            .then(res => {
                setProvincias(res.data.getProvincia)
            })
    }, [client, getProvincias])

    const onChangeProvincia = (e) => {
        setDatosForm({...datosForm, provincia: e.target.options[e.target.selectedIndex].text})
        if(e.target.value) {
            fetchLocalidades(e.target.value)
        }

    };
    
    const fetchLocalidades = useCallback((e) => {
        client
            .query({
                query: getMunicipiosByProvincia ,
                variables: {
                    provinciaId: e,
                }
            })
            .then(res => {
                setLocalidades(res.data.getMunicipio)
            })
    }, [client,getMunicipiosByProvincia])

    const onChangeMunicipio = (e) => {
        setDatosForm({...datosForm, localidad: e.target.options[e.target.selectedIndex].text})
    };

    const fetchCentroName = () => {
        client
            .query({
                query: getCentroName,
                variables: {
                    centroId
                }
            })
            .then(res => {
                setDatosForm({...datosForm, centro_id: centroId, centro: res.data.getCentrosProductoresView[0].nombre})
            })
    }

    const fetchCentros = () => {
        client
            .query({
                query: getCentros
            })
            .then(res => {
                setCentros(res.data.getCentroProductor)
            })
    }

    /* const fetchZona = (centro) => {
        client
            .query({
                query: getZonaByCentro,
                variables: {
                    centroId: centro
                }
            })
            .then(res => {
                fetchZonaName(res.data.getCentroProductor[0].ZONA_ID)
            })
    }

    const fetchZonaName = (id) => {
        client
            .query({
                query: getZonaName,
                variables: {
                    zonaId: id.toString()
                }
            })
            .then(res => {
                setDatosForm({...datosForm, zona_id: id.toString(), zona: res.data.getZona[0].nombre})
            })
    } */

    const onChangeCentro = (e) => {
        console.log(e.target.value, e.target.options[e.target.selectedIndex].text)
        setDatosForm({...datosForm, centro_id: e.target.value, centro: e.target.options[e.target.selectedIndex].text})
        setAlmacen(true)
        //fetchZona(e.target.value)
    }

    // FORMATEAR DATOS PARA ENVIAR
    const setMutationString = () => {
        return JSON.stringify(datosForm);
    }

    const existsParteB = () => {
        return fileNamesB.length > 0
    }

    useEffect(() => {
        fetchLastId()
        !existsParteB() ? setDatosForm({...datosForm, estado_id: 2}) : setDatosForm({...datosForm, estado_id: 3})
    }, [fileNamesB])

    const fetchLastId = () => {
        return client
                .query({
                    query: getLastId,
                    fetchPolicy: "no-cache"
                })
                .then(res => {
                    //console.log(res.data.ventas_bricomart[0].id)
                    setDatosForm({...datosForm, id: res.data.ventas_bricomart[0].id + 1})
                    //return res.data.ventas_bricomart[0].id
                })
    }

    const onSubmitForm = async (e) => {
        e.preventDefault();
        //console.log(JSON.parse(setMutationString()))
        let ventaId;
        const parteAId = await saveDocuments(newFiles, fileNames, "Bricomart Parte A")
        if(!parteAId) {
            toggleVentaErrorDocument()
            return
        }
        let parteBId = "";
        if(fileNamesB.length > 0) {
            parteBId = await saveDocuments(newFilesB, fileNamesB, "Bricomart Parte B")    
        }
        await client
                .mutate({
                    mutation: insertVentaBricomart,
                    variables: {
                        fields: JSON.parse(setMutationString())
                    }
                })
                .then(res => {
                    ventaId = res.data.insert_ventas_bricomart.returning[0].id
                })        
        const pathParteA = await documentPath(parteAId)
        let pathParteB;
        if(parteBId) {
            pathParteB = await documentPath(parteBId)
        }
        const isUpdated = await updateRutaVentaDocumento(ventaId, pathParteA, pathParteB)
        if(isUpdated === 1) toggleVentaSuccess()
    }

    const documentPath = async (id) => {
        return client
                .query({
                    query: getDocumentPath,
                    variables: {
                        documentId: id
                    }
                })
                .then(res => {
                    console.log(res)
                    return res.data.getDocumento[0].RUTA
                })
    }

    const updateRutaVentaDocumento = async (ventaId, parteA, parteB) => {
        return client
                .mutate({
                    mutation: updateDocumentsPath,
                    variables: {
                        ventaId: ventaId,
                        parteAPath: parteA,
                        parteBPath: parteB
                    }
                })
                .then(res => {
                    return res.data.update_ventas_bricomart.affected_rows
                })
    }

    const redirectToVentas = () => {
        history.push("/crm/registro-ventas");
      };

     useEffect(() => {
        fetchProvincias()
        fetchCentros()    
        if(centroId) {
            fetchCentroName()
            setAlmacen(true)
        }
    }, [])

    return (
        <div>
            <div className="content">
                <section className="box">
                    <div className= "content-body">
                        <h2>Registro Nueva Venta</h2>
                        <Form onSubmit={onSubmitForm}>
                            <Row form>
                                <Col md={2}>
                                    <FormGroup>
                                        <Label>NIF/NIE</Label>
                                        <Input
                                        type="text"
                                        onChange={onChangeNif}
                                        maxLength="9"
                                        />
                                        {nifInvalido ? (
                                                    <div>Introduzca un número de identificación válido</div>
                                                ) : (<></>)
                                            }
                                    </FormGroup>
                                </Col>
                                <Col md={4}>
                                    <FormGroup>
                                        <Label>Nombre</Label>
                                        <Input
                                        type="text"
                                        onChange={onChangeFullName}
                                        />
                                    </FormGroup>
                                </Col>
                                <Col md={3}>
                                    <FormGroup>
                                        <Label>Apellido 1</Label>
                                        <Input
                                        type="text"
                                        onChange={onChangeApellido1}
                                        />
                                    </FormGroup>
                                </Col>
                                <Col md={3}>
                                    <FormGroup>
                                        <Label>Apellido 2</Label>
                                        <Input
                                        type="text"
                                        onChange={onChangeApellido2}
                                        />
                                    </FormGroup>
                                </Col>
                            </Row>
                            <Row form>
                                <Col md={12}>
                                    <FormGroup>
                                        <Label>Razón Social</Label>
                                        <Input
                                        type="text"
                                        onChange={onChangeRazonSocial}
                                        />
                                    </FormGroup>
                                </Col>
                            </Row>
                            <Row form>
                                <Col md={3}>
                                    <FormGroup>
                                        <Label>Tipo de Vía</Label>
                                        <Input
                                        type="text"
                                        onChange={onChangeTipoVia}
                                        />
                                    </FormGroup>
                                </Col>
                                <Col md={4}>
                                    <FormGroup>
                                        <Label>Nombre Vía</Label>
                                        <Input
                                        type="text"
                                        onChange={onChangeNombreVia}
                                        />
                                    </FormGroup>
                                </Col>
                                <Col md={1}>
                                    <FormGroup>
                                        <Label>Número</Label>
                                        <Input
                                        type="text"
                                        onChange={onChangeNumero}
                                        />
                                    </FormGroup>
                                </Col>
                                <Col md={1}>
                                    <FormGroup>
                                        <Label>Piso</Label>
                                        <Input
                                        type="text"
                                        onChange={onChangePiso}
                                        />
                                    </FormGroup>
                                </Col>
                                <Col md={1}>
                                    <FormGroup>
                                        <Label>Puerta</Label>
                                        <Input
                                        type="text"
                                        onChange={onChangePuerta}
                                        />
                                    </FormGroup>
                                </Col>
                                <Col md={2}>
                                    <FormGroup>
                                        <Label>Código Postal</Label>
                                        <Input
                                        type="text"
                                        onChange={onChangeCodigoPostal}
                                        />
                                    </FormGroup>
                                </Col>
                            </Row>
                            <Row form>
                                <Col md={6}>
                                    <FormGroup>
                                        <Label>Provincia</Label>
                                        <Input
                                        type="select"
                                        onChange= {onChangeProvincia}
                                        >
                                            <option disabled selected defaultValue> -- Seleccionar -- </option>
                                            {provincias && provincias.map(provincia=>{ 
                                                return (
                                                <option key={provincia.ID} value={provincia.ID} >{provincia.NOMBRE}</option>
                                                )
                                            })}
                                        </Input>
                                    </FormGroup>
                                </Col>
                                <Col md={6}>
                                    <FormGroup>
                                        <Label>Localidad</Label>
                                        <Input
                                        type="select"
                                        onChange={onChangeMunicipio}
                                        >
                                            <option disabled selected defaultValue> -- Seleccionar -- </option>
                                            {localidades && localidades.map(localidad=>{ 
                                                return (
                                                <option key={localidad.ID} value={localidad.ID} >{localidad.NOMBRE}</option>
                                                )
                                            })}
                                        </Input>
                                    </FormGroup>
                                </Col>
                            </Row>
                            <Row form>
                                <Col md={6}>
                                    <FormGroup>
                                        <Label>Marca</Label>
                                        <Input
                                        type="text"
                                        onChange={onChangeMarca}
                                        />
                                    </FormGroup>
                                </Col>
                                <Col md={6}>
                                    <FormGroup>
                                        <Label>Modelo</Label>
                                        <Input
                                        type="text"
                                        onChange={onChangeModelo}
                                        />
                                    </FormGroup>
                                </Col>
                            </Row>
                            <Row form>
                                <Col md={3}>
                                    <FormGroup>
                                        <Label>Referencia</Label>
                                        <Input
                                        type="text"
                                        onChange={onChangeReferencia}
                                        />
                                    </FormGroup>
                                </Col>
                                <Col md={3}>
                                    <FormGroup>
                                        <Label>Número de Serie</Label>
                                        <Input
                                        type="text"
                                        onChange={onChangeNumeroSerie}
                                        />
                                    </FormGroup>
                                </Col>
                                <Col md={3}>
                                    <FormGroup>
                                        <Label>Cantidad</Label>
                                        <Input
                                        type="number"
                                        onChange={onChangeCantidad}
                                        />
                                    </FormGroup>
                                </Col>
                                <Col md={3}>
                                    <FormGroup>
                                        <Label>Tipo Gas</Label>
                                        <Input
                                        type="text"
                                        onChange={onChangeTipoGas}
                                        />
                                    </FormGroup>
                                </Col>
                            </Row>
                            <Row form>
                                <Col md={3}>
                                    <FormGroup>
                                        <Label>Fecha Venta*</Label>
                                        <Input
                                        type="date"
                                        placeholder="date placeholder"
                                        onChange={onChangeFechaVenta}
                                        />
                                         {!fecha ? (
                                                    <div>Por favor, seleccione una fecha</div>
                                                ) : (<></>)
                                            }
                                    </FormGroup>
                                </Col>
                                <Col md={4}>
                                    <FormGroup>
                                        <Label>Almacén*</Label>
                                        <Input
                                        type="select"
                                        onChange={onChangeCentro}
                                        >   
                                            {!centroId && (<option disabled selected value> -- Seleccionar -- </option>)}
                                            {centros && centros.map(centro=>{ 
                                                if(centro.ID == centroId) {
                                                    return (<option key={centro.ID} value={centro.ID} selected>{centro.DENOMINACION}</option>)
                                                } 
                                                return (
                                                    <option key={centro.ID} value={centro.ID} >{centro.DENOMINACION}</option>
                                                )
                                            })}
                                        </Input>
                                        {!almacen ? (
                                                    <div>Por favor, seleccione un almacén</div>
                                                ) : (<></>)
                                            }
                                    </FormGroup>
                                </Col>
                            </Row>
                            <Row form>
                                <Col md={4}>
                                <Label>Añadir parte A*:</Label>
                                <Dropzone onDrop={onDropA}>
                                    {({
                                        getRootProps,
                                        getInputProps,
                                        isDragActive,
                                        isDragAccept,
                                        isDragReject,
                                    }) => {
                                        const additionalClass = isDragAccept
                                        ? "accept"
                                        : isDragReject
                                        ? "reject"
                                        : "";

                                        return (
                                        <div
                                            {...getRootProps({
                                            className: `dropzone ${additionalClass}`,
                                            })}
                                        >
                                            <input {...getInputProps()} />
                                            <span>{isDragActive ? "📂" : "📁"}</span>
                                        </div>
                                        );
                                    }}
                                </Dropzone>
                                    <div>
                                    {fileNames.length > 0 ? <strong>Documentos:</strong> : <></>}
                                    <ul>
                                        {fileNames.map((fileName) => (
                                        <li key={fileName.NOMBRE}>
                                            <span className="filename-list">{fileName.NOMBRE}</span>
                                            {/* {fileName.IS_NEW ? (
                                            <select
                                                name={fileName.NOMBRE}
                                                value={fileName.TIPO_DOCUMENTO_ID}
                                                style={{ width: "280px" }}
                                                onChange={changeType}
                                            >
                                                {tipoDocumentos.map(({ ID, nombre }) => (
                                                <option key={ID} value={ID}>
                                                    {nombre}
                                                </option>
                                                ))}
                                            </select>
                                            ) : (
                                            <button>{fileName.TIPO_DOCUMENTO[0].NOMBRE}</button>
                                            )} */}
                                            {fileName.IS_NEW && (
                                            <span
                                                className="delete-document"
                                                onClick={() => quitarDocumentoA(fileName)}
                                            >
                                                <Button color="danger">Eliminar</Button>
                                            </span>
                                            )}
                                        </li>
                                        ))}
                                    </ul>
                                    </div>
                                </Col>
                                <Col md={4}>
                                <Label>Añadir parte B:</Label>
                                <Dropzone onDrop={onDropB}>
                                    {({
                                        getRootProps,
                                        getInputProps,
                                        isDragActive,
                                        isDragAccept,
                                        isDragReject,
                                    }) => {
                                        const additionalClass = isDragAccept
                                        ? "accept"
                                        : isDragReject
                                        ? "reject"
                                        : "";

                                        return (
                                        <div
                                            {...getRootProps({
                                            className: `dropzone ${additionalClass}`,
                                            })}
                                        >
                                            <input {...getInputProps()} />
                                            <span>{isDragActive ? "📂" : "📁"}</span>
                                        </div>
                                        );
                                    }}
                                </Dropzone>
                                    <div>
                                    {fileNamesB.length > 0 ? <strong>Documentos:</strong> : <></>}
                                    <ul>
                                        {fileNamesB.map((fileName) => (
                                        <li key={fileName.NOMBRE}>
                                            <span className="filename-list">{fileName.NOMBRE}</span>
                                            {/* {fileName.IS_NEW ? (
                                            <select
                                                name={fileName.NOMBRE}
                                                value={fileName.TIPO_DOCUMENTO_ID}
                                                style={{ width: "280px" }}
                                                onChange={changeType}
                                            >
                                                {tipoDocumentos.map(({ ID, nombre }) => (
                                                <option key={ID} value={ID}>
                                                    {nombre}
                                                </option>
                                                ))}
                                            </select>
                                            ) : (
                                            <button>{fileName.TIPO_DOCUMENTO[0].NOMBRE}</button>
                                            )} */}
                                            {fileName.IS_NEW && (
                                            <span
                                                className="delete-document"
                                                onClick={() => quitarDocumentoB(fileName)}
                                            >
                                                <Button color="danger">Eliminar</Button>
                                            </span>
                                            )}
                                        </li>
                                        ))}
                                    </ul>
                                    </div>
                                </Col>
                            </Row>
                            <Row form> 
                                <Col md={2}>
                                    {nifInvalido || !almacen || !fecha ? (
                                        <Button type="submit" disabled>
                                                Guardar 
                                        </Button>
                                        ) : (
                                        <Button color="primary" type="submit">
                                            Guardar 
                                        </Button>)
                                    }
                                 </Col>
                            </Row>
                        </Form>
                    </div>
                </section>
            </div>
            {/* MODALES */}
            {ventaSuccess ? (
                    <VentaSuccessModal ventaSuccess={ventaSuccess} toggle={toggleVentaSuccess} redirectToVentas={redirectToVentas} />
                ) : (<></>)
            }
            {ventaErrorDocument ? (
                    <VentaErrorDocumentoModal ventaErrorDocument={ventaErrorDocument} toggle={toggleVentaErrorDocument} />
                ) : (<></>)
            }
        </div>
    )
}

export default FormularioNuevaVenta
