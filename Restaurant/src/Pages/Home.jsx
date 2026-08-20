import { Link } from "react-router-dom";
import Navbar from "../Components/Navbar";
import profileImg from "../assets/profile.jpg";

function Home() {
  return (
    <>
      <Navbar />

      {/* Restaurant Hero Section */}
      <div
        className="container-fluid text-white d-flex align-items-center justify-content-center position-relative"
        style={{
          minHeight: "85vh",
          backgroundImage:
            "linear-gradient(rgba(0,0,0,0.55), rgba(0,0,0,0.55)), url('https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=2000&q=90')",
          backgroundPosition: "center",
          backgroundSize: "cover",
          backgroundRepeat: "no-repeat",
        }}
      >
        {/* Profile top-left */}
        <div
          className="position-absolute d-flex align-items-center gap-2"
          style={{ top: "20px", left: "30px" }}
        >
          <img
            src={profileImg}
            alt="Adepu Ganesh"
            style={{
              width: "50px",
              height: "50px",
              borderRadius: "50%",
              objectFit: "cover",
              border: "2px solid #fff",
            }}
          />
          <div>
            <h6 className="mb-0 fw-bold text-white">Adepu Ganesh</h6>
            <small className="text-white-50">Owner & Chef</small>
          </div>
        </div>

        <div className="text-center">
          <h1 className="display-3 fw-bold">
            Welcome to Our Restaurant
          </h1>

          <p className="lead mt-3">
            Delicious food, fast delivery, and unforgettable taste.
          </p>

          <div className="mt-4">
            <Link
              to="/menu"
              className="btn btn-primary btn-lg me-3"
            >
              View Menu
            </Link>

            <Link
              to="/menu"
              className="btn btn-success btn-lg"
            >
              Order Now
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}

export default Home;