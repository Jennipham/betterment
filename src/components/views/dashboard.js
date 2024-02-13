import React, { useState, useEffect } from 'react';
import '../styles/Dashboard.css';
import { Doughnut, Bar, Pie } from 'react-chartjs-2';
import 'chart.js/auto';
import Header from '../utils/header';
import Footer from '../utils/footer';


const Dashboard = () => {
    const [userStats, setUserStats] = useState(null);

    const [user, setUser] = useState({
        firstName: sessionStorage.getItem('firstName') || 'User',
        lastName: sessionStorage.getItem('lastName') || '',
        userType: sessionStorage.getItem('userType') || '',
        email: sessionStorage.getItem('email') || '',
    });

    useEffect(() => {
        // Retrieve user information from sessionStorage
        const firstName = sessionStorage.getItem('firstName');
        const lastName = sessionStorage.getItem('lastName');
        const userType = sessionStorage.getItem('userType');
        const email = sessionStorage.getItem('email');

        setUser({ firstName, lastName, userType, email });
        // console.log('User Information:', { firstName, lastName, userType, email, jobRole, officeLocation, developmentAreas, mentoringMethods, languages });
    }, []);


    useEffect(() => {
        // Function to fetch user stats
        const fetchUserStats = async () => {
            try {
                const adminEmail = user.email; // Replace with your admin email
                const response = await fetch(`http://localhost:3001/matched-stats/${adminEmail}`);
                const data = await response.json();

                setUserStats(data);
            } catch (error) {
                console.error('Error fetching user stats:', error);
            }
        };

        // Call the function
        fetchUserStats();
    }, []); // Empty dependency array to run only once when the component mounts

    // Function to render the pie chart
    const renderPieChart = () => {
        if (!userStats) {
            return null;
        }
    
        const data = {
            labels: ['Mentors', 'Mentees'],
            datasets: [
                {
                    data: [userStats.mentorCount, userStats.menteeCount],
                    backgroundColor: ['#3BBED1', '#007785'], // You can customize the colors
                    hoverBackgroundColor: ['#3BBED1', '#007785'],
                },
            ],
        };

    
        return <Pie data={data} />;
    };
    // Your JSX code
    return (
                <>
                    <Header />
        
                    <div className="dashboard-container">
                        <div className="chart-container">
                            <div className="chart-item">
                                {/* <Doughnut data={pieChartData} /> */}
                            </div>
                            <div className="chart-item">
                                {renderPieChart()}
                            </div>
                        </div>
                    </div>
        
                    <Footer />
                </>
            );
};

export default Dashboard;

