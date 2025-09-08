import React, { useState } from "react";
import * as PropTypes from "prop-types";
import { TableFilterRow } from "@devexpress/dx-react-grid-bootstrap4";

const VentaOnlineFilterCell = (props) => {
  return (
    <TableFilterRow.Cell {...props}>
      <select
        value={props.filter ? props.filter.value : ""}
        onChange={(e) => {
          const value = e.target.value;
          if (value === "") {
            props.onFilter(null);
          } else {
            props.onFilter({ value: value });
          }
        }}
        style={{ 
          width: "100%", 
          fontSize: "14px",
          border: "1px solid #ccc",
          borderRadius: "4px",
          padding: "4px"
        }}
      >
        <option value="">Todos</option>
        <option value="Sí">Sí</option>
        <option value="No">No</option>
      </select>
    </TableFilterRow.Cell>
  );
};

VentaOnlineFilterCell.propTypes = {
  onFilter: PropTypes.func.isRequired,
  column: PropTypes.shape({ name: PropTypes.string }).isRequired,
};

export default VentaOnlineFilterCell;
