import React, { useState, useEffect, useRef, useCallback } from "react";
import { Row, Col } from "reactstrap";
import {
  IntegratedSorting,
  SortingState,
  SearchState,
  FilteringState,
  IntegratedFiltering,
} from "@devexpress/dx-react-grid";
import { SearchPanel } from "@devexpress/dx-react-grid-bootstrap4";
import {
  Grid,
  TableHeaderRow,
  VirtualTable,
  TableColumnVisibility,
  TableFilterRow,
  Toolbar,
  ExportPanel,
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
import ExportExcel from "./../Export/ExportExcel";
import Buttons from "./../Buttons/Buttons";
import FilterCell from "../../common/Filters/FilterCell";

// CONSTANTS
import { compareDates } from "./../../constants";

// GRAPHQL
import { client, getVentasAllCentros } from "../../graphql";

const Layout = ({ title, rows, setRows, columns, children, dataFilters }) => {
  const getRowId = (row) => row.id;
  const filterRowMessages = {
    filterPlaceholder: "Filtrar...",
  };
  const [filterRows, setFilterRows] = useState(null);

  // SORTING DE FECHAS
  const [integratedSortingColumnExtensions] = useState([
    { columnName: "fecha_venta", compare: compareDates },
  ]);

  // FILTRO COLUMNA
  const [filteringStateColumnExtensions] = useState([
    { columnName: "fecha_venta", filteringEnabled: false },
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

  // FILTRO BÚSQUEDA
  const [loading, setLoading] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const [lastQuery, setLastQuery] = useState();

  const getQueryString = () => {
    let filter = columns
      .reduce((acc, { name }) => {
        if (name === "id") {
          console.log("id");
          //acc.push(`{"${name}": {"_eq": "${searchValue}"}}`);
        } else if (name === "fecha_venta") {
          console.log("fecha");
          //acc.push(`{"fecha_venta": {"_eq": "${searchValue}"}}`)
        } else if (name === "estado") {
          acc.push(
            `{"estado_venta": {"nombre": {"_ilike": "%${searchValue}%"}}}`
          );
        } else acc.push(`{"${name}": {"_ilike": "%${searchValue}%"}}`);
        return acc;
      }, [])
      .join(",");

    if (columns.length > 1) {
      filter = `${filter}`;
    }
    return `{"_or":[${filter}]}`;
  };

  const loadData = (excelExport = false) => {
    const queryString = getQueryString();
    let limit = excelExport ? 10000 : 500;
    if (
      (queryString && excelExport) ||
      (queryString !== lastQuery && !loading)
    ) {
      client
        .query({
          query: getVentasAllCentros,
          variables: {
            limit: limit,
            fields: JSON.parse(queryString),
          },
        })
        .then((res) => {
          const results = res.data.ventas_bricomart;
          console.log(results);
          if (!excelExport) {
            setRows(results);
            setLastQuery(queryString);
          } else {
            console.log("exporting...");
            setRowsExport(results, () => startExport(rowsExport));
            startExport();
          }
        });
      if (!excelExport) setLastQuery(queryString);
    }
  };

  useEffect(() => loadData());

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
                          <SearchState onValueChange={setSearchValue} />
                          <SortingState />
                          <IntegratedSorting
                            columnExtensions={integratedSortingColumnExtensions}
                          />
                          {children}
                          <VirtualTable />
                          <TableHeaderRow showSortingControls />
                          <Toolbar />
                          {/* <TableColumnVisibility
                            hiddenColumnNames={hiddenColumnsNames}
                          />
                          */}
                          {/* <TableFilterRow
                            messages={filterRowMessages}
                            cellComponent={(props) => (
                              <FilterCell {...props} {...dataFilters} />
                            )}
                          /> */}
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
                            columns={columns}
                            onSave={onSave}
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
                        </Grid>
                      )}
                    </div>
                  </div>
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
