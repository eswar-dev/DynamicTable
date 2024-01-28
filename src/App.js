import React, { useState, useEffect, useRef } from "react";
import Paper from "@mui/material/Paper";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TablePagination from "@mui/material/TablePagination";
import TableRow from "@mui/material/TableRow";
import Snackbar from '@material-ui/core/Snackbar';
import MuiAlert from '@material-ui/lab/Alert';
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
import OutlinedInput from '@mui/material/OutlinedInput';
import ListItemText from '@mui/material/ListItemText';
import Checkbox from '@mui/material/Checkbox';
import TableRowItem from "./Table";
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
const months = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];
const dynamicColumns = months.map((month) => ({
  id: month.toLowerCase(),
  label: month,
  minWidth: 170,
  align: "right",
  format: (value) => value.toFixed(2),
}));

function createData(rowLabel, dynamicColumn, Qty) {
  return { rowLabel, dynamicColumn, Qty };
}

function Alert(props) {
  return <MuiAlert elevation={6} variant="filled" {...props} />;
}

export default function StickyHeadTable() {
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(10);
  const [data, setData] = useState([]);
  const [file, setFile] = useState(null);
  const [rows, setRows] = useState([]);
  const [selectedFilter, setSelectedFilter] = useState("");
  const [disabled, setDisabled] = useState(true);
  const [open, setOpen] = useState(false);
  const fileInputRef = useRef(null);
  const [filters, setFilters] = React.useState({
    segmentLeadership: [],
    status: [],
    brand: [],
    rows: ['DRNAME','SPECIALTY']
  });

  const handleChange = (event, filterName) => {
    const {
      target: { value },
    } = event;

    setFilters((prevFilters) => ({
      ...prevFilters,
      [filterName]: typeof value === 'string' ? value.split(',') : value,
    }));
  };
  const handleChangeFilter = (event) => {
    const selectedFilter = event.target.value;
    setSelectedFilter(selectedFilter);
    updateRows(selectedFilter);
  };
  const handleClose = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }

    setOpen(false); // Close Snackbar
  };
  const updateRows = (filter) => {
    // Use Set to keep track of unique row labels and dynamic columns
    const uniqueRowLabels = new Set();
    const uniqueDynamicColumns = new Set();

    // Map the fetched data to create rows with dynamic labels
    const updatedRows = data.reduce((rows, dataItem) => {
      const rowLabel = dataItem[filter];

      // Check if the row label is not already in the Set
      if (!uniqueRowLabels.has(rowLabel)) {
        uniqueRowLabels.add(rowLabel);

        // Check if the dynamic column is not already in the Set
        // if (!uniqueDynamicColumns.has(dynamicColumn)) {
        //   uniqueDynamicColumns.add(dynamicColumn);

        const rowData = {
          rowLabel,
          dynamicColumn: dataItem.Month,
          Qty: dataItem.Qty,
        };

        // Assuming createData is a function to create a data object
        rows.push(createData(rowData.rowLabel, rowData.dynamicColumn, rowData.Qty));
        // }
      }

      return rows;
    }, []);

    // Set the updated rows
    setRows(updatedRows);
  };


  // const handleFileChange = (e) => {
  //   setFile(e.target.files[0]);

  // };


  const handleFileChange = async () => {
    const selectedFile = fileInputRef.current.files[0];
    // Handle file change logic here
    console.log("Selected File:", selectedFile);

    // API call to upload the file
    try {
      const formData = new FormData();
      formData.append('file', selectedFile);

      const response = await fetch('http://localhost:5000/upload', {
        method: 'POST',
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


  const uploadFile = async () => {
    const formData = new FormData();
    formData.append("file", file);
    setDisabled(false);
    try {
      await axios.post("http://localhost:5000/upload", formData);
      fetchData();
    } catch (error) {
      console.error("Error uploading file:", error);
    }
  };

  const fetchData = async (filters) => {
    try {
      const response = await axios.get(`http://localhost:5000/Qty-data?items=${filters.rows.join('&items=')}`);
      console.log(response,'res')
      setData(response.data);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  useEffect(() => {
    fetchData(filters);
  }, [filters]);

  useEffect(() => {
    // Call updateRows when the data is fetched or selected filter changes
    if (selectedFilter) {
      updateRows(selectedFilter);
    }
  }, [data, selectedFilter]);
  const columns = ["Row Label", ...rows.map((col) => col.dynamicColumn)];
  const handleButtonClick = () => {
    fileInputRef.current.click(); // Trigger click event on file input
  };

  // const handleChange = (event) => {
  //   const {
  //     target: { value },
  //   } = event;
  //   setPersonName(
  //     // On autofill we get a stringified value.
  //     typeof value === 'string' ? value.split(',') : value,
  //   );
  // };
  const segmentLeadership = [
    'All',
    'yes',
    'no'
  ];
  const brand = [
    'All',
    'NINTIB',
    'Montair LC Adult',
    'Furamist',
    'Ablung',
    'Montair',
    'Montair LC Kids',
    'Levolin Plus',

  ];

  const rowsFilter = [
    'BU',
    'TASKFORCE',
    'ZMHQ',
    'RMHQ',
    'ABM HQ',
    'TM HQ',
    'TM Name',
    'Month',
    'MSL CODE',
    'DRNAME',
    'SPECIALTY',
    'Spl',
    'Class',
    'SKU Name',
    'BRAND',
    'Segment Leadership',
    'Status 2k',
    'Status 5k' 
  ];
  const status = [
    'All',
    'Above 2k',
    'Below 2k'
  ];

  const tabledata = [
    {
      id: 1,
      name: 'A',
      children: [
        {
          id: 23,
          name: 'Montair',
          children: [{ id: 10101, name: 'Cardio' }, { id: 10102, name: 'Chest' }],
        },
        {
          id: 21,
          name: 'Team 4',
          children: [{ id: 10201, name: 'CP' }, { id: 10202, name: 'ENT' }],
        },
      ],
    },
    {
      id: 2,
      name: 'A Plus',
      children: [
        {
          id: 21,
          name: 'Team 4',
          children: [{ id: 10101, name: 'Cardio' }, { id: 10102, name: 'Chest' }],
        },
        {
          id: 25,
          name: 'Team 4',
          children: [{ id: 10201, name: 'CP' }, { id: 10202, name: 'ENT' }],
        },
      ],
    },
    {
      id: 3,
      name: 'B',
      children: [
        {
          id: 21,
          name: 'Team 4',
          children: [{ id: 10101, name: 'Cardio' }, { id: 10102, name: 'Chest' }],
        },
        {

          name: 'Team 4',
          children: [{ id: 10201, name: 'CP' }, { id: 10202, name: 'ENT' }],
        },
      ],
    },
  ];


  return (
    <Paper sx={{ width: "100%", overflow: "hidden" }}>
      <Grid container display={'flex'} justifyContent={'space-between'} m={2}>
        <Grid item >
          <Typography fontWeight={700} fontSize={'22px'}>Data Visualization</Typography>
        </Grid>
        <Grid item mr={4}>
          <input
            type="file"
            accept=".xlsx"
            onChange={handleFileChange}
            ref={fileInputRef}
            style={{ display: 'none' }} // Hide the file input
          />
          <Button variant="contained" onClick={handleButtonClick} sx={{ textTransform: 'none' }}>
            Choose File
          </Button>
          <Snackbar
            open={open}
            autoHideDuration={3000}
            onClose={handleClose}
            anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
          >
            <Alert onClose={handleClose} severity="success">
              File uploaded successfully!
            </Alert>
          </Snackbar>
        </Grid>

      </Grid>
      <Grid container display={'flex'} gap={3.8}>
        <Grid item>
          <FormControl sx={{ m: 1, width: 350 }}>
            <InputLabel id="segment-leadership-label">Segment Leadership</InputLabel>
            <Select
              labelId="segment-leadership-label"
              id="segment-leadership"
              multiple
              value={filters.segmentLeadership}
              onChange={(e) => handleChange(e, 'segmentLeadership')}
              input={<OutlinedInput label="Segment Leadership" />}
              renderValue={(selected) => selected.join(', ')}
              MenuProps={MenuProps}
            >
              {segmentLeadership.map((name) => (
                <MenuItem key={name} value={name}>
                  <Checkbox checked={filters.segmentLeadership.indexOf(name) > -1} />
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
              onChange={(e) => handleChange(e, 'status')}
              input={<OutlinedInput label="Status" />}
              renderValue={(selected) => selected.join(', ')}
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
              onChange={(e) => handleChange(e, 'brand')}
              input={<OutlinedInput label="Brand" />}
              renderValue={(selected) => selected.join(', ')}
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
              onChange={(e) => handleChange(e, 'rows')}
              input={<OutlinedInput label="Row Filter" />}
              renderValue={(selected) => selected.join(', ')}
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
      <div style={{ height: '530px', overflowY: 'auto', margin: 2 }}>
        <TableContainer component={Paper}>
          <Table aria-label="collapsible table" style={{ borderCollapse: 'collapse' }}>
            <TableHead sx={{ backgroundColor: '#f0f0f0', boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)' }}>
              <TableRow>
                <TableCell />
                <TableCell sx={{ fontWeight: 600, fontSize: '18px', border: '1px solid #dddddd' }}>Row Label</TableCell>
                <TableCell sx={{ fontWeight: 600, fontSize: '18px', border: '1px solid #dddddd' }}>Nov-23</TableCell>
                <TableCell sx={{ fontWeight: 600, fontSize: '18px', border: '1px solid #dddddd' }}>Dec-23</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {tabledata.map((row) => (
                <TableRowItem key={row.id} row={row} />
              ))}
            </TableBody>
          </Table>
        </TableContainer>

      </div>
      <TablePagination
        rowsPerPageOptions={[10, 25, 100]}
        component="div"
        count={rows.length}
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


