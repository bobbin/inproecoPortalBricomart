//PROD
export const API_INPRONET = "https://api.inpronet.es/inproecoweb2_0";

// QA
//export const API_INPRONET = "http://34.243.112.211/inproecoweb2_0";
//export const API_INPRONET = "https://api.dev.inpronet.es/inproecoweb2_0";

// CONSTANTES PARA BRICOMART

export const REGISTRO_VENTAS_COLUMNS = [
  { name: "CODIGO_VENTA", title: "Codigo Venta" },
  { name: "CENTRO_PRODUCTOR_NOMBRE", title: "Centro" },
  { name: "FECHA_VENTA", title: "Fecha compra" },
  { name: "NIF", title: "Nif" },
  { name: "EMAIL", title: "Email" },
  { name: "NOMBRE", title: "Nombre" },
  { name: "APELLIDO1", title: "Apellido 1" },
  { name: "APELLIDO2", title: "Apellido 2" },
  { name: "NOMBRE_VIA", title: "Calle" },
  { name: "LOCALIDAD_NOMBRE", title: "Localidad" },
  { name: "MARCA", title: "Marca" },
  { name: "MODELO", title: "Modelo" },
  { name: "NUMERO_SERIE", title: "Nº de Serie" },
  { name: "REFERENCIA", title: "Referencia" },
  { name: "NUMERO_PEDIDO", title: "Pedido" },
  { name: "VENTAONLINE", title: "Venta Online" },
  { name: "ESTADO_NOMBRE", title: "Estado" },
];

export const REGISTRO_VENTAS_EXPORT_COLUMNS = [
  { name: "CODIGO_VENTA", title: "Codigo Venta" },
  { name: "CENTRO_PRODUCTOR_NOMBRE", title: "Centro" },
  { name: "FECHA_VENTA", title: "Fecha compra" },
  { name: "NIF", title: "Nif" },
  { name: "NOMBRE", title: "Nombre" },
  { name: "APELLIDO1", title: "Apellido 1" },
  { name: "APELLIDO2", title: "Apellido 2" },
  { name: "NOMBRE_VIA", title: "Calle" },
  { name: "LOCALIDAD_NOMBRE", title: "Localidad" },
  { name: "MARCA", title: "Marca" },
  { name: "MODELO", title: "Modelo" },
  { name: "NUMERO_SERIE", title: "Nº de Serie" },
  { name: "REFERENCIA", title: "Referencia" },
  { name: "NUMERO_PEDIDO", title: "Pedido" },
  { name: "VENTAONLINE", title: "Venta Online" },
  { name: "ESTADO_NOMBRE", title: "Estado" },
];

// FIN CONSTANTES BRICOMART
export const COLUMNS_SERVICIOS = [
  { name: "ID", title: "ID" },
  { name: "GESTOR", title: "Gestor" },
  { name: "CLIENTE", title: "Cliente" },
  { name: "CENTRO", title: "Centro" },
  { name: "RESIDUO", title: "Residuo" },
  { name: "FECHA_SOLICITUD", title: "Fecha Solicitud" },
  { name: "FECHA_REALIZACION", title: "Fecha Servicio" },
  { name: "TRANSPORTISTA", title: "Transportista" },
  { name: "ESTADO", title: "Estado servicio" },
  { name: "CANTIDAD", title: "Cantidad" },
  { name: "OBSERVACIONES", title: "Observaciones" },
];

export const COLUMNS_FACTURACION = [
  { name: "GESTOR", title: "Gestor" },
  { name: "NUMFACTURA", title: "Nº Factura" },
  { name: "CLIENTE", title: "Cliente" },
  { name: "CENTRO", title: "Centro" },
  { name: "MES", title: "Mes" },
  { name: "ANYO", title: "Año" },
  { name: "ESTADO", title: "Estado" },
  { name: "CONCEPTO", title: "Concepto" },
  { name: "FECHA_FILTRADA", title: "Fecha Emisión" },
  { name: "IMPORTE", title: "Importe" },
];

export const COLUMNS_FACTURA_SERVICIOS = [
  { name: "ID", title: "Id" },
  { name: "CONCEPTO", title: "Concepto" },
  { name: "RESIDUO", title: "Residuo" },
  { name: "ESTADO", title: "Estado" },
  { name: "FECHA_SOLICITUD", title: "Fecha solicitud" },
  { name: "FECHA_REALIZACION", title: "Fecha realizacion" },
  { name: "CANTIDAD", title: "Cantidad" },
  { name: "TOTAL", title: "Total" },
];

export const HIDDEN_COLUMNS_FACTURACION = ["ID"];

export const compareDates = (firstDate, secondDate) => {
  if (firstDate == null) {
    firstDate = "1915/01/01";
  }
  if (secondDate == null) {
    secondDate = "1915/01/01";
  }

  const splittedFirstDate = firstDate.split("/");
  const dateA = new Date(
    splittedFirstDate[2],
    splittedFirstDate[1] - 1,
    splittedFirstDate[0]
  );

  const splittedSecondDate = secondDate.split("/");
  const dateB = new Date(
    splittedSecondDate[2],
    splittedSecondDate[1] - 1,
    splittedSecondDate[0]
  );

  if (dateA == dateB) {
    return 0;
  }
  return dateA < dateB ? -1 : 1;
};

export const compareTimestamps = (firstDate, secondDate) => {
  if (firstDate == null) {
    firstDate = "1915/01/01";
  }
  if (secondDate == null) {
    secondDate = "1915/01/01";
  }

  const dateA = new Date(firstDate);
  const dateB = new Date(secondDate);

  if (dateA == dateB) {
    return 0;
  }
  return dateA < dateB ? -1 : 1;

  
}

export const setMonth = (monthNumber) => {
  switch (monthNumber) {
    case "01":
      return "Enero";
    case "02":
      return "Febrero";
    case "03":
      return "Marzo";
    case "04":
      return "Abril";
    case "05":
      return "Mayo";
    case "06":
      return "Junio";
    case "07":
      return "Julio";
    case "08":
      return "Agosto";
    case "09":
      return "Septiembre";
    case "10":
      return "Octubre";
    case "11":
      return "Noviembre";
    case "12":
      return "Diciembre";
  }
};

//CONSTANTES DE PORTAL INPROECO BORRAR MÁS ADELANTE
export const RESIDUOS_LM = [
  { nombre: "Escombro CONTENEDOR" },
  { nombre: "Escombro SACA" },
];

export const GESTORES_LEROY_MATERIALES = [
  "TRANSFEL - RCD LME",
  "LLOPIS Servicios Ambientales",
  "Salmedina Saca - RCD LME",
  "Salmedina Contenedor - RCD LME",
  "Reciclados Pucelanos-RCD",
  "HORMIGONES ANGULO-RCD",
  "CORRECAMINOS-RCD",
  "CONTEM-RCD",
  "CONTECO LA POBLA-RCD",
  "Contenedores GARVI-RCD",
  "Contenedores CELDRAN-RCD",
  "TOT PER CONSTRUIR - RCD LME",
  "HICOMAT-RCD",
  "Recicab Materiales-RCD",
];

export const ESTADOS_BORRABLES = [
  "SOLICITADO",
  "CONFIRMADO",
  "PENDIENTE",
  "PLANIFICADO",
];

export const PERIODICIDAD_SERVICIOS = [
  "Diario",
  "Semanal",
  "Mensual",
  "Definible",
];

export const GET_RESULTS_SERVICIOS = (res) => {
  let results = [];
  for (let i = 0; i < res.data.getRetiradasView.length; i++) {
    res.data.getRetiradasView[i].id = res.data.getRetiradasView[i].ID;
    if (res.data.getRetiradasView[i].FECHA_ULTIMO_DOCUMENTO_GESTOR !== null) {
      // ESTE IF ES PORQUE AL HACER LAS QUERIES DE LOS FILTROS DE LAS COLUMNAS, LANZA MÁS DE LAS DEBIDAS Y DA ERROR EN EL FORMATO DE LA FECHA
      if (
        typeof res.data.getRetiradasView[i].dateUltimoDocumentoModified ==
        "undefined"
      ) {
        let options = { year: "numeric", month: "2-digit", day: "2-digit" };
        let date = new Date(
          res.data.getRetiradasView[i].FECHA_ULTIMO_DOCUMENTO_GESTOR
        );
        res.data.getRetiradasView[i]["FECHA_ULTIMO_DOCUMENTO_GESTOR"] =
          date.toLocaleString("es-ES", options);
        res.data.getRetiradasView[i].dateUltimoDocumentoModified = true;
      }
    }

    //Parsea a entero o decimal
    if (typeof res.data.getRetiradasView[i].CANTIDAD === "string") {
      res.data.getRetiradasView[i].CANTIDAD = res.data.getRetiradasView[i]
        .CANTIDAD
        ? res.data.getRetiradasView[i].CANTIDAD.indexOf(".") != -1
          ? parseFloat(res.data.getRetiradasView[i].CANTIDAD).toFixed(2)
          : parseInt(res.data.getRetiradasView[i].CANTIDAD)
        : res.data.getRetiradasView[i].CANTIDAD;
    }

    res.data.getRetiradasView[i].OBSERVACIONES =
      res.data.getRetiradasView[i].OBSERVACIONES === null
        ? ""
        : res.data.getRetiradasView[i].OBSERVACIONES;
    res.data.getRetiradasView[i].OBSERVACIONES_NEW = "";
    res.data.getRetiradasView[i].FACTURA = "";
    res.data.getRetiradasView[i].onEdit = false;
    results.push(res.data.getRetiradasView[i]);
  }
  return results;
};
