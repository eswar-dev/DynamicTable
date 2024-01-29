import React, { useState, useEffect, useRef } from "react";
import Paper from "@mui/material/Paper";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TablePagination from "@mui/material/TablePagination";
import TableRow from "@mui/material/TableRow";
import Snackbar from "@material-ui/core/Snackbar";
import MuiAlert from "@material-ui/lab/Alert";
import {
  Select,
  InputLabel,
  MenuItem,
  Grid,
  FormControl,
  Button,
  Typography,
} from "@mui/material";
import axios from "axios";
import OutlinedInput from "@mui/material/OutlinedInput";
import ListItemText from "@mui/material/ListItemText";
import Checkbox from "@mui/material/Checkbox";
const ITEM_HEIGHT = 48;
const ITEM_PADDING_TOP = 8;
const MenuProps = {
  PaperProps: {
    style: {
      maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
      width: 250,
    },
  },
};

function Alert(props) {
  return <MuiAlert elevation={6} variant="filled" {...props} />;
}

export default function StickyHeadTable() {
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(10);
  const [data, setData] = useState([]);
  const [open, setOpen] = useState(false);
  const fileInputRef = useRef(null);
  const [tableData, setTableData] = useState();

  const [filters, setFilters] = React.useState({
    segmentLeadership: [],
    status: [],
    brand: [],
    rows: ["Spl"],
  });

  const handleChange = (event, filterName) => {
    const {
      target: { value },
    } = event;

    setFilters((prevFilters) => ({
      ...prevFilters,
      [filterName]: typeof value === "string" ? value.split(",") : value,
    }));
  };

  const handleClose = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }

    setOpen(false); // Close Snackbar
  };

  const handleFileChange = async () => {
    const selectedFile = fileInputRef.current.files[0];

    try {
      const formData = new FormData();
      formData.append("file", selectedFile);

      const response = await fetch("http://localhost:5000/upload", {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        setOpen(true); // Open Snackbar on successful upload
        console.log("File uploaded successfully");
        // Add any further handling logic here
      } else {
        console.error("Failed to upload file");
        // Handle error scenario
      }
    } catch (error) {
      console.error("Error uploading file:", error);
      // Handle error scenario
    }
  };

  const fetchData = async (filters) => {
    try {
      const response = await axios.get(
        `http://localhost:5000/Qty-data?items=${filters.rows.join("&items=")}`
      );
      setData(response.data);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  useEffect(() => {
    fetchData(filters);
  }, [filters]);

  const handleButtonClick = () => {
    fileInputRef.current.click(); // Trigger click event on file input
  };

  const segmentLeadership = ["All", "yes", "no"];
  const brand = [
    "All",
    "NINTIB",
    "Montair LC Adult",
    "Furamist",
    "Ablung",
    "Montair",
    "Montair LC Kids",
    "Levolin Plus",
  ];

  const rowsFilter = [
    "BU",
    "TASKFORCE",
    "ZMHQ",
    "RMHQ",
    "ABM HQ",
    "TM HQ",
    "TM Name",
    "Month",
    "MSL CODE",
    "DRNAME",
    "SPECIALTY",
    "Spl",
    "Class",
    "SKU Name",
    "BRAND",
    "Segment Leadership",
    "Status 2k",
    "Status 5k",
  ];
  const status = ["All", "Above 2k", "Below 2k"];

  useEffect(() => {
    if (data.aggregatedResults !== undefined) {
      const rowData = [];

      // Initialize newColData and newRowData arrays outside the loop
      const newColData = [];
      const newRowData = [];

      // Iterate through each key in data.aggregatedResults
      Object.entries(data.aggregatedResults).forEach(([key, value]) => {
        if (filters.rows.includes(key)) {
          // Calculate newColData and newRowData for each key
          const items = Object.entries(value);
          const monthsSet = new Set(); // Use a Set to store unique months

          items.forEach(([, item]) => {
            if (item.monthlyCounts) {
              Object.keys(item.monthlyCounts).forEach((month) => {
                monthsSet.add(month); // Add each month to the Set
              });
            }
          });

          const months = Array.from(monthsSet); // Convert Set back to array
          const rows = items.map(([label, item]) => {
            const rowData = { label };
            months.forEach((month) => {
              rowData[month] =
                item.monthlyCounts && item.monthlyCounts[month]
                  ? item.monthlyCounts[month]
                  : "-";
            });
            rowData.total = item.total;
            return rowData;
          });

          // Concatenate newColData and newRowData for each key with the existing arrays
          newColData.push(months);
          newRowData.push(rows);
        }
      });

      // Merge duplicate-free newColData into a single array
      const mergedNewColData = Array.from(
        newColData.reduce((set, arr) => {
          arr.forEach((item) => set.add(item));
          return set;
        }, new Set())
      );

      // Push newColData and newRowData to rowData
      rowData.push({
        newColData: mergedNewColData.flat(),
        newRowData: newRowData.flat(),
      });

      setTableData(rowData);
    } else {
      setTableData([]);
    }
  }, [data, filters]);

  return (
    <Paper sx={{ width: "100%", overflow: "hidden" }}>
      <Grid container display={"flex"} justifyContent={"space-between"} m={2}>
        <Grid item>
          <Typography fontWeight={700} fontSize={"22px"}>
            Data Visualization
          </Typography>
        </Grid>
        <Grid item mr={4}>
          <input
            type="file"
            accept=".xlsx"
            onChange={handleFileChange}
            ref={fileInputRef}
            style={{ display: "none" }} // Hide the file input
          />
          <Button
            variant="contained"
            onClick={handleButtonClick}
            sx={{ textTransform: "none" }}
          >
            Choose File
          </Button>
          <Snackbar
            open={open}
            autoHideDuration={3000}
            onClose={handleClose}
            anchorOrigin={{ vertical: "top", horizontal: "right" }}
          >
            <Alert onClose={handleClose} severity="success">
              File uploaded successfully!
            </Alert>
          </Snackbar>
        </Grid>
      </Grid>
      <Grid container display={"flex"} gap={3.8}>
        <Grid item>
          <FormControl sx={{ m: 1, width: 350 }}>
            <InputLabel id="segment-leadership-label">
              Segment Leadership
            </InputLabel>
            <Select
              labelId="segment-leadership-label"
              id="segment-leadership"
              multiple
              value={filters.segmentLeadership}
              onChange={(e) => handleChange(e, "segmentLeadership")}
              input={<OutlinedInput label="Segment Leadership" />}
              renderValue={(selected) => selected.join(", ")}
              MenuProps={MenuProps}
            >
              {segmentLeadership.map((name) => (
                <MenuItem key={name} value={name}>
                  <Checkbox
                    checked={filters.segmentLeadership.indexOf(name) > -1}
                  />
                  <ListItemText primary={name} />
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
        <Grid item>
          <FormControl sx={{ m: 1, width: 350 }}>
            <InputLabel id="status-label">Status</InputLabel>
            <Select
              labelId="status-label"
              id="status"
              multiple
              value={filters.status}
              onChange={(e) => handleChange(e, "status")}
              input={<OutlinedInput label="Status" />}
              renderValue={(selected) => selected.join(", ")}
              MenuProps={MenuProps}
            >
              {status.map((name) => (
                <MenuItem key={name} value={name}>
                  <Checkbox checked={filters.status.indexOf(name) > -1} />
                  <ListItemText primary={name} />
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
        <Grid item>
          <FormControl sx={{ m: 1, width: 350 }}>
            <InputLabel id="brand-label">Brand</InputLabel>
            <Select
              labelId="brand-label"
              id="brand"
              multiple
              value={filters.brand}
              onChange={(e) => handleChange(e, "brand")}
              input={<OutlinedInput label="Brand" />}
              renderValue={(selected) => selected.join(", ")}
              MenuProps={MenuProps}
            >
              {brand.map((name) => (
                <MenuItem key={name} value={name}>
                  <Checkbox checked={filters.brand.indexOf(name) > -1} />
                  <ListItemText primary={name} />
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>

        <Grid item>
          <FormControl sx={{ m: 1, width: 350 }}>
            <InputLabel id="brand-label">Row Filter</InputLabel>
            <Select
              labelId="brand-label"
              id="brand"
              multiple
              value={filters.rows}
              onChange={(e) => handleChange(e, "rows")}
              input={<OutlinedInput label="Row Filter" />}
              renderValue={(selected) => selected.join(", ")}
              MenuProps={MenuProps}
            >
              {rowsFilter.map((name) => (
                <MenuItem key={name} value={name}>
                  <Checkbox checked={filters.rows.indexOf(name) > -1} />
                  <ListItemText primary={name} />
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
      </Grid>
      <div style={{ height: "530px", overflowY: "auto", margin: 2 }}>
        <React.Fragment>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell
                    sx={{
                      backgroundColor: "#f0f0f0",
                      boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
                      fontWeight: 600,
                    }}
                  >
                    Row Label
                  </TableCell>
                  {((tableData && tableData[0]?.newColData) || []).map(
                    (column, index) => (
                      <TableCell
                        key={index}
                        sx={{
                          backgroundColor: "#f0f0f0",
                          boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
                          fontWeight: 600,
                        }}
                      >
                        {column}
                      </TableCell>
                    )
                  )}
                  <TableCell
                    sx={{
                      backgroundColor: "#f0f0f0",
                      boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
                      fontWeight: 600,
                    }}
                  >
                    Total
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {((tableData && tableData[0]?.newRowData) || [])
                  .filter((row) => row.label !== "totalMonthlyCounts") // Filter out the entry with label "totalMonthlyCounts"
                  .map((row, rowIndex) => (
                    <TableRow key={rowIndex}>
                      <TableCell>{row.label}</TableCell>
                      {tableData &&
                        tableData[0]?.newColData.map((month) => (
                          <TableCell key={`${rowIndex}-${month}`}>
                            {row[month]}
                          </TableCell>
                        ))}
                      <TableCell>{row.total}</TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          </TableContainer>
        </React.Fragment>
      </div>
      <TablePagination
        rowsPerPageOptions={[10, 25, 100]}
        component="div"
        count={0}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={(e, newPage) => setPage(newPage)}
        onRowsPerPageChange={(e) => {
          setRowsPerPage(+e.target.value);
          setPage(0);
        }}
      />
    </Paper>
  );
}
