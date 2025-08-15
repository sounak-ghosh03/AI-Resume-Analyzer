import { Link } from "react-router";
import { usePuterStore } from "~/lib/puter";
import { useState } from "react";

function Navbar() {
    const { auth } = usePuterStore();
    const [menuOpen, setMenuOpen] = useState(false);

    return (
        <nav className="navbar flex flex-col md:flex-row md:items-center md:justify-between p-4 gap-4 relative">
            <Link to="/">
                <p className="text-2xl font-bold text-gradient">RESUMIND</p>
            </Link>

            <button
                className="primary-button md:hidden w-fit"
                onClick={() => setMenuOpen(!menuOpen)}
            >
                Menu
            </button>

            <div
                className={`flex flex-col items-center gap-4 absolute top-full right-4 bg-white shadow-md rounded-lg p-4 z-10 transition-all duration-300 ${
                    menuOpen ? "block" : "hidden"
                } md:static md:flex md:flex-row md:items-center md:justify-end md:bg-transparent md:shadow-none md:p-0 md:gap-4`}
            >
                <Link to="/upload" className="primary-button md:w-fit">
                    Upload Resume
                </Link>
                <Link to="/wipe" className="primary-button md:w-fit">
                    Wipe Data
                </Link>
                {auth.isAuthenticated ? (
                    <button
                        onClick={auth.signOut}
                        className="primary-button md:w-fit"
                    >
                        Logout
                    </button>
                ) : (
                    <button
                        onClick={auth.signIn}
                        className="primary-button md:w-fit"
                    >
                        Login
                    </button>
                )}
            </div>
        </nav>
    );
}

export default Navbar;
