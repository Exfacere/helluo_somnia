'use client';

import { useState, useEffect, useRef, FormEvent } from 'react';

interface PortfolioItem {
    id?: string;
    file: string;
    title: string;
    category: string;
    public_id?: string;
}

interface Exhibition {
    id: string;
    title: string;
    location: string;
    city: string;
    startDate: string;
    endDate?: string;
    description?: string;
    image?: string;
    public_id?: string;
    createdAt: string;
}

const categoryNames: Record<string, string> = {
    pyro: 'Pyrogravure',
    peinture: 'Peinture',
    collage: 'Collage',
    gravure: 'Gravure',
    divers: 'Divers',
};

// Helper to resolve image URL
function getImageUrl(file: string): string {
    // If it's already a full URL (Cloudinary), return as-is
    if (file.startsWith('http')) return file;
    // Otherwise, add /Images/ prefix
    return `/Images/${file}`;
}

export default function AdminPage() {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [password, setPassword] = useState('');
    const [items, setItems] = useState<PortfolioItem[]>([]);
    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [filter, setFilter] = useState('all');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Active tab state
    const [activeTab, setActiveTab] = useState<'portfolio' | 'exhibitions'>('portfolio');

    // Form state for portfolio
    const [title, setTitle] = useState('');
    const [category, setCategory] = useState('');
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [preview, setPreview] = useState<string | null>(null);

    // Edit state for portfolio
    const [editingIndex, setEditingIndex] = useState<number | null>(null);
    const [editingTitle, setEditingTitle] = useState('');

    // Exhibitions state
    const [exhibitions, setExhibitions] = useState<Exhibition[]>([]);
    const [exhibitionsLoading, setExhibitionsLoading] = useState(false);
    const [exhTitle, setExhTitle] = useState('');
    const [exhLocation, setExhLocation] = useState('');
    const [exhCity, setExhCity] = useState('');
    const [exhStartDate, setExhStartDate] = useState('');
    const [exhEndDate, setExhEndDate] = useState('');
    const [exhDescription, setExhDescription] = useState('');
    const [editingExhibition, setEditingExhibition] = useState<string | null>(null);

    // Load items when authenticated
    useEffect(() => {
        if (isAuthenticated) {
            loadItems();
            loadExhibitions();
        }
    }, [isAuthenticated]);

    async function loadItems() {
        setLoading(true);
        try {
            const res = await fetch('/api/portfolio');
            const data = await res.json();
            setItems(data.items || []);
        } catch (err) {
            setError('Erreur de chargement');
        }
        setLoading(false);
    }

    async function loadExhibitions() {
        setExhibitionsLoading(true);
        try {
            const res = await fetch('/api/exhibitions');
            const data = await res.json();
            setExhibitions(data.items || []);
        } catch (err) {
            setError('Erreur de chargement des expositions');
        }
        setExhibitionsLoading(false);
    }

    async function handleAddExhibition(e: FormEvent) {
        e.preventDefault();
        setError('');
        setSuccess('');

        if (!exhTitle || !exhLocation || !exhCity || !exhStartDate) {
            setError('Veuillez remplir tous les champs obligatoires');
            return;
        }

        setUploading(true);
        try {
            const res = await fetch('/api/exhibitions', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${getToken()}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    title: exhTitle,
                    location: exhLocation,
                    city: exhCity,
                    startDate: exhStartDate,
                    endDate: exhEndDate || undefined,
                    description: exhDescription || undefined,
                }),
            });

            if (!res.ok) throw new Error('Failed to add exhibition');

            setSuccess('Exposition ajoutée !');
            setTimeout(() => setSuccess(''), 3000);

            // Reset form
            setExhTitle('');
            setExhLocation('');
            setExhCity('');
            setExhStartDate('');
            setExhEndDate('');
            setExhDescription('');

            loadExhibitions();
        } catch (err) {
            setError('Erreur lors de l\'ajout de l\'exposition');
        }
        setUploading(false);
    }

    async function handleDeleteExhibition(id: string) {
        if (!confirm('Supprimer cette exposition ?')) return;

        try {
            const res = await fetch(`/api/exhibitions?id=${id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${getToken()}`,
                },
            });

            if (!res.ok) throw new Error('Delete failed');

            setSuccess('Exposition supprimée !');
            setTimeout(() => setSuccess(''), 3000);
            loadExhibitions();
        } catch (err) {
            setError('Erreur lors de la suppression');
        }
    }

    function startEditExhibition(exh: Exhibition) {
        setEditingExhibition(exh.id);
        setExhTitle(exh.title);
        setExhLocation(exh.location);
        setExhCity(exh.city);
        setExhStartDate(exh.startDate);
        setExhEndDate(exh.endDate || '');
        setExhDescription(exh.description || '');
    }

    function cancelEditExhibition() {
        setEditingExhibition(null);
        setExhTitle('');
        setExhLocation('');
        setExhCity('');
        setExhStartDate('');
        setExhEndDate('');
        setExhDescription('');
    }

    async function handleSaveExhibition(e: FormEvent) {
        e.preventDefault();
        if (!editingExhibition) return;

        try {
            const res = await fetch('/api/exhibitions', {
                method: 'PATCH',
                headers: {
                    'Authorization': `Bearer ${getToken()}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    id: editingExhibition,
                    title: exhTitle,
                    location: exhLocation,
                    city: exhCity,
                    startDate: exhStartDate,
                    endDate: exhEndDate || undefined,
                    description: exhDescription || undefined,
                }),
            });

            if (!res.ok) throw new Error('Update failed');

            setSuccess('Exposition modifiée !');
            setTimeout(() => setSuccess(''), 3000);
            cancelEditExhibition();
            loadExhibitions();
        } catch (err) {
            setError('Erreur lors de la modification');
        }
    }

    const [loginLoading, setLoginLoading] = useState(false);
    const [loginError, setLoginError] = useState('');

    async function handleLogin(e: FormEvent) {
        e.preventDefault();
        setLoginLoading(true);
        setLoginError('');

        try {
            const res = await fetch('/api/auth', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ password }),
            });

            if (res.ok) {
                sessionStorage.setItem('adminToken', password);
                setIsAuthenticated(true);
            } else {
                setLoginError('Mot de passe incorrect');
            }
        } catch (err) {
            setLoginError('Erreur de connexion');
        }
        setLoginLoading(false);
    }

    function getToken() {
        return sessionStorage.getItem('adminToken') || '';
    }

    function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0];
        if (file) {
            setSelectedFile(file);
            const reader = new FileReader();
            reader.onloadend = () => setPreview(reader.result as string);
            reader.readAsDataURL(file);
        }
    }

    async function handleSubmit(e: FormEvent) {
        e.preventDefault();
        if (!selectedFile || !title || !category) {
            setError('Veuillez remplir tous les champs');
            return;
        }

        setUploading(true);
        setError('');

        try {
            // Upload image
            const formData = new FormData();
            formData.append('file', selectedFile);

            const uploadRes = await fetch('/api/upload', {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${getToken()}` },
                body: formData,
            });

            if (!uploadRes.ok) {
                const uploadErr = await uploadRes.json();
                throw new Error(uploadErr.error || 'Upload failed');
            }

            const uploadData = await uploadRes.json();

            // Add to portfolio
            const portfolioRes = await fetch('/api/portfolio', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${getToken()}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    title,
                    category,
                    url: uploadData.url,
                    public_id: uploadData.public_id,
                }),
            });

            if (!portfolioRes.ok) throw new Error('Failed to save');

            // Reset form
            setTitle('');
            setCategory('');
            setSelectedFile(null);
            setPreview(null);
            if (fileInputRef.current) fileInputRef.current.value = '';

            setSuccess('Œuvre ajoutée avec succès !');
            setTimeout(() => setSuccess(''), 3000);
            loadItems();
        } catch (err: any) {
            setError(err.message || 'Erreur lors de l\'ajout');
        }
        setUploading(false);
    }

    async function handleDelete(index: number) {
        if (!confirm('Supprimer cette œuvre ?')) return;

        try {
            const res = await fetch(`/api/portfolio?index=${index}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${getToken()}` },
            });

            if (!res.ok) throw new Error('Delete failed');

            setSuccess('Œuvre supprimée');
            setTimeout(() => setSuccess(''), 3000);
            loadItems();
        } catch (err) {
            setError('Erreur lors de la suppression');
        }
    }

    function startEditing(index: number, currentTitle: string) {
        setEditingIndex(index);
        setEditingTitle(currentTitle);
    }

    function cancelEditing() {
        setEditingIndex(null);
        setEditingTitle('');
    }

    async function handleSaveEdit(index: number) {
        try {
            const res = await fetch('/api/portfolio', {
                method: 'PATCH',
                headers: {
                    'Authorization': `Bearer ${getToken()}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ index, title: editingTitle }),
            });

            if (!res.ok) throw new Error('Update failed');

            setSuccess('Titre modifié !');
            setTimeout(() => setSuccess(''), 3000);
            setEditingIndex(null);
            setEditingTitle('');
            loadItems();
        } catch (err) {
            setError('Erreur lors de la modification');
        }
    }

    const filteredItems = filter === 'all'
        ? items
        : items.filter(item => item.category === filter);

    // Login screen
    if (!isAuthenticated) {
        return (
            <div style={styles.loginContainer}>
                <div style={styles.loginBox}>
                    <h1 style={styles.loginTitle}>HELLUO_SOMNIA</h1>
                    <p style={styles.loginSubtitle}>Administration</p>
                    {loginError && (
                        <div style={{
                            background: '#F8D7DA',
                            color: '#721C24',
                            padding: '0.75rem',
                            borderRadius: '4px',
                            marginBottom: '1rem',
                            fontSize: '0.875rem'
                        }}>
                            {loginError}
                        </div>
                    )}
                    <form onSubmit={handleLogin} style={styles.loginForm}>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Mot de passe"
                            style={styles.loginInput}
                            autoFocus
                            disabled={loginLoading}
                        />
                        <button
                            type="submit"
                            style={{
                                ...styles.loginButton,
                                opacity: loginLoading ? 0.7 : 1,
                            }}
                            disabled={loginLoading}
                        >
                            {loginLoading ? 'Connexion...' : 'Accéder'}
                        </button>
                    </form>
                </div>
            </div>
        );
    }

    return (
        <div style={styles.container}>
            {/* Header */}
            <header style={styles.header}>
                <h1 style={styles.headerTitle}>HELLUO_SOMNIA — Admin</h1>
                <a href="/" style={styles.headerLink}>← Retour au site</a>
            </header>

            {/* Tabs */}
            <div style={styles.tabs}>
                <button
                    onClick={() => setActiveTab('portfolio')}
                    style={{
                        ...styles.tab,
                        ...(activeTab === 'portfolio' ? styles.tabActive : {}),
                    }}
                >
                    Portfolio
                </button>
                <button
                    onClick={() => setActiveTab('exhibitions')}
                    style={{
                        ...styles.tab,
                        ...(activeTab === 'exhibitions' ? styles.tabActive : {}),
                    }}
                >
                    Expositions
                </button>
            </div>

            {/* Portfolio Tab Content */}
            {activeTab === 'portfolio' && (
                <div style={styles.content}>
                    {/* Works List */}
                    <div style={styles.card}>
                        <div style={styles.cardHeader}>
                            <h2 style={styles.cardTitle}>Œuvres</h2>
                            <span style={styles.count}>{items.length} œuvres</span>
                        </div>

                        {/* Filters */}
                        <div style={styles.filters}>
                            {['all', 'pyro', 'peinture', 'collage', 'gravure', 'divers'].map(f => (
                                <button
                                    key={f}
                                    onClick={() => setFilter(f)}
                                    style={{
                                        ...styles.filterBtn,
                                        ...(filter === f ? styles.filterActive : {}),
                                    }}
                                >
                                    {f === 'all' ? 'Toutes' : categoryNames[f]}
                                </button>
                            ))}
                        </div>

                        {/* Grid */}
                        <div style={styles.grid}>
                            {loading ? (
                                <p>Chargement...</p>
                            ) : filteredItems.length === 0 ? (
                                <p>Aucune œuvre</p>
                            ) : (
                                filteredItems.map((item, i) => {
                                    // Find actual index in full items array
                                    const actualIndex = items.indexOf(item);
                                    return (
                                        <div key={actualIndex} style={styles.item}>
                                            <img
                                                src={getImageUrl(item.file)}
                                                alt={item.title}
                                                style={styles.itemImage}
                                            />
                                            <div style={styles.itemOverlay}>
                                                {editingIndex === actualIndex ? (
                                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                                        <input
                                                            type="text"
                                                            value={editingTitle}
                                                            onChange={(e) => setEditingTitle(e.target.value)}
                                                            style={{
                                                                padding: '0.25rem 0.5rem',
                                                                fontSize: '0.75rem',
                                                                borderRadius: '4px',
                                                                border: 'none',
                                                            }}
                                                            autoFocus
                                                        />
                                                        <div style={{ display: 'flex', gap: '0.25rem' }}>
                                                            <button
                                                                onClick={() => handleSaveEdit(actualIndex)}
                                                                style={{
                                                                    padding: '0.25rem 0.5rem',
                                                                    fontSize: '0.65rem',
                                                                    background: '#28a745',
                                                                    color: '#fff',
                                                                    border: 'none',
                                                                    borderRadius: '4px',
                                                                    cursor: 'pointer',
                                                                }}
                                                            >
                                                                ✓
                                                            </button>
                                                            <button
                                                                onClick={cancelEditing}
                                                                style={{
                                                                    padding: '0.25rem 0.5rem',
                                                                    fontSize: '0.65rem',
                                                                    background: '#6c757d',
                                                                    color: '#fff',
                                                                    border: 'none',
                                                                    borderRadius: '4px',
                                                                    cursor: 'pointer',
                                                                }}
                                                            >
                                                                ✗
                                                            </button>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <>
                                                        <span style={styles.itemTitle}>{item.title}</span>
                                                        <span style={styles.itemCategory}>
                                                            {categoryNames[item.category] || item.category}
                                                        </span>
                                                    </>
                                                )}
                                            </div>
                                            {editingIndex !== actualIndex && (
                                                <>
                                                    <button
                                                        onClick={() => startEditing(actualIndex, item.title)}
                                                        style={{
                                                            ...styles.deleteBtn,
                                                            background: '#007bff',
                                                            top: '0.5rem',
                                                            right: '2.5rem',
                                                        }}
                                                    >
                                                        ✎
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(actualIndex)}
                                                        style={styles.deleteBtn}
                                                    >
                                                        ×
                                                    </button>
                                                </>
                                            )}
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    </div>

                    {/* Add Form */}
                    <div style={styles.sidebar}>
                        <div style={styles.card}>
                            <div style={styles.cardHeader}>
                                <h2 style={styles.cardTitle}>Ajouter une œuvre</h2>
                            </div>
                            <div style={styles.cardBody}>
                                {error && <div style={styles.alertError}>{error}</div>}
                                {success && <div style={styles.alertSuccess}>{success}</div>}

                                <form onSubmit={handleSubmit}>
                                    <div style={styles.formGroup}>
                                        <label style={styles.label}>Image</label>
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={handleFileChange}
                                            ref={fileInputRef}
                                            style={styles.input}
                                        />
                                        {preview && (
                                            <img src={preview} alt="Aperçu" style={styles.preview} />
                                        )}
                                    </div>

                                    <div style={styles.formGroup}>
                                        <label style={styles.label}>Titre</label>
                                        <input
                                            type="text"
                                            value={title}
                                            onChange={(e) => setTitle(e.target.value)}
                                            placeholder="Titre de l'œuvre"
                                            style={styles.input}
                                        />
                                    </div>

                                    <div style={styles.formGroup}>
                                        <label style={styles.label}>Catégorie</label>
                                        <select
                                            value={category}
                                            onChange={(e) => setCategory(e.target.value)}
                                            style={styles.input}
                                        >
                                            <option value="">Choisir...</option>
                                            <option value="pyro">Pyrogravure</option>
                                            <option value="peinture">Peinture</option>
                                            <option value="collage">Collage</option>
                                            <option value="gravure">Gravure</option>
                                            <option value="divers">Divers</option>
                                        </select>
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={uploading}
                                        style={{
                                            ...styles.submitBtn,
                                            opacity: uploading ? 0.7 : 1,
                                        }}
                                    >
                                        {uploading ? 'Upload en cours...' : '+ Ajouter l\'œuvre'}
                                    </button>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Exhibitions Tab Content */}
            {activeTab === 'exhibitions' && (
                <div style={styles.content}>
                    {/* Exhibitions List */}
                    <div style={styles.card}>
                        <div style={styles.cardHeader}>
                            <h2 style={styles.cardTitle}>Expositions</h2>
                            <span style={styles.count}>{exhibitions.length} expositions</span>
                        </div>

                        <div style={{ padding: '1rem' }}>
                            {exhibitionsLoading ? (
                                <p>Chargement...</p>
                            ) : exhibitions.length === 0 ? (
                                <p style={{ color: '#666', fontStyle: 'italic' }}>Aucune exposition pour le moment</p>
                            ) : (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                    {exhibitions.map((exh) => (
                                        <div
                                            key={exh.id}
                                            style={{
                                                background: '#f9f9f9',
                                                padding: '1rem',
                                                borderRadius: '8px',
                                            }}
                                        >
                                            {editingExhibition === exh.id ? (
                                                // Mode édition
                                                <form onSubmit={handleSaveExhibition} style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                                    <input
                                                        type="text"
                                                        value={exhTitle}
                                                        onChange={(e) => setExhTitle(e.target.value)}
                                                        placeholder="Titre"
                                                        required
                                                        style={{ padding: '0.5rem', borderRadius: '4px', border: '1px solid #ccc' }}
                                                    />
                                                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                                                        <input
                                                            type="text"
                                                            value={exhLocation}
                                                            onChange={(e) => setExhLocation(e.target.value)}
                                                            placeholder="Lieu"
                                                            required
                                                            style={{ flex: 1, padding: '0.5rem', borderRadius: '4px', border: '1px solid #ccc' }}
                                                        />
                                                        <input
                                                            type="text"
                                                            value={exhCity}
                                                            onChange={(e) => setExhCity(e.target.value)}
                                                            placeholder="Ville"
                                                            required
                                                            style={{ flex: 1, padding: '0.5rem', borderRadius: '4px', border: '1px solid #ccc' }}
                                                        />
                                                    </div>
                                                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                                                        <input
                                                            type="date"
                                                            value={exhStartDate}
                                                            onChange={(e) => setExhStartDate(e.target.value)}
                                                            required
                                                            style={{ flex: 1, padding: '0.5rem', borderRadius: '4px', border: '1px solid #ccc' }}
                                                        />
                                                        <input
                                                            type="date"
                                                            value={exhEndDate}
                                                            onChange={(e) => setExhEndDate(e.target.value)}
                                                            style={{ flex: 1, padding: '0.5rem', borderRadius: '4px', border: '1px solid #ccc' }}
                                                        />
                                                    </div>
                                                    <textarea
                                                        value={exhDescription}
                                                        onChange={(e) => setExhDescription(e.target.value)}
                                                        placeholder="Description (optionnel)"
                                                        style={{ padding: '0.5rem', borderRadius: '4px', border: '1px solid #ccc', minHeight: '60px' }}
                                                    />
                                                    <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                                                        <button
                                                            type="button"
                                                            onClick={cancelEditExhibition}
                                                            style={{
                                                                padding: '0.5rem 1rem',
                                                                background: '#6c757d',
                                                                color: '#fff',
                                                                border: 'none',
                                                                borderRadius: '4px',
                                                                cursor: 'pointer',
                                                            }}
                                                        >
                                                            Annuler
                                                        </button>
                                                        <button
                                                            type="submit"
                                                            style={{
                                                                padding: '0.5rem 1rem',
                                                                background: '#C9A962',
                                                                color: '#fff',
                                                                border: 'none',
                                                                borderRadius: '4px',
                                                                cursor: 'pointer',
                                                            }}
                                                        >
                                                            Enregistrer
                                                        </button>
                                                    </div>
                                                </form>
                                            ) : (
                                                // Mode affichage
                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                                    <div>
                                                        <h3 style={{ margin: '0 0 0.25rem', fontWeight: 600, fontSize: '1rem' }}>{exh.title}</h3>
                                                        <p style={{ margin: '0 0 0.25rem', color: '#666', fontSize: '0.875rem' }}>
                                                            📍 {exh.location}, {exh.city}
                                                        </p>
                                                        <p style={{ margin: '0', color: '#C9A962', fontSize: '0.75rem' }}>
                                                            📅 {new Date(exh.startDate).toLocaleDateString('fr-FR')}
                                                            {exh.endDate && ` - ${new Date(exh.endDate).toLocaleDateString('fr-FR')}`}
                                                        </p>
                                                        {exh.description && (
                                                            <p style={{ margin: '0.5rem 0 0', color: '#444', fontSize: '0.875rem' }}>{exh.description}</p>
                                                        )}
                                                    </div>
                                                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                                                        <button
                                                            onClick={() => startEditExhibition(exh)}
                                                            style={{
                                                                background: '#C9A962',
                                                                color: '#fff',
                                                                border: 'none',
                                                                borderRadius: '50%',
                                                                width: '28px',
                                                                height: '28px',
                                                                cursor: 'pointer',
                                                                fontSize: '0.75rem',
                                                            }}
                                                        >
                                                            ✎
                                                        </button>
                                                        <button
                                                            onClick={() => handleDeleteExhibition(exh.id)}
                                                            style={{
                                                                background: '#DC3545',
                                                                color: '#fff',
                                                                border: 'none',
                                                                borderRadius: '50%',
                                                                width: '28px',
                                                                height: '28px',
                                                                cursor: 'pointer',
                                                                fontSize: '1rem',
                                                            }}
                                                        >
                                                            ×
                                                        </button>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Add Exhibition Form */}
                    <div style={styles.sidebar}>
                        <div style={styles.card}>
                            <div style={styles.cardHeader}>
                                <h2 style={styles.cardTitle}>Ajouter une exposition</h2>
                            </div>
                            <div style={styles.cardBody}>
                                {error && <div style={styles.alertError}>{error}</div>}
                                {success && <div style={styles.alertSuccess}>{success}</div>}

                                <form onSubmit={handleAddExhibition}>
                                    <div style={styles.formGroup}>
                                        <label style={styles.label}>Titre *</label>
                                        <input
                                            type="text"
                                            value={exhTitle}
                                            onChange={(e) => setExhTitle(e.target.value)}
                                            placeholder="Nom de l'exposition"
                                            style={styles.input}
                                        />
                                    </div>

                                    <div style={styles.formGroup}>
                                        <label style={styles.label}>Lieu *</label>
                                        <input
                                            type="text"
                                            value={exhLocation}
                                            onChange={(e) => setExhLocation(e.target.value)}
                                            placeholder="Galerie, musée, etc."
                                            style={styles.input}
                                        />
                                    </div>

                                    <div style={styles.formGroup}>
                                        <label style={styles.label}>Ville *</label>
                                        <input
                                            type="text"
                                            value={exhCity}
                                            onChange={(e) => setExhCity(e.target.value)}
                                            placeholder="Paris, Lyon, etc."
                                            style={styles.input}
                                        />
                                    </div>

                                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                                        <div style={{ ...styles.formGroup, flex: 1 }}>
                                            <label style={styles.label}>Début *</label>
                                            <input
                                                type="date"
                                                value={exhStartDate}
                                                onChange={(e) => setExhStartDate(e.target.value)}
                                                style={styles.input}
                                            />
                                        </div>
                                        <div style={{ ...styles.formGroup, flex: 1 }}>
                                            <label style={styles.label}>Fin</label>
                                            <input
                                                type="date"
                                                value={exhEndDate}
                                                onChange={(e) => setExhEndDate(e.target.value)}
                                                style={styles.input}
                                            />
                                        </div>
                                    </div>

                                    <div style={styles.formGroup}>
                                        <label style={styles.label}>Description</label>
                                        <textarea
                                            value={exhDescription}
                                            onChange={(e) => setExhDescription(e.target.value)}
                                            placeholder="Détails optionnels..."
                                            style={{ ...styles.input, minHeight: '80px', resize: 'vertical' }}
                                        />
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={uploading}
                                        style={{
                                            ...styles.submitBtn,
                                            opacity: uploading ? 0.7 : 1,
                                        }}
                                    >
                                        {uploading ? 'Ajout en cours...' : '+ Ajouter l\'exposition'}
                                    </button>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

// Inline styles
const styles: Record<string, React.CSSProperties> = {
    loginContainer: {
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#1A1A1A',
    },
    loginBox: {
        background: '#fff',
        padding: '3rem',
        borderRadius: '8px',
        textAlign: 'center',
        width: '100%',
        maxWidth: '360px',
    },
    loginTitle: {
        fontFamily: 'Cormorant Garamond, serif',
        fontSize: '1.5rem',
        fontWeight: 500,
        letterSpacing: '0.1em',
        marginBottom: '0.5rem',
    },
    loginSubtitle: {
        color: '#666',
        marginBottom: '2rem',
    },
    loginForm: {
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem',
    },
    loginInput: {
        padding: '0.75rem 1rem',
        border: '1px solid #ddd',
        borderRadius: '4px',
        fontSize: '1rem',
    },
    loginButton: {
        padding: '0.75rem',
        background: '#C9A962',
        color: '#fff',
        border: 'none',
        borderRadius: '4px',
        fontSize: '1rem',
        cursor: 'pointer',
    },
    container: {
        minHeight: '100vh',
        background: '#FAFAF8',
    },
    header: {
        background: '#1A1A1A',
        color: '#fff',
        padding: '1.5rem 2rem',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    headerTitle: {
        fontFamily: 'Cormorant Garamond, serif',
        fontSize: '1.5rem',
        fontWeight: 500,
        letterSpacing: '0.1em',
    },
    headerLink: {
        color: '#C9A962',
        textDecoration: 'none',
    },
    content: {
        maxWidth: '1400px',
        margin: '0 auto',
        padding: '2rem',
        display: 'grid',
        gridTemplateColumns: '1fr 350px',
        gap: '2rem',
    },
    card: {
        background: '#fff',
        borderRadius: '8px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
        overflow: 'hidden',
    },
    cardHeader: {
        padding: '1rem 1.5rem',
        borderBottom: '1px solid #eee',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    cardTitle: {
        fontSize: '1rem',
        fontWeight: 600,
    },
    cardBody: {
        padding: '1.5rem',
    },
    count: {
        fontSize: '0.875rem',
        color: '#666',
        background: '#f5f5f5',
        padding: '0.25rem 0.75rem',
        borderRadius: '999px',
    },
    filters: {
        padding: '1rem 1.5rem',
        display: 'flex',
        gap: '0.5rem',
        flexWrap: 'wrap',
    },
    filterBtn: {
        padding: '0.5rem 1rem',
        border: '1px solid #ddd',
        borderRadius: '999px',
        background: 'transparent',
        fontSize: '0.75rem',
        cursor: 'pointer',
    },
    filterActive: {
        background: '#1A1A1A',
        color: '#fff',
        borderColor: '#1A1A1A',
    },
    grid: {
        padding: '0 1.5rem 1.5rem',
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))',
        gap: '1rem',
        maxHeight: '60vh',
        overflowY: 'auto',
    },
    item: {
        position: 'relative',
        aspectRatio: '1',
        borderRadius: '8px',
        overflow: 'hidden',
        background: '#f0f0f0',
    },
    itemImage: {
        width: '100%',
        height: '100%',
        objectFit: 'cover',
    },
    itemOverlay: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        padding: '0.75rem',
        background: 'linear-gradient(to top, rgba(0,0,0,0.8), transparent)',
        display: 'flex',
        flexDirection: 'column',
    },
    itemTitle: {
        color: '#fff',
        fontSize: '0.75rem',
        fontWeight: 500,
    },
    itemCategory: {
        color: '#C9A962',
        fontSize: '0.65rem',
        textTransform: 'uppercase',
    },
    deleteBtn: {
        position: 'absolute',
        top: '0.5rem',
        right: '0.5rem',
        width: '28px',
        height: '28px',
        borderRadius: '50%',
        border: 'none',
        background: '#DC3545',
        color: '#fff',
        fontSize: '1.25rem',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
    },
    sidebar: {
        display: 'flex',
        flexDirection: 'column',
        gap: '1.5rem',
    },
    formGroup: {
        marginBottom: '1rem',
    },
    label: {
        display: 'block',
        fontSize: '0.875rem',
        fontWeight: 500,
        marginBottom: '0.5rem',
    },
    input: {
        width: '100%',
        padding: '0.75rem',
        border: '1px solid #ddd',
        borderRadius: '4px',
        fontSize: '0.875rem',
    },
    preview: {
        marginTop: '0.5rem',
        width: '100%',
        maxHeight: '150px',
        objectFit: 'cover',
        borderRadius: '4px',
    },
    submitBtn: {
        width: '100%',
        padding: '0.75rem',
        background: '#C9A962',
        color: '#fff',
        border: 'none',
        borderRadius: '4px',
        fontSize: '0.875rem',
        fontWeight: 500,
        cursor: 'pointer',
    },
    alertError: {
        padding: '0.75rem',
        background: '#F8D7DA',
        color: '#721C24',
        borderRadius: '4px',
        marginBottom: '1rem',
        fontSize: '0.875rem',
    },
    alertSuccess: {
        padding: '0.75rem',
        background: '#D4EDDA',
        color: '#155724',
        borderRadius: '4px',
        marginBottom: '1rem',
        fontSize: '0.875rem',
    },
};
