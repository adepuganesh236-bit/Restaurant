import { useState } from "react";
import API from "../Services/api";

function Contact() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [sending, setSending] = useState(false);

  const handleSubmit = async () => {
    if (!name || !email || !message) {
      alert("Please fill in all fields.");
      return;
    }

    const token = localStorage.getItem("access");
    if (!token) {
      alert("Please login first to send a message.");
      return;
    }

    setSending(true);
    try {
      await API.post("contacts/", { name, email, message });
      setSubmitted(true);
      setName("");
      setEmail("");
      setMessage("");
    } catch (error) {
      console.error(error);
      alert("Failed to send message. Please try again.");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="container mt-5">
      <h2 className="page-title">Contact Us</h2>

      <div className="row justify-content-center">
        <div className="col-md-8">
          <div className="card contact-card">
            <div className="card-body">
              <div className="row">
                <div className="col-md-5">
                  <h5 className="fw-bold mb-3">Restaurant Information</h5>

                  <div className="contact-info-row">
                    <div className="icon">Restaurant</div>
                    <div>
                      <strong>Ganesh Home Foods</strong>
                    </div>
                  </div>

                  <div className="contact-info-row">
                    <div className="icon">Address</div>
                    <div>Hyderabad, Telangana</div>
                  </div>

                  <div className="contact-info-row">
                    <div className="icon">Phone</div>
                    <div>+91 6303693659</div>
                  </div>

                  <div className="contact-info-row">
                    <div className="icon">Email</div>
                    <div>gani@foodparadise.com</div>
                  </div>
                </div>

                <div className="col-md-7">
                  <h5 className="fw-bold mb-3">Send us a Message</h5>

                  {submitted && (
                    <div className="alert alert-success" role="alert">
                      Message sent successfully! We will get back to you soon.
                    </div>
                  )}

                  <div className="contact-form">
                    <input
                      type="text"
                      className="form-control mb-3"
                      placeholder="Your Name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                    />

                    <input
                      type="email"
                      className="form-control mb-3"
                      placeholder="Your Email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />

                    <textarea
                      className="form-control mb-3"
                      rows="4"
                      placeholder="Your Message"
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                    ></textarea>

                    <button
                      className="btn btn-success w-100"
                      onClick={handleSubmit}
                      disabled={sending}
                    >
                      {sending ? "Sending..." : "Send Message"}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Contact;
