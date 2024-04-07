import React, { useState, useEffect } from 'react';
import '../../styles/Dashboard.css';
import { Doughnut, Bar, Pie } from 'react-chartjs-2';
import 'chart.js/auto';
import 'chartjs-adapter-moment';
import Header from '../../utils/header';
import Footer from '../../utils/footer';
import Loader from '../../utils/loader';
import axios from 'axios';


const Dashboard = () => {
    const [userCountStats, setUserCountStats] = useState(null);
    const [matchedStats, setMatchedStats] = useState(null);
    const [signupDurationStats, setSignupDurationStats] = useState(null);
    const [departmentStats, setDepartmentStats] = useState(null);
    const [developmentAreaStats, setDevelopmentAreaStats] = useState(null);
    const [locationStats, setLocationStats] = useState(null);
    const [matchByDateStats, setMatchByDateStats] = useState(null);


    const [countLoading, setCountLoading] = useState(true);
    const [matchedLoading, setMatchedLoading] = useState(true);
    const [signupDurationLoading, setSignupDurationLoading] = useState(true);
    const [departmentLoading, setDepartmentLoading] = useState(true);
    const [developmentAreaLoading, setDevelopmentAreaLoading] = useState(true);
    const [locationLoading, setLocationLoading] = useState(true);
    const [matchByDateLoading, setMatchByDateLoading] = useState(true);


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
        // Fetch matched the stats for number of users matched/not matched
        const fetchUserCountStats = async () => {
            try {
                const adminEmail = user.email;
                const response = await fetch(`https://localhost:3001/matched-stats/${adminEmail}`);
                const data = await response.json();

                setUserCountStats(data);
            } catch (error) {
                console.error('Error fetching user stats:', error);
            }
            finally {
                setCountLoading(false);
            }
        };
        fetchUserCountStats();
    }, []);

    // Render the pie chart
    const renderUserCountPieChart = () => {
        if (!userCountStats) {
            return null;
        }

        const data = {
            labels: ['Mentors', 'Mentees'],
            datasets: [
                {
                    data: [userCountStats.mentorCount, userCountStats.menteeCount],
                    backgroundColor: ['#007785', '#3BBED1'],
                    hoverBackgroundColor: ['#007785', '#3BBED1'],
                },
            ],
        };


        return <Pie className="pie-chart" data={data} />;
    };

    const fetchMatchedStats = async () => {
        try {
            const adminEmail = user.email;
            const response = await fetch(`https://localhost:3001/matched-stats/${adminEmail}`);
            const data = await response.json();

            setMatchedStats(data);
        } catch (error) {
            console.error('Error fetching matched stats:', error);
        }
        finally {
            setMatchedLoading(false);
        }
    };

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

    const fetchSignupDurationStats = async () => {
        try {
            const adminEmail = user.email;
            const response = await fetch(`https://localhost:3001/average-signup-duration/${adminEmail}`);
            const data = await response.json();

            setSignupDurationStats(data);
        } catch (error) {
            console.error('Error fetching signup duration stats:', error);
        } finally {
            setSignupDurationLoading(false);
        }
    };

    useEffect(() => {
        fetchSignupDurationStats();
    }, []);

    const renderSignupDurationNumber = () => {
        if (!signupDurationStats || signupDurationStats.averageSignupDurationDays == null) {
            return null;
        }

        const averageSignupDuration = signupDurationStats.averageSignupDurationDays;
        const formattedAverageSignupDuration = averageSignupDuration.toFixed(2);

        return (
            <div className='average-duration'>
                <p>{formattedAverageSignupDuration}</p>
            </div>
        );
    };


    useEffect(() => {
        const fetchDepartmentStats = async () => {
            try {
                const adminEmail = user.email;
                const response = await fetch(`https://localhost:3001/department-stats/${adminEmail}`);
                const data = await response.json();

                setDepartmentStats(data.departmentStats);
            } catch (error) {
                console.error('Error fetching department stats:', error);
            } finally {
                setDepartmentLoading(false);
            }
        };

        fetchDepartmentStats();
    }, []);

    const renderDoughnutChart = () => {
        if (!departmentStats) {
            return null;
        }

        const labels = departmentStats.map((entry) => entry.department === '' ? 'Not Disclosed' : entry.department);

        // const labels = departmentStats.map((department) => department.department);
        const data = departmentStats.map((department) => department.userCount);

        const doughnutData = {
            labels,
            datasets: [
                {
                    data,
                    backgroundColor: [
                        '#3BBED1', '#007785', '#FF6384', '#36A2EB', '#FFCE56',
                        '#4CAF50', '#9966FF', '#FF5733', '#8B4513', '#2E8B57',
                        '#800080', '#FFD700', '#00BFFF', '#FF4500', '#8A2BE2',
                        '#008000', '#FF1493', '#008080', '#FFA500', '#BDB76B'
                    ],
                    hoverBackgroundColor: [
                        '#3BBED1', '#007785', '#FF6384', '#36A2EB', '#FFCE56',
                        '#4CAF50', '#9966FF', '#FF5733', '#8B4513', '#2E8B57',
                        '#800080', '#FFD700', '#00BFFF', '#FF4500', '#8A2BE2',
                        '#008000', '#FF1493', '#008080', '#FFA500', '#BDB76B'
                    ],
                },
            ],
        };

        return <Doughnut data={doughnutData} />;
    };

    useEffect(() => {
        const fetchDevelopmentAreaStats = async () => {
            try {
                const adminEmail = user.email;
                const response = await fetch(`https://localhost:3001/development-area-stats/${adminEmail}`);
                const data = await response.json();

                setDevelopmentAreaStats(data.developmentAreaStats);
            } catch (error) {
                console.error('Error fetching development area stats:', error);
            } finally {
                setDevelopmentAreaLoading(false);
            }
        };

        fetchDevelopmentAreaStats();
    }, []);

    const renderDevelopmentAreaPieChart = () => {
        if (!developmentAreaStats) {
            return null;
        }

        const data = {
            labels: developmentAreaStats.map((entry) => entry.developmentArea),
            datasets: [
                {
                    data: developmentAreaStats.map((entry) => entry.userCount),
                    backgroundColor: [
                        '#3BBED1', '#007785', '#FF6384', '#36A2EB', '#FFCE56',
                        '#4CAF50', '#9966FF', '#FF5733', '#8B4513', '#2E8B57',
                        '#800080', '#FFD700', '#00BFFF', '#FF4500', '#8A2BE2',
                        '#008000', '#FF1493', '#008080', '#FFA500', '#BDB76B'
                    ],
                    hoverBackgroundColor: [
                        '#3BBED1', '#007785', '#FF6384', '#36A2EB', '#FFCE56',
                        '#4CAF50', '#9966FF', '#FF5733', '#8B4513', '#2E8B57',
                        '#800080', '#FFD700', '#00BFFF', '#FF4500', '#8A2BE2',
                        '#008000', '#FF1493', '#008080', '#FFA500', '#BDB76B'
                    ],
                },
            ],
        };

        return <Pie className="pie-chart" data={data} />;
    };


    useEffect(() => {
        const fetchLocationStats = async () => {
            try {
                const adminEmail = user.email;
                const response = await fetch(`https://localhost:3001/location-stats/${adminEmail}`);
                const data = await response.json();

                setLocationStats(data.locationStats);
            } catch (error) {
                console.error('Error fetching Location stats:', error);
            } finally {
                setLocationLoading(false);
            }
        };

        fetchLocationStats();
    }, []);

    const renderLocationPieChart = () => {
        if (!locationStats) {
            return null;
        }

        const labels = locationStats.map((entry) => entry.location === '' ? 'Not Disclosed' : entry.location);
        const data = locationStats.map((entry) => entry.userCount);

        const pieChartData = {
            labels,
            datasets: [
                {
                    data,
                    backgroundColor: [
                        '#3BBED1', '#007785', '#FF6384', '#36A2EB', '#FFCE56',
                        '#4CAF50', '#9966FF', '#FF5733', '#8B4513', '#2E8B57',
                        '#800080', '#FFD700', '#00BFFF', '#FF4500', '#8A2BE2',
                        '#008000', '#FF1493', '#008080', '#FFA500', '#BDB76B'
                    ],
                    hoverBackgroundColor: [
                        '#3BBED1', '#007785', '#FF6384', '#36A2EB', '#FFCE56',
                        '#4CAF50', '#9966FF', '#FF5733', '#8B4513', '#2E8B57',
                        '#800080', '#FFD700', '#00BFFF', '#FF4500', '#8A2BE2',
                        '#008000', '#FF1493', '#008080', '#FFA500', '#BDB76B'
                    ],
                },
            ],
        };

        return <Pie data={pieChartData} />;
    };

    useEffect(() => {
        const fetchMatchByDateStats = async () => {
            try {
                const adminEmail = user.email;
                const response = await axios.get(`https://localhost:3001/match-data-by-date/${adminEmail}`);
                setMatchByDateStats(response.data);
            } catch (error) {
                console.error('Error fetching match data:', error);
            } finally {
                setMatchByDateLoading(false);
            }
        };

        fetchMatchByDateStats();
    }, []);

    const renderMatchDataBarChart = () => {
        if (!matchByDateStats) {
            return null;
        }
    
        const chartData = {
            labels: Object.keys(matchByDateStats),
            datasets: [
                {
                    label: 'Matches by Date',
                    data: Object.values(matchByDateStats),
                    backgroundColor: '#3BBED1',
                    borderWidth: 1,
                },
            ],
        };
    
        const options = {
            scales: {
                x: {
                    type: 'time',
                    time: {
                        unit: 'day',
                        displayFormats: {
                            day: 'MMM DD',
                        },
                    },
                },
                y: {
                    beginAtZero: true,
                    stepSize: 1,
                },
            },
        };
    
        return <Bar data={chartData} options={options} />;
    };

    const renderAverageMatchesPerDate = () => {
        if (!matchByDateStats) {
            return null;
        }
    
        const dates = Object.keys(matchByDateStats);
        const matchesPerDate = Object.values(matchByDateStats);
        const totalMatches = matchesPerDate.reduce((total, matches) => total + matches, 0);
        const averageMatchesPerDate = totalMatches / dates.length;
    
        return (
            <div className='average-matches-per-date'>
                <p>{averageMatchesPerDate.toFixed(2)}</p>
            </div>
        );
    };



    return (
        <>
            <Header />
            <div className="dashboard-container">
                <h1 className='insights-header'>Program Dashboard</h1>

                <div className="chart-container">
                    <div className="chart-item">
                        <h2 className='chart-title'>Users Count</h2>
                        {countLoading ? <Loader /> : renderUserCountPieChart()}
                    </div>
                    <div className="chart-item">
                        <h2 className='chart-title'>Matched Users</h2>
                        {matchedLoading ? <Loader /> : renderStackedBarChart()}

                    </div>
                </div>
                <div className="chart-container">
                    <div className="chart-item">
                        <h2 className='chart-title'>Average User Duration in System (Days)</h2>
                        {signupDurationLoading ? <Loader /> : renderSignupDurationNumber()}
                    </div>
                    <div className="chart-item">
                        <h2 className='chart-title'>Users by Department</h2>
                        {departmentLoading ? <Loader /> : renderDoughnutChart()}

                    </div>

                </div>

                <div className="chart-container">
                    <div className="chart-item">
                        <h2 className='chart-title'>Development Areas</h2>
                        {developmentAreaLoading ? <Loader /> : renderDevelopmentAreaPieChart()}

                    </div>
                    <div className="chart-item">
                        <h2 className='chart-title'>Users by Location</h2>
                        {locationLoading ? <Loader /> : renderLocationPieChart()}
                    </div>

                </div>

                <div className="chart-container">

                <div className="chart-item">
                    <h2 className='chart-title'>Matches by Date</h2>
                    {matchByDateLoading ? <Loader /> : renderMatchDataBarChart()}
                </div>


                <div className="chart-item">
                    <h2 className='chart-title'>Average Matches per Round</h2>
                    {matchByDateLoading ? <Loader /> : renderAverageMatchesPerDate()}
                </div>
                </div>


            </div>

            <Footer />
        </>
    );
};

export default Dashboard;

