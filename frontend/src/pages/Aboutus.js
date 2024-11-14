import React from 'react';
import '../styles/about.css';
import sanviImage from '../assets/sanvi.jpg';
import darshanImage from '../assets/darshan.jpg';
import amrithImage from '../assets/amrith.jpg';
import lavanyaImage from '../assets/lavanya.jpg';



const App = () => {
  return (
    <div className="container">
      {/* About Us Section */}
      <section className="about-us">
        <h1>About Us</h1>
        <p>
        We specialize in providing secure, encrypted solutions for storing and processing sensitive data, particularly credit and debit card information. Our advanced encryption and decryption technology ensures that your payment details are protected at every step of the transaction process.

We utilize Elliptic Curve Cryptography encryption algorithms to securely encode card details, making it safe and secure. Our system decrypts your card information only when necessary, ensuring that it is kept safe while stored and only accessible to authorized systems.

In addition to robust encryption, we store card details in a secure, encrypted database that complies with industry standards and regulations. This ensures that your information is always kept confidential, even during long-term storage.

Our team is dedicated to delivering the highest levels of security, so you can add your cards with confidence knowing your card details are safe with us.
        </p>
      </section>

      {/* The Team Section */}
      <section className="team">
        <h2>The Team</h2>
        <div className="team-container">
          <div className="team-member">
           
            <h3>Sanvi Shetty</h3>
            <div
              className="image-circle"
              style={{ backgroundImage: `url(${sanviImage})` }}
            ></div>
            <p>Frontend Developer passionate about building intuitive interfaces.</p>
            
          </div>

          <div className="team-member">
            <h3>Darshan Nakshatri</h3>
            <div
              className="image-circle"
              style={{ backgroundImage: `url(${darshanImage})` }}
            ></div>
            <p>Developed a robust encryption and decryption systems.</p>
          </div>
          <div className="team-member">
          

            <h3>Amrith J Shet</h3>
            <div
              className="image-circle"
              style={{ backgroundImage: `url(${amrithImage})` }}
            ></div>
            <p>Backend Specialist, ensuring reliable and scalable solutions.</p>
          </div>

          <div className="team-member">
            <h3>Lavanya G Prabhu</h3>
            <div
              className="image-circle"
              style={{ backgroundImage: `url(${lavanyaImage})` }}
            ></div>
            <p>"Managed the database for secure storage and led documentation to ensure consistency."</p>
            
          </div>
        </div>
      </section>
    </div>
  );
};

export default App;
