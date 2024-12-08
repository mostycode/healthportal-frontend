import {Paper} from "@mui/material";
import { DataGrid } from '@mui/x-data-grid';

function DoctorsTable({ rows, columns }) {
    return (
        <Paper sx={{ height: 500, width: '75%', margin: 'auto' }}>
            <DataGrid
                rows={rows}
                columns={columns}
                sx={{ border: 0 }}
            />
        </Paper>
    );
}

export default DoctorsTable;