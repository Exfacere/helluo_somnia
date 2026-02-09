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

interface CarnetPage {
    pageNumber: number;
    url: string;
    public_id: string;
}

interface Carnet {
    id: string;
    number: number;
    title: string;
    coverUrl: string;
    pages: CarnetPage[];
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
    const [activeTab, setActiveTab] = useState<'portfolio' | 'exhibitions' | 'categories' | 'carnets'>('portfolio');

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

    // Categories state
    const [categories, setCategories] = useState<{ id: string; name: string; order: number }[]>([]);
    const [categoriesLoading, setCategoriesLoading] = useState(false);
    const [newCatId, setNewCatId] = useState('');
    const [newCatName, setNewCatName] = useState('');

    // Carnets state
    const [carnets, setCarnets] = useState<Carnet[]>([]);
    const [carnetsLoading, setCarnetsLoading] = useState(false);
    const [carnetsUploading, setCarnetsUploading] = useState(false);
    const [carnetFiles, setCarnetFiles] = useState<FileList | null>(null);
    const [editingCarnetId, setEditingCarnetId] = useState<string | null>(null);
    const [editingCarnetTitle, setEditingCarnetTitle] = useState('');

    // Load items when authenticated
    useEffect(() => {
        if (isAuthenticated) {
            loadItems();
            loadExhibitions();
            loadCategories();
            loadCarnets();
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

    async function loadCategories() {
        setCategoriesLoading(true);
        try {
            const res = await fetch('/api/categories');
            const data = await res.json();
            setCategories(data.categories || []);
        } catch (err) {
            setError('Erreur de chargement des catégories');
        }
        setCategoriesLoading(false);
    }

    async function loadCarnets() {
        setCarnetsLoading(true);
        try {
            const res = await fetch('/api/carnets');
            const data = await res.json();
            setCarnets(data.carnets || []);
        } catch (err) {
            setError('Erreur de chargement des carnets');
        }
        setCarnetsLoading(false);
    }

    async function handleUploadCarnets(e: FormEvent) {
        e.preventDefault();
        if (!carnetFiles || carnetFiles.length === 0) {
            setError('Veuillez sélectionner des fichiers');
            return;
        }

        setCarnetsUploading(true);
        setError('');

        try {
            const formData = new FormData();
            for (let i = 0; i < carnetFiles.length; i++) {
                formData.append('files', carnetFiles[i]);
            }

            const res = await fetch('/api/carnets', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${getToken()}`,
                },
                body: formData,
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Upload failed');

            setSuccess(`${data.uploaded}/${data.total} fichiers uploadés !`);
            setTimeout(() => setSuccess(''), 5000);
            setCarnetFiles(null);
            loadCarnets();
        } catch (err: any) {
            setError(err.message || 'Erreur lors de l\'upload');
        }
        setCarnetsUploading(false);
    }

    async function handleDeleteCarnet(carnetId: string, pageNumber?: number) {
        const message = pageNumber !== undefined
            ? 'Supprimer cette page ?'
            : 'Supprimer ce carnet et toutes ses pages ?';
        if (!confirm(message)) return;

        try {
            const url = pageNumber !== undefined
                ? `/api/carnets?carnetId=${carnetId}&pageNumber=${pageNumber}`
                : `/api/carnets?carnetId=${carnetId}`;

            const res = await fetch(url, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${getToken()}` },
            });

            if (!res.ok) throw new Error('Delete failed');

            setSuccess('Suppression effectuée !');
            setTimeout(() => setSuccess(''), 3000);
            loadCarnets();
        } catch (err) {
            setError('Erreur lors de la suppression');
        }
    }

    async function handleUpdateCarnetTitle(carnetId: string) {
        if (!editingCarnetTitle.trim()) return;

        try {
            const res = await fetch('/api/carnets', {
                method: 'PATCH',
                headers: {
                    'Authorization': `Bearer ${getToken()}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ id: carnetId, title: editingCarnetTitle.trim() }),
            });

            if (!res.ok) throw new Error('Update failed');

            setSuccess('Titre modifié !');
            setTimeout(() => setSuccess(''), 3000);
            setEditingCarnetId(null);
            setEditingCarnetTitle('');
            loadCarnets();
        } catch (err) {
            setError('Erreur lors de la modification');
        }
    }

    async function handleAddCategory(e: FormEvent) {
        e.preventDefault();
        setError('');
        setSuccess('');

        if (!newCatId || !newCatName) {
            setError('Veuillez remplir l\'ID et le nom');
            return;
        }

        try {
            const res = await fetch('/api/categories', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${getToken()}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ id: newCatId, name: newCatName }),
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || 'Failed to add category');
            }

            setSuccess('Catégorie ajoutée !');
            setTimeout(() => setSuccess(''), 3000);

            setNewCatId('');
            setNewCatName('');
            loadCategories();
        } catch (err: any) {
            setError(err.message || 'Erreur lors de l\'ajout');
        }
    }

    async function handleDeleteCategory(id: string) {
        if (!confirm('Supprimer cette catégorie ?')) return;

        try {
            const res = await fetch(`/api/categories?id=${id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${getToken()}`,
                },
            });

            if (!res.ok) throw new Error('Delete failed');

            setSuccess('Catégorie supprimée !');
            setTimeout(() => setSuccess(''), 3000);
            loadCategories();
        } catch (err) {
            setError('Erreur lors de la suppression');
        }
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

    function startEditingExhibition(exh: Exhibition) {
        setEditingExhibition(exh.id);
        setExhTitle(exh.title);
        setExhLocation(exh.location);
        setExhCity(exh.city);
        setExhStartDate(exh.startDate);
        setExhEndDate(exh.endDate || '');
        setExhDescription(exh.description || '');
    }

    function cancelEditingExhibition() {
        setEditingExhibition(null);
        setExhTitle('');
        setExhLocation('');
        setExhCity('');
        setExhStartDate('');
        setExhEndDate('');
        setExhDescription('');
    }

    async function handleEditExhibition(e: FormEvent) {
        e.preventDefault();
        if (!editingExhibition) return;

        setError('');
        setSuccess('');

        if (!exhTitle || !exhLocation || !exhCity || !exhStartDate) {
            setError('Veuillez remplir tous les champs obligatoires');
            return;
        }

        setUploading(true);
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

            if (!res.ok) throw new Error('Failed to update exhibition');

            setSuccess('Exposition modifiée !');
            setTimeout(() => setSuccess(''), 3000);

            // Reset form and exit edit mode
            cancelEditingExhibition();
            loadExhibitions();
        } catch (err) {
            setError('Erreur lors de la modification');
        }
        setUploading(false);
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
                <button
                    onClick={() => setActiveTab('categories')}
                    style={{
                        ...styles.tab,
                        ...(activeTab === 'categories' ? styles.tabActive : {}),
                    }}
                >
                    Catégories
                </button>
                <button
                    onClick={() => setActiveTab('carnets')}
                    style={{
                        ...styles.tab,
                        ...(activeTab === 'carnets' ? styles.tabActive : {}),
                    }}
                >
                    Carnets
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
                                                display: 'flex',
                                                justifyContent: 'space-between',
                                                alignItems: 'flex-start',
                                            }}
                                        >
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
                                                    onClick={() => startEditingExhibition(exh)}
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
                                                    title="Modifier"
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
                                                    title="Supprimer"
                                                >
                                                    ×
                                                </button>
                                            </div>
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
                                <h2 style={styles.cardTitle}>
                                    {editingExhibition ? 'Modifier l\'exposition' : 'Ajouter une exposition'}
                                </h2>
                                {editingExhibition && (
                                    <button
                                        type="button"
                                        onClick={cancelEditingExhibition}
                                        style={{
                                            background: 'transparent',
                                            border: 'none',
                                            color: '#666',
                                            cursor: 'pointer',
                                            fontSize: '0.875rem',
                                            textDecoration: 'underline',
                                        }}
                                    >
                                        Annuler
                                    </button>
                                )}
                            </div>
                            <div style={styles.cardBody}>
                                {error && <div style={styles.alertError}>{error}</div>}
                                {success && <div style={styles.alertSuccess}>{success}</div>}

                                <form onSubmit={editingExhibition ? handleEditExhibition : handleAddExhibition}>
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
                                        {uploading
                                            ? (editingExhibition ? 'Modification...' : 'Ajout en cours...')
                                            : (editingExhibition ? '✓ Modifier l\'exposition' : '+ Ajouter l\'exposition')}
                                    </button>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Categories Tab Content */}
            {activeTab === 'categories' && (
                <div style={styles.content}>
                    {/* Categories List */}
                    <div style={styles.card}>
                        <div style={styles.cardHeader}>
                            <h2 style={styles.cardTitle}>Catégories du Portfolio</h2>
                            <span style={styles.count}>{categories.length} catégories</span>
                        </div>

                        <div style={{ padding: '1rem' }}>
                            {categoriesLoading ? (
                                <p>Chargement...</p>
                            ) : categories.length === 0 ? (
                                <p>Aucune catégorie</p>
                            ) : (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                    {categories.map((cat) => (
                                        <div
                                            key={cat.id}
                                            style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'space-between',
                                                padding: '0.75rem 1rem',
                                                background: '#2A2A2A',
                                                borderRadius: '6px',
                                            }}
                                        >
                                            <div>
                                                <strong style={{ color: '#C9A962' }}>{cat.name}</strong>
                                                <span style={{ color: '#888', marginLeft: '0.75rem', fontSize: '0.875rem' }}>
                                                    ID: {cat.id}
                                                </span>
                                            </div>
                                            <button
                                                onClick={() => handleDeleteCategory(cat.id)}
                                                style={{
                                                    background: 'transparent',
                                                    border: '1px solid #444',
                                                    color: '#f66',
                                                    width: '32px',
                                                    height: '32px',
                                                    borderRadius: '4px',
                                                    cursor: 'pointer',
                                                    fontSize: '1.25rem',
                                                }}
                                            >
                                                ×
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Add category form */}
                        <div style={styles.uploadSection}>
                            <h3 style={styles.uploadTitle}>Ajouter une catégorie</h3>

                            <form onSubmit={handleAddCategory}>
                                <div style={styles.formGroup}>
                                    <label style={styles.label}>ID (minuscules, sans espaces)</label>
                                    <input
                                        type="text"
                                        value={newCatId}
                                        onChange={(e) => setNewCatId(e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, ''))}
                                        placeholder="ex: sculpture"
                                        style={styles.input}
                                    />
                                </div>

                                <div style={styles.formGroup}>
                                    <label style={styles.label}>Nom affiché</label>
                                    <input
                                        type="text"
                                        value={newCatName}
                                        onChange={(e) => setNewCatName(e.target.value)}
                                        placeholder="ex: Sculptures"
                                        style={styles.input}
                                    />
                                </div>

                                <button
                                    type="submit"
                                    style={styles.submitBtn}
                                >
                                    + Ajouter la catégorie
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            )}

            {/* Carnets Tab Content */}
            {activeTab === 'carnets' && (
                <div style={styles.content}>
                    {/* Upload section */}
                    <div style={styles.card}>
                        <div style={styles.cardHeader}>
                            <h2 style={styles.cardTitle}>Uploader des carnets</h2>
                        </div>
                        <form onSubmit={handleUploadCarnets} style={{ padding: '1.5rem' }}>
                            <p style={{ marginBottom: '1rem', color: '#666', fontSize: '0.875rem' }}>
                                Nommez vos fichiers au format <strong>C.X.Y</strong> (ex: C.1.1.jpg pour Carnet 1, Page 1).
                                Les images seront automatiquement groupées par carnet.
                            </p>
                            <div style={styles.formGroup}>
                                <input
                                    type="file"
                                    multiple
                                    accept="image/*"
                                    onChange={(e) => setCarnetFiles(e.target.files)}
                                    style={styles.input}
                                />
                            </div>
                            {carnetFiles && carnetFiles.length > 0 && (
                                <p style={{ fontSize: '0.875rem', color: '#333', marginBottom: '1rem' }}>
                                    {carnetFiles.length} fichier(s) sélectionné(s)
                                </p>
                            )}
                            <button
                                type="submit"
                                style={{
                                    ...styles.submitBtn,
                                    opacity: carnetsUploading ? 0.7 : 1,
                                }}
                                disabled={carnetsUploading}
                            >
                                {carnetsUploading ? 'Upload en cours...' : '⬆️ Uploader les images'}
                            </button>
                        </form>
                    </div>

                    {/* Carnets list */}
                    <div style={styles.card}>
                        <div style={styles.cardHeader}>
                            <h2 style={styles.cardTitle}>Vos carnets</h2>
                            <span style={styles.count}>{carnets.length} carnet(s)</span>
                        </div>

                        {carnetsLoading ? (
                            <p style={{ padding: '2rem', textAlign: 'center' }}>Chargement...</p>
                        ) : carnets.length === 0 ? (
                            <p style={{ padding: '2rem', textAlign: 'center', color: '#888' }}>
                                Aucun carnet. Uploadez des images pour commencer.
                            </p>
                        ) : (
                            <div style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                                {carnets.map(carnet => (
                                    <div
                                        key={carnet.id}
                                        style={{
                                            border: '1px solid #ddd',
                                            borderRadius: '8px',
                                            overflow: 'hidden',
                                        }}
                                    >
                                        {/* Carnet header */}
                                        <div style={{
                                            padding: '1rem',
                                            background: '#f8f9fa',
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            alignItems: 'center',
                                        }}>
                                            {editingCarnetId === carnet.id ? (
                                                <div style={{ display: 'flex', gap: '0.5rem', flex: 1 }}>
                                                    <input
                                                        type="text"
                                                        value={editingCarnetTitle}
                                                        onChange={(e) => setEditingCarnetTitle(e.target.value)}
                                                        style={{ ...styles.input, flex: 1 }}
                                                        autoFocus
                                                    />
                                                    <button
                                                        onClick={() => handleUpdateCarnetTitle(carnet.id)}
                                                        style={{
                                                            padding: '0.5rem 1rem',
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
                                                        onClick={() => { setEditingCarnetId(null); setEditingCarnetTitle(''); }}
                                                        style={{
                                                            padding: '0.5rem 1rem',
                                                            background: '#6c757d',
                                                            color: '#fff',
                                                            border: 'none',
                                                            borderRadius: '4px',
                                                            cursor: 'pointer',
                                                        }}
                                                    >
                                                        ✕
                                                    </button>
                                                </div>
                                            ) : (
                                                <>
                                                    <div>
                                                        <h3 style={{ margin: 0, fontSize: '1.1rem' }}>{carnet.title}</h3>
                                                        <span style={{ color: '#888', fontSize: '0.8rem' }}>
                                                            {carnet.pages.length} page(s)
                                                        </span>
                                                    </div>
                                                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                                                        <button
                                                            onClick={() => { setEditingCarnetId(carnet.id); setEditingCarnetTitle(carnet.title); }}
                                                            style={{
                                                                padding: '0.4rem 0.75rem',
                                                                background: '#007bff',
                                                                color: '#fff',
                                                                border: 'none',
                                                                borderRadius: '4px',
                                                                cursor: 'pointer',
                                                                fontSize: '0.8rem',
                                                            }}
                                                        >
                                                            ✏️ Renommer
                                                        </button>
                                                        <button
                                                            onClick={() => handleDeleteCarnet(carnet.id)}
                                                            style={{
                                                                padding: '0.4rem 0.75rem',
                                                                background: '#dc3545',
                                                                color: '#fff',
                                                                border: 'none',
                                                                borderRadius: '4px',
                                                                cursor: 'pointer',
                                                                fontSize: '0.8rem',
                                                            }}
                                                        >
                                                            🗑️ Supprimer
                                                        </button>
                                                    </div>
                                                </>
                                            )}
                                        </div>
                                        {/* Pages thumbnails */}
                                        <div style={{
                                            display: 'flex',
                                            flexWrap: 'wrap',
                                            gap: '0.5rem',
                                            padding: '1rem',
                                        }}>
                                            {carnet.pages.map(page => (
                                                <div
                                                    key={page.pageNumber}
                                                    style={{
                                                        position: 'relative',
                                                        width: 80,
                                                        height: 110,
                                                    }}
                                                >
                                                    <img
                                                        src={page.url.replace('/upload/', '/upload/f_auto,q_auto,w_150,c_fill/')}
                                                        alt={`Page ${page.pageNumber}`}
                                                        style={{
                                                            width: '100%',
                                                            height: '100%',
                                                            objectFit: 'cover',
                                                            borderRadius: '4px',
                                                        }}
                                                    />
                                                    <span style={{
                                                        position: 'absolute',
                                                        bottom: 2,
                                                        left: 2,
                                                        background: 'rgba(0,0,0,0.7)',
                                                        color: '#fff',
                                                        fontSize: '0.65rem',
                                                        padding: '2px 5px',
                                                        borderRadius: '2px',
                                                    }}>
                                                        P.{page.pageNumber}
                                                    </span>
                                                    <button
                                                        onClick={() => handleDeleteCarnet(carnet.id, page.pageNumber)}
                                                        style={{
                                                            position: 'absolute',
                                                            top: 2,
                                                            right: 2,
                                                            width: 20,
                                                            height: 20,
                                                            borderRadius: '50%',
                                                            border: 'none',
                                                            background: '#dc3545',
                                                            color: '#fff',
                                                            fontSize: '0.75rem',
                                                            cursor: 'pointer',
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            justifyContent: 'center',
                                                        }}
                                                    >
                                                        ×
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

// Inline styles - Modern Dark Theme
const styles: Record<string, React.CSSProperties> = {
    // Login styles
    loginContainer: {
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #0f0f0f 0%, #1a1a1a 50%, #0f0f0f 100%)',
        padding: '1rem',
    },
    loginBox: {
        background: 'rgba(30, 30, 30, 0.95)',
        backdropFilter: 'blur(20px)',
        padding: 'clamp(2rem, 5vw, 3rem)',
        borderRadius: '16px',
        textAlign: 'center',
        width: '100%',
        maxWidth: '400px',
        border: '1px solid rgba(201, 169, 98, 0.2)',
        boxShadow: '0 25px 50px rgba(0, 0, 0, 0.5), 0 0 100px rgba(201, 169, 98, 0.05)',
    },
    loginTitle: {
        fontFamily: 'Cormorant Garamond, serif',
        fontSize: 'clamp(1.5rem, 4vw, 2rem)',
        fontWeight: 500,
        letterSpacing: '0.15em',
        marginBottom: '0.5rem',
        background: 'linear-gradient(135deg, #C9A962, #E8D5A3)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
    },
    loginSubtitle: {
        color: '#888',
        marginBottom: '2rem',
        fontSize: '0.9rem',
        letterSpacing: '0.05em',
    },
    loginForm: {
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem',
    },
    loginInput: {
        padding: '1rem 1.25rem',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        borderRadius: '12px',
        fontSize: '1rem',
        background: 'rgba(0, 0, 0, 0.3)',
        color: '#fff',
        transition: 'all 0.3s ease',
    },
    loginButton: {
        padding: '1rem',
        background: 'linear-gradient(135deg, #C9A962 0%, #B8954E 100%)',
        color: '#fff',
        border: 'none',
        borderRadius: '12px',
        fontSize: '1rem',
        fontWeight: 600,
        cursor: 'pointer',
        transition: 'all 0.3s ease',
        letterSpacing: '0.05em',
    },

    // Main container
    container: {
        minHeight: '100vh',
        background: 'linear-gradient(180deg, #0f0f0f 0%, #1a1a1a 100%)',
        color: '#fff',
    },

    // Header
    header: {
        background: 'rgba(15, 15, 15, 0.95)',
        backdropFilter: 'blur(20px)',
        color: '#fff',
        padding: 'clamp(1rem, 3vw, 1.5rem) clamp(1rem, 4vw, 2rem)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderBottom: '1px solid rgba(201, 169, 98, 0.15)',
        position: 'sticky',
        top: 0,
        zIndex: 100,
        flexWrap: 'wrap',
        gap: '1rem',
    },
    headerTitle: {
        fontFamily: 'Cormorant Garamond, serif',
        fontSize: 'clamp(1rem, 3vw, 1.5rem)',
        fontWeight: 500,
        letterSpacing: '0.1em',
        background: 'linear-gradient(135deg, #C9A962, #E8D5A3)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
    },
    headerLink: {
        color: '#C9A962',
        textDecoration: 'none',
        fontSize: '0.875rem',
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        transition: 'color 0.3s ease',
        padding: '0.5rem 1rem',
        borderRadius: '8px',
        border: '1px solid rgba(201, 169, 98, 0.3)',
    },

    // Tabs
    tabs: {
        display: 'flex',
        gap: '0.5rem',
        padding: 'clamp(0.75rem, 2vw, 1rem) clamp(1rem, 4vw, 2rem)',
        background: 'rgba(20, 20, 20, 0.8)',
        overflowX: 'auto',
        WebkitOverflowScrolling: 'touch',
        borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
    },
    tab: {
        padding: '0.75rem 1.5rem',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        borderRadius: '10px',
        background: 'transparent',
        color: '#888',
        fontSize: '0.875rem',
        cursor: 'pointer',
        transition: 'all 0.3s ease',
        whiteSpace: 'nowrap',
        fontWeight: 500,
    },
    tabActive: {
        background: 'linear-gradient(135deg, rgba(201, 169, 98, 0.2), rgba(201, 169, 98, 0.1))',
        color: '#C9A962',
        borderColor: 'rgba(201, 169, 98, 0.4)',
    },

    // Content area
    content: {
        maxWidth: '1600px',
        margin: '0 auto',
        padding: 'clamp(1rem, 3vw, 2rem)',
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 400px), 1fr))',
        gap: 'clamp(1rem, 3vw, 2rem)',
    },

    // Cards
    card: {
        background: 'rgba(25, 25, 25, 0.9)',
        backdropFilter: 'blur(10px)',
        borderRadius: '16px',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        overflow: 'hidden',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)',
    },
    cardHeader: {
        padding: 'clamp(0.75rem, 2vw, 1rem) clamp(1rem, 2vw, 1.5rem)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        background: 'rgba(30, 30, 30, 0.5)',
        flexWrap: 'wrap',
        gap: '0.5rem',
    },
    cardTitle: {
        fontSize: 'clamp(0.9rem, 2vw, 1rem)',
        fontWeight: 600,
        color: '#fff',
    },
    cardBody: {
        padding: 'clamp(1rem, 2vw, 1.5rem)',
    },

    // Counts and badges
    count: {
        fontSize: '0.8rem',
        color: '#C9A962',
        background: 'rgba(201, 169, 98, 0.15)',
        padding: '0.35rem 0.85rem',
        borderRadius: '20px',
        border: '1px solid rgba(201, 169, 98, 0.25)',
    },

    // Filters
    filters: {
        padding: 'clamp(0.75rem, 2vw, 1rem) clamp(1rem, 2vw, 1.5rem)',
        display: 'flex',
        gap: '0.5rem',
        flexWrap: 'wrap',
        background: 'rgba(20, 20, 20, 0.3)',
    },
    filterBtn: {
        padding: '0.5rem 1rem',
        border: '1px solid rgba(255, 255, 255, 0.15)',
        borderRadius: '20px',
        background: 'transparent',
        fontSize: '0.75rem',
        cursor: 'pointer',
        color: '#aaa',
        transition: 'all 0.3s ease',
    },
    filterActive: {
        background: 'linear-gradient(135deg, #C9A962 0%, #B8954E 100%)',
        color: '#fff',
        borderColor: '#C9A962',
    },

    // Grid
    grid: {
        padding: '0 clamp(1rem, 2vw, 1.5rem) clamp(1rem, 2vw, 1.5rem)',
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))',
        gap: 'clamp(0.75rem, 2vw, 1rem)',
        maxHeight: '55vh',
        overflowY: 'auto',
    },

    // Items
    item: {
        position: 'relative',
        aspectRatio: '1',
        borderRadius: '12px',
        overflow: 'hidden',
        background: 'rgba(40, 40, 40, 0.5)',
        border: '1px solid rgba(255, 255, 255, 0.05)',
        transition: 'transform 0.3s ease, box-shadow 0.3s ease',
        cursor: 'pointer',
    },
    itemImage: {
        width: '100%',
        height: '100%',
        objectFit: 'cover',
        transition: 'transform 0.3s ease',
    },
    itemOverlay: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        padding: '0.75rem',
        background: 'linear-gradient(to top, rgba(0, 0, 0, 0.9), transparent)',
        display: 'flex',
        flexDirection: 'column',
    },
    itemTitle: {
        color: '#fff',
        fontSize: '0.7rem',
        fontWeight: 500,
        lineHeight: 1.3,
    },
    itemCategory: {
        color: '#C9A962',
        fontSize: '0.6rem',
        textTransform: 'uppercase',
        letterSpacing: '0.05em',
    },

    // Delete button
    deleteBtn: {
        position: 'absolute',
        top: '0.5rem',
        right: '0.5rem',
        width: '28px',
        height: '28px',
        borderRadius: '50%',
        border: 'none',
        background: 'linear-gradient(135deg, #DC3545, #c82333)',
        color: '#fff',
        fontSize: '1rem',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        opacity: 0.9,
        transition: 'all 0.3s ease',
        boxShadow: '0 2px 8px rgba(220, 53, 69, 0.4)',
    },

    // Sidebar
    sidebar: {
        display: 'flex',
        flexDirection: 'column',
        gap: '1.5rem',
    },

    // Forms
    formGroup: {
        marginBottom: '1rem',
    },
    label: {
        display: 'block',
        fontSize: '0.85rem',
        fontWeight: 500,
        marginBottom: '0.5rem',
        color: '#ccc',
    },
    input: {
        width: '100%',
        padding: '0.85rem 1rem',
        border: '1px solid rgba(255, 255, 255, 0.12)',
        borderRadius: '10px',
        fontSize: '0.9rem',
        background: 'rgba(0, 0, 0, 0.3)',
        color: '#fff',
        transition: 'all 0.3s ease',
    },
    preview: {
        marginTop: '0.75rem',
        width: '100%',
        maxHeight: '150px',
        objectFit: 'cover',
        borderRadius: '10px',
        border: '1px solid rgba(255, 255, 255, 0.08)',
    },

    // Buttons
    submitBtn: {
        width: '100%',
        padding: '0.9rem',
        background: 'linear-gradient(135deg, #C9A962 0%, #B8954E 100%)',
        color: '#fff',
        border: 'none',
        borderRadius: '10px',
        fontSize: '0.9rem',
        fontWeight: 600,
        cursor: 'pointer',
        transition: 'all 0.3s ease',
        letterSpacing: '0.03em',
    },

    // Alerts
    alertError: {
        padding: '0.85rem 1rem',
        background: 'rgba(220, 53, 69, 0.15)',
        color: '#ff6b7a',
        borderRadius: '10px',
        marginBottom: '1rem',
        fontSize: '0.85rem',
        border: '1px solid rgba(220, 53, 69, 0.3)',
    },
    alertSuccess: {
        padding: '0.85rem 1rem',
        background: 'rgba(40, 167, 69, 0.15)',
        color: '#5dd879',
        borderRadius: '10px',
        marginBottom: '1rem',
        fontSize: '0.85rem',
        border: '1px solid rgba(40, 167, 69, 0.3)',
    },
};
