<?php 

require_once(realpath($_SERVER["DOCUMENT_ROOT"]).'/inproecoweb2_0/core/entidades/LeroyInstalaciones.php');
require_once(realpath($_SERVER["DOCUMENT_ROOT"]).'/inproecoweb2_0/core/dao/LeroyInstalacionesDao.php');
require_once realpath($_SERVER["DOCUMENT_ROOT"]) . '/inproecoweb2_0/core/controller/LogController.php';
require_once realpath($_SERVER["DOCUMENT_ROOT"]) . '/inproecoweb2_0/core/controller/CentroProductorController.php';
require_once realpath($_SERVER["DOCUMENT_ROOT"]) . '/inproecoweb2_0/core/controller/EstadoLeroyInstalacionesController.php';
require_once realpath($_SERVER["DOCUMENT_ROOT"]) . '/inproecoweb2_0/core/controller/GeneradorDocumentoLeroyInstalacionesController.php';

if (isset($_POST['accion']) && $_POST['accion'] == 'AdjuntarDocumentoLeroyInstalaciones') {
	LeroyInstalacionesController::adjuntarDocumentoLeroyInstalaciones($_POST, $_FILES);
	if(isset($_POST['direct'])) {
		echo "done";
		exit();
	}
	header("Location: ../../registroventas_linstalaciones.php?instalacionId=".$_POST['instalacionId']."&editarDocumentacion=1");

} else if (isset($_POST['accion']) && $_POST['accion'] == 'obtenerModelosPorMarca') {
	$listado =  LeroyInstalacionesController::obtenerModelosPorMarca($_POST['marca']);

	if(isset($_POST['html']) && $_POST['html']==true) {

		$html="";
		foreach($listado as $item)
			$html.="<option>$item</option>";
		print $html;
	} else 
		return $listado;
} else if (isset($_POST['accion']) && $_POST['accion'] == 'obtenerReferenciayGasPorModelo') {
	print LeroyInstalacionesController::obtenerReferenciayGasPorModelo($_POST['modelo']);
} else if (isset($_POST['accion']) && $_POST['accion'] == 'obtenerMarcaModeloyGasPorReferencia') {
	print LeroyInstalacionesController::obtenerMarcaModeloyGasPorReferencia($_POST['referencia']);
} else if (isset($_POST['accion']) && $_POST['accion'] == 'cargarparteinstalacionescliente' ) {

	if(LeroyInstalacionesController::cargarParte(strtoupper($_POST['tipo']), $_POST['identificador'], $_FILES)) {
		header("Location: ../../upload_leroyinstalaciones.php?tipo=".$_POST['tipo']."&resultado=OK");
	}
	else {
		header("Location: ../../upload_leroyinstalaciones.php?tipo=".$_POST['tipo']."&resultado=ERROR");
	}

}
else if (isset($_POST['accion']) && $_POST['accion'] == 'cargarpartebinstalaciones' ) {

	$resultado = LeroyInstalacionesController::cargarParte("B", $_POST['identificador'], $_FILES);

	// Anulacion por registro duplicado: cambiar estado y avisar al cliente por email
	if (isset($_POST['registro_duplicado']) && $_POST['registro_duplicado'] === 'true') {
		if(LeroyInstalacionesController::marcarRegistroDuplicado($_POST['identificador']))
			$resultado = true;
	}

	if($resultado) {
		if(isset($_POST['direct'])) {
			$respuesta = array(
				"resultado" => "OK"
			);

			echo json_encode($respuesta);
			exit();
		}
		header("Location: ../../uploadfile_b_linstalaciones.php?resultado=OK");
	}
	else {
		if(isset($_POST['direct'])) {
			$respuesta = array(
				"resultado" => "KO"
			);

			echo json_encode($respuesta);
			exit();
		}
		header("Location: ../../uploadfile_b_linstalaciones.php?resultado=ERROR");
	}

} else if (isset($_POST['accion']) && $_POST['accion'] == 'editarLeroyInstalaciones') {

	if(isset($_POST['instalacionpropia']))
		$instalacionPropia = $_POST['instalacionpropia'];
	else $instalacionPropia = 0;
	
	if(isset($_POST['devuelto']))
		$devuelto = $_POST['devuelto'];
	else $devuelto = 0;

	LeroyInstalacionesController::editarLeroyMateriales($_POST['instalacionId'],
		$instalacionPropia, $devuelto);
		
		header("Location: ../../registroventas_linstalaciones.php");
} 
else if (isset($_POST['accion']) && $_POST['accion'] == 'guardarRetiradaLeroyInstalaciones') {
		$fechaAlta = $_POST['fechaventa'];
		LogController::escribirEntrada("Fecha Venta instalaciones $fechaAlta");
		if (!isset($_POST['fechaventa']) || substr($_POST['fechaventa'], 0, 10) == date("d/m/Y")) {
			LogController::escribirEntrada("Fecha Venta instalaciones IF");

			$fechaAlta = date("Y-m-d H:i:s");
		} else {
			LogController::escribirEntrada("Fecha Venta instalaciones Else");

			$fechaAlta = date("Y-m-d H:i:s", strtotime(str_replace('/', '-', $_POST['fechaventa'])));
		}
		LogController::escribirEntrada("Fecha Venta instalaciones $fechaAlta");

		list($idInstalacion,$linkA,$linkB) = LeroyInstalacionesController::guardarRetiradaLeroyInstalaciones(
			$_POST['nif'], $_POST['nombre'], $_POST['apellido1'],  $_POST['apellido2'],  
			$_POST['razon'], $_POST['tipovia'],  $_POST['nombrevia'], $_POST['numero'], 
			$_POST['piso'], $_POST['puerta'], $_POST['codigopostal'], $_POST['localidad'], 
			$_POST['provincia'], $_POST['telefono'], $_POST['email'], $_POST['marca'], 
			$_POST['modelo'], $_POST['referencia'],  $_POST['numserie'],  $_POST['cantidad'], 
			$_POST['tipogas'], $fechaAlta, $_POST['tienda'],  $_POST['ticket'], $_POST['numeropedido'], 
			$_POST['instalacionpropia'] == "1" ? 1 : 0, null, isset($_POST['ventatelefonica']) ? 1 : 0);

	if(isset($idInstalacion)) {

		header("Location: ../../solicitud_servicio_linstalaciones.php?resultado=OK&linkDocumentoA=".$linkA."&linkDocumentoB=".$linkB);

	} else {
		header("Location: ../../solicitud_servicio_linstalaciones.php?resultado=ERROR");

	}
	

} 



class LeroyInstalacionesController {

	function guardarRetiradaLeroyInstalaciones($nif, $nombre, $apellido1, $apellido2, $razonSocial, $tipoVia, $nombreVia, $numero, 
		$piso, $puerta, $cp, $localidad, $provincia, $telefono, $email, $marca,	$modelo, $referencia, $numeroSerie, 
		$cantidad, $tipoGas, $fechaVenta, $centroProductorId, $ticket, $numeroPedido, $instalacionPropia, $localidadExtranjera=null, $ventatelefonica=null) {
			
			$centroProductor = CentroProductorController::obtenerPorId($centroProductorId);
			$zonaId = $centroProductor->zonaId;

			if (isset($_POST['paisDireccion']) && !empty($_POST['paisDireccion']) && $_POST['paisDireccion'] != 'spain') {
				$ciudadFrancia = $_POST['localidadFra'];
				$ciudadPortugal = $_POST['localidadPor'];

				if (isset($ciudadFrancia) && !empty($ciudadFrancia)) {
					$localidadExtranjera = $ciudadFrancia;
					$localidad = '8117';
					$provincia = "54";
				}

				if (isset($ciudadPortugal) && !empty($ciudadPortugal)) {
					$localidadExtranjera = $ciudadPortugal;
					$localidad = '8117';
					$provincia = "55";
				}
			}
			
			$language = $_POST['language'];

			$duplicado = (int)$_POST['duplicado'];	
			if(isset($duplicado) && !empty($duplicado) && $duplicado < 0){
				 return;
			}
			if(isset($duplicado) && !empty($duplicado) && $duplicado != 0){
				return LeroyInstalacionesController::insertRetirada($nif, $nombre, $apellido1, $apellido2, $razonSocial, $tipoVia,
                                        $nombreVia, $numero, $piso, $puerta, $cp, $localidad, $provincia, $telefono, $email, $marca,
                                        $modelo,  $referencia, $numeroSerie, $cantidad, $tipoGas, $fechaVenta, $centroProductorId,
                                        $ticket, $numeroPedido, $instalacionPropia, $codigoVenta, $zonaId, $localidadExtranjera, $duplicado, $language,$ventatelefonica);
			} else {
				return LeroyInstalacionesController::insertRetirada($nif, $nombre, $apellido1, $apellido2, $razonSocial, $tipoVia,
                                        $nombreVia, $numero, $piso, $puerta, $cp, $localidad, $provincia, $telefono, $email, $marca,
                                        $modelo,  $referencia, $numeroSerie, $cantidad, $tipoGas, $fechaVenta, $centroProductorId,
                                        $ticket, $numeroPedido, $instalacionPropia, $codigoVenta, $zonaId, $localidadExtranjera, 1, $language,$ventatelefonica);
			}

	}
	
	function insertRetirada($nif, $nombre, $apellido1, $apellido2, $razonSocial, $tipoVia,
                                        $nombreVia, $numero, $piso, $puerta, $cp, $localidad, $provincia, $telefono, $email, $marca,
                                        $modelo,  $referencia, $numeroSerie, $cantidad, $tipoGas, $fechaVenta, $centroProductorId,
                                        $ticket, $numeroPedido, $instalacionPropia, $codigoVenta, $zonaId, $localidadExtranjera, $duplicado = 1, $language,$ventatelefonica){
			
		$codigosVenta = array();
		$idsInstalaciones= array();
                for($i = 1; $i <= $duplicado; $i++){
                     if($i <= 10) {
				$codigoVenta = LeroyInstalacionesController::getCode(7);
                     		$idInstalacion = LeroyInstalacionesDao::guardar($nif, $nombre, $apellido1, $apellido2, $razonSocial, $tipoVia,
                                 	 $nombreVia, $numero, $piso, $puerta, $cp, $localidad, $provincia, $telefono, $email, $marca,
                                         $modelo,  $referencia, $numeroSerie, $cantidad, $tipoGas, $fechaVenta, $centroProductorId,
                                         $ticket, $numeroPedido, $instalacionPropia, $codigoVenta, $zonaId, $localidadExtranjera, $ventatelefonica);

				if(isset($idInstalacion)) {
					array_push($idsInstalaciones, $idInstalacion);
             	        		array_push($codigosVenta, $codigoVenta);
                        		if($instalacionPropia) {
                        			$estado = EstadoLeroyInstalacionesController::obtenerPorNombre("INSTALACION LEROY MERLIN");
                        		} else {
                                		$estado = EstadoLeroyInstalacionesController::obtenerPorNombre("SIN DOCUMENTACION");
                        		}
                    	 		LeroyInstalacionesDao::cambiarEstado($idInstalacion, $estado->id);

                      		} else {
                     	 		return array(null, null, null);
                      		}
			}
                  }
                  // Generar documentos
           	  // devolver documentos ruta para ponerlos en el modal
                   list($idDocumentoA,$linkA) = GeneradorDocumentoLeroyInstalacionesController::generarDocumento($nif, $nombre, $apellido1, $apellido2, $razonSocial, $tipoVia,
                                $nombreVia, $numero, $piso, $puerta, $cp, $localidad, $provincia, $telefono, $email, $marca,
                                $modelo,  $referencia, $numeroSerie, $cantidad, $tipoGas, $fechaVenta, $centroProductorId,
                                $ticket, $numeroPedido, $instalacionPropia, $codigosVenta, $zonaId, "A", $language, $ventatelefonica);
                        for($i=0;$i<count($idsInstalaciones);$i++){
                   LeroyInstalacionesDao::asociarDocumento($idsInstalaciones[$i], $idDocumentoA);
                        }

                   list($idDocumentoB,$linkB) = GeneradorDocumentoLeroyInstalacionesController::generarDocumento($nif, $nombre, $apellido1, $apellido2, $razonSocial, $tipoVia,
                                                $nombreVia, $numero, $piso, $puerta, $cp, $localidad, $provincia, $telefono, $email, $marca,
                                                $modelo,  $referencia, $numeroSerie, $cantidad, $tipoGas, $fechaVenta, $centroProductorId,
                                                $ticket, $numeroPedido, $instalacionPropia, $codigosVenta, $zonaId, "B", $language, $ventatelefonica);

                        for($i=0;$i<count($idsInstalaciones);$i++){
                    LeroyInstalacionesDao::asociarDocumento($idsInstalaciones[$i], $idDocumentoB);
                        }

                    LeroyInstalacionesController::enviarEmailNuevaVenta($email, $linkA, $linkB, $instalacionPropia);
                    return array($idInstalacion, $linkA, $linkB);

	}	

	function enviarEmailNuevaVenta($email, $linkA, $linkB, $instalacionPropia) {
			
			$rutaPlantilla = realpath($_SERVER["DOCUMENT_ROOT"]) . '/inproecoweb2_0/documentos/emailsnotificacion/nuevaventaleroyinstalaciones.html';
			$claves = array('_LINKA_', '_LINKB_', '_INSTALACION_PROPIA_');
			$textoInstalacionPropia = '';
			
			LogController::escribirEntrada("Mandando email leroy instalaciones instalacionPropia $instalacionPropia");
			if(isset($instalacionPropia) && $instalacionPropia==1) {
				$textoInstalacionPropia = 'Al contratar la instalaci&oacute;n del equipo con LEROY MERL&Iacute;N, no es necesario que nos remita la PARTE B';
				LogController::escribirEntrada("Mandando email leroy instalaciones instalacionPropia con texto custom");
			}
			$valores = array($linkA, $linkB, $textoInstalacionPropia);

			$destinatarios=array($email);
			$asunto = 'Adquisión equipo gases fluorados - LEROY MERLÍN';
			EmailController::enviarMailAttachment($rutaPlantilla, $claves, $valores, array_unique($destinatarios), $asunto, -1, array($linkB,$linkA));

	}

	function enviarCambioInstalacionPropia($email, $linkB) {
			
		$rutaPlantilla = realpath($_SERVER["DOCUMENT_ROOT"]) . '/inproecoweb2_0/documentos/emailsnotificacion/solopartebventaleroyinstalaciones.html';
		$claves = array('_LINKB_');
		$valores = array($linkB);

		$destinatarios=array($email);
		$asunto = 'Instalación equipo gases fluorados - LEROY MERLÍN';
		EmailController::enviarMailAttachment($rutaPlantilla, $claves, $valores, array_unique($destinatarios), $asunto, -1, array($linkB,$linkA));

	}

	function enviarDevuelto($email, $codigo) {
			
		$rutaPlantilla = realpath($_SERVER["DOCUMENT_ROOT"]) . '/inproecoweb2_0/documentos/emailsnotificacion/devueltoleroyinstalaciones.html';
		$claves = array('_CODE_');
		$valores = array($codigo);

		$destinatarios=array($email);
		$asunto = 'Devolución equipo gases fluorados - LEROY MERLÍN';
		EmailController::enviarMailAttachment($rutaPlantilla, $claves, $valores, array_unique($destinatarios), $asunto, -1, array());

	}

	function marcarRegistroDuplicado($identificador) {

		$instalacion = LeroyInstalacionesController::obtenerPorCodigo($identificador);
		if(!isset($instalacion)) {
			LogController::escribirEntrada("Registro duplicado: no existe instalacion con codigo $identificador");
			return false;
		}

		$estado = EstadoLeroyInstalacionesController::obtenerPorNombre('REGISTRO DUPLICADO');
		if(!isset($estado)) {
			LogController::escribirEntrada("Registro duplicado: no existe el estado REGISTRO DUPLICADO en la tabla de estados");
			return false;
		}

		LeroyInstalacionesDao::cambiarEstado($instalacion->id, $estado->id);
		LeroyInstalacionesController::enviarDuplicado($instalacion->email, $instalacion->codigoVenta);
		LogController::escribirEntrada("Registro duplicado: instalacion $identificador anulada y email enviado a ".$instalacion->email);

		return true;
	}

	function enviarDuplicado($email, $codigo) {

		$rutaPlantilla = realpath($_SERVER["DOCUMENT_ROOT"]) . '/inproecoweb2_0/documentos/emailsnotificacion/duplicadoleroyinstalaciones.html';
		$claves = array('_CODE_');
		$valores = array($codigo);

		$destinatarios=array($email);
		$asunto = 'Anulación de registro '.$codigo.' por error - LEROY MERLIN';
		EmailController::enviarMailAttachment($rutaPlantilla, $claves, $valores, array_unique($destinatarios), $asunto, -1, array());

	}

	function editarLeroyMateriales($id, $instalacionpropia, $devuelto) {

		// comprobar que se ha desmarcado InstalacionPropia
		$instalacion = LeroyInstalacionesController::obtenerPorId($id);

		// Se desmarca cuando ya esatba marcado anteriormente
		if($instalacion->instalacionPropia == 1 && $instalacionpropia==0 && $devuelto==0) {
			// Caso especial mandar email ....

			$documentosExistentes = LeroyInstalacionesController::obtenerIdsDocumentosPorInstalacionId($id);
			$linkB=null;
			$tipo = TipoDocumentoController::obtenerLeroyInstalacionesIdPorNombre('PARTE B SIN FIRMAR');

			$tipoAFirmado = TipoDocumentoController::obtenerLeroyInstalacionesIdPorNombre('PARTE A FIRMADO');
			$tipoBFirmado = TipoDocumentoController::obtenerLeroyInstalacionesIdPorNombre('PARTE B FIRMADO');
			$estadoFuturo = EstadoLeroyInstalacionesController::obtenerPorNombre('SIN DOCUMENTACION');
			
			foreach($documentosExistentes as $documentoId) {
				$documento = DocumentoController::obtenerLeroyInstalacionesPorId($documentoId);

				if($documento->tipoDocumentoId == $tipo->id)
					$linkB=$documento->ruta;
				
				if($documento->tipoDocumentoId == $tipoAFirmado->id)
					$estadoFuturo = EstadoLeroyInstalacionesController::obtenerPorNombre('PARTE A FIRMADO');
				
				if($documento->tipoDocumentoId == $tipoAFirmado->id) {
					$estadoFuturo = EstadoLeroyInstalacionesController::obtenerPorNombre('PARTE B FIRMADO');
					break 1;
				}
			}

			LeroyInstalacionesDao::cambiarInstalacionPropia($instalacion->id, 0);

			if(isset($estadoFuturo))
				LeroyInstalacionesDao::cambiarEstado($instalacion->id, $estadoFuturo->id);

			if(isset($linkB))
				LeroyInstalacionesController::enviarCambioInstalacionPropia($instalacion->email, $linkB);
			
		}

		// se marca cuando estaba a 0 y ahora pasa a 1
		if($instalacion->instalacionPropia == 0 && $instalacionpropia==1) {

			$estado = EstadoLeroyInstalacionesController::obtenerPorNombre('INSTALACION LEROY MERLIN');
			LeroyInstalacionesDao::cambiarInstalacionPropia($instalacion->id, $instalacionpropia);

			if(isset($estado))
				LeroyInstalacionesDao::cambiarEstado($id, $estado->id);
		}

		// Marcan devuelto
		if($devuelto==1) {

			$estado = EstadoLeroyInstalacionesController::obtenerPorNombre('DEVUELTO/ANULADO');
			LeroyInstalacionesDao::cambiarEstado($id, $estado->id);
			LeroyInstalacionesController::enviarDevuelto($instalacion->email, $instalacion->codigoVenta);

		}

	}

	function obtenerArrayRawDesdeVistaPorId($idServicio) {

		$res = LeroyInstalacionesDao::obtenerArrayRawDesdeVistaPorId($idServicio);

		while ($usuario = $res->fetch_assoc()) {
			return $usuario;

		}
	}
	
	function cargarParte($tipo, $identificador, $files) {

		// 1º Guardar Documento
		$idDocumento = null;
		$instalacion = LeroyInstalacionesController::obtenerPorCodigo($identificador);
		$id = $array['instalacionId'];

		if($tipo == "B")
			$tipoDocumento = TipoDocumentoController::obtenerLeroyInstalacionesIdPorNombre('PARTE B FIRMADO');
		else
			$tipoDocumento = TipoDocumentoController::obtenerLeroyInstalacionesIdPorNombre('PARTE A FIRMADO');


		if (isset($files) && !empty($files["documento"]["name"])) {

			$idDocumento = DocumentoController::subirLeroyInstalacionesDocumento($tipoDocumento->nombre, $files["documento"]["name"],
				$files["documento"]["size"], $files["documento"]["tmp_name"], "");

			if (isset($instalacion) && isset($idDocumento)){
				if($tipo == "B")
					$estado = EstadoLeroyInstalacionesController::obtenerPorNombre('PARTE B FIRMADO');	
				else 
					$estado = EstadoLeroyInstalacionesController::obtenerPorNombre('PARTE A FIRMADO');	
				LeroyInstalacionesDao::asociarDocumento($instalacion->id, $idDocumento);
				LeroyInstalacionesDao::cambiarEstado($instalacion->id, $estado->id);
				return true;
			}
		}

		return false;
	}


	function adjuntarDocumentoLeroyInstalaciones($array, $files) {

		// 1º Guardar Documento
		$idDocumento = null;
		if (!isset($array['tipoId']) || empty($array['tipoId'])) {
			$_SESSION['ERRORGRAVE'] = "El tipo de documento es obligatorio";
			header("Location: ../../registroventas_linstalaciones.php");
			return;
		}
		$id = $array['instalacionId'];
		$tipo = TipoDocumentoController::obtenerLeroyInstalacionesPorId($array['tipoId']);

		if (isset($files) && !empty($files["documento"]["name"])) {
			$idDocumento = DocumentoController::subirLeroyInstalacionesDocumento($tipo->nombre, $files["documento"]["name"],
				$files["documento"]["size"], $files["documento"]["tmp_name"], "");
			LeroyInstalacionesDao::asociarDocumento($id, $idDocumento);

		}

		// segun tipo adjuntado cambiar estado:
		// Si se adjunta parte a y no tiene mas documentos poner a PARTE A FIRMADA
		// Si se adjunt parte b poner a PARTE B FIRMADA
		$estadoFuturo = EstadoLeroyInstalacionesController::obtenerPorNombre('PARTE A FIRMADO');

		$instalacion = LeroyInstalacionesController::obtenerPorId($id);

		// Se desmarca cuando ya esatba marcado anteriormente
		if($instalacion->instalacionPropia == 1) {
			// No cambia de estado, se mantiene siempre en estado INSTALACION PROPIA
		} else {
			if (strpos($tipo->nombre, 'PARTE B') !== false) {
				$estado = EstadoLeroyInstalacionesController::obtenerPorNombre('PARTE B FIRMADO');	
				LeroyInstalacionesDao::cambiarEstado($id, $estado->id);
			} else {
				// Solo si no tiene ya documentos
				$documentosExistentes = LeroyInstalacionesController::obtenerIdsDocumentosPorInstalacionId($id);

				foreach($documentosExistentes as $documentoId) {
					$documento = DocumentoController::obtenerLeroyInstalacionesPorId($documentoId);
					$tipoBFirmado = EstadoLeroyInstalacionesController::obtenerPorNombre('PARTE B FIRMADO');	

					if($documento->tipoDocumentoId == $tipoBFirmado->id)
						$estadoFuturo = EstadoLeroyInstalacionesController::obtenerPorNombre('PARTE B FIRMADO');
				}
				if(count($estadoFuturo) <= 1)
					LeroyInstalacionesDao::cambiarEstado($id, $estadoFuturo->id);
			}
		}
	}

	function getCode($digits) { 
		$characters = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ'; 
		$randomString = ''; 
	  
		for ($i = 0; $i < $digits; $i++) { 
			$index = rand(0, strlen($characters) - 1); 
			$randomString .= $characters[$index]; 
		} 
	  
		return $randomString; 
	} 

	function crearDocumentoLeroyInstalaciones($nif, $nombre, $apellido1, $apellido2, $razonSocial, $tipoVia, 
		$nombreVia, $numero, $piso, $puerta, $cp, $localidad, $provincia, $telefono, $email, $marca,
		$modelo,  $referencia, $numeroSerie, $cantidad, $tipoGas, $fechaVenta, $centroProductorId, 
		$ticket, $numeroPedido, $instalacionPropia, $codigoVenta, $zonaId, $tipoDocumento) {

			return $link;
		}

	function obtenerIdsDocumentosPorInstalacionId($idInstalacion) {

		$res = LeroyInstalacionesDao::obtenerIdsDocumentosPorInstalacionId($idInstalacion);
		$lista = array();

		while ($usuario = $res->fetch_assoc()) {
			array_push($lista, $usuario['LEROY_INSTALACIONES_DOCUMENTO_ID']);
		}

		return $lista;
	}

	function obtenerPorId($id) {
		$res = LeroyInstalacionesDao::obtenerPorId($id);

		while ($tmp = $res->fetch_assoc()) {
		
			$user = LeroyInstalaciones::fullLeroyInstalaciones(
				$tmp['ID'],$tmp['NIF'],
				$tmp['NOMBRE'],$tmp['APELLIDO1'],
				$tmp['APELLIDO2'],$tmp['RAZON_SOCIAL'],
				$tmp['TIPO_DE_VIA'],$tmp['NOMBRE_VIA'],
				$tmp['NUMERO'],$tmp['PISO'],
				$tmp['PUERTA'],$tmp['CP'],
				$tmp['LOCALIDAD'],$tmp['PROVINCIA'],
				$tmp['TELEFONO'],$tmp['EMAIL'],
				$tmp['MARCA'],$tmp['MODELO'],
				$tmp['NUMERO_SERIE'],$tmp['CANTIDAD'],
				$tmp['TIPO_GAS'],$tmp['FECHA_VENTA'],
				$tmp['CENTRO_PRODUCTOR_ID'],
				$tmp['CODIGO_VENTA'],
				$tmp['ZONA_ID'],
				$tmp['ESTADO_ID'],
				$tmp['TICKET_COMPRA'],
				$tmp['NUMERO_PEDIDO'],
				$tmp['INSTALACION_PROPIA'],
				$tmp['REFERENCIA']);
			
				
			return $user;
		}
		return null;
	}

	function obtenerPorCodigo($codigo) {
		$res = LeroyInstalacionesDao::obtenerPorCodigoVenta($codigo);

		while ($tmp = $res->fetch_assoc()) {
	
			$user = LeroyInstalaciones::fullLeroyInstalaciones(
				$tmp['ID'],$tmp['NIF'],
				$tmp['NOMBRE'],$tmp['APELLIDO1'],
				$tmp['APELLIDO2'],$tmp['RAZON_SOCIAL'],
				$tmp['TIPO_DE_VIA'],$tmp['NOMBRE_VIA'],
				$tmp['NUMERO'],$tmp['PISO'],
				$tmp['PUERTA'],$tmp['CP'],
				$tmp['LOCALIDAD'],$tmp['PROVINCIA'],
				$tmp['TELEFONO'],$tmp['EMAIL'],
				$tmp['MARCA'],$tmp['MODELO'],
				$tmp['NUMERO_SERIE'],$tmp['CANTIDAD'],
				$tmp['TIPO_GAS'],$tmp['FECHA_VENTA'],
				$tmp['CENTRO_PRODUCTOR_ID'],
				$tmp['CODIGO_VENTA'],
				$tmp['ZONA_ID'],
				$tmp['ESTADO_ID'],
				$tmp['TICKET_COMPRA'],
				$tmp['NUMERO_PEDIDO'],
				$tmp['INSTALACION_PROPIA'],
				$tmp['REFERENCIA']);
			
				
			return $user;
		}
		return null;
	}

	function obtenerMarcas() {
		$res = LeroyInstalacionesDao::obtenerMarcas();

		$lista = array();

		while ($usuario = $res->fetch_assoc()) {
			array_push($lista, $usuario['MARCA']);
		}

		return $lista;
	}

	function obtenerModelosPorMarca($marca) {
		$res = LeroyInstalacionesDao::obtenerModelosPorMarca($marca);

		$lista = array();

		while ($usuario = $res->fetch_assoc()) {
			array_push($lista, $usuario['MODELO']);
		}
		return $lista;
	}

	function obtenerReferenciayGasPorModelo($modelo) {
		$res = LeroyInstalacionesDao::obtenerReferenciayGasPorModelo($modelo);
		
		while ($usuario = $res->fetch_assoc()) {
			if($usuario['REFERENCIA'])
				//array_push($lista, $usuario['REFERENCIA'], $usuario['TIPO_GAS']);
				return ($usuario['REFERENCIA'].";".$usuario['TIPO_GAS']);
			else return "";
		}

		return "";
	}

	function obtenerMarcaModeloyGasPorReferencia($referencia) {
		$res = LeroyInstalacionesDao::obtenerMarcaModeloyGasPorReferencia($referencia);
	
		while ($usuario = $res->fetch_assoc()) {
			if($usuario['MARCA']){	
				return ($usuario['MARCA'].";".$usuario['MODELO'].";".$usuario['TIPO_GAS']);
			} else return "";
		}

		return "";
	}

	
	  
	
}


?>
