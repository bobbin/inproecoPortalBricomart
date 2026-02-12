import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
  useContext,
} from "react";
import { Row, Col } from "reactstrap";
import {
  IntegratedSorting,
  SortingState,
  SearchState,
  FilteringState,
  IntegratedFiltering,
  RowDetailState,
  PagingState,
  IntegratedPaging,
} from "@devexpress/dx-react-grid";
import { DataTypeProvider } from '@devexpress/dx-react-grid';

import { SearchPanel } from "@devexpress/dx-react-grid-bootstrap4";
import {
  Grid,
  TableHeaderRow,
  VirtualTable,
  TableColumnVisibility,
  TableFilterRow,
  Toolbar,
  ExportPanel,
  TableRowDetail,
  PagingPanel,
} from "@devexpress/dx-react-grid-bootstrap4";
import {
  Template,
  TemplatePlaceholder,
  TemplateConnector,
} from "@devexpress/dx-react-core";
import "@devexpress/dx-react-grid-bootstrap4/dist/dx-react-grid-bootstrap4.css";
import { GridExporter } from "@devexpress/dx-react-grid-export";
import saveAs from "file-saver";

// COMPONENTS
import FilterCell from "../../common/Filters/FilterCell";
import RowVentaActions from "../Icons/RowVentaActions";
import ClearFilters from "../Filters/ClearFilters";

// CONSTANTS
import { compareDates, compareTimestamps } from "./../../constants";

// CONTEXT
import {
  GlobalStateContext,
  GlobalDispatchContext,
} from "../../../context/GlobalContext";

// GRAPHQL
import {
  client,
  getVentasAllCentros,
  getVentasByCentroFilter,
  getCentros,
  getVentasByCentroLM,
  getVentasByCentro,
  getCentroName,
} from "../../graphql";
import { fi } from "date-fns/locale";

const Layout = ({
  title,
  rows,
  setRows,
  columns,
  columnsToExport,
  children,
  fetchVentas,
  setEstadoName,
  formatVentaOnline,
  user,
  lastQuery,
  setLastQuery,
}) => {
  const { filtersApplied } = useContext(GlobalStateContext);

  const dispatch = useContext(GlobalDispatchContext);
  const getRowId = (row) => row.ID;
  const filterRowMessages = {
    filterPlaceholder: "Filtrar...",
  };
  const [filterRows, setFilterRows] = useState([]);
  const [filters, setFilters] = useState([]);
  const [count, setCount] = useState(null);
  const [pageSizes] = React.useState([5, 10, 15]);
  /* const [filtersApplied, setFiltersApplied] = useState([]); */
  const [dateColumns] = useState(['FECHA_VENTA']);
  // SORTING DE FECHAS
  const [integratedSortingColumnExtensions] = useState([
    { columnName: "FECHA_SOLICITUD", compare: compareDates },
    { columnName: "FECHA_VENTA", compare: compareTimestamps },

  ]);

  const [tableColumnExtensions] = useState([
    { columnName: "NUMERO_SERIE", width: "210px" },
  ]);


  // FILTRO COLUMNA
  const columnFilterMultiPredicate = (value, filter, row) => {
    if (!filter.value.length) return true;
    for (let i = 0; i < filter.value.length; i++) {
      if (value === filter.value[i]) return true;
    }

    return IntegratedFiltering.defaultPredicate(value, filter, row);
  };
  const columnFilterDateTimePredicate = (value, filter, row) => {
    // transformar el valor de la celda a un objeto Date
    const date = new Date(value);
    // transformar date a un string con formato DD/MM/YYYY
    const dateString = date.toLocaleDateString('es-ES', { year: 'numeric', month: '2-digit', day: '2-digit' });

    // obtener el valor del filtro
    const { value: filterValue } = filter;
    // si el filtro no tiene valor, devolver verdadero
    if (!filterValue) return true;
    // si la fecha es anterior al filtro, devolver falso
    if (dateString.includes(filterValue)) return true;
    // en cualquier otro caso, devolver verdadero
    return false;

  }
  const [filteringColumnExtensions, setFilteringColumnExtensions] = useState([
    { columnName: "centro", predicate: columnFilterMultiPredicate },
    { columnName: "estado", predicate: columnFilterMultiPredicate },
    { columnName: "FECHA_VENTA", predicate: columnFilterDateTimePredicate },
    { columnName: "VENTAONLINE", predicate: IntegratedFiltering.defaultPredicate },
  ]);

  const [filteringStateColumnExtensions] = useState([
    { columnName: "centro", filteringEnabled: false },
  ]);

  // EXPORT EXCEL
  const onSave = (workbook) => {
    workbook.xlsx.writeBuffer().then((buffer) => {
      saveAs(
        new Blob([buffer], { type: "application/octet-stream" }),
        "Servicios.xlsx"
      );
    });
  };
  const [rowsExport, setRowsExport] = useState(null);
  const exporterRef = useRef(null);

  const startExport = useCallback(() => {
    exporterRef.current.exportGrid();
  }, [exporterRef]);

  const exportMessages = {
    exportAll: "Exportar todo",
  };
  // worksheet customization
  /* eslint-disable no-param-reassign */
  const customizeCell = (cell, row, column) => {

    if (column.name == "FECHA_VENTA") {
      cell.value = new Date(row.FECHA_VENTA);
    }
    // if (row.OrderDate < new Date(2014, 2, 3)) {
    //   cell.font = { color: { argb: 'AAAAAA' } };
    // }
    // if (row.SaleAmount > 15000) {
    //   if (column.name === 'SaleAmount') {
    //     cell.font = { color: { argb: '000000' } };
    //     cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFBB00' } };
    //   }
    // }
    // if (column.name === 'SaleAmount') {
    //   cell.numFmt = '$0';
    // }
  };
  // FILTRO BÚSQUEDA
  const [loading, setLoading] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  //const [lastQuery, setLastQuery] = useState();

  const getQueryString = () => {
    let filter;
    if (
      user.rolDesc !== "LEROY_INSTALACIONES_CENTRO"
    ) {
      filter = columns
        .reduce((acc, { name }) => {

          if (searchValue === "") {
            return acc;
          }
          if (name === "id") {

            /* acc.push(`{"${name}": {"_eq": "${searchValue}"}}`); */
          } else acc.push(`"${name}": "(${searchValue})"`);
          return acc;
        }, [])
        .join(",");

      if (columns.length > 1) {
        filter = `${filter}`;
      }
      return `{${filter}}`;
    }

    filter = columns
      .reduce((acc, { name }) => {
        if (name === "id") {
          /* console.log("id"); */
          /* acc.push(`{"${name}": {"_eq": "${searchValue}"}}`); */
        } else acc.push(`"${name}": "(${searchValue})"`);
        return acc;
      }, [])
      .join(",");

    if (columns.length > 1) {
      filter = `${filter}`;
    }
    return `{${filter}}`;
  };

  const loadData = (excelExport = false) => {

    //const queryString = getQueryString();
    let queryString = `{${loadDataFilter()}}`;
    //const queryString = loadDataFilter();
    let limit = excelExport ? 10000 : 500;
    // Añadir el filtro de centro en queryString
    if (user.rolDesc == "LEROY_INSTALACIONES_CENTRO") {
      // Si el objeto queryString está vacío, añadir la separación de campos si no, no añadir nada
      queryString = queryString === "{}" ? queryString.replace("}", `"CENTRO_PRODUCTOR_ID": "${user.centroId}"}`) : queryString.replace("}", `,"CENTRO_PRODUCTOR_ID": "${user.centroId}"}`);
    }
    // Añadir el filtro de zona en queryString
    if (user.zonaId) {
      queryString = queryString === "{}" ? queryString.replace("}", `"ZONA_ID": "${user.zonaId}"}`) : queryString.replace("}", `,"ZONA_ID": "${user.zonaId}"}`);
    }
    if (
      (queryString && excelExport) ||
      (queryString !== lastQuery && !loading)
    ) {
      client
        .query({
          query:
            user.rolDesc == "LEROY_INSTALACIONES_CENTRO"
              ? getVentasAllCentros
              : getVentasAllCentros,
          fetchPolicy: "no-cache",
          variables: {
            centroId: user.centroId,
            limit: limit,
            fields: JSON.parse(queryString),
          },
        })
        .then((res) => {
          let results = setEstadoName(res.data.getLeroyInstalacionesView);
          if (formatVentaOnline) {
            results = formatVentaOnline(results);
          }
          if (!excelExport) {
            setRows(results);
            setLastQuery(queryString);
          } else {
            setRowsExport(results, () => startExport(rowsExport));
            startExport();
          }
        });
      if (!excelExport) setLastQuery(queryString);
    }
    console.log(lastQuery);
  };

  const loadDataFilter = () => {
    let filters = []
    let results = []
    filtersApplied.forEach((elemt) => {
      // Excluir el filtro VENTAONLINE ya que es solo local
      if (elemt.columnName !== "VENTAONLINE") {
        filters.push(`"${elemt.columnName}": "*${elemt.value}*"`);
      }
    })
    return filters;

  };

  // const DateFormatter = ({ value }) => value.replace(/(\d{4})-(\d{2})-(\d{2})/, '$3.$2.$1');

  const DateFormatter = ({ value }) => {
    let options = { year: "numeric", month: "2-digit", day: "2-digit" };
    let date = new Date(value);
    return date.toLocaleString("es-ES", options);
  };
  const DateTypeProvider = props => (
    <DataTypeProvider
      formatterComponent={DateFormatter}
      {...props}
    />
  );
  const fetchCentros = useCallback(async () => {
    let results = [];
    if (
      user.rolDesc !== "BRICOMART_CENTRO" &&
      user.rolDesc !== "BRICOMART_INPROECO_CENTRO"
    ) {
      const variables = {};
      if (user.zonaId) {
        variables.where = { CLIENTE_ID: "23", ZONA_ID: user.zonaId };
      }
      await client
        .query({
          query: getCentros,
          fetchPolicy: "no-cache",
          variables: variables
        })
        .then((res) => {
          for (let centro of res.data.getCentroProductor) {
            results.push(centro.DENOMINACION);
          }
        });
    } else {
      await client
        .query({
          query: getCentroName,
          fetchPolicy: "no-cache",
          variables: {
            centroId: user.centroId,
          },
        })
        .then((res) => {
          results.push(res.data.getCentrosProductoresView[0].nombre);
        });
    }
    dispatch({ type: "SET_CENTROS", payload: { centros: results } });
  }, [client, getCentros]);

  const fetchEstados = useCallback(async () => {
    let results = [];
    await client
      .query({
        query: getVentasAllCentros,
        fetchPolicy: "no-cache",
      })
      .then((res) => {
        for (let estado of res.data.ventas_bricomart) {
          if (estado.estado_venta != null) {
            results.push(estado.estado_venta.nombre);
          }
          results = [...new Set(results)];
        }
      });
    dispatch({ type: "SET_ESTADOS", payload: { estados: results } });
  }, [client, getVentasAllCentros]);

  useEffect(() => {
    //dataCount();
    fetchCentros();
    //fetchEstados();
  }, []);

  useEffect(() => {
    if (filtersApplied.length > 0) {
      // dataCountFilter();
    }
  }, [loadDataFilter]);

  useEffect(() => {
    dispatch({ type: "SET_LOAD_VENTAS", payload: { loadVentas: loadData } });
    if (searchValue !== "") {
      loadData();
    } else {
      fetchVentas();
    }
  }, [searchValue]);

  useEffect(() => {
    console.log("filternum", filtersApplied);
    // Solo ejecutar loadData si hay filtros que necesitan ir al servidor
    const serverFilters = filtersApplied.filter(filter => filter.columnName !== "VENTAONLINE");
    if (serverFilters.length > 0) {
      setFilters(filtersApplied);
      loadData();
    } else {
      fetchVentas();
      //dataCount();
    }
  }, [filtersApplied]);
  useEffect(() => {
    // loadData();
  }, [filters]);

  return (
    <div>
      <div className="content">
        <Row>
          <Col xs={12} md={12}>
            <div className="page-title">
              <div className="float-left">
                <h2 className="title">{title}</h2>
              </div>
            </div>
            <div className="col-12">
              <section className="box">
                <div className="content-body">
                  <div className="row">
                    <div className="col-lg-12 card">
                      {!rows ? (
                        <p>Cargando...</p>
                      ) : (
                        <Grid rows={rows} columns={columns} getRowId={getRowId}>
                          <PagingState defaultCurrentPage={0} pageSize={10} />
                          <SearchState onValueChange={setSearchValue} />
                          <SortingState />
                          <FilteringState
                            filters={filtersApplied}
                            onFiltersChange={(filter) => {
                              dispatch({
                                type: "SET_FILTERS_APPLIED",
                                payload: { filtersApplied: filter },
                              });
                            }}
                            columnExtensions={filteringStateColumnExtensions}
                          />
                          <RowDetailState />
                          <IntegratedSorting
                            columnExtensions={integratedSortingColumnExtensions}
                          />
                          <IntegratedFiltering
                            columnExtensions={filteringColumnExtensions}
                          />
                          <IntegratedPaging />
                          {children}
                          <DateTypeProvider
                            for={dateColumns}
                          />
                          <VirtualTable
                            columnExtensions={tableColumnExtensions}
                          />
                          <TableHeaderRow showSortingControls />
                          <Toolbar />
                          <TableFilterRow
                            messages={filterRowMessages}
                            cellComponent={FilterCell}
                          />
                          <SearchPanel
                            messages={{ searchPlaceholder: "Buscar..." }}
                          />
                          <ExportPanel
                            messages={exportMessages}
                            startExport={() => loadData(true)}
                          />
                          <GridExporter
                            ref={exporterRef}
                            rows={rowsExport}
                            columns={columnsToExport}
                            onSave={onSave}
                            customizeCell={customizeCell}
                          />
                          <TableRowDetail
                            toggleCellComponent={(props) => (
                              <RowVentaActions {...props} fetchVentas={fetchVentas} />
                            )}
                          />
                          {/* INICIO RECOGER LAS LÍNEAS FILTRADAS */}
                          <Template name="root">
                            <TemplateConnector>
                              {({ rows: filteredRows }) => {
                                setFilterRows(filteredRows);

                                return <TemplatePlaceholder />;
                              }}
                            </TemplateConnector>
                          </Template>
                          {/* FIN RECOGER LAS LÍNEAS FILTRADAS */}
                          <PagingPanel />
                        </Grid>
                      )}
                      <ClearFilters />
                    </div>
                  </div>
                  <p>
                    Mostrando {filterRows.length} de {count} resultados
                  </p>
                </div>
              </section>
            </div>
          </Col>
        </Row>
      </div>
    </div>
  );
};

export default Layout;
