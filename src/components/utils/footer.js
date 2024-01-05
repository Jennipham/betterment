import React from 'react';
import Modal from '../utils/modal';
import { useState } from 'react';
import '../styles/Footer.css';
import '../styles/font.css'

const Footer = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);

    const openModal = () => {
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
    };
    return (
        <div className="footer">
            <div className="footer-text">
                <h1 className='by'>Jennifer Pham  |  Supervisor: Matthew Leeke</h1>
                <p className="terms-footer" onClick={openModal}>
                    Terms of Use
                </p>
                {isModalOpen && (
                    <Modal onClose={handleCloseModal}>
                        <iframe title="Terms of Use" src="/termsofuse" width="100%" height="100%" />
                    </Modal>
                )}        </div>

        </div>
    );
};

export default Footer;
