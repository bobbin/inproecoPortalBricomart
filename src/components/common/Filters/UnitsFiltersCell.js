import React, { useState, useContext, useEffect, useCallback } from "react";
import * as PropTypes from "prop-types";
import MultiSelect from "@khanacademy/react-multi-select";


// context
import { GlobalStateContext } from "../../../context/GlobalContext";

// hooks
import useFilters from "../../../hooks/useFilters";

// GRAPHQL
import { client, getCentros } from "../../../components/graphql";

let clickedOptionCentro = [];
let clickedOptionEstado = [];

const UnitsFilterCell = ({ onFilter, column, centros, estados }) => {
 
  const { value, setValue } = useFilters();
  const { user } = useContext(GlobalStateContext);
  const context = useContext(GlobalStateContext);
  /* const [centros, setCentros] = useState([]); */
  /* const [selected, setSelected] = useState([]); */

  /* const fetchCentros = useCallback(async () => {
    let results = [];
    await client
      .query({
        query: getCentros,
        fetchPolicy: "no-cache",
      })
      .then((res) => {
        console.log(res.data.getCentroProductor);
        for (let centro of res.data.getCentroProductor) {
          results.push(centro.DENOMINACION);
        }
      });
    setCentros(results);
  }, [client, getCentros]);

  useEffect(() => {
    fetchCentros();
  }, []); */

  //Variable global para las opciones de los checkbox seleccionadas
  
  
  let clickedOptionResiduo = [];
  let centrosCliente = [];
  let clickedPendiente = {};

  // Inicializamos colecciones
  //let gestores = [];
  let clientes = [];
  //let centros = [];
  let residuos = [];
  let transportistas = [];
  

  let elems = [];
  let col = [];
  let data = [];

  //Dropdowns normales
  /* if (column.name === "centro") {
    elems = centros ? centros : [];
    data = elems.map((elem) => {
      console.log(elem);
      return { label: elem, value: elem };
    });
  } */
  //if (column.name === "estado") elems = estados ? estados : [];

  //Dropdowns dinámicos
  useEffect(() => {}, [centros]);
  if (column.name === "centro") {
    
        elems=centros
        data = elems.map(elem => { return {label: elem, value: elem}})
   
  return (
    <th style={{ fontWeight: "normal" }}>
      <MultiSelect
                    selectAllLabel="Todos"
                    selectSomeItems="Seleccionar..."
                    options={data}
                    selected={clickedOptionCentro}
                    overrideStrings={{"selectSomeItems": "Seleccionar...", "search":"Buscar", "allItemsAreSelected":"Todos"}}
                    onSelectedChanged={selected =>{
                    
                        // Actualizamos el valor seleccionado              
                        clickedOptionCentro = selected
                       
                        // Callback a filtrado
                        onFilter(selected ? { value: selected } : null)
                        
                    }}
                />
    </th>
  );
}
if (column.name === "estado") {
    
  elems=estados
  data = elems.map(elem => { return {label: elem, value: elem}})

return (
<th style={{ fontWeight: "normal" }}>
<MultiSelect
              selectAllLabel="Todos"
              selectSomeItems="Seleccionar..."
              options={data}
              selected={clickedOptionEstado}
              overrideStrings={{"selectSomeItems": "Seleccionar...", "search":"Buscar", "allItemsAreSelected":"Todos"}}
              onSelectedChanged={selected =>{
              
                  // Actualizamos el valor seleccionado              
                  clickedOptionEstado = selected
                 
                  // Callback a filtrado
                  onFilter(selected ? { value: selected } : null)
              }}
          />
</th>
);
}
}
;

UnitsFilterCell.propTypes = {
  filter: PropTypes.shape({
    value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  }),
  onFilter: PropTypes.func.isRequired,
  column: PropTypes.shape({ name: PropTypes.string }).isRequired,
};

UnitsFilterCell.defaultProps = {
  filter: null,
};

export default UnitsFilterCell;
