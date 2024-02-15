import React, { useState, useEffect } from 'react';
import '../styles/Dashboard.css';
import { Doughnut, Bar, Pie } from 'react-chartjs-2';
import 'chart.js/auto';
import Header from '../utils/header';
import Footer from '../utils/footer';


const Dashboard = () => {
    const [userCountStats, setUserCountStats] = useState(null);
    const [matchedStats, setMatchedStats] = useState(null);


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
        const fetchUserCountStats = async () => {
            try {
                const adminEmail = user.email; // Replace with your admin email
                const response = await fetch(`http://localhost:3001/matched-stats/${adminEmail}`);
                const data = await response.json();

                setUserCountStats(data);
            } catch (error) {
                console.error('Error fetching user stats:', error);
            }
        };

        // Call the function
        fetchUserCountStats();
    }, []); // Empty dependency array to run only once when the component mounts

    // Function to render the pie chart
    const renderUserCountPieChart = () => {
        if (!userCountStats) {
            return null;
        }
    
        const data = {
            labels: ['Mentors', 'Mentees'],
            datasets: [
                {
                    data: [userCountStats.mentorCount, userCountStats.menteeCount],
                    backgroundColor: ['#3BBED1', '#007785'], // You can customize the colors
                    hoverBackgroundColor: ['#3BBED1', '#007785'],
                },
            ],
        };

    
        return <Pie className="pie-chart" data={data} />;
    };

    // Inside your Dashboard component
const fetchMatchedStats = async () => {
    try {
        const adminEmail = user.email;
        const response = await fetch(`http://localhost:3001/matched-stats/${adminEmail}`);
        const data = await response.json();

        // Do something with the data (set it to a state, etc.)
        setMatchedStats(data);
    } catch (error) {
        console.error('Error fetching matched stats:', error);
    }
};

// Call the function
useEffect(() => {
    fetchMatchedStats();
}, []);

const renderStackedBarChart = () => {
    if (!matchedStats) {
        return null;
    }

    const data = {
        labels: ['Matched', 'Not Matched'],
        datasets: [
            {
                label: 'Mentors',
                data: [
                    matchedStats.mentorMatchesCount,
                    matchedStats.mentorCount - matchedStats.mentorMatchesCount,
                ],
                backgroundColor: ['#007785', '#007785'],
            },
            {
                label: 'Mentees',
                data: [
                    matchedStats.menteeMatchesCount,
                    matchedStats.menteeCount - matchedStats.menteeMatchesCount,
                ],
                backgroundColor: ['#3BBED1', '#3BBED1'],
            },
        ],
    };

    const options = {
        title: {
            display: true,
            text: 'Mentor and Mentee Stats',
            fontSize: 16,
        },
        scales: {
            x: {
                stacked: true,
            },
            y: {
                stacked: true,
            },
        },
    };

    return <Bar className="bar-chart" data={data} options={options} />;
};


    return (
                <>
                    <Header />
                    <div className="dashboard-container">
                    <h1 className='insights-header'>Programme Dashboard</h1>

                        <div className="chart-container">
                            <div className="chart-item">
                                <h2 className='chart-title'>Users Count</h2>
                            {renderUserCountPieChart()}
                            </div>
                            <div className="chart-item">
                            <h2 className='chart-title'>Matched Users</h2>
                            {renderStackedBarChart()}

                            </div>
                        </div>
                    </div>
        
                    <Footer />
                </>
            );
};

export default Dashboard;

