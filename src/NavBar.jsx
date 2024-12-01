import {Link} from "react-router-dom";


function NavBar() {

    return (
        <nav className="navbar"
             style={{backgroundColor: '#ffffff', borderBottom: '2px solid #007bff', padding: '1rem'}}>
            <div className="container" style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                <h1 className="logo" style={{color: '#007bff', margin: 0}}>
                    <Link to="/">Healthcare App</Link></h1>
                <ul className="nav-links"
                    style={{listStyle: 'none', display: 'flex', gap: '1.5rem', margin: 0, padding: 0}}>
                    <li>
                        <Link to="/appointments" style={{textDecoration: 'none', color: '#007bff'}}>Appointments</Link>
                    </li>
                    <li>
                        <Link to="/create-appointment" style={{textDecoration: 'none', color: '#007bff'}}>Create
                            Appointment</Link>
                    </li>
                    <li>
                        <Link to="/admin" style={{textDecoration: 'none', color: '#007bff'}}>Admin</Link>
                    </li>
                </ul>
            </div>
        </nav>
    );
}

export default NavBar;