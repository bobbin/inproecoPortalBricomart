import React, { useState, useEffect, useCallback, useContext } from 'react';
import { FilteringState, IntegratedFiltering } from "@devexpress/dx-react-grid";

//constants
import { REGISTRO_VENTAS_COLUMNS, REGISTRO_VENTAS_EXPORT_COLUMNS } from '../../../components/constants';

//graphql
import { client, getVentasByCentro, getVentasAllCentros, getVentasByCentroLM } from '../../../components/graphql';

// context
import { GlobalStateContext } from "../../../context/GlobalContext";

//components
import Layout from '../../../components/common/Layout/Layout'

const RegistroVentas = () => {
    const { user } = useContext(GlobalStateContext);  
    const { centroId } = user; 
    const columns = REGISTRO_VENTAS_COLUMNS;
    const [ventas, setVentas] = useState(null)
    const [lastQuery, setLastQuery] = useState();
    console.log(user)
    const fetchVentas = () => {
        if(user.rolDesc === "LEROY_INSTALACIONES_CENTRO" || user.rolDesc === "INPROECO") fetchVentasRoleCentro()
        else fetchVentasRoleCorporativo()
    }

    const fetchVentasRoleCentro = useCallback(() => {
        //let centro = `{ "CENTRO_ID": { "_eq": ${centroId} } }`
        client
            .query({
                query: getVentasByCentroLM,
                fetchPolicy: "no-cache",
                variables: {
                    limit: 5000,
                    //fields: JSON.parse(centro),
                    centroId: centroId
                    /* centroId: centroId */
                }
            })
            .then(res => {
                //console.log(res)
                let results = setEstadoName(res.data.getLeroyInstalacionesView);
                results = formatVentaOnline(results);
                setVentas(results);
            })
    }, [client, getVentasByCentroLM])
    const fetchVentasRoleCorporativo = useCallback(() => {
        client
            .query({
                query: getVentasAllCentros,
                fetchPolicy: "no-cache",
                variables: {
                    limit: 5000,
                    fields: lastQuery
                  },
            })
            .then(res => {
                let results = setEstadoName(res.data.getLeroyInstalacionesView);
                results = formatVentaOnline(results);
                setVentas(results);
            })
    }, [client, getVentasAllCentros])

    const setEstadoName = (ventas) => {
        let results = []
        console.log(ventas)
        if(!ventas) return results;
        for(let i = 0; i < ventas.length; i++){
            if(ventas[i].estado_venta) ventas[i].estado = ventas[i].estado_venta.nombre
            results.push(ventas[i])
        }
        return results;
    }

    const formatVentaOnline = (ventas) => {
        let results = []
        if(!ventas) return results;
        for(let i = 0; i < ventas.length; i++){
            // Formatear VENTAONLINE: 1 = "Sí", 0 = "No", null/undefined = "No"
            if(ventas[i].VENTAONLINE === 1) {
                ventas[i].VENTAONLINE = "Sí"
            } else {
                ventas[i].VENTAONLINE = "No"
            }
            results.push(ventas[i])
        }
        return results;
    }

    /* const setFechaFormatted = (ventas) => {
        let results = []
        for(let i = 0; i < ventas.length; i++){
            if(ventas[i].fecha_venta) ventas[i].fecha_venta = ventas[i].fecha_venta
            results.push(ventas[i])
        }
        console.log(results)
        return results;
    } */


    useEffect(() => {
        fetchVentas()
    }, [])

    return (
        <Layout
            title="Registro de ventas"
            rows={ventas}
            setRows={setVentas}
            columns={columns}
            columnsToExport={REGISTRO_VENTAS_EXPORT_COLUMNS}
            fetchVentas={fetchVentas}
            setEstadoName={setEstadoName}
            formatVentaOnline={formatVentaOnline}
            user={user}
            lastQuery={lastQuery}
            setLastQuery={setLastQuery}
        >
            {/* <FilteringState defaultFilters={[]} />
            <IntegratedFiltering /> */}
        </Layout>
    )
}

export default RegistroVentas
