import NavBar from "./NavBar.jsx";
import {CssBaseline} from "@mui/material";
import {BrowserRouter as Router, Routes, Route} from "react-router-dom";
import Appointments from "./Appointments.jsx";

// Placeholder components for each page
function Home() {
    return (
        <div>
            <h1>Home Page</h1>
        </div>
    );
}

function CreateAppointment() {
    return (
        <div>
            <h1>Create Appointment Page</h1>
        </div>
    );
}

function Admin() {
    return (
        <div>
            <h1>Admin Page</h1>
        </div>
    );
}

function App() {

  return (
      <>
          <CssBaseline />
          <Router>
              <NavBar />
              <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/create-appointment" element={<CreateAppointment />} />
                  <Route path="/appointments" element={<Appointments />} />
                  <Route path="/admin" element={<Admin />}/>
              </Routes>
          </Router>
      </>
  );
}

export default App
