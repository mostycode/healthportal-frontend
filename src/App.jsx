import NavBar from "./NavBar.jsx";
import {CssBaseline} from "@mui/material";
import {BrowserRouter as Router, Routes, Route} from "react-router-dom";
import Appointments from "./Appointments.jsx";
import CreateAppointment from "./CreateAppointment.jsx";
import 'bootstrap/dist/css/bootstrap.min.css';
import DoctorManagement from "./DoctorManagement.jsx";
import CreateDoctor from "./CreateDoctor.jsx";
import {useEffect, useState} from "react";
import {SpecializationsProvider} from "./SpecializationsContext.jsx";
import Home from "./Home.jsx";

function App() {
    const [authenticated, setAuthenticated] = useState(false);
    const [user, setUser] = useState(null);

    useEffect(() => {
        fetch('http://localhost:8080/api/user', { credentials: 'include' })
            .then((response) => response.text())
            .then((body) => {
                if (body) {
                    setUser(JSON.parse(body));
                    setAuthenticated(true);
                } else {
                    setAuthenticated(false);
                }
            });
    }, []);

    const login = () => {
        window.location.href = `http://localhost:8080/oauth2/authorization/okta`;
    };

    const logout = () => {
        const csrfToken = document.cookie.split('; ').find(row => row.startsWith('XSRF-TOKEN=')).split('=')[1];
        fetch('http://localhost:8080/api/logout', {
            method: 'POST',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
                'X-XSRF-TOKEN': csrfToken
            }
        })
            .then((res) => res.json())
            .then((response) => {
                window.location.href = `${response.logoutUrl}?id_token_hint=${response.idToken}&post_logout_redirect_uri=${window.location.origin}`;
            })

    };
  return (
      <>
          <CssBaseline />
          <SpecializationsProvider>
              <Router>
                  <NavBar
                      authenticated={authenticated}
                      onLogin={login}
                      onLogout={logout}
                  />
                  <Routes>
                      <Route path="/" element={<Home />} />
                      <Route path="/create-appointment" element={<CreateAppointment />} />
                      <Route path="/appointments" element={<Appointments />} />

                      {/*only shows on the nav bar if the user/admin is logged in*/}
                      {authenticated && <Route path="/admin" element={<DoctorManagement authenticated={authenticated}/>}/>}
                  </Routes>
              </Router>
          </SpecializationsProvider>
      </>
  );
}

export default App
