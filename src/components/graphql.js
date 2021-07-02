import ApolloClient, { InMemoryCache, gql } from "apollo-boost";

export const client = new ApolloClient({
  //uri: 'http://63.33.70.172:8080/v1/graphql',
  uri: "https://back-inpr.app.inpronet.es/v1/graphql",
  //uri: "https://prod-back-inpronet.app.inpronet.es/v1/graphql",
  fetch,
  request: (operation) => {
    operation.setContext({
      headers: {
        "x-hasura-admin-secret": "inproeco2020",
      },
    });
  },
  cache: new InMemoryCache({
    addTypename: false,
  }),
});

// QUERIES
export const getRetiradasGestor = gql`
  query servicios($offset: Int, $limit: Int, $gestorId: String!) {
    getRetiradasView(
      offset: $offset
      limit: $limit
      where: { GESTOR_ID: $gestorId }
      orderBy: { FECHA_MODIFICACION: desc }
    ) {
      CANTIDAD
      CLIENTE
      CENTRO
      CENTRO_PRODUCTOR_ID
      CENTRO_PRODUCTOR_RESIDUO_ID
      GESTOR
      GESTOR_ID
      TRANSPORTISTA
      TRANSPORTISTA_ID
      ID
      FECHA_REALIZACION
      FECHA_SOLICITUD
      OBSERVACIONES
      RESIDUO
      RESIDUO_ID
      ESTADO
    }
  }
`;

export const getRetiradasByFechaRealizacion = gql`
  query servicios(
    $limit: Int
    $fields: retiradasViewWhereInput = { FECHA_SOLICITUD_ORDEN: ">20200100" }
  ) {
    getRetiradasView(
      limit: $limit
      where: $fields
      orderBy: { FECHA_MODIFICACION: desc }
    ) {
      CANTIDAD
      CLIENTE
      CENTRO
      CENTRO_PRODUCTOR_ID
      CENTRO_PRODUCTOR_RESIDUO_ID
      GESTOR
      GESTOR_ID
      TRANSPORTISTA
      TRANSPORTISTA_ID
      ID
      FECHA_REALIZACION
      FECHA_SOLICITUD
      OBSERVACIONES
      RESIDUO
      RESIDUO_ID
      ESTADO
    }
  }
`;

export const getGestoresByUser = gql`
  query gestores($gestorId: String!) {
    getGestor(where: { ID: $gestorId }) {
      id: ID
      nombre: NOMBRE
    }
  }
`;

export const getFacturasGestor = gql`
  query facturas($offset: Int, $limit: Int, $gestorId: String!) {
    getFacturasGestoresView(
      offset: $offset
      limit: $limit
      where: { GESTORID: $gestorId }
    ) {
      ID
      MES
      ANYO
      IMPORTE: BASE_IMPONIBLE
      RUTA_DOCUMENTO
      GESTOR: GESTORNOMBRE
      NUMFACTURA
      CLIENTE: CLIENTENOMBRE
      CENTRO: CENTRONOMBRE
      ESTADO
      CONCEPTO
      FECHA_FILTRADA
      FECHA
    }
  }
`;

export const getServiciosAnterioresEmisionFactura = gql`
  query servicios($limit: Int, $fields: retiradasViewWhereInput) {
    getRetiradasView(
      limit: $limit
      where: $fields
      orderBy: { FECHA_MODIFICACION: desc }
    ) {
      ID
      RESIDUO
      FECHA_SOLICITUD
      FECHA_REALIZACION
      CANTIDAD
    }
  }
`;

export const getDocumentoRuta = gql`
  query documentos($id: String!) {
    getDocumento(where: { ID: $id }) {
      RUTA
    }
  }
`;

export const getBaseImponibleFactura = gql`
  query facturas($id: String!) {
    getFacturasView(where: { ID: $id }) {
      baseImponible: BASE_IMPONIBLE
    }
  }
`;

export const getDocumentosByRetiradaId = gql`
  query documentos($retiradaId: String!) {
    getRetiradaDocumento(where: { RETIRADA_ID: $retiradaId }) {
      DOCUMENTO_ID
    }
  }
`;

export const getDocumentosById = gql`
  query documentos($id: String!) {
    getDocumento(where: { ID: $id }) {
      ID
      NOMBRE
      RUTA
    }
  }
`;

export const getGastosByCentroProductorResiduoId = gql`
  query gastos($centroProductorResiduoId: String!) {
    getCentroProductorResiduo(where: { ID: $centroProductorResiduoId }) {
      ABONO
      ALQUILER
      COSTE_PORTES
      COSTE_TRATAMIENTO
    }
  }
`;

export const getOtrosGastosFijosByCentroProductor = gql`
  query gastosFijo($centroProductorId: String!) {
    getCentroProductorOtrosGastosFijos(
      where: { CENTRO_PRODUCTOR_ID: $centroProductorId }
    ) {
      ID
      CONCEPTO
      TOTAL: IMPORTE
    }
  }
`;

// MUTATIONS
export const insertGastosResiduoOcasional = gql`
  mutation insert_gastosResiduoOcasionales(
    $fields: [gastosResiduoOcasionales_insert_input!]!
  ) {
    insert_gastosResiduoOcasionales(objects: $fields) {
      returning {
        id
        retirada_id
        coste_portes
        coste_tratamiento
        total_tratamiento
        coste_abono
        total_abono
        total
      }
    }
  }
`;

export const insertOtrosGastosOcasionales = gql`
  mutation insert_otrosGastosOcasionales(
    $fields: [otrosGastosOcasionales_insert_input!]!
  ) {
    insert_otrosGastosOcasionales(objects: $fields) {
      returning {
        ID: id
        CONCEPTO: concepto
        RESIDUO: residuo
        TOTAL: importe
      }
    }
  }
`;

export const updateEstadoFactura = gql`
  mutation updateFactura($newEstado: Int!, $id: String!) {
    updateFactura(
      FACTURA: { ESTADO_FACTURA_ID: $newEstado }
      where: { ID: $id }
    ) {
      ID
      ESTADO_FACTURA_ID
    }
  }
`;

// QUERIES DE PORTAL INPROECO BORRAR MÁS ADELANTE
export const getTotalCount = gql`
  query {
    countretiradas {
      Products
    }
  }
`;
export const getRetiradas = gql`
  query servicios(
    $offset: Int
    $limit: Int
    $fields: retiradasViewWhereInput = { FECHA_SOLICITUD_ORDEN: ">20200100" }
  ) {
    getRetiradasView(
      offset: $offset
      limit: $limit
      where: $fields
      orderBy: { FECHA_MODIFICACION: desc }
    ) {
      CANTIDAD
      CENTRO
      CENTRO_PRODUCTOR_ID
      CENTRO_PRODUCTOR_RESIDUO_ID
      CLIENTE
      GESTOR
      GESTOR_ID
      LER
      PELIGROSO_SIN_FECHA
      ESTADO_RETIRADA_ID
      ID
      FECHA_REALIZACION
      FECHA_SOLICITUD
      FECHA_ULTIMO_DOCUMENTO_GESTOR
      OBSERVACIONES
      SOLICITANTE
      PENDIENTE_REVISAR
      PENDIENTE_REVISAR_OBSERVACIONES
      RESIDUO
      RESIDUO_ID
      ESTADO
      TRANSPORTISTA
      TRANSPORTISTA_ID
      ZONA
    }
  }
`;
export const getRetiradasFilter = gql`
  query servicios($offset: Int, $limit: Int, $fields: retiradasViewWhereInput) {
    getRetiradasView(
      offset: $offset
      limit: $limit
      where: $fields
      orderBy: { FECHA_MODIFICACION: desc }
    ) {
      CANTIDAD
      CENTRO
      CENTRO_PRODUCTOR_ID
      CENTRO_PRODUCTOR_RESIDUO_ID
      CLIENTE
      GESTOR
      GESTOR_ID
      LER
      PELIGROSO_SIN_FECHA
      ESTADO_RETIRADA_ID
      ID
      FECHA_REALIZACION
      FECHA_SOLICITUD
      FECHA_ULTIMO_DOCUMENTO_GESTOR
      OBSERVACIONES
      SOLICITANTE
      PENDIENTE_REVISAR
      PENDIENTE_REVISAR_OBSERVACIONES
      RESIDUO
      RESIDUO_ID
      ESTADO
      TRANSPORTISTA
      TRANSPORTISTA_ID
      ZONA
    }
  }
`;

export const getRetiradasLeroyMateriales = gql`
  query serviciosLeroyMateriales(
    $offset: Int
    $limit: Int
    $fields: retiradasLeroyMaterialesViewWhereInput = {
      FECHA_SOLICITUD_ORDEN: ">20200100"
    }
  ) {
    getRetiradasLeroyMaterialesView(
      offset: $offset
      limit: $limit
      where: $fields
      orderBy: { FECHA_MODIFICACION: desc }
    ) {
      CANTIDAD
      CENTRO
      CENTRO_PRODUCTOR_ID
      CENTRO_PRODUCTOR_RESIDUO_ID
      CLIENTE
      GESTOR
      GESTOR_ID
      LER
      NUMEROSACAS
      ESTADO
      ID
      LM_MATERIALES_2
      FECHA_REALIZACION
      FECHA_SOLICITUD
      OBSERVACIONES
      SOLICITANTE
      PENDIENTE_REVISAR_OBSERVACIONES
      RESIDUO
      RESIDUO_ID
      ESTADO_RETIRADA_ID
      MANDANTE_DENOMINACION
      MANDANTE_TIPO
      MANDANTE_CALLE
      MANDANTE_TELEFONO
      TRANSPORTISTA
      TRANSPORTISTA_ID
      ZONA
    }
  }
`;

export const getRetiradasLeroyMaterialesFilter = gql`
  query serviciosLeroyMateriales(
    $offset: Int
    $limit: Int
    $fields: retiradasLeroyMaterialesViewWhereInput
  ) {
    getRetiradasLeroyMaterialesView(
      offset: $offset
      limit: $limit
      where: $fields
      orderBy: { FECHA_MODIFICACION: desc }
    ) {
      CANTIDAD
      CENTRO
      CENTRO_PRODUCTOR_ID
      CENTRO_PRODUCTOR_RESIDUO_ID
      CLIENTE
      GESTOR
      GESTOR_ID
      LER
      NUMEROSACAS
      ESTADO
      ID
      LM_MATERIALES_2
      FECHA_REALIZACION
      FECHA_SOLICITUD
      OBSERVACIONES
      SOLICITANTE
      PENDIENTE_REVISAR_OBSERVACIONES
      RESIDUO
      RESIDUO_ID
      ESTADO_RETIRADA_ID
      MANDANTE_DENOMINACION
      MANDANTE_TIPO
      MANDANTE_CALLE
      MANDANTE_TELEFONO
      TRANSPORTISTA
      TRANSPORTISTA_ID
      ZONA
    }
  }
`;

export const getRetiradasLeroyMaterialesByFechaRealizacion = gql`
  query serviciosLeroyMateriales($limit: Int, $dates: String) {
    getRetiradasLeroyMaterialesView(
      limit: $limit
      where: { FECHA_SOLICITUD_ORDEN: $dates }
      orderBy: { FECHA_MODIFICACION: desc }
    ) {
      CANTIDAD
      CENTRO
      CENTRO_PRODUCTOR_ID
      CENTRO_PRODUCTOR_RESIDUO_ID
      CLIENTE
      GESTOR
      GESTOR_ID
      LER
      NUMEROSACAS
      ESTADO
      ID
      LM_MATERIALES_2
      FECHA_REALIZACION
      FECHA_SOLICITUD
      OBSERVACIONES
      SOLICITANTE
      PENDIENTE_REVISAR_OBSERVACIONES
      RESIDUO
      RESIDUO_ID
      ESTADO_RETIRADA_ID
      MANDANTE_DENOMINACION
      MANDANTE_TIPO
      MANDANTE_CALLE
      MANDANTE_TELEFONO
      TRANSPORTISTA
      TRANSPORTISTA_ID
      ZONA
    }
  }
`;

export const getRetiradasLeroyInstalaciones = gql`
  query serviciosLeroyInstalaciones($offset: Int, $limit: Int) {
    getRetiradasLeroyInstalacionesView(offset: $offset, limit: $limit) {
      ID
      CODIGO_VENTA
      ZONA_NOMBRE
      CENTRO_PRODUCTOR_NOMBRE
      NIF
      EMAIL
      NOMBRE
      LOCALIDAD_NOMBRE
      MARCA
      MODELO
      REFERENCIA
      TICKET_COMPRA
      ESTADO_NOMBRE
      FECHA_VENTA_NORMAL
    }
  }
`;

export const getRetiradasLeroyInstalacionesFilter = gql`
  query serviciosLeroyInstalaciones(
    $offset: Int
    $limit: Int
    $fields: retiradasLeroyInstalacionesViewWhereInput
  ) {
    getRetiradasLeroyInstalacionesView(
      offset: $offset
      limit: $limit
      where: $fields
    ) {
      ID
      CODIGO_VENTA
      ZONA_NOMBRE
      CENTRO_PRODUCTOR_NOMBRE
      NIF
      EMAIL
      NOMBRE
      LOCALIDAD_NOMBRE
      MARCA
      MODELO
      REFERENCIA
      TICKET_COMPRA
      ESTADO_NOMBRE
      FECHA_VENTA_NORMAL
    }
  }
`;

export const FILE_UPLOAD_MUTATION = gql`
  mutation ($name: String!, $type: String!, $base64str: String!) {
    fileUpload(name: $name, type: $type, base64str: $base64str) {
      file_path
    }
  }
`;
export const GET_ESTADOS = gql`
  query estados {
    getEstadoRetirada {
      ID
      nombre: DESCRIPCION
    }
  }
`;
export const GET_ESTADO_BY_ID = gql`
  query estados($id: String!) {
    getEstadoRetirada(where: { ID: $id }) {
      nombre: DESCRIPCION
    }
  }
`;
export const GET_TIPO_DOCUMENTOS = gql`
  query tipo_documentos {
    getTipoDocumento {
      ID
      nombre: NOMBRE
    }
  }
`;
// MULTIQUERY PARA OBTENER TODO LO NECESARIO
export const GET_RETIRADA_COLS = gql`
  query residuos(
    $CENTRO_PRODUCTOR: String = ""
    $CENTRO_PRODUCTOR_RESIDUO_ID: String = ""
    $RETIRADA_ID: String = ""
  ) {
    getCentroProductorResiduo(
      where: { CENTRO_PRODUCTOR_ID: $CENTRO_PRODUCTOR }
    ) {
      ID
      RESIDUO_ID
      RESIDUO {
        NOMBRE
      }
    }
    getCentroProductorResiduoTransportista(
      where: { CENTRO_PRODUCTOR_RESIDUO_ID: $CENTRO_PRODUCTOR_RESIDUO_ID }
    ) {
      TRANSPORTISTA_ID
      TRANSPORTISTA {
        NOMBRE
      }
    }
    getCentroProductorResiduoGestor(
      where: { CENTRO_PRODUCTOR_RESIDUO_ID: $CENTRO_PRODUCTOR_RESIDUO_ID }
    ) {
      GESTOR_ID
      GESTOR {
        NOMBRE
      }
    }
    getRetiradaDocumento(where: { RETIRADA_ID: $RETIRADA_ID }) {
      NUMERO
      DOCUMENTO_ID
      FECHA_MODIFICACION
      DOCUMENTO {
        NOMBRE
        TIPO_DOCUMENTO_ID
        RUTA
        TIPO_DOCUMENTO(where: {}) {
          ID
          NOMBRE
          RUTAGUARDADO
        }
      }
    }
  }
`;

// QUERY PARA OBTENER DOCUMENTOS
export const GET_RETIRADA_DOCUMENTOS = gql`
  query documentos($DOCUMENTO_ID: String!) {
    getDocumento(where: { ID: $DOCUMENTO_ID }) {
      ID
      NOMBRE
      RUTA
      FECHA
      TIPO_DOCUMENTO_ID
      TIPO_DOCUMENTO {
        NOMBRE
        ID
      }
    }
  }
`;

// QUERY PARA OBTENER LOS DATOS PARA LOS DESPLEGABLES
export const GET_DESPLEGABLES = gql`
  query transportistas {
    getTransportistasView(limit: 500) {
      id: ID
      nombre: NOMBRE
    }
    getGestor(limit: 500) {
      id: ID
      nombre: NOMBRE
    }
    getClientesView(limit: 500) {
      id
      nombre
    }
    getZona(limit: 500) {
      nombre: NOMBRE
      id: ID
      cliente: CLIENTE {
        nombre: NOMBRE
      }
    }
    getResiduosView(limit: 500) {
      id: ID
      nombre: NOMBRE
    }
    getCentroProductor(limit: 1000, where: { BORRADO: "0" }) {
      nombre: DENOMINACION
      id: ID
      cliente: CLIENTE {
        nombre: NOMBRE
      }
    }
    getCentrosProductoresView(limit: 1000) {
      zona: ZONA_NOMBRE
      id: ID
      nombre: DENOMINACION
      cliente: CLIENTE_NOMBRE
    }
    getEstadoRetirada {
      id: ID
      nombre: DESCRIPCION
    }
  }
`;

// QUERY PARA OBTENER LOS DATOS PARA LOS DESPLEGABLES LEROY MATERIALES
export const GET_DESPLEGABLES_LM = gql`
  query transportistas {
    getTransportistasView(limit: 500) {
      id: ID
      nombre: NOMBRE
    }
    getGestor(limit: 500) {
      id: ID
      nombre: NOMBRE
    }
    getClientesView(limit: 500) {
      id
      nombre
    }
    getZona(where: { CLIENTE_ID: "21" }) {
      CLIENTE_ID
      nombre: NOMBRE
      ID
    }
    getResiduosView(limit: 500) {
      id: ID
      nombre: NOMBRE
    }
    getCentrosProductoresView(
      limit: 200
      where: { BORRADO: "0", CLIENTE_ID: "21" }
    ) {
      nombre: DENOMINACION
      id: ID
      cliente: CLIENTE_NOMBRE
      zona: ZONA_NOMBRE
    }
    getEstadoRetirada {
      id: ID
      nombre: DESCRIPCION
    }
  }
`;

export const GET_CENTROS = gql`
  query centros {
    getCentroProductor(limit: 500, where: { BORRADO: "0" }) {
      nombre: DENOMINACION
      id: ID
      cliente: CLIENTE {
        nombre: NOMBRE
      }
    }
    getCentrosProductoresView(limit: 1000) {
      zona: ZONA_NOMBRE
      id: ID
      nombre: DENOMINACION
      cliente: CLIENTE_NOMBRE
    }
  }
`;

export const GET_CENTROS_LM = gql`
  query centros {
    getCentrosProductoresView(
      limit: 200
      where: { BORRADO: "0", CLIENTE_ID: "21" }
    ) {
      nombre: DENOMINACION
      id: ID
      cliente: CLIENTE_NOMBRE
      zona: ZONA_NOMBRE
    }
  }
`;

export const GET_RESIDUOS_CENTRO = gql`
  query centro($id: String!) {
    getCentroProductorResiduo(where: { CENTRO_PRODUCTOR_ID: $id }) {
      id: ID
      residuo: RESIDUO {
        id: ID
        nombre: NOMBRE
      }
    }
  }
`;

export const GET_CENTRO_PRODUCTOR_RESIDUO = gql`
  query centro($centroId: String!, $residuoId: String!) {
    getCentroProductorResiduo(
      where: { CENTRO_PRODUCTOR_ID: $centroId, RESIDUO_ID: $residuoId }
    ) {
      id: ID
      residuo: RESIDUO {
        id: ID
        nombre: NOMBRE
      }
    }
  }
`;

export const GET_CENTROS_ZONA = gql`
  query centros($id: String!) {
    getCentrosProductoresView(where: { ZONA_ID: $id }) {
      id: ID
      denominacion: DENOMINACION
    }
  }
`;

export const GET_CENTROS_BY_NOMBRE_ZONA = gql`
  query centros($name: String!) {
    getCentrosProductoresView(where: { ZONA_NOMBRE: $name }) {
      id: ID
      nombre: DENOMINACION
    }
  }
`;

export const GET_SERVICIOS_PROGRAMADOS = gql`
  query serviciosProgramados {
    getRetiradasperiodicasView(limit: 1000, orderBy: { ID: desc }) {
      CENTRO
      CLIENTE
      FECHA_INICIO
      FECHA_PROXIMO
      FIJAR_FECHA_REALIZACION
      ID
      NOTIFICAR
      NOTIFICARNADA
      OBSERVACIONES
      PERIODICIDAD
      RESIDUO
      ZONA
    }
  }
`;

export const GET_FACTURAS = gql`
  query facturas {
    getFacturasView {
      numFactura: NUMFACTURA
      id: ID
    }
  }
`;

export const GET_FACTURAS_BY_NUMERO = gql`
  query facturas($numFactura: String!) {
    getFacturasView(where: { NUMFACTURA: $numFactura }) {
      numFactura: NUMFACTURA
      id: ID
    }
  }
`;

export const GET_FACTURA_RETIRADA = gql`
  query retirada($id: String!) {
    getRetirada(where: { ID: $id }) {
      numFactura: NUMFACTURA
    }
  }
`;

export const GET_GESTORES_RESIDUO = gql`
  query gestor($id: String!) {
    getCentroProductorResiduoGestor(
      where: { CENTRO_PRODUCTOR_RESIDUO_ID: $id }
    ) {
      activo: ACTIVO
      GESTOR {
        id: ID
        nombre: NOMBRE
      }
    }
  }
`;

export const GET_TRANSPORTISTAS_RESIDUO = gql`
  query transportistas($id: String!) {
    getCentroProductorResiduoTransportista(
      where: { CENTRO_PRODUCTOR_RESIDUO_ID: $id }
    ) {
      activo: ACTIVO
      TRANSPORTISTA {
        id: ID
        nombre: NOMBRE
      }
    }
  }
`;

export const GET_DOCUMENTOS_LEROY_INSTALACION = gql`
  query documentos($id: String!) {
    getLeroyInstalacionesDocumento(where: { ID: $id }) {
      nombre: NOMBRE
      tipoId: TIPO_DOCUMENTO_ID
      ruta: RUTA
    }
  }
`;

export const GET_ALL_DOCUMENTOS_LEROY_INSTALACION = gql`
  query documentos($id: String!) {
    getLeroyInstalacionesLeroyInstalacionesDocumento(
      where: { LEROY_INSTALACION_ID: $id }
    ) {
      documentoId: LEROY_INSTALACIONES_DOCUMENTO_ID
    }
  }
`;

export const GET_TIPO_DOCUMENTO = gql`
  query tipo($id: String!) {
    getLeroyInstalacionesTipoDocumento(where: { ID: $id }) {
      nombre: NOMBRE
    }
  }
`;

export const GET_PENDIENTES = gql`
  query tipo($value: retiradasViewWhereInput, $limit: Int) {
    getRetiradasView(limit: $limit, where: $value) {
      CANTIDAD
      CENTRO
      CENTRO_PRODUCTOR_ID
      CENTRO_PRODUCTOR_RESIDUO_ID
      CLIENTE
      GESTOR
      GESTOR_ID
      LER
      PELIGROSO_SIN_FECHA
      ESTADO_RETIRADA_ID
      ID
      FECHA_REALIZACION
      FECHA_SOLICITUD
      FECHA_ULTIMO_DOCUMENTO_GESTOR
      OBSERVACIONES
      SOLICITANTE
      PENDIENTE_REVISAR
      PENDIENTE_REVISAR_OBSERVACIONES
      RESIDUO
      RESIDUO_ID
      ESTADO
      TRANSPORTISTA
      TRANSPORTISTA_ID
      ZONA
    }
  }
`;

export const GET_PENDIENTES_LEROY_MATERIALES = gql`
  query tipo($limit: Int) {
    getRetiradasLeroyMaterialesView(
      limit: $limit
      where: { PENDIENTE_REVISAR_OBSERVACIONES: "1" }
    ) {
      CANTIDAD
      CENTRO
      CENTRO_PRODUCTOR_ID
      CENTRO_PRODUCTOR_RESIDUO_ID
      CLIENTE
      GESTOR
      GESTOR_ID
      LER
      ESTADO_RETIRADA_ID
      ID
      FECHA_REALIZACION
      FECHA_SOLICITUD
      OBSERVACIONES
      SOLICITANTE
      PENDIENTE_REVISAR_OBSERVACIONES
      RESIDUO
      RESIDUO_ID
      ESTADO
      TRANSPORTISTA
      TRANSPORTISTA_ID
      ZONA
    }
  }
`;

export const GET_LER_BY_RESIDUO = gql`
  query ler($id: String!) {
    getResiduosView(where: { ID: $id }) {
      LER
    }
  }
`;

export const getRetiradasMainFilter = gql`
  query servicios($fields: retiradasViewWhereInput, $limit: Int) {
    getRetiradasView(
      limit: $limit
      where: $fields
      orderBy: { FECHA_MODIFICACION: desc }
    ) {
      CANTIDAD
      CENTRO
      CENTRO_PRODUCTOR_ID
      CENTRO_PRODUCTOR_RESIDUO_ID
      CLIENTE
      GESTOR
      GESTOR_ID
      LER
      PELIGROSO_SIN_FECHA
      ESTADO_RETIRADA_ID
      ID
      FECHA_REALIZACION
      FECHA_SOLICITUD
      FECHA_ULTIMO_DOCUMENTO_GESTOR
      OBSERVACIONES
      SOLICITANTE
      PENDIENTE_REVISAR
      PENDIENTE_REVISAR_OBSERVACIONES
      RESIDUO
      RESIDUO_ID
      ESTADO
      TRANSPORTISTA
      TRANSPORTISTA_ID
      ZONA
    }
  }
`;
