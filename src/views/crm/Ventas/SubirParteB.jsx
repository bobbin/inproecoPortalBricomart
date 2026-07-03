import React, { useState, useEffect, useCallback, useContext } from 'react'
import {Modal, ModalHeader, ModalBody, ModalFooter, Col, Row, Form, FormGroup, Label, Input,  Button } from "reactstrap";
import Dropzone from "react-dropzone";
import moment from "moment";

// context
import { GlobalStateContext } from "../../../context/GlobalContext";

//graphql
import { client, getLastId, getProvincias, getMunicipiosByProvincia, getCentros, insertVentaBricomart, getCentroName, getZonaByCentro, getZonaName, getDocumentPath, updateDocumentsPath, getVentasAllCentros, getRetiradaDocumentosId, getDocumentosById, GET_TIPO_DOCUMENTOS } from '../../../components/graphql';

// constants
import { API_INPRONET } from '../../../components/constants';

// components
import VentaSuccessModal from '../../../components/common/Modals/VentaSuccessModal';
import VentaErrorDocumentoModal from '../../../components/common/Modals/VentaErrorDocumentoModal';

// Variable Global para FIX de añadir el ID al clicar en submit
let newId;

const SubirParteB = ({history}) => {

    const { user } = useContext(GlobalStateContext);
    const [toggleVentaSuccess, setToggleVentaSuccess] = useState(false);
    const [toggleVentaErrorDocument, setToggleVentaErrorDocument] = useState(false);
    
    // Add new state variables for Parte A
    const [fileNames, setFileNames] = useState([]);
    const [newFiles, setNewFiles] = useState([]);
    const [uploadFiles, setUploadFiles] = useState([]);
    
    // Existing state variables for Parte B
    const [fileNamesB, setFileNamesB] = useState([]);
    const [newFilesB, setNewFilesB] = useState([]);
    const [uploadFilesB, setUploadFilesB] = useState([]);
    
    const [instalacionPropia, setInstalacionPropia] = useState(false);
    const [devuelto, setDevuelto] = useState(false);
    const [registroDuplicado, setRegistroDuplicado] = useState(false);
    const [toggleConfirmDuplicado, setToggleConfirmDuplicado] = useState(false);
    const [datosPendientes, setDatosPendientes] = useState(null);

    // Al clicar en cerrar, se resetea el formulario
    const onClickCerrar = () => {
        setToggleVentaSuccess(false);
        document.getElementById("datosVenta").reset();
        setFileNames([]);
        setNewFiles([]);
        setUploadFiles([]);
        setFileNamesB([]);
        setNewFilesB([]);
        setUploadFilesB([]);
        setInstalacionPropia(false);
        setDevuelto(false);
        setRegistroDuplicado(false);
        setDatosPendientes(null);
    }

    // Add onDropA handler
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
    }, [newFiles, fileNames]);

    // Add quitarDocumentoA handler
    const quitarDocumentoA = (name) => {
        setNewFiles(newFiles.filter((item) => item.name !== name.NOMBRE));
        setFileNames(fileNames.filter((item) => item !== name));
    };

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
  const quitarDocumentoB = (name) => {
    setNewFilesB(newFilesB.filter((item) => item.name !== name.NOMBRE));
    setFileNamesB(fileNamesB.filter((item) => item !== name));
  };
    // Comprueba si el registro (por CODIGO_VENTA) tiene documentación firmada subida.
    // Devuelve null si no existe el registro, true/false según tenga PARTE A/B FIRMADO.
    const comprobarDocumentacionFirmada = async (identificador) => {
        const resVenta = await client.query({
            query: getVentasAllCentros,
            fetchPolicy: "no-cache",
            variables: {
                limit: 1,
                fields: { CODIGO_VENTA: identificador },
            },
        });
        const ventas = resVenta.data.getLeroyInstalacionesView;
        if (!ventas || ventas.length === 0) {
            return null;
        }

        const resTipos = await client.query({
            query: GET_TIPO_DOCUMENTOS,
            fetchPolicy: "no-cache",
        });
        const tiposFirmados = resTipos.data.getLeroyInstalacionesTipoDocumento
            .filter((tipo) => tipo.NOMBRE === "PARTE A FIRMADO" || tipo.NOMBRE === "PARTE B FIRMADO")
            .map((tipo) => tipo.ID.toString());

        const resDocumentosIds = await client.query({
            query: getRetiradaDocumentosId,
            fetchPolicy: "no-cache",
            variables: {
                retiradaId: ventas[0].ID.toString(),
            },
        });
        const documentosIds = resDocumentosIds.data.getLeroyInstalacionesLeroyInstalacionesDocumento;

        for (let i = 0; i < documentosIds.length; i++) {
            const resDocumento = await client.query({
                query: getDocumentosById,
                fetchPolicy: "no-cache",
                variables: {
                    id: documentosIds[i].LEROY_INSTALACIONES_DOCUMENTO_ID.toString(),
                },
            });
            const documento = resDocumento.data.getLeroyInstalacionesDocumento[0];
            if (documento && tiposFirmados.includes(documento.TIPO_DOCUMENTO_ID.toString())) {
                return true;
            }
        }
        return false;
    }

    // Enviar datos a la API usando FormData con todos los inputs del formulario
    const enviarFormulario = (datos) => {
        const formData = new FormData();
        formData.append("accion", "cargarpartebinstalaciones");
        formData.append("identificador", datos.identificador);
        formData.append("instalacionpropia", datos.instalacionpropia);
        formData.append("devuelto", datos.devuelto);
        formData.append("registro_duplicado", datos.registro_duplicado);
        formData.append("ref_instalacion", datos.ref_instalacion);
        formData.append("codigo_devolucion", datos.codigo_devolucion);
        formData.append("user", user.nickname);

        // Add Parte A files
        newFiles.forEach(file => {
            formData.append('documentoA', file);
        });

        // Add Parte B files
        newFilesB.forEach(file => {
            formData.append('documento', file);
        });

        formData.append("direct", "true");

        const requestOptions = {
            method: 'POST',
            body: formData
        };
        fetch(`${API_INPRONET}/core/controller/LeroyInstalacionesController.php`, requestOptions)
          .then(response => response.json())
          .then(data => {
                setToggleVentaSuccess(true)
          })
          .catch(err => {
              console.log(err)
              if(err){
                setToggleVentaErrorDocument(true)
              }
        })
    }

    const onSubmitForm = async (e) => {
        e.preventDefault();
        // Validar campos obligatorios si los checkboxes están seleccionados
        if (instalacionPropia && !e.target.referencia_instalacion.value) {
            alert('Por favor, complete el campo "REFERENCIA INSTALACION".');
            return;
        }

        if (devuelto && !e.target.codigo_devolucion.value) {
            alert('Por favor, complete el campo "CÓDIGO DEVOLUCIÓN".');
            return;
        }

        if (registroDuplicado && !e.target.identificador.value) {
            alert('Por favor, indique el ID del documento.');
            return;
        }

        // Capturar los valores del formulario antes de las comprobaciones asíncronas
        const datos = {
            identificador: e.target.identificador.value,
            instalacionpropia: e.target.instalacion_propia.checked,
            devuelto: e.target.devuelto.checked,
            registro_duplicado: e.target.registro_duplicado.checked,
            ref_instalacion: e.target.referencia_instalacion ? e.target.referencia_instalacion.value:'',
            codigo_devolucion: e.target.codigo_devolucion ? e.target.codigo_devolucion.value: '',
        };

        if (registroDuplicado) {
            let tieneFirmados;
            try {
                tieneFirmados = await comprobarDocumentacionFirmada(datos.identificador);
            } catch (err) {
                console.log(err);
                alert('No se ha podido comprobar la documentación del registro. Inténtelo de nuevo.');
                return;
            }
            if (tieneFirmados === null) {
                alert('No se ha encontrado ningún registro con ese ID.');
                return;
            }
            if (tieneFirmados) {
                setDatosPendientes(datos);
                setToggleConfirmDuplicado(true);
                return;
            }
        }

        enviarFormulario(datos);
    }

    return (
        <div>
            <div className="content">
                <section className="box">
                    <div className= "content-body">
                        <h2>GESTIONES OTRAS TIENDAS</h2>
                        <Form id="datosVenta" onSubmit={onSubmitForm}>
                            <Row form>
                                <Col md={3}>
                                    <FormGroup>
                                        <Label for="identificador">Indique el ID del documento</Label>
                                        <Input type="text" name="identificador" id="identificador" />
                                    </FormGroup>
                                </Col>
                            </Row>
                            {/* Add Parte A Dropzone */}
                            <Row form>
                                <Col md={3}>
                                    <FormGroup>
                                        <Label style={{ fontSize: "18px" }}>Añadir parte A:</Label>
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
                                                        <span style={{ cursor: "pointer", fontSize: "36px" }}>{isDragActive ? "📂" : "📁"}</span>
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
                                    </FormGroup>
                                </Col>
                            </Row>
                            {/* Existing Parte B Dropzone */}
                            <Row form>
                                <Col md={3}>
                                    <FormGroup>
                                    <Label style={{ fontSize: "18px" }}>Añadir parte B:</Label>
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
                                            <span style={{ cursor: "pointer", fontSize: "36px"  }}>{isDragActive ? "📂" : "📁"}</span>
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
                                    </FormGroup>
                                </Col>
                            </Row>
          <Row form>
          <Col md={5}>
  <FormGroup>
    <Label md={5}>INSTALACION LEROY</Label>
    <Input
      id="instalacion_propia"
      type="checkbox"
      onChange={(e) => setInstalacionPropia(e.target.checked)}
      style={{ backgroundColor: '#fff',
      border: '2px solid #ccc',
      borderRadius: '3px' }}
    />
  </FormGroup>
</Col></Row>
{instalacionPropia && (
                                <Row form>
                                    <Col md={5}>
                                        <FormGroup>
                                            <Label md={4}>Ticket de instalación</Label>
                                            <Input
                                                                                             id="referencia_instalacion"
                                                                                             name="referencia_instalacion"
                                                                                             type="text"
                                                                                             style={{ width: '200px', height: '30px' }}
                                                                                             required={instalacionPropia}  // Requerido si checkbox seleccionado
                                                                                          />
                                        </FormGroup>
                                    </Col>
                                </Row>
                            )}
<Row form>
<Col md={5}>
  <FormGroup>
    <Label md={5}>DEVUELTO/ANULADO</Label>
    <Input
      id="devuelto"
      type="checkbox"
      onChange={(e) => setDevuelto(e.target.checked)}
      style={{ backgroundColor: '#fff',
      border: '2px solid #ccc',
      borderRadius: '3px' }}
    />
  </FormGroup>
</Col>
            </Row>
            {devuelto && (
                                <Row form>
                                    <Col md={5}>
                                        <FormGroup>
                                            <Label md={5}>Ticket de Devolución/Anulación</Label>
                                            <Input
 id="codigo_devolucion"
 name="codigo_devolucion"
 type="text"
 style={{ width: '200px', height: '30px' }}
 required={devuelto}  // Requerido si checkbox seleccionado

                                            />
                                        </FormGroup>
                                    </Col>
                                </Row>
                            )}
<Row form>
<Col md={5}>
  <FormGroup>
    <Label md={5}>REGISTRO DUPLICADO</Label>
    <Input
      id="registro_duplicado"
      type="checkbox"
      onChange={(e) => setRegistroDuplicado(e.target.checked)}
      style={{ backgroundColor: '#fff',
      border: '2px solid #ccc',
      borderRadius: '3px' }}
    />
  </FormGroup>
</Col>
            </Row>
                            <Row form>
                                <Col md={2}>
                                    <Button type="submit" color="primary" className="btn btn-primary btn-lg btn-block">Guardar</Button>
                                </Col>
                            </Row>
                        </Form>
                    </div>
                </section>
            </div>
            {/* MODALES */}
            {toggleConfirmDuplicado ? (
                <Modal isOpen={toggleConfirmDuplicado} toggle={()=>{setToggleConfirmDuplicado(!toggleConfirmDuplicado)}}>
                <ModalHeader >Registro duplicado</ModalHeader>
                <ModalBody>El archivo que desea anular por duplicidad contiene documentación firmada, ¿está seguro que desea anularlo?
                </ModalBody>
                <ModalFooter>
        <Button color="primary" onClick={() => {
            setToggleConfirmDuplicado(false);
            enviarFormulario(datosPendientes);
            setDatosPendientes(null);
        }}>
          Aceptar
        </Button>
        <Button color="secondary" onClick={() => {
            setToggleConfirmDuplicado(false);
            setDatosPendientes(null);
        }}>
          Cancelar
        </Button>
      </ModalFooter>
              </Modal>
                ) : (<></>)
            }
            {toggleVentaSuccess ? (
                <Modal isOpen={toggleVentaSuccess} toggle={()=>{setToggleVentaSuccess(!toggleVentaSuccess)}}>
                <ModalHeader >Subir Documento</ModalHeader>
                <ModalBody>Información guardada correctamente.
                </ModalBody>
                <ModalFooter>
        <Button color="primary" onClick={onClickCerrar}>
          Cerrar
        </Button>
      </ModalFooter>
              </Modal>
                ) : (<></>)
            }
            {toggleVentaErrorDocument ? (
                <Modal isOpen={toggleVentaErrorDocument} toggle={()=>{setToggleVentaErrorDocument(!toggleVentaErrorDocument)}}>
                <ModalHeader >Subir Documento</ModalHeader>
                <ModalBody>Ha habido un error al subir el documento.
                </ModalBody>
                <ModalFooter>
        <Button color="primary" onClick={setToggleVentaErrorDocument(false)}>
          Cerrar
        </Button>
      </ModalFooter>
              </Modal>
                ) : (<></>)
            }
        </div>
    )
}

export default SubirParteB
