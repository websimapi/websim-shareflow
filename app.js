import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { CONFIG } from './config.js';

// Initialize WebsimSocket for real-time data
const room = new WebsimSocket();

// Main App Component
function App() {
    const [currentView, setCurrentView] = useState('home');
    const [currentUser, setCurrentUser] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // Get current user info
        const getUserInfo = async () => {
            try {
                const creatorUsername = (await window.websim.getCreatedBy()).username;
                setCurrentUser({
                    username: creatorUsername,
                    avatar: `https://images.websim.ai/avatar/${creatorUsername}`,
                    points: CONFIG.DEFAULT_USER_POINTS,
                    location: null
                });
            } catch (error) {
                console.error("Error getting user info:", error);
            } finally {
                setIsLoading(false);
            }
        };
        
        getUserInfo();
        
        // Ask for user's location
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    setCurrentUser(prev => ({
                        ...prev,
                        location: {
                            lat: position.coords.latitude,
                            lng: position.coords.longitude
                        }
                    }));
                },
                (error) => {
                    console.error("Error getting location:", error);
                }
            );
        }
    }, []);

    const renderView = () => {
        if (isLoading) return <LoadingView />;
        
        switch(currentView) {
            case 'home':
                return <HomeView setCurrentView={setCurrentView} currentUser={currentUser} />;
            case 'marketplace':
                return <MarketplaceView setCurrentView={setCurrentView} currentUser={currentUser} />;
            case 'timebank':
                return <TimebankView setCurrentView={setCurrentView} currentUser={currentUser} />;
            case 'profile':
                return <ProfileView setCurrentView={setCurrentView} currentUser={currentUser} />;
            case 'create-item':
                return <CreateItemView setCurrentView={setCurrentView} currentUser={currentUser} />;
            case 'create-service':
                return <CreateServiceView setCurrentView={setCurrentView} currentUser={currentUser} />;
            default:
                return <HomeView setCurrentView={setCurrentView} currentUser={currentUser} />;
        }
    };

    return (
        <div className="app">
            <Header currentView={currentView} setCurrentView={setCurrentView} currentUser={currentUser} />
            <main className="container">
                {renderView()}
            </main>
            <Footer />
        </div>
    );
}

// Header Component
function Header({ currentView, setCurrentView, currentUser }) {
    return (
        <header className="header">
            <div className="container nav-container">
                <a href="#" className="logo" onClick={(e) => {
                    e.preventDefault();
                    setCurrentView('home');
                }}>
                    {CONFIG.APP_NAME}
                </a>
                <nav>
                    <ul className="nav-links">
                        <li>
                            <a 
                                href="#" 
                                className={currentView === 'home' ? 'active' : ''} 
                                onClick={(e) => {
                                    e.preventDefault();
                                    setCurrentView('home');
                                }}
                            >
                                Home
                            </a>
                        </li>
                        <li>
                            <a 
                                href="#" 
                                className={currentView === 'marketplace' ? 'active' : ''} 
                                onClick={(e) => {
                                    e.preventDefault();
                                    setCurrentView('marketplace');
                                }}
                            >
                                Marketplace
                            </a>
                        </li>
                        <li>
                            <a 
                                href="#" 
                                className={currentView === 'timebank' ? 'active' : ''} 
                                onClick={(e) => {
                                    e.preventDefault();
                                    setCurrentView('timebank');
                                }}
                            >
                                TimeBank
                            </a>
                        </li>
                        <li>
                            <a 
                                href="#" 
                                className={currentView === 'profile' ? 'active' : ''} 
                                onClick={(e) => {
                                    e.preventDefault();
                                    setCurrentView('profile');
                                }}
                            >
                                {currentUser ? (
                                    <div className="flex-center">
                                        <img 
                                            src={currentUser.avatar} 
                                            alt={currentUser.username} 
                                            className="avatar"
                                            style={{ marginRight: '5px' }}
                                        />
                                        <span>{currentUser.points} Points</span>
                                    </div>
                                ) : 'Profile'}
                            </a>
                        </li>
                    </ul>
                </nav>
            </div>
        </header>
    );
}

// Footer Component
function Footer() {
    return (
        <footer className="footer">
            <div className="container text-center">
                <p>&copy; {new Date().getFullYear()} {CONFIG.APP_NAME} - Connecting Communities Through Sharing</p>
            </div>
        </footer>
    );
}

// Loading View
function LoadingView() {
    return (
        <div className="flex-center" style={{ height: '70vh' }}>
            <h2>Loading {CONFIG.APP_NAME}...</h2>
        </div>
    );
}

// Home View
function HomeView({ setCurrentView, currentUser }) {
    const [nearbyItems, setNearbyItems] = useState([]);
    const [nearbyServices, setNearbyServices] = useState([]);
    
    // Sync with database using React.useSyncExternalStore
    const items = React.useSyncExternalStore(
        room.collection('resource_item').subscribe,
        room.collection('resource_item').getList
    );
    
    const services = React.useSyncExternalStore(
        room.collection('service_offer').subscribe,
        room.collection('service_offer').getList
    );
    
    useEffect(() => {
        // In a real app, we would filter based on user's location
        // For now, just show the most recent items
        setNearbyItems(items.slice(0, 3));
        setNearbyServices(services.slice(0, 3));
    }, [items, services]);

    return (
        <div className="home-view">
            <section className="hero card mb-20" style={{ padding: '40px 20px' }}>
                <div className="text-center">
                    <h1 style={{ fontSize: '2.5rem', marginBottom: '20px' }}>
                        Share Resources, Build Community
                    </h1>
                    <p style={{ fontSize: '1.2rem', maxWidth: '800px', margin: '0 auto 30px' }}>
                        {CONFIG.APP_NAME} connects people with resources to share with those who need them. 
                        Reduce waste, help your community, and earn points by sharing your unused items or skills.
                    </p>
                    <div className="flex-center" style={{ gap: '15px' }}>
                        <button 
                            className="btn-primary" 
                            onClick={() => setCurrentView('create-item')}
                        >
                            Share an Item
                        </button>
                        <button 
                            className="btn-secondary" 
                            onClick={() => setCurrentView('create-service')}
                        >
                            Offer a Service
                        </button>
                    </div>
                </div>
            </section>

            <section className="mb-20">
                <div className="flex-between mb-20">
                    <h2>Items Near You</h2>
                    <button 
                        className="btn-outline" 
                        onClick={() => setCurrentView('marketplace')}
                    >
                        View All
                    </button>
                </div>
                
                {nearbyItems.length > 0 ? (
                    <div className="grid">
                        {nearbyItems.map(item => (
                            <ItemCard key={item.id} item={item} />
                        ))}
                    </div>
                ) : (
                    <div className="card text-center">
                        <p>No items available yet. Be the first to share!</p>
                        <button 
                            className="btn-primary mt-20" 
                            onClick={() => setCurrentView('create-item')}
                        >
                            Share an Item
                        </button>
                    </div>
                )}
            </section>

            <section className="mb-20">
                <div className="flex-between mb-20">
                    <h2>Services Available</h2>
                    <button 
                        className="btn-outline" 
                        onClick={() => setCurrentView('timebank')}
                    >
                        View All
                    </button>
                </div>
                
                {nearbyServices.length > 0 ? (
                    <div className="grid">
                        {nearbyServices.map(service => (
                            <ServiceCard key={service.id} service={service} />
                        ))}
                    </div>
                ) : (
                    <div className="card text-center">
                        <p>No services available yet. Be the first to offer your skills!</p>
                        <button 
                            className="btn-primary mt-20" 
                            onClick={() => setCurrentView('create-service')}
                        >
                            Offer a Service
                        </button>
                    </div>
                )}
            </section>

            <section className="how-it-works card mb-20">
                <h2 className="text-center mb-20">How It Works</h2>
                <div className="grid">
                    <div className="text-center">
                        <div style={{ fontSize: '3rem', color: 'var(--primary)' }}>📦</div>
                        <h3>Share Items</h3>
                        <p>List your unused items for others to collect and use.</p>
                    </div>
                    <div className="text-center">
                        <div style={{ fontSize: '3rem', color: 'var(--primary)' }}>⏱️</div>
                        <h3>Offer Services</h3>
                        <p>Exchange your skills and time with your community.</p>
                    </div>
                    <div className="text-center">
                        <div style={{ fontSize: '3rem', color: 'var(--primary)' }}>🏆</div>
                        <h3>Earn Points</h3>
                        <p>Get points for sharing that you can use for other items and services.</p>
                    </div>
                </div>
            </section>
        </div>
    );
}

// Item Card Component
function ItemCard({ item }) {
    return (
        <div className="card">
            <div style={{ 
                height: '180px', 
                background: '#eee',
                borderRadius: 'var(--radius)', 
                marginBottom: '15px',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center'
            }}>
                {item.image_url ? (
                    <img 
                        src={item.image_url} 
                        alt={item.title} 
                        style={{ 
                            width: '100%', 
                            height: '100%', 
                            objectFit: 'cover',
                            borderRadius: 'var(--radius)' 
                        }}
                    />
                ) : (
                    <div style={{ fontSize: '3rem' }}>📦</div>
                )}
            </div>
            <h3>{item.title}</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                {item.description && item.description.length > 80 
                    ? item.description.substring(0, 80) + '...' 
                    : item.description}
            </p>
            <div className="mt-20">
                <span className="tag tag-item">{item.category}</span>
            </div>
            <div className="flex-between mt-20">
                <div className="flex" style={{ alignItems: 'center', gap: '8px' }}>
                    <img 
                        src={`https://images.websim.ai/avatar/${item.username}`} 
                        alt={item.username} 
                        className="avatar" 
                        style={{ width: '30px', height: '30px' }}
                    />
                    <span>{item.username}</span>
                </div>
                <button className="btn-primary">Request</button>
            </div>
        </div>
    );
}

// Service Card Component
function ServiceCard({ service }) {
    return (
        <div className="card">
            <h3>{service.title}</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                {service.description && service.description.length > 100 
                    ? service.description.substring(0, 100) + '...' 
                    : service.description}
            </p>
            <div className="mt-20">
                <span className="tag tag-service">{service.category}</span>
                <span style={{ 
                    display: 'block', 
                    marginTop: '10px', 
                    fontWeight: 'bold', 
                    color: 'var(--primary)' 
                }}>
                    {service.hoursOffered} {service.hoursOffered === 1 ? 'hour' : 'hours'} available
                </span>
            </div>
            <div className="flex-between mt-20">
                <div className="flex" style={{ alignItems: 'center', gap: '8px' }}>
                    <img 
                        src={`https://images.websim.ai/avatar/${service.username}`} 
                        alt={service.username} 
                        className="avatar" 
                        style={{ width: '30px', height: '30px' }}
                    />
                    <span>{service.username}</span>
                </div>
                <button className="btn-secondary">Book Time</button>
            </div>
        </div>
    );
}

// Marketplace View
function MarketplaceView({ setCurrentView }) {
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [searchTerm, setSearchTerm] = useState('');
    const [sortBy, setSortBy] = useState('newest');
    
    // Sync with database using React.useSyncExternalStore
    const items = React.useSyncExternalStore(
        room.collection('resource_item').subscribe,
        room.collection('resource_item').getList
    );
    
    // Filter and sort items
    const filteredItems = items.filter(item => {
        const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
        const matchesSearch = !searchTerm || 
            item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (item.description && item.description.toLowerCase().includes(searchTerm.toLowerCase()));
        return matchesCategory && matchesSearch;
    });
    
    // Sort items
    const sortedItems = [...filteredItems].sort((a, b) => {
        if (sortBy === 'newest') {
            return new Date(b.created_at) - new Date(a.created_at);
        }
        // Add more sorting options as needed
        return 0;
    });

    return (
        <div className="marketplace-view">
            <div className="flex-between mb-20">
                <h1>Resource Marketplace</h1>
                <button 
                    className="btn-primary" 
                    onClick={() => setCurrentView('create-item')}
                >
                    Share an Item
                </button>
            </div>
            
            <div className="card mb-20">
                <div className="flex" style={{ gap: '15px', flexWrap: 'wrap' }}>
                    <div style={{ flex: 1, minWidth: '200px' }}>
                        <label htmlFor="search">Search:</label>
                        <input 
                            id="search"
                            type="text" 
                            placeholder="Search items..." 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div style={{ flex: 1, minWidth: '200px' }}>
                        <label htmlFor="category">Category:</label>
                        <select 
                            id="category"
                            value={selectedCategory}
                            onChange={(e) => setSelectedCategory(e.target.value)}
                        >
                            <option value="All">All Categories</option>
                            {CONFIG.CATEGORIES.map(category => (
                                <option key={category} value={category}>{category}</option>
                            ))}
                        </select>
                    </div>
                    <div style={{ flex: 1, minWidth: '200px' }}>
                        <label htmlFor="sort">Sort By:</label>
                        <select 
                            id="sort"
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value)}
                        >
                            <option value="newest">Newest First</option>
                            <option value="oldest">Oldest First</option>
                        </select>
                    </div>
                </div>
            </div>
            
            {sortedItems.length > 0 ? (
                <div className="grid">
                    {sortedItems.map(item => (
                        <ItemCard key={item.id} item={item} />
                    ))}
                </div>
            ) : (
                <div className="card text-center">
                    <p>No items found matching your criteria.</p>
                    <button 
                        className="btn-primary mt-20" 
                        onClick={() => {
                            setSelectedCategory('All');
                            setSearchTerm('');
                        }}
                    >
                        Clear Filters
                    </button>
                </div>
            )}
        </div>
    );
}

// Timebank View
function TimebankView({ setCurrentView }) {
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [searchTerm, setSearchTerm] = useState('');
    
    // Sync with database using React.useSyncExternalStore
    const services = React.useSyncExternalStore(
        room.collection('service_offer').subscribe,
        room.collection('service_offer').getList
    );
    
    // Filter services
    const filteredServices = services.filter(service => {
        const matchesCategory = selectedCategory === 'All' || service.category === selectedCategory;
        const matchesSearch = !searchTerm || 
            service.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (service.description && service.description.toLowerCase().includes(searchTerm.toLowerCase()));
        return matchesCategory && matchesSearch;
    });

    return (
        <div className="timebank-view">
            <div className="flex-between mb-20">
                <h1>Time Banking Services</h1>
                <button 
                    className="btn-secondary" 
                    onClick={() => setCurrentView('create-service')}
                >
                    Offer a Service
                </button>
            </div>
            
            <div className="card mb-20">
                <div className="flex" style={{ gap: '15px', flexWrap: 'wrap' }}>
                    <div style={{ flex: 1, minWidth: '200px' }}>
                        <label htmlFor="search">Search:</label>
                        <input 
                            id="search"
                            type="text" 
                            placeholder="Search services..." 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div style={{ flex: 1, minWidth: '200px' }}>
                        <label htmlFor="category">Category:</label>
                        <select 
                            id="category"
                            value={selectedCategory}
                            onChange={(e) => setSelectedCategory(e.target.value)}
                        >
                            <option value="All">All Categories</option>
                            {CONFIG.SERVICE_CATEGORIES.map(category => (
                                <option key={category} value={category}>{category}</option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>
            
            {filteredServices.length > 0 ? (
                <div className="grid">
                    {filteredServices.map(service => (
                        <ServiceCard key={service.id} service={service} />
                    ))}
                </div>
            ) : (
                <div className="card text-center">
                    <p>No services found matching your criteria.</p>
                    <button 
                        className="btn-secondary mt-20" 
                        onClick={() => {
                            setSelectedCategory('All');
                            setSearchTerm('');
                        }}
                    >
                        Clear Filters
                    </button>
                </div>
            )}
        </div>
    );
}

// Profile View
function ProfileView({ currentUser }) {
    const [activeTab, setActiveTab] = useState('myItems');
    
    // Sync with database using React.useSyncExternalStore
    const allItems = React.useSyncExternalStore(
        room.collection('resource_item').subscribe,
        room.collection('resource_item').getList
    );
    
    const allServices = React.useSyncExternalStore(
        room.collection('service_offer').subscribe,
        room.collection('service_offer').getList
    );
    
    // Filter for user's own items and services
    const myItems = allItems.filter(item => item.username === currentUser.username);
    const myServices = allServices.filter(service => service.username === currentUser.username);
    
    // Get transactions for the current user
    const transactions = React.useSyncExternalStore(
        room.collection('transaction').subscribe,
        room.collection('transaction').filter({ 
            $or: [
                { sender_username: currentUser.username },
                { receiver_username: currentUser.username }
            ]
        }).getList
    );

    return (
        <div className="profile-view">
            <div className="card mb-20">
                <div className="flex" style={{ gap: '20px', alignItems: 'center' }}>
                    <img 
                        src={currentUser.avatar} 
                        alt={currentUser.username} 
                        style={{ 
                            width: '80px', 
                            height: '80px', 
                            borderRadius: '50%',
                            border: '3px solid var(--primary)'
                        }}
                    />
                    <div>
                        <h2>{currentUser.username}</h2>
                        <p style={{ color: 'var(--primary)', fontWeight: 'bold' }}>
                            {currentUser.points} Points Available
                        </p>
                    </div>
                </div>
            </div>

            <div className="tab-container">
                <div 
                    className={`tab ${activeTab === 'myItems' ? 'active' : ''}`}
                    onClick={() => setActiveTab('myItems')}
                >
                    My Items ({myItems.length})
                </div>
                <div 
                    className={`tab ${activeTab === 'myServices' ? 'active' : ''}`}
                    onClick={() => setActiveTab('myServices')}
                >
                    My Services ({myServices.length})
                </div>
                <div 
                    className={`tab ${activeTab === 'transactions' ? 'active' : ''}`}
                    onClick={() => setActiveTab('transactions')}
                >
                    Transactions
                </div>
            </div>

            {activeTab === 'myItems' && (
                <div>
                    {myItems.length > 0 ? (
                        <div className="grid">
                            {myItems.map(item => (
                                <ItemCard key={item.id} item={item} />
                            ))}
                        </div>
                    ) : (
                        <div className="card text-center">
                            <p>You haven't shared any items yet.</p>
                        </div>
                    )}
                </div>
            )}

            {activeTab === 'myServices' && (
                <div>
                    {myServices.length > 0 ? (
                        <div className="grid">
                            {myServices.map(service => (
                                <ServiceCard key={service.id} service={service} />
                            ))}
                        </div>
                    ) : (
                        <div className="card text-center">
                            <p>You haven't offered any services yet.</p>
                        </div>
                    )}
                </div>
            )}

            {activeTab === 'transactions' && (
                <div>
                    {transactions.length > 0 ? (
                        <div>
                            {transactions.map(transaction => (
                                <div key={transaction.id} className="card mb-20">
                                    <div className="flex-between">
                                        <div>
                                            <h3>{transaction.type} Transaction</h3>
                                            <p>
                                                {transaction.sender_username === currentUser.username 
                                                    ? `You sent to ${transaction.receiver_username}` 
                                                    : `Received from ${transaction.sender_username}`}
                                            </p>
                                            <p style={{ color: 'var(--text-secondary)' }}>
                                                {new Date(transaction.created_at).toLocaleDateString()} at {new Date(transaction.created_at).toLocaleTimeString()}
                                            </p>
                                        </div>
                                        <div style={{ 
                                            fontWeight: 'bold', 
                                            color: transaction.sender_username === currentUser.username ? 'var(--error)' : 'var(--success)' 
                                        }}>
                                            {transaction.sender_username === currentUser.username ? '-' : '+'}{transaction.points} Points
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="card text-center">
                            <p>No transactions yet.</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

// Create Item View
function CreateItemView({ setCurrentView, currentUser }) {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [category, setCategory] = useState('');
    const [imageUrl, setImageUrl] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!title || !category) {
            alert('Please fill in all required fields');
            return;
        }

        setIsSubmitting(true);
        try {
            await room.collection('resource_item').create({
                title,
                description,
                category,
                image_url: imageUrl,
                status: 'available'
            });
            
            alert('Item shared successfully!');
            setCurrentView('marketplace');
        } catch (error) {
            console.error('Error creating item:', error);
            alert('Error creating item. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };
    
    const handleFileUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        
        try {
            const url = await window.websim.upload(file);
            setImageUrl(url);
        } catch (error) {
            console.error('Error uploading file:', error);
            alert('Error uploading image. Please try again.');
        }
    };

    return (
        <div className="create-item-view">
            <h1 className="mb-20">Share an Item</h1>
            
            <div className="card">
                <form onSubmit={handleSubmit}>
                    <div className="mb-20">
                        <label htmlFor="title">Title: *</label>
                        <input 
                            id="title"
                            type="text" 
                            placeholder="What are you sharing?" 
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            required
                        />
                    </div>
                    
                    <div className="mb-20">
                        <label htmlFor="description">Description:</label>
                        <textarea 
                            id="description"
                            placeholder="Describe your item... condition, size, etc." 
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            rows={4}
                        ></textarea>
                    </div>
                    
                    <div className="mb-20">
                        <label htmlFor="category">Category: *</label>
                        <select 
                            id="category"
                            value={category}
                            onChange={(e) => setCategory(e.target.value)}
                            required
                        >
                            <option value="">Select a category</option>
                            {CONFIG.CATEGORIES.map(cat => (
                                <option key={cat} value={cat}>{cat}</option>
                            ))}
                        </select>
                    </div>
                    
                    <div className="mb-20">
                        <label htmlFor="image">Image:</label>
                        <input 
                            id="image"
                            type="file" 
                            accept="image/*"
                            onChange={handleFileUpload}
                        />
                        {imageUrl && (
                            <div className="mt-20">
                                <img 
                                    src={imageUrl} 
                                    alt="Preview" 
                                    style={{ 
                                        maxWidth: '100%', 
                                        maxHeight: '200px',
                                        borderRadius: 'var(--radius)'
                                    }}
                                />
                            </div>
                        )}
                    </div>
                    
                    <div className="flex" style={{ gap: '10px', justifyContent: 'flex-end' }}>
                        <button 
                            type="button" 
                            className="btn-outline" 
                            onClick={() => setCurrentView('marketplace')}
                            disabled={isSubmitting}
                        >
                            Cancel
                        </button>
                        <button 
                            type="submit" 
                            className="btn-primary"
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? 'Submitting...' : 'Share Item'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

// Create Service View
function CreateServiceView({ setCurrentView, currentUser }) {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [category, setCategory] = useState('');
    const [hoursOffered, setHoursOffered] = useState(1);
    const [availableTimes, setAvailableTimes] = useState([]);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleTimeSlotToggle = (slot) => {
        if (availableTimes.includes(slot)) {
            setAvailableTimes(availableTimes.filter(time => time !== slot));
        } else {
            setAvailableTimes([...availableTimes, slot]);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!title || !category || availableTimes.length === 0) {
            alert('Please fill in all required fields and select at least one time slot');
            return;
        }

        setIsSubmitting(true);
        try {
            await room.collection('service_offer').create({
                title,
                description,
                category,
                hoursOffered: Number(hoursOffered),
                availableTimes,
                status: 'available'
            });
            
            alert('Service offered successfully!');
            setCurrentView('timebank');
        } catch (error) {
            console.error('Error creating service:', error);
            alert('Error offering service. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="create-service-view">
            <h1 className="mb-20">Offer a Service</h1>
            
            <div className="card">
                <form onSubmit={handleSubmit}>
                    <div className="mb-20">
                        <label htmlFor="title">Service Title: *</label>
                        <input 
                            id="title"
                            type="text" 
                            placeholder="What service can you offer?" 
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            required
                        />
                    </div>
                    
                    <div className="mb-20">
                        <label htmlFor="description">Description:</label>
                        <textarea 
                            id="description"
                            placeholder="Describe your service, your experience level, etc." 
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            rows={4}
                        ></textarea>
                    </div>
                    
                    <div className="mb-20">
                        <label htmlFor="category">Category: *</label>
                        <select 
                            id="category"
                            value={category}
                            onChange={(e) => setCategory(e.target.value)}
                            required
                        >
                            <option value="">Select a category</option>
                            {CONFIG.SERVICE_CATEGORIES.map(cat => (
                                <option key={cat} value={cat}>{cat}</option>
                            ))}
                        </select>
                    </div>
                    
                    <div className="mb-20">
                        <label htmlFor="hours">Hours Offered: *</label>
                        <input 
                            id="hours"
                            type="number" 
                            min="1" 
                            max="10"
                            value={hoursOffered}
                            onChange={(e) => setHoursOffered(e.target.value)}
                            required
                        />
                    </div>
                    
                    <div className="mb-20">
                        <label>Available Time Slots: *</label>
                        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginTop: '10px' }}>
                            {CONFIG.DEFAULT_TIME_SLOTS.map(slot => (
                                <div key={slot} style={{ marginBottom: '10px' }}>
                                    <label style={{ 
                                        display: 'inline-block',
                                        padding: '8px 12px',
                                        borderRadius: 'var(--radius)',
                                        border: '1px solid var(--border)',
                                        backgroundColor: availableTimes.includes(slot) ? 'var(--secondary-light)' : 'transparent',
                                        cursor: 'pointer'
                                    }}>
                                        <input 
                                            type="checkbox"
                                            checked={availableTimes.includes(slot)}
                                            onChange={() => handleTimeSlotToggle(slot)}
                                            style={{ marginRight: '5px' }}
                                        />
                                        {slot}
                                    </label>
                                </div>
                            ))}
                        </div>
                    </div>
                    
                    <div className="flex" style={{ gap: '10px', justifyContent: 'flex-end' }}>
                        <button 
                            type="button" 
                            className="btn-outline" 
                            onClick={() => setCurrentView('timebank')}
                            disabled={isSubmitting}
                        >
                            Cancel
                        </button>
                        <button 
                            type="submit" 
                            className="btn-secondary"
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? 'Submitting...' : 'Offer Service'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

// Render the App
ReactDOM.render(
    <App />,
    document.getElementById('app')
);

