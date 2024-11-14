// Cards.js
import React, { useState, useContext, useEffect } from 'react';
import { UserContext } from '../UserContext';
import '../styles/cards.css';  // Your styles for the Cards page

const Cards = () => {
    const { userId } = useContext(UserContext);
    const [storedCards, setStoredCards] = useState([]);
    const [decryptedCards, setDecryptedCards] = useState([]);
    const [selectedCard, setSelectedCard] = useState(null); // Track selected card
    const [password, setPassword] = useState(''); // Track entered password
    const [error, setError] = useState('');
    const [isDialogOpen, setIsDialogOpen] = useState(false); // Toggle dialog box
    const [showUnmasked, setShowUnmasked] = useState(false); // Toggle masking

    const fetchStoredCards = async () => {
        try {
            const retrieveResponse = await fetch("http://localhost:5000/retrieve-encrypted", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ userId }),
            });
            const data = await retrieveResponse.json();
            if (retrieveResponse.ok) {
                setStoredCards(data);
            } else {
                setError(data.error || "Failed to retrieve stored cards.");
            }
        } catch (err) {
            console.error("Error fetching stored cards:", err);
            setError("An error occurred while retrieving cards.");
        }
    };

    const decryptStoredCards = async () => {
        try {
            const decryptedData = await Promise.all(
                storedCards.map(async (card) => {
                    const decryptResponse = await fetch("http://localhost:5000/decrypt", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                            encryptedCardNetwork: card.encrypted_card_network,
                            encryptedCardType: card.encrypted_card_type, 
                            encryptedCardNumber: card.encrypted_card_number,
                            encryptedCardHolderName: card.encrypted_card_holder_name,
                            encryptedExpiryDate: card.encrypted_expiry_date,
                            encryptedCvv: card.encrypted_cvv
                        }),
                    });
                    const decryptedCard = await decryptResponse.json();
                    if (decryptResponse.ok) {
                        return {
                          decrypted_card_network: decryptedCard.decrypted_card_network,
                          decrypted_card_type: decryptedCard.decrypted_card_type, 
                          decrypted_card_number: decryptedCard.decrypted_card_number,
                          decrypted_card_holder_name: decryptedCard.decrypted_card_holder_name,
                          decrypted_expiry_date: decryptedCard.decrypted_expiry_date,
                          decrypted_cvv: decryptedCard.decrypted_cvv,
                        };
                      } else {
                        throw new Error("Failed to decrypt card data.");
                      }
                })
            );
            setDecryptedCards(decryptedData);
        } catch (err) {
            console.error("Error decrypting stored cards:", err);
            setError("An error occurred while decrypting cards.");
        }
    };

    const maskCardNumber = (number) => `**** **** **** ${number.slice(-4)}`;
    const maskCvv = (cvv) => '***';
    const maskExpiryDate = (expiryDate) => `**/**`;

    const handleCardClick = (card) => {
        setSelectedCard(card);
        setIsDialogOpen(true); // Open dialog box
    };

    const verifyPassword = async () => {
        try {
            const response = await fetch('http://localhost:5000/verify-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId, password })
            });
            const data = await response.json();
            if (data.status === 'success') {
                setShowUnmasked(true); // Unmask card details
                setIsDialogOpen(false); // Close dialog box
            } else {
                setError('Incorrect password.');
            }
        } catch (err) {
            console.error("Error verifying password:", err);
            setError("An error occurred. Please try again.");
        }
    };

    useEffect(() => {
        fetchStoredCards();
    }, [userId]);

    useEffect(() => {
        if (storedCards.length > 0) {
            decryptStoredCards();
        }
    }, [storedCards]);

    return (
        <div className="cards-container">
            <h2 className='heading'>Stored Cards</h2>
            {error && <div className="error">{error}</div>}
            {decryptedCards.length > 0 ? (
                <ul>
                    {decryptedCards.map((card, index) => (
                        <li key={index} onClick={() => handleCardClick(card)}>
                            <p><strong>Card Network:</strong> {card.decrypted_card_network}</p>
                            <p><strong>Card Type:</strong> {card.decrypted_card_type}</p>
                            <p><strong>Card Number:</strong> {showUnmasked && selectedCard === card ? card.decrypted_card_number : maskCardNumber(card.decrypted_card_number)}</p>
                            <p><strong>Cardholder Name:</strong> {card.decrypted_card_holder_name}</p>
                            <p><strong>Expiry:</strong> {showUnmasked && selectedCard === card ? card.decrypted_expiry_date : maskExpiryDate(card.decrypted_expiry_date)}</p>
                            <p><strong>CVC:</strong> {showUnmasked && selectedCard === card ? card.decrypted_cvv : maskCvv(card.decrypted_cvv)}</p>
                        </li>
                    ))}
                </ul>
            ) : (
                <p>No decrypted cards available.</p>
            )}

            {isDialogOpen && (
                <div className="dialog-overlay">
                    <div className="dialog-box">
                        <h3>Enter Password</h3>
                        <input
                            type="password"
                            placeholder="Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                        <button className='submit_button' onClick={verifyPassword}>Submit</button>
                        <button className='cancel_button' onClick={() => setIsDialogOpen(false)}>Cancel</button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Cards;
