import React, { useState, useEffect, useCallback, useContext } from "react";
import * as PropTypes from "prop-types";

import { TableFilterRow } from "@devexpress/dx-react-grid-bootstrap4";
import "@devexpress/dx-react-grid-bootstrap4/dist/dx-react-grid-bootstrap4.css";

// components
import UnitsFilterCell from "./UnitsFiltersCell";
import VentaOnlineFilterCell from "./VentaOnlineFilterCell";
import { GlobalStateContext } from "../../../context/GlobalContext";

const FilterCell = (props) => {
  const { column } = props;
  const { centros, estados } = useContext(GlobalStateContext);

  switch (column.name) {
    case "centro":
      return <UnitsFilterCell centros={centros} {...props} />;
    case "estado":
      return <UnitsFilterCell estados={estados} {...props} />;
    case "VENTAONLINE":
      return <VentaOnlineFilterCell {...props} />;
    default:
      return <TableFilterRow.Cell {...props} />;
  }
};

FilterCell.propTypes = {
  column: PropTypes.shape({ name: PropTypes.string }).isRequired,
};

export default FilterCell;
