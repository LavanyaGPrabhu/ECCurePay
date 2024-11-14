// EnterCard.js
import React, { useState, useContext } from 'react';
import { UserContext } from '../UserContext';
import '../styles/entercard.css';  // Your styles for the Enter Card page

const EnterCard = () => {
  const { userId } = useContext(UserContext);
  const [cardNetwork, setCardNetwork] = useState('');
  const [cardType, setCardType] = useState('');
  const [cardNumber, setCardNumber] = useState(Array(16).fill(''));
  const [cardHolderName, setCardHolderName] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [cvv, setCvv] = useState('');
  const [error, setError] = useState('');
  const [encryptedData, setEncryptedData] = useState(null);
  const [cvvError, setCvvError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (
      !cardNetwork || 
      !cardType || 
      !cardNumber.every(num => num !== '') || 
      !cardHolderName || 
      !expiryDate || 
      !cvv
    ) {
      setError("Please fill in all fields.");
      return;
    }
    
    if (cvvError) {
      setError('Please correct the CVV before submitting.');
      return;
    }

    try {
      const encryptResponse = await fetch("http://localhost:5000/encrypt", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          cardNetwork,
          cardType,
          cardNumber: cardNumber.join(''),
          cardHolderName,
          expiryDate,
          cvv
        }),
      });

      const encryptData = await encryptResponse.json();

      console.log("Encrypted Data:", encryptData);

      if (encryptResponse.ok) {
        const storeResponse = await fetch("http://localhost:5000/store-encrypted", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId,
            encrypted_card_network: encryptData.encrypted_card_network,
            encrypted_card_type: encryptData.encrypted_card_type,
            encrypted_card_number: encryptData.encrypted_card_number,
            encrypted_card_holder_name: encryptData.encrypted_card_holder_name,
            encrypted_expiry_date: encryptData.encrypted_expiry_date,
            encrypted_cvv: encryptData.encrypted_cvv,
          }),
        });
        if (storeResponse.ok) {
          setEncryptedData(encryptData);
          setError("");
        } else {
          const storeData = await storeResponse.json();
          setError(storeData.error || "Failed to store encrypted data");
        }
      } else {
        setError(encryptData.error || 'Encryption failed');
      }
    } catch (error) {
      console.error("Error:", error);
      setError('An error occurred while processing the card data.');
    }
  };

  const handleCardNumberChange = (index,e) => {
    let value = e.target.value;

    // Remove all non-digit characters
    value = value.replace(/\D/g, '');

    if (value.length <= 1) { // Ensure single character per box
      const updatedCardNumber = [...cardNumber]; // Make a shallow copy
      updatedCardNumber[index] = value; // Update specific index
      setCardNumber(updatedCardNumber); // Set the updated array back to state
    }
  };

  const handleExpiryChange = (e) => {
    let value = e.target.value;

    // Remove any non-digit characters except "/"
    value = value.replace(/[^0-9/]/g, '');

    // Automatically add a slash after the first two digits (month)
    if (value.length === 2 && !value.includes('/')) {
      value = value.slice(0, 2) + '/' + value.slice(2);
    }

    // Limit length to 5 characters
    if (value.length > 5) {
      return;
    }

    setExpiryDate(value);
  };

  const handleCvvChange = (e) => {
    let value = e.target.value;
    value = value.replace(/\D/g, ''); // Remove non-digit characters
    if (value.length > 3) 
      setCvvError('CVV must be 3 digits.');
    else{
      setCvv(value);
      setCvvError('');
    }
  };

  // Function to validate the expiry date
  const isValidExpiryDate = (value) => {
    const regex = /^(0[1-9]|1[0-2])\/\d{2}$/; // Format MM/YY
    return regex.test(value);
  };

  return (
    <div className="card-form-container">
      <h2 style={{color:'#003366',marginTop:'-15px',fontSize:'35px'}}>Enter Card Details</h2>
      <form onSubmit={handleSubmit} className="card-form">

        <div className="card-input-container">
          <div className="card-input-label">
            <label>Card Network:</label>
          </div>
          <select value={cardNetwork} onChange={(e) => setCardNetwork(e.target.value)} required>
            <option value="" disabled className='placeholder'>Select Network</option>
            <option value="Visa">Visa</option>
            <option value="Mastercard">Mastercard</option>
            <option value="Rupay">Rupay</option>
          </select>
        </div>

        <div className="card-input-container">
          <div className="card-input-label">
            <label>Card Type:</label>
          </div>
          <select value={cardType} onChange={(e) => setCardType(e.target.value)} required>
            <option value="" disabled className='placeholder'>Select Card Type</option>
            <option value="Credit">Credit</option>
            <option value="Debit">Debit</option>
            <option value="Prepaid">Prepaid</option>
            <option value="Commercial">Commercial</option>
          </select>
        </div>

        <div className="card-input-container">
          <div className="card-input-label">
            <label>Card Number:</label>
          </div>
          <div className="card-number-input">
            {/* Render 16 individual boxes for card number */}
            {[...Array(16)].map((_, index) => (
              <input
                key={index}
                type="text"
                value={cardNumber[index]}
                onChange={(e)=>handleCardNumberChange(index,e)}
                maxLength="1"
                placeholder="x"
                className={`card-box ${index % 4 === 3 ? 'with-space' : ''}`}
                required
              />
            ))}
          </div>
        </div>

        {/* Card Holder's Name */}
        <div className="card-input-container">
          <div className="card-input-label">
            <label>Card Holder's Name:</label>
          </div>
          <input
            type="text"
            value={cardHolderName}
            onChange={(e) => setCardHolderName(e.target.value)}
            placeholder="Enter Name"
            required
          />
        </div>

        <div className="card-row">

          <div className="card-input-container">
            <div className="card-input-label">
              <label>Expiry Date (MM/YY):</label>
            </div>
            <input
              type="text"
              value={expiryDate}
              onChange={handleExpiryChange}
              maxLength="5"
              placeholder="MM/YY"
              required
              style={{
                borderColor: expiryDate && !isValidExpiryDate(expiryDate) ? 'red' : '',
              }}
            />
            {!isValidExpiryDate(expiryDate) && expiryDate.length === 5 && (
              <span style={{ color: 'red', fontSize: '12px' }}>
                Invalid expiry date
              </span>
            )}
          </div>

          <div className="card-input-container">
            <div className="card-input-label">
              <label>CVV:</label>
            </div>
            <input
              type="password"
              value={cvv}
              onChange={handleCvvChange}
              maxLength="3"
              placeholder="123"
              required
            />
            {cvvError && (
              <span style={{ color: 'red', fontSize: '12px' }}>
                {cvvError}
              </span>
            )}
          </div>
        </div>

        <div className="butt">
          <button type="submit" disabled={cvvError}>Submit</button>
        </div>

        {error && <div className="error">{error}</div>}
      </form>

      {encryptedData && (
        <div>
          <h3>Encrypted Data</h3>
          <p>Card Network: {encryptedData.encrypted_card_network.ciphertext}</p>
          <p>Card Type: {encryptedData.encrypted_card_type.ciphertext}</p>
          <p>Card Number: {encryptedData.encrypted_card_number.ciphertext}</p>
          <p>Card Holder's Name: {encryptedData.encrypted_card_holder_name.ciphertext}</p>
          <p>Expiry Date: {encryptedData.encrypted_expiry_date.ciphertext}</p>
          <p>CVV: {encryptedData.encrypted_cvv.ciphertext}</p>
        </div>
      )}
    </div>
  );
};

export default EnterCard;