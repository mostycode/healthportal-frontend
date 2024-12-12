
import Box from '@mui/material/Box';
import { DataGrid, GridActionsCellItem } from '@mui/x-data-grid';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/DeleteOutlined';
import {useState} from "react";

function AppointmentsDataGrid({ rows, columns, onEdit, onDelete }) {

    const enhancedColumns = [
        ...columns,
        {
            field: 'actions',
            type: 'actions',
            headerName: 'Actions',
            width: 150,
            getActions: (params) => {
                const isCancelled = params.row.status === 'Cancelled';
                return [
                    <GridActionsCellItem
                        key={`${params.row.id}-edit`}
                        icon={<EditIcon />}
                        label="Edit"
                        onClick={() => onEdit(params.row.id)}
                        color="primary"
                        disabled={isCancelled}
                    />,
                    <GridActionsCellItem
                        key={`${params.row.id}-delete`}
                        icon={<DeleteIcon />}
                        label="Delete"
                        onClick={() => onDelete(params.row.id)}
                        color="warning"
                        disabled={isCancelled}
                    />,
                ];
            },
        },
    ];

    return (
        <Box sx={{ height: 600, width: 'fit-content', maxWidth: '100%',display: 'flex', justifyContent: 'center' }}>
            <DataGrid
                rows={rows}
                columns={enhancedColumns}
            />
        </Box>
    );
}

export default AppointmentsDataGrid;
